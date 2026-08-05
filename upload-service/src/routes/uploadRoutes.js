/**
 * src/routes/uploadRoutes.js
 * -----------------------------------------------------------------------
 * POST /upload/csv          - import a .csv file (multipart field "file")
 * POST /upload/excel        - import a .xlsx/.xls file (multipart field "file")
 * GET  /upload/history       - list past import attempts
 * DELETE /upload/history/:id - remove a history record
 *
 * Every upload request must also include a form field "entityType" set
 * to one of: categories | products | customers | orders.
 * -----------------------------------------------------------------------
 */

const express = require('express');
const router = express.Router();

const { upload } = require('../middleware/uploadMiddleware');
const uploadController = require('../controllers/uploadController');

router.post('/csv', upload.single('file'), uploadController.uploadCsv);
router.post('/excel', upload.single('file'), uploadController.uploadExcel);

router.get('/history', uploadController.getHistory);
router.delete('/history/:id', uploadController.deleteHistory);

module.exports = router;
