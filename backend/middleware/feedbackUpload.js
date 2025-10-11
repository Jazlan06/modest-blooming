const multer = require('multer');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/jpg'
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed'), false);
    }
};

const parser = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 7 * 1024 * 1024,
        files: 5
    }
});

module.exports = parser;
