const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../utils/cloudinary');

// Allowed image & video types
const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/svg',
    'image/jpg',
    'video/mp4',
    'video/webm',
    'video/quicktime'
];

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => ({
        folder: 'modest-blooming/products',
        resource_type: 'auto',
        format: file.mimetype.split('/')[1],
        public_id: `${Date.now()}-${file.originalname.split('.')[0]}`
    })
});

// Filter only accepted types
const fileFilter = (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only image and video files are allowed'), false);
    }
};

const parser = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 20 MB per file
        files: 10
    }
});

module.exports = parser;
