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
    parser.any(),
    updateHomePageConfig
);

module.exports = router;