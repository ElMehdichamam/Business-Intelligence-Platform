/**
 * src/controllers/uploadController.js
 * -----------------------------------------------------------------------
 * Controllers stay thin: pull data off the request, delegate parsing to
 * csvService/excelService, delegate validation to validationService,
 * delegate persistence to uploadModel, and shape the HTTP response.
 * No SQL and no parsing logic lives here.
 * -----------------------------------------------------------------------
 */

const path = require('path');
const { parseCsv } = require('../services/csvService');
const { parseExcel } = require('../services/excelService');
const { validateRows, SUPPORTED_ENTITIES } = require('../services/validationService');
const uploadModel = require('../models/uploadModel');
const { deleteUploadedFile } = require('../utils/fileCleaner');

function successResponse(res, statusCode, message, data) {
  return res.status(statusCode).json({ success: true, message, data });
}

function errorResponse(res, statusCode, message, errors = []) {
  return res.status(statusCode).json({ success: false, message, errors });
}

/**
 * Shared handler for both POST /upload/csv and POST /upload/excel.
 * `expectedExt` restricts each route to its own file type, so hitting
 * /upload/csv with an .xlsx file (or vice versa) is rejected even though
 * uploadMiddleware would otherwise accept it.
 */
function makeUploadHandler(expectedExt) {
  return async function handleUpload(req, res) {
    let uploadedFilePath = null;

    try {
      // ---- 1. Basic request validation -------------------------------
      if (!req.file) {
        return errorResponse(res, 400, 'No file was uploaded. Attach a file under field "file".');
      }

      uploadedFilePath = req.file.path;
      const originalName = req.file.originalname;
      const ext = path.extname(originalName).toLowerCase();

      const entityType = (req.body.entityType || '').trim().toLowerCase();
      if (!SUPPORTED_ENTITIES.includes(entityType)) {
        return errorResponse(
          res,
          400,
          `Missing or invalid "entityType" field. Expected one of: ${SUPPORTED_ENTITIES.join(', ')}`
        );
      }

      // ---- 2/3/4. Confirm the file actually matches this route -------
      if (expectedExt === 'csv' && ext !== '.csv') {
        return errorResponse(res, 400, `This endpoint only accepts .csv files, got "${ext}"`);
      }
      if (expectedExt === 'excel' && !['.xlsx', '.xls'].includes(ext)) {
        return errorResponse(res, 400, `This endpoint only accepts .xlsx/.xls files, got "${ext}"`);
      }

      // ---- 5/6. Parse the file into row objects -----------------------
      const rows =
        expectedExt === 'csv'
          ? await parseCsv(uploadedFilePath)
          : await parseExcel(uploadedFilePath);

      // ---- 7. Validate every row ---------------------------------------
      const { isValid, errors, validRows } = validateRows(entityType, rows);

      if (!isValid) {
        await uploadModel.logUploadHistory({
          fileName: originalName,
          entityType,
          fileType: expectedExt,
          totalRows: rows.length,
          insertedRows: 0,
          status: 'failed',
          errorMessage: `${errors.length} validation error(s)`
        });

        return errorResponse(res, 422, 'Validation failed for one or more rows', errors);
      }

      // ---- 8. Insert into MySQL (transactional, with FK resolution) ---
      const insertedCount = await uploadModel.insertEntityRows(entityType, validRows);

      await uploadModel.logUploadHistory({
        fileName: originalName,
        entityType,
        fileType: expectedExt,
        totalRows: rows.length,
        insertedRows: insertedCount,
        status: 'success',
        errorMessage: null
      });

      return successResponse(res, 201, `Successfully imported ${insertedCount} ${entityType} row(s)`, {
        entityType,
        totalRows: rows.length,
        insertedRows: insertedCount
      });
    } catch (err) {
      console.error('[uploadController] Import failed:', err);

      // Best-effort history log — don't let a logging failure mask the
      // real error being returned to the client.
      try {
        if (req.file) {
          await uploadModel.logUploadHistory({
            fileName: req.file.originalname,
            entityType: (req.body.entityType || 'unknown').toLowerCase(),
            fileType: expectedExt,
            totalRows: 0,
            insertedRows: 0,
            status: 'failed',
            errorMessage: err.message
          });
        }
      } catch (logErr) {
        console.error('[uploadController] Failed to log history:', logErr.message);
      }

      const statusCode = err.statusCode || 500;
      return errorResponse(res, statusCode, err.message || 'Internal server error while importing file');
    } finally {
      // ---- 9. Always clean up the temp file, success or failure -------
      await deleteUploadedFile(uploadedFilePath);
    }
  };
}

const uploadCsv = makeUploadHandler('csv');
const uploadExcel = makeUploadHandler('excel');

/**
 * GET /upload/history
 */
async function getHistory(req, res) {
  try {
    const history = await uploadModel.getUploadHistory();
    return successResponse(res, 200, 'Upload history retrieved', history);
  } catch (err) {
    console.error('[uploadController] Failed to fetch history:', err);
    return errorResponse(res, 500, 'Failed to retrieve upload history');
  }
}

/**
 * DELETE /upload/history/:id
 */
async function deleteHistory(req, res) {
  try {
    const { id } = req.params;

    if (!id || Number.isNaN(Number(id))) {
      return errorResponse(res, 400, 'A valid numeric history id is required');
    }

    const deleted = await uploadModel.deleteUploadHistoryRecord(id);

    if (!deleted) {
      return errorResponse(res, 404, `No upload history record found with id ${id}`);
    }

    return successResponse(res, 200, `Upload history record ${id} deleted`, { id: Number(id) });
  } catch (err) {
    console.error('[uploadController] Failed to delete history record:', err);
    return errorResponse(res, 500, 'Failed to delete upload history record');
  }
}

module.exports = { uploadCsv, uploadExcel, getHistory, deleteHistory };
