/**
 * src/services/excelService.js
 * -----------------------------------------------------------------------
 * Parses an Excel file (.xlsx/.xls) on disk into an array of plain JS
 * objects using the first worksheet's header row as keys.
 * -----------------------------------------------------------------------
 */

const XLSX = require('xlsx');

/**
 * Parse an Excel file into an array of row objects.
 * @param {string} filePath - absolute path to the uploaded .xlsx/.xls file
 * @returns {Promise<Array<Object>>}
 */
async function parseExcel(filePath) {
  try {
    const workbook = XLSX.readFile(filePath, { cellDates: true });
    const firstSheetName = workbook.SheetNames[0];

    if (!firstSheetName) {
      throw new Error('Workbook contains no sheets');
    }

    const sheet = workbook.Sheets[firstSheetName];

    // defval: '' ensures missing cells come back as empty string instead
    // of being omitted from the row object, so validation can catch them.
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false });

    // Trim string values for consistency with csvService.
    return rows.map((row) => {
      const cleanRow = {};
      for (const key of Object.keys(row)) {
        const trimmedKey = key.trim();
        const value = row[key];
        cleanRow[trimmedKey] = typeof value === 'string' ? value.trim() : value;
      }
      return cleanRow;
    });
  } catch (err) {
    throw new Error(`Failed to parse Excel file: ${err.message}`);
  }
}

module.exports = { parseExcel };
