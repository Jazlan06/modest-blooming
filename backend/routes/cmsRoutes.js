const express = require('express');
const {
    getHomePageContent,
    updateHomePageConfig
} = require('../controllers/cmsController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const parser = require('../middleware/cmsUpload');

const router = express.Router();

router.get('/homepage', getHomePageContent);

router.put(
    '/homepage',
    isAuthenticated,
    isAdmin,
    parser.fields([
        { name: 'heroBanners' },
        { name: 'brandBanner', maxCount: 1 },
        { name: 'bestSellerBanner', maxCount: 1 },
        { name: 'saleBanner', maxCount: 1 },
        { name: 'announcementImages' }
    ]),
    updateHomePageConfig
);

module.exports = router;
