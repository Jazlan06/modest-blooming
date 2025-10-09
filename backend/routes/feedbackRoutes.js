const express = require('express');
const { createFeedback, getProductFeedbackStats, getAllFeedback, deleteFeedback, getFeedbackAnalytics, getFeedbackForProduct } = require('../controllers/feedbackController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const parser = require('../middleware/feedbackUpload');

const router = express.Router();

// User: Create feedback
router.post(
    '/',
    isAuthenticated,
    parser.fields([{ name: 'media', maxCount: 5 }]),
    createFeedback
);
router.get('/stats/product/:productId', getProductFeedbackStats);
//Admin : View Feedback for specific Product
router.get('/product/:id', getFeedbackForProduct);
// Admin: View all feedback
router.get('/', isAuthenticated, isAdmin, getAllFeedback);
// Admin: Delete specific feedback
router.delete('/:id', isAuthenticated, isAdmin, deleteFeedback);
router.get('/analytics/summary', isAuthenticated, isAdmin, getFeedbackAnalytics);
module.exports = router;