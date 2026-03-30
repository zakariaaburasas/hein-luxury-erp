async function seed() {
  console.log("Seeding MongoDB for HEIN Luxury ERP Intelligence Update...");
  
  const API_URL = 'http://localhost:5000/api';

  // 1. Create Products with SKU Data
  const products = [
    {
      name: 'Oxford Leather VIP',
      sku_code: 'HN-FW-001',
      category: 'Footwear',
      season_collection: 'Winter 2026',
      colorway: 'Classic Black',
      size_run: '40-45',
      stockLevel: 400,
      min_stock_level: 50,
      cost_price: 80,
      selling_price: 420,
      manufacturer: 'Lux China',
      image_url: '/products/oxford-shoe.png'
    },
    {
      name: 'Woolen Trench Coat',
      sku_code: 'HN-AP-001',
      category: 'Apparel',
      season_collection: 'Autumn 2025',
      colorway: 'Midnight Navy',
      size_run: 'S-XL',
      stockLevel: 5, // Triggers Low Stock!
      min_stock_level: 10,
      cost_price: 150,
      selling_price: 850,
      manufacturer: 'SinoApparel',
      image_url: '/products/trench-coat.png'
    }
  ];

  const createdProducts = [];
  for (const p of products) {
    const res = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(p)
    });
    createdProducts.push(await res.json());
  }
  console.log("Products seeded.");

  // 2. Create Customers
  const customers = [
    { name: 'Christian Bale', email: 'bale@hollywood.com' },
    { name: 'Elon Musk', email: 'elon@spacex.com' }
  ];
  const createdCustomers = [];
  for (const c of customers) {
    const res = await fetch(`${API_URL}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(c)
    });
    createdCustomers.push(await res.json());
  }
  console.log("Customers seeded.");

  // 3. Create Expenses
  const expenses = [
    { category: 'Advertising', amount: 500, description: 'Meta Ads - Winter Launch', date: new Date() },
    { category: 'Shipping', amount: 120, description: 'DHL Express OEM China', date: new Date() }
  ];
  for (const e of expenses) {
    await fetch(`${API_URL}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(e)
    });
  }
  console.log("Expenses seeded.");

  // 4. Create Sales
  const sales = [
    { 
      product: createdProducts[0]._id, 
      customer: createdCustomers[0]._id, 
      quantitySold: 2, 
      revenue: createdProducts[0].selling_price * 2 
    },
    { 
      product: createdProducts[1]._id, 
      customer: createdCustomers[1]._id, 
      quantitySold: 1, 
      revenue: createdProducts[1].selling_price * 1 
    }
  ];
  for (const s of sales) {
    await fetch(`${API_URL}/sales`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(s)
    });
  }
  console.log("Sales seeded.");
  
  // 5. Create Production Orders
  const productionOrders = [
    {
      poNumber: 'PO-2026-001',
      factory: 'Lux China',
      productName: 'Oxford Leather VIP',
      quantity: 500,
      expectedArrival: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      status: 'In Production'
    },
    {
      poNumber: 'PO-2026-002',
      factory: 'SinoApparel',
      productName: 'Woolen Trench Coat',
      quantity: 200,
      expectedArrival: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
      status: 'Shipped'
    }
  ];
  for (const po of productionOrders) {
    await fetch(`${API_URL}/production`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(po)
    });
  }
  console.log("Production orders seeded.");

  console.log("Seeding complete! Dashboard intelligence ready.");
}

seed();
