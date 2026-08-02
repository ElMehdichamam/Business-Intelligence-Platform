/**
 * src/utils/fileCleaner.js
 * -----------------------------------------------------------------------
 * Deletes an uploaded file from disk once the import has finished — on
 * success OR failure. We never want temporary uploads piling up in
 * src/uploads.
 * -----------------------------------------------------------------------
 */

const fs = require('fs/promises');

/**
 * Delete a file if it exists. Never throws — a cleanup failure shouldn't
 * mask the real success/error response already being sent to the client,
 * it's just logged.
 * @param {string} filePath
 */
async function deleteUploadedFile(filePath) {
  if (!filePath) return;

  try {
    await fs.unlink(filePath);
    console.log(`[fileCleaner] Removed temporary upload: ${filePath}`);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      // ENOENT (already gone) is fine to ignore; anything else is worth a log.
      console.error(`[fileCleaner] Failed to delete ${filePath}:`, err.message);
    }
  }
}

module.exports = { deleteUploadedFile };
