require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const app = express();
const PORT = process.env.PORT || 5000;

// Create HTTP server for socket.io
const server = http.createServer(app);

// ===== Socket.io setup =====
const { Server } = require('socket.io');
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000', // frontend URL
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// Listen for client connections
io.on('connection', (socket) => {
    console.log('🔌 A client connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('❌ Client disconnected:', socket.id);
    });
});

app.locals.io = io;

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB connected successfully'))
    .catch((err) => console.error('❌ MongoDB connection error:', err));

app.get('/', (req, res) => res.send('API is running...'));

// Import routes
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const userActionsRoutes = require('./routes/userActionsRoutes');
const couponRoutes = require('./routes/couponRoutes');
const saleRoutes = require('./routes/saleRoutes');
const cmsRoutes = require('./routes/cmsRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const orderRoutes = require('./routes/orderRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');
const deliveryRateRoutes = require('./routes/admin/deliveryRateRoutes');

// Route bindings
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/user', userActionsRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/cms', cmsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/admin/delivery-rates', deliveryRateRoutes);

server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
