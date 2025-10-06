const express = require('express');
const { registerUser, loginUser, forgotPassword, resetPassword, verifyEmail } = require('../controllers/authController');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/verify-email/:token', verifyEmail);

router.post('/logout', (req, res) => {
    // Frontend should delete the token; backend doesn't store sessions
    res.json({ message: 'Logged out successfully' });
});



module.exports = router;
