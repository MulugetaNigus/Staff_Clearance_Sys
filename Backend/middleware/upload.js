const multer = require('multer');
const path = require('path');

// Get allowed file types from environment or use defaults
const getAllowedMimeTypes = () => {
  const types = process.env.ALLOWED_FILE_TYPES || 'application/pdf,image/jpeg,image/png,image/jpg';
  return types.split(',').map(type => type.trim());
};

const ALLOWED_MIME_TYPES = getAllowedMimeTypes();
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 5242880; // 5MB default

// Sanitize filename to prevent directory traversal and other attacks
const sanitizeFilename = (filename) => {
  // Remove any path components and dangerous characters
  return filename
    .replace(/^.*[\\\/]/, '') // Remove directory path
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace special chars with underscore
    .substring(0, 255); // Limit filename length
};

// Set up storage engine
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: function (req, file, cb) {
    const sanitized = sanitizeFilename(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(sanitized);
    const nameWithoutExt = path.basename(sanitized, ext);
    cb(null, `${file.fieldname}-${uniqueSuffix}-${nameWithoutExt}${ext}`);
  }
});

// Enhanced file type checking with MIME type validation
function checkFileType(file, cb) {
  // Check MIME type against allowed types
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(new Error(`Invalid file type. Only ${ALLOWED_MIME_TYPES.join(', ')} are allowed.`));
  }

  // Additional extension check for double-check security
  const allowedExtensions = /pdf|jpeg|jpg|png|doc|docx/;
  const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());

  if (!extname) {
    return cb(new Error('Invalid file extension.'));
  }

  // Double-check: MIME type should match extension
  const ext = path.extname(file.originalname).toLowerCase();
  const mimeTypeMap = {
    '.pdf': 'application/pdf',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  };

  const expectedMimeType = mimeTypeMap[ext];
  if (expectedMimeType && file.mimetype !== expectedMimeType) {
    return cb(new Error('File extension does not match file content.'));
  }

  return cb(null, true);
}

// Init upload with enhanced security
const upload = multer({
  storage: storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 10 // Maximum 10 files per request
  },
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
});

// Middleware for handling multiple file uploads
const uploadClearanceFiles = upload.array('clearanceFiles', 10); // 'clearanceFiles' is the field name, 10 is max files

// Middleware for handling single file replacement
const uploadSingleClearanceFile = upload.single('clearanceFile'); // 'clearanceFile' is the single-file field name

module.exports = { upload, uploadClearanceFiles, uploadSingleClearanceFile };
