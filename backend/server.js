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

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/products', productRoutes);
app.use('/api/production', productionRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/expenses', expenseRoutes);

// Database Connection Logic
const startServer = async () => {
    const PORT = process.env.PORT || 5000;
    const MONGODB_URI = process.env.MONGODB_URI;

    try {
        if (!MONGODB_URI) {
            console.error('❌ MONGODB_URI IS MISSING. CRITICAL SYSTEM FAILURE.');
            process.exit(1);
        }

        // PRODUCTION: Use Real MongoDB Atlas
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to LIVE MongoDB Atlas Database');

        app.listen(PORT, () => console.log(`🚀 HEIN ERP Engine active on port ${PORT}`));
    } catch (err) {
        console.error('❌ Database Initialization Error:', err.message);
    }
};

startServer();
