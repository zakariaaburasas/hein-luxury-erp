require('dotenv').config();
const mongoose = require('mongoose');
const xlsx = require('xlsx');

const Sale = require('./models/Sale');
const Product = require('./models/Product');
const Customer = require('./models/Customer');

async function importSales() {
    try {
        console.log('Connecting to LIVE MongoDB Atlas Database...');
        await mongoose.connect(process.env.MONGODB_URI);
        
        console.log('Wiping old dummy Sales & Customers...');
        await Sale.deleteMany({});
        await Customer.deleteMany({});
        
        console.log('Parsing Tracker.xlsx Sales Sheet...');
        const wb = xlsx.readFile('tracker.xlsx');
        const salesRows = xlsx.utils.sheet_to_json(wb.Sheets['Sales']);
        
        // Find our primary HEIN Nike shoe that we added in the last script
        const primaryProduct = await Product.findOne({ name: 'HEIN Nike Premium' });
        if (!primaryProduct) {
            throw new Error("Could not find the core Nike shoe product in inventory! Did the previous script run properly?");
        }
        console.log(`Linked to Master SKU: ${primaryProduct.sku_code} [Current Stock: ${primaryProduct.stockLevel}]`);

        let importCount = 0;
        
        for (const row of salesRows) {
            // Excel dates parsing helper
            let dateVal = new Date();
            if (typeof row['Date'] === 'number') {
                dateVal = new Date((row['Date'] - (25567 + 2)) * 86400 * 1000);
            } else if (typeof row['Date'] === 'string') {
                const parsed = new Date(row['Date']);
                if (!isNaN(parsed.valueOf())) dateVal = parsed;
            }

            const rawName = row['Customer'] || 'Walk-in';
            const rawPhone = row['Customer Number '] ? String(row['Customer Number ']).trim() : '';

            // Upsert Customer based on Phone or Name
            let customerDoc = null;
            if (rawPhone) {
                customerDoc = await Customer.findOne({ phoneNumber: rawPhone });
            } else {
                customerDoc = await Customer.findOne({ name: rawName });
            }

            if (!customerDoc) {
                customerDoc = await Customer.create({
                    name: rawName,
                    phoneNumber: rawPhone,
                    email: `client-${Date.now()}-${Math.floor(Math.random() * 10000)}@hein.vip`,
                    vipStatus: 'Bronze'
                });
            }

            // Prepare Sale Fields
            const qty = parseInt(row['Quantity']) || 1;
            const revenue = parseFloat(row['Total']) || (parseFloat(row['Unit Price']) * qty) || 0;
            const payment_method = row['payment method '] ? String(row['payment method ']).trim() : 'Unknown';
            const status = row[' Paid/unpaid'] ? String(row[' Paid/unpaid']).trim() : 'Paid';
            const notes = row['__EMPTY'] ? String(row['__EMPTY']).trim() : '';

            const sale = await Sale.create({
                product: primaryProduct._id,
                customer: customerDoc._id,
                quantitySold: qty,
                revenue: revenue,
                payment_method: payment_method,
                status: status,
                notes: notes,
                createdAt: dateVal, // Backdate the sale!
                updatedAt: dateVal
            });

            // Adjust stock
            primaryProduct.stockLevel -= qty;
            
            // Push to customer history
            customerDoc.purchaseHistory.push(sale._id);
            await customerDoc.save();

            importCount++;
        }
        
        // Save the final stock reduction
        await primaryProduct.save();

        console.log(`✅ Success! Imported ${importCount} REAL-WORLD sales records natively. Decreased Master SKU stock appropriately.`);
        process.exit(0);
    } catch(err) {
        console.error("FATAL ERROR:", err);
        process.exit(1);
    }
}

importSales();
