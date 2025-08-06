const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Generate random string
const generateRandomString = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

// Generate slug from string
const generateSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

// Paginate results
const paginate = (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  return { skip, limit: parseInt(limit) };
};

// Build pagination response
const buildPaginationResponse = (page, limit, total) => {
  return {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    pages: Math.ceil(total / limit),
    hasNext: page < Math.ceil(total / limit),
    hasPrev: page > 1,
  };
};

// Sanitize user input (remove HTML tags)
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.replace(/<[^>]*>/g, '');
};

// Generate OTP
const generateOTP = (length = 6) => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
};

// Check if email is valid
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Format currency
const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

// Calculate percentage
const calculatePercentage = (part, total) => {
  if (total === 0) return 0;
  return Math.round((part / total) * 100 * 100) / 100; // Round to 2 decimal places
};

// Deep clone object
const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

// Remove undefined values from object
const removeUndefined = (obj) => {
  const cleaned = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      cleaned[key] = value;
    }
  }
  return cleaned;
};

// Get file extension
const getFileExtension = (filename) => {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
};

// Check if file type is allowed
const isAllowedFileType = (filename, allowedTypes = []) => {
  const extension = getFileExtension(filename).toLowerCase();
  return allowedTypes.includes(extension);
};

// Generate unique filename
const generateUniqueFilename = (originalName) => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  const extension = getFileExtension(originalName);
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
  
  return `${nameWithoutExt}-${timestamp}-${random}.${extension}`;
};

// Save base64 image to file
const saveBase64Image = async (base64String, uploadDir = 'uploads', departmentName = null) => {
  if (!base64String || typeof base64String !== 'string') {
    throw new Error('Invalid base64 string provided.');
  }

  const matches = base64String.match(/^data:image\/([a-zA-Z0-9]+);base64,(.*)$/);
  if (!matches || matches.length !== 3) {
    throw new Error('Invalid base64 image format.');
  }

  const imageFormat = matches[1];
  const base64Data = matches[2];
  const buffer = Buffer.from(base64Data, 'base64');

  let filename;
  if (departmentName) {
    const departmentKey = departmentName.toLowerCase().replace(/[^a-z0-9]/g, '');
    filename = `signature-${departmentKey}.${imageFormat}`;
  } else {
    filename = `signature-${Date.now()}.${imageFormat}`;
  }

  const filePath = path.join(uploadDir, filename);

  await fs.promises.writeFile(filePath, buffer);
  return filePath.replace(/\\/g, '/');
};

module.exports = {
  generateRandomString,
  generateSlug,
  paginate,
  buildPaginationResponse,
  sanitizeInput,
  generateOTP,
  isValidEmail,
  formatCurrency,
  calculatePercentage,
  deepClone,
  removeUndefined,
  getFileExtension,
  isAllowedFileType,
  generateUniqueFilename,
  saveBase64Image,
};
