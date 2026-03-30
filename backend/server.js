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

const app = express();

// Middleware
app.use(cors({
    origin: '*', // Allow all for now to solve connectivity issues
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '20mb' })); // Higher limit for Base64 images

// Routes
app.use('/api/products', productRoutes);
app.use('/api/production', productionRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

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

// Database Connection Logic
const startServer = async () => {
    const PORT = process.env.PORT || 5000;
    const MONGODB_URI = process.env.MONGODB_URI;

    console.log('🔄 DEPLOYMENT UPDATE: System starting...');
    console.log('🔍 Checking Environment: ', MONGODB_URI ? 'MONGODB_URI Found' : 'MONGODB_URI MISSING');

    try {
        if (!MONGODB_URI) {
            console.error('❌ MONGODB_URI IS MISSING. CRITICAL SYSTEM FAILURE.');
            process.exit(1);
        }

        console.log('🔌 Attempting to connect to MongoDB Atlas...');
        
        // Let's add options for better stability on Render
        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 15000, // Timeout after 15s instead of hanging
            family: 4 // Force IPv4 (sometimes Render prefers this)
        });

        console.log('✅ Connected to LIVE MongoDB Atlas Database');

        app.listen(PORT, () => {
            console.log('--------------------------------------------------');
            console.log(`🚀 HEIN ERP Engine active on port ${PORT}`);
            console.log('--------------------------------------------------');
        });

    } catch (err) {
        console.error('❌ MONGODB CONNECTION ERROR:', err.message);
        console.error('💡 PRO TIP: Check if your MongoDB Atlas has "Network Access" set to "Allow Access From Anywhere (0.0.0.0/0)".');
        process.exit(1); // Exit so Render shows the error in logs clearly
    }
};

startServer();
