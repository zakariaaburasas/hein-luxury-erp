require('dotenv').config();
const mongoose = require('mongoose');

const collections = ['sales', 'products', 'customers', 'expenses', 'productions'];

async function factoryReset() {
  console.log('--- HEIN LUXURY ERP: PRE-DEPLOYMENT FACTORY RESET ---');
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to live Atlas database.');

    for (const col of collections) {
      const result = await mongoose.connection.db.collection(col).deleteMany({});
      console.log(`Cleared [${col}]: Removed ${result.deletedCount} records.`);
    }

    console.log('\n--- SYSTEM IS NOW FRESH AND READY FOR BRAND DEPLOYMENT ---');
    process.exit(0);
  } catch (err) {
    console.error('Reset failed:', err.message);
    process.exit(1);
  }
}

factoryReset();
