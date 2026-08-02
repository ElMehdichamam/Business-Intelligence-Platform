/**
 * src/services/csvService.js
 * -----------------------------------------------------------------------
 * Parses a CSV file on disk into an array of plain JS objects, one per
 * data row, keyed by the header row's column names.
 * -----------------------------------------------------------------------
 */

const fs = require('fs');
const csvParser = require('csv-parser');

/**
 * Parse a CSV file into an array of row objects.
 * @param {string} filePath - absolute path to the uploaded .csv file
 * @returns {Promise<Array<Object>>}
 */
function parseCsv(filePath) {
  return new Promise((resolve, reject) => {
    const rows = [];

    fs.createReadStream(filePath)
      .on('error', (err) => reject(new Error(`Unable to read CSV file: ${err.message}`)))
      .pipe(csvParser({
        // Trim header names so " Price " and "Price" behave the same.
        mapHeaders: ({ header }) => header.trim()
      }))
      .on('data', (row) => {
        // Trim every string value too — sloppy spreadsheet exports are
        // the #1 source of "why did validation fail" surprises.
        const cleanRow = {};
        for (const key of Object.keys(row)) {
          const value = row[key];
          cleanRow[key] = typeof value === 'string' ? value.trim() : value;
        }
        rows.push(cleanRow);
      })
      .on('end', () => resolve(rows))
      .on('error', (err) => reject(new Error(`Failed to parse CSV: ${err.message}`)));
  });
}

module.exports = { parseCsv };
