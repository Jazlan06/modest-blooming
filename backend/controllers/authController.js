const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

const registerUser = async (req, res) => {
    const { name, email, password, phone } = req.body;

    try {
        const existingEmail = await User.findOne({ email });
        if (existingEmail) return res.status(400).json({ message: 'Email already registered' });

        const existingPhone = await User.findOne({ phone });
        if (existingPhone) return res.status(400).json({ message: 'Phone number already registered' });

        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

        const user = new User({
            name,
            email,
            password: hashedPassword,
            phone,
            verificationToken,
            verificationTokenExpire
        });

        await user.save();

        // Send verification email
        const verifyUrl = `http://localhost:3000/verify-email/${verificationToken}`;
        const message = `Please verify your email by clicking on the link: ${verifyUrl}`;

        await sendEmail(user.email, 'Email Verification', message);

        res.status(201).json({ message: 'User registered. Please check your email to verify.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const verifyEmail = async (req, res) => {
    const { token } = req.params;

    const user = await User.findOne({
        verificationToken: token,
        verificationTokenExpire: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired verification token' });

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpire = undefined;

    await user.save();

    res.json({ message: 'Email verified successfully. You can now log in.' });
};

const resendVerificationEmail = async (req, res) => {
    const { email } = req.body;
    console.log('📩 Resend verification initiated for:', email);

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user.isVerified) return res.status(400).json({ message: 'Email is already verified' });

        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000;

        user.verificationToken = verificationToken;
        user.verificationTokenExpire = verificationTokenExpire;
        await user.save();

        const verifyUrl = `http://localhost:3000/verify-email/${verificationToken}`;
        const message = `Please verify your email by clicking this link: ${verifyUrl}`;

        console.log('📨 Attempting to send email to', user.email);
        await sendEmail(user.email, 'Resend Email Verification', message);
        console.log('✅ Email sent successfully');

        res.json({ message: 'Verification email sent successfully' });
    } catch (err) {
        console.error('❌ Failed to resend verification:', err);
        res.status(500).json({ message: 'Failed to resend verification email', error: err.message });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid email or password' });
        if (!user.isVerified) {
            return res.status(401).json({ message: 'Please verify your email before logging in' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const forgotPassword = async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 min
    await user.save();

    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;

    const message = `You requested a password reset.\n\nReset here: ${resetUrl}\n\nIf you didn't request this, ignore.`;

    try {
        await sendEmail(user.email, 'Password Reset', message);
        res.json({ message: 'Reset email sent successfully.' });
    } catch (err) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(500).json({ message: 'Email sending failed', error: err.message });
    }
};

const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
};

module.exports = { registerUser, loginUser, forgotPassword, resetPassword, verifyEmail, resendVerificationEmail };