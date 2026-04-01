require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const productRoutes = require('./routes/productRoutes');
const productionRoutes = require('./routes/productionRoutes');
const customerRoutes = require('./routes/customerRoutes');
const salesRoutes = require('./routes/salesRoutes');
const financeRoutes = require('./routes/financeRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

// Middleware
app.use(cors({
    origin: '*', // Allow all for now to solve connectivity issues
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '20mb' })); // Higher limit for Base64 images

// Vercel Serverless Database Connection Middleware
const MONGODB_URI = process.env.MONGODB_URI;

app.use(async (req, res, next) => {
    if (!MONGODB_URI) {
        console.warn('❌ MONGODB_URI IS MISSING. CRITICAL SYSTEM FAILURE.');
        return next();
    }
    
    // connection.readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    if (mongoose.connection.readyState === 1) {
        return next();
    }

    if (mongoose.connection.readyState === 2) {
        return next();
    }

    try {
        console.log('🔌 Initializing new Serverless MongoDB connection...');
        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            family: 4
        });
        console.log('✅ Connected to LIVE MongoDB Atlas Database');
        next();
    } catch (err) {
        console.error('❌ MONGODB CONNECTION ERROR:', err.message);
        next(err);
    }
});

// Routes
app.use('/api/products', productRoutes);
app.use('/api/production', productionRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Root Health Check
app.get('/', (req, res) => {
  res.json({ status: 'active', engine: 'HEIN Luxury ERP', version: '2.1.0', message: 'Operational.' });
});

// 404 Handler
app.use((req, res, next) => {
  const err = new Error('Resource not found in HEIN Engine.');
  err.status = 404;
  next(err);
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('SERVER_CRITICAL_ERROR:', err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal logic failure in HEIN Engine.',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});



// Conditionally listen if not on Vercel (Vercel uses exported app)
if (!process.env.VERCEL_ENV && !process.env.VERCEL) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log('--------------------------------------------------');
        console.log(`🚀 HEIN ERP Engine active on port ${PORT}`);
        console.log('--------------------------------------------------');
    });
}

// Export the Express API for Vercel Serverless Functions
module.exports = app;
