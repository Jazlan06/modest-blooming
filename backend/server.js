require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const PORT = process.env.PORT || 5000;

const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const userActionsRoutes = require('./routes/userActionsRoutes');

app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB connected successfully'))
    .catch((err) => console.error('❌ MongoDB connection error:', err));


app.get('/', (req, res) => {
    res.send('API is running...');
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/user', userActionsRoutes);


app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
