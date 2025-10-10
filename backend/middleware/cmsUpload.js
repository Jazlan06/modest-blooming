const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../utils/cloudinary');

// Define allowed MIME types
const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/jpg',
    'image/svg',
    'video/mp4',
    'video/webm',
    'video/quicktime'
];

const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
        return {
            folder: 'modest-blooming/cms',
            resource_type: 'auto',
            format: file.mimetype.split('/')[1],
            public_id: `${Date.now()}-${file.originalname.split('.')[0]}`
        };
    }
});

// Filter files by type
const fileFilter = (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only images and videos are allowed (JPEG, PNG, MP4, etc.)'), false);
    }
};

// Set up multer with limits
const parser = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
        files: 10 // Up to 10 files per request
    }
});

module.exports = parser;
