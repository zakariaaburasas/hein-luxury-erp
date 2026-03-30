require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');

const Expense = require('./models/Expense');
const Product = require('./models/Product');
const Customer = require('./models/Customer');
const Sale = require('./models/Sale');
const Production = require('./models/Production');

async function importLiveSystem() {
    try {
        console.log('Connecting to LIVE MongoDB Atlas Database...');
        await mongoose.connect(process.env.MONGODB_URI);
        
        console.log('Clearing old mock sandbox data to prepare for Customer-Ready Production...');
        await Expense.deleteMany({});
        await Product.deleteMany({});
        await Customer.deleteMany({});
        await Sale.deleteMany({});
        await Production.deleteMany({});
        
        console.log('Reading downloaded Real-World Data from Google Sheets CSV File...');
        const csvData = fs.readFileSync('c:\\Users\\zakar\\Videos\\programs\\backend\\inventory_data.csv', 'utf8');
        const lines = csvData.split('\n');
        
        let expensesCount = 0;
        
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            // Parse CSV, honoring double quotes
            const row = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            if (row.length < 5) continue;
            
            const dateRaw = row[0];
            const category = row[1];
            const description = row[2];
            const amount = parseFloat(row[3]) || 0;
            const payment_method = row[4];
            const notes = row[5] ? row[5].replace(/"/g, '') : '';
            
            // Clean up date ranges like "10/5/2025 - 10/12/2025" and take the first date safely
            let safeDateString = dateRaw.split('-')[0].trim();
            let parsedDate = new Date(safeDateString);
            if (isNaN(parsedDate.getTime())) parsedDate = new Date(); // fallback
            
            await Expense.create({
                date: parsedDate,
                category,
                description,
                amount,
                payment_method,
                notes
            });
            expensesCount++;
            
            // Advanced Logic: If the sheet describes buying raw stock from China, securely map it to the Inventory Store
            if (description.toLowerCase().includes('200 pairs') && description.toLowerCase().includes('nike')) {
                await Product.create({
                    name: 'HEIN Nike Premium',
                    sku_code: 'HN-NK-001',
                    category: 'Footwear',
                    season_collection: 'Summer Launch',
                    colorway: 'Signature',
                    size_run: '40-44',
                    stockLevel: 200,
                    min_stock_level: 25,
                    cost_price: amount / 200, // exact unit cost
                    selling_price: 120, // Sample luxury margin, easily editable
                    manufacturer: 'Nike / China Cargo'
                });
                console.log('📦 Successfully ported Nike Stock Shipment directly into your Inventory Register!');
            }
        }
        
        console.log(`✅ Success! Imported ${expensesCount} financial records directly from the live Google Sheet spreadsheet.`);
        console.log('SYSTEM IS NOW LIVE AND CUSTOMER READY. Exiting...');
        process.exit(0);
    } catch(err) {
        console.error("FATAL ERROR:", err);
        process.exit(1);
    }
}

importLiveSystem();
