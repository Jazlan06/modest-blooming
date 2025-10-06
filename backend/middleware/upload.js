const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../utils/cloudinary');

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'modest-blooming/products',
        allowed_formats: ['jpeg', 'png', 'jpg', 'webp', 'svg']
    }
});

const parser = multer({ storage });

module.exports = parser;
