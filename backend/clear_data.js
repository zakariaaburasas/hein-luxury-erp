require('dotenv').config();
const mongoose = require('mongoose');
const Expense = require('./models/Expense');
const Product = require('./models/Product');
const Customer = require('./models/Customer');
const Sale = require('./models/Sale');

async function resetForNewSystem() {
    try {
        console.log('Connecting to LIVE MongoDB Atlas Database...');
        await mongoose.connect(process.env.MONGODB_URI);
        
        console.log('Wiping all legacy Google Sheet Data to prepare pristine New System...');
        await Expense.deleteMany({});
        await Sale.deleteMany({});
        await Customer.deleteMany({});
        
        // Let's reset the Product inventory back to 200 rather than deleting the product
        // Because they need the product to actually sell in the new system!
        await Product.updateMany({}, { stockLevel: 200 });

        console.log('✅ Success! The new system is 100% reset to zero. Revenue is $0, ready for company launch.');
        process.exit(0);
    } catch(err) {
        console.error("FATAL ERROR:", err);
        process.exit(1);
    }
}

resetForNewSystem();
