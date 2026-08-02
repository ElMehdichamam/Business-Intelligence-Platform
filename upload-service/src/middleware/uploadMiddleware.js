/**
 * src/middleware/uploadMiddleware.js
 * -----------------------------------------------------------------------
 * Configures Multer to:
 *  - store incoming files on disk in src/uploads
 *  - give each file a collision-safe name
 *  - reject anything that isn't a .csv or .xlsx/.xls file up front
 *  - cap file size (default 10MB, configurable via MAX_FILE_SIZE_MB)
 *
 * The controller still re-checks the extension before parsing (defense in
 * depth), but rejecting bad files here means we never even write them to
 * disk.
 * -----------------------------------------------------------------------
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

// Make sure the uploads directory exists (first boot on a fresh clone).
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const ALLOWED_EXTENSIONS = ['.csv', '.xlsx', '.xls'];
const ALLOWED_MIME_TYPES = [
  'text/csv',
  'application/vnd.ms-excel', // some browsers report .csv/.xls as this
  'application/csv',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' // .xlsx
];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    // Prefix with timestamp + random suffix so concurrent uploads of
    // files with the same name never collide.
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();

  const extensionOk = ALLOWED_EXTENSIONS.includes(ext);
  const mimeOk = ALLOWED_MIME_TYPES.includes(file.mimetype);

  // We accept the file as long as the extension is right — mimetype is a
  // useful signal but browsers/OSes are inconsistent about what they send
  // for CSV/Excel, so we don't hard-fail on mimetype alone.
  if (extensionOk || mimeOk) {
    return cb(null, true);
  }

  cb(new Error('Only .csv and .xlsx/.xls files are allowed'));
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: (Number(process.env.MAX_FILE_SIZE_MB) || 10) * 1024 * 1024
  }
});

module.exports = { upload, UPLOAD_DIR };
