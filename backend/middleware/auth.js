const jwt = require('jsonwebtoken');

const isAuthenticated = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'No token provided' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { userId, role }
        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};

const isAdmin = (req, res, next) => {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied: Admins only' });
    }
    next();
};

const isAuthenticatedOptional = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return next(); // continue without user
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
    } catch (err) {

    }
    next();
};

module.exports = { isAuthenticated, isAdmin, isAuthenticatedOptional };
