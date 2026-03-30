async function migrate() {
  const API_URL = 'http://localhost:5000/api';
  console.log("🚀 Starting Real Data Migration for HEIN Luxury ERP...");

  try {
    const products = [
      { name: 'Nike 👟 White', sku_code: 'HN-FW-NKW', category: 'Footwear', season_collection: 'Summer 2025 Batch', colorway: 'All White', size_run: '38-45', stockLevel: 200, min_stock_level: 10, cost_price: 6.15, selling_price: 20, manufacturer: 'Nike OEM' },
      { name: 'Nike 👟 B & W', sku_code: 'HN-FW-NKBW', category: 'Footwear', season_collection: 'Summer 2025 Batch', colorway: 'Black & White', size_run: '38-45', stockLevel: 100, min_stock_level: 5, cost_price: 6.15, selling_price: 20, manufacturer: 'Nike OEM' },
      { name: 'Nike 👟 W & B', sku_code: 'HN-FW-NKWB', category: 'Footwear', season_collection: 'Summer 2025 Batch', colorway: 'White & Black', size_run: '38-45', stockLevel: 100, min_stock_level: 5, cost_price: 6.15, selling_price: 20, manufacturer: 'Nike OEM' },
      { name: 'Nike 👟 Black', sku_code: 'HN-FW-NKB', category: 'Footwear', season_collection: 'Summer 2025 Batch', colorway: 'All Black', size_run: '38-45', stockLevel: 100, min_stock_level: 5, cost_price: 6.15, selling_price: 20, manufacturer: 'Nike OEM' }
    ];

    const productMap = {};
    for (const p of products) {
      const res = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(p)
      });
      const data = await res.json();
      productMap[p.name] = data._id;
      console.log(`✅ Created Product: ${p.name}`);
    }

    const expenses = [
      { date: '2025-07-12', category: 'Materials', amount: 1230.00, description: '200 pairs of Nike 👟 brand HEIN' },
      { date: '2025-08-24', category: 'Shipping', amount: 368.00, description: 'Transport cargo from China to Hargeisa' },
      { date: '2025-08-23', category: 'Operations', amount: 120.00, description: 'Deposit for one month' },
      { date: '2025-08-23', category: 'Operations', amount: 10.00, description: 'Public Notary' },
      { date: '2025-08-23', category: 'Operations', amount: 150.00, description: 'Decorations of the place' },
      { date: '2025-08-30', category: 'Operations', amount: 8.00, description: 'Boodhka meherada Title' },
      { date: '2025-09-03', category: 'Operations', amount: 10.00, description: 'WIFI Internet' },
      { date: '2025-09-02', category: 'Operations', amount: 14.00, description: 'Vios Prepaid' },
      { date: '2025-09-06', category: 'Operations', amount: 240.00, description: 'Shop rent' },
      { date: '2025-09-06', category: 'Materials', amount: 175.00, description: 'Shalafka meherada kabaha' },
      { date: '2025-09-05', category: 'Operations', amount: 10.00, description: 'Rooga Akhtarka ee meherada' },
      { date: '2025-09-16', category: 'Advertising', amount: 10.00, description: 'Marketing cost: Facebook boost' },
      { date: '2025-10-05', category: 'Advertising', amount: 20.80, description: 'Marketing cost: Facebook boost' },
      { date: '2025-10-08', category: 'Advertising', amount: 12.00, description: 'Marketing cost: Facebook boost' },
      { date: '2025-10-14', category: 'Advertising', amount: 20.80, description: 'Marketing cost: Facebook boost' },
      { date: '2025-10-21', category: 'Operations', amount: 35.00, description: 'Light Lamp and lighting lines' }
    ];

    for (const e of expenses) {
      await fetch(`${API_URL}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(e)
      });
      console.log(`✅ Logged Expense: ${e.description}`);
    }

    const salesRaw = [
      { date: '2025-08-24', item: 'Nike 👟 White', q: 1, p: 16 },
      { date: '2025-08-25', item: 'Nike 👟 W & B', q: 1, p: 20 },
      { date: '2025-08-26', item: 'Nike 👟 B & W', q: 1, p: 20 },
      { date: '2025-08-31', item: 'Nike 👟 Black', q: 1, p: 20 },
      { date: '2025-09-02', item: 'Nike 👟 White', q: 1, p: 20 },
      { date: '2025-09-02', item: 'Nike 👟 White', q: 1, p: 15 },
      { date: '2025-09-02', item: 'Nike 👟 B & W', q: 1, p: 20 },
      { date: '2025-09-07', item: 'Nike 👟 White', q: 1, p: 11 },
      { date: '2025-09-13', item: 'Nike 👟 W & B', q: 1, p: 14 },
      { date: '2025-09-15', item: 'Nike 👟 B & W', q: 1, p: 20 },
      { date: '2025-09-15', item: 'Nike 👟 White', q: 2, p: 15 },
      { date: '2025-09-17', item: 'Nike 👟 White', q: 1, p: 14 },
      { date: '2025-09-25', item: 'Nike 👟 White', q: 2, p: 18 },
      { date: '2025-09-26', item: 'Nike 👟 Black', q: 1, p: 17 },
      { date: '2025-10-06', item: 'Nike 👟 White', q: 1, p: 12 },
      { date: '2025-10-07', item: 'Nike 👟 White', q: 1, p: 12 },
      { date: '2025-10-08', item: 'Nike 👟 Black', q: 1, p: 13 },
      { date: '2025-10-08', item: 'Nike 👟 White', q: 1, p: 13 },
      { date: '2025-10-09', item: 'Nike 👟 W & B', q: 1, p: 12 },
      { date: '2025-10-12', item: 'Nike 👟 W & B', q: 2, p: 12 },
      { date: '2025-10-12', item: 'Nike 👟 White', q: 1, p: 15 },
      { date: '2025-10-13', item: 'Nike 👟 White', q: 1, p: 11 },
      { date: '2025-10-15', item: 'Nike 👟 B & W', q: 1, p: 14 },
      { date: '2025-10-16', item: 'Nike 👟 Black', q: 1, p: 12 },
      { date: '2025-10-16', item: 'Nike 👟 White', q: 1, p: 11 },
      { date: '2025-10-18', item: 'Nike 👟 White', q: 1, p: 12 },
      { date: '2025-10-20', item: 'Nike 👟 White', q: 2, p: 15 },
      { date: '2025-10-23', item: 'Nike 👟 White', q: 1, p: 11 },
      { date: '2025-10-29', item: 'Nike 👟 W & B', q: 2, p: 12.50 },
      { date: '2025-10-31', item: 'Nike 👟 W & B', q: 1, p: 13 },
      { date: '2025-11-18', item: 'Nike 👟 White', q: 1, p: 13 },
      { date: '2025-11-10', item: 'Nike 👟 Black', q: 1, p: 16 },
      { date: '2025-11-29', item: 'Nike 👟 Black', q: 1, p: 13 },
      { date: '2025-12-20', item: 'Nike 👟 White', q: 1, p: 10 },
      { date: '2025-12-20', item: 'Nike 👟 White', q: 1, p: 10 },
      { date: '2025-12-20', item: 'Nike 👟 Black', q: 1, p: 10 },
      { date: '2025-12-20', item: 'Nike 👟 White', q: 1, p: 10 },
      { date: '2025-12-20', item: 'Nike 👟 White', q: 1, p: 10 },
      { date: '2025-12-21', item: 'Nike 👟 White', q: 1, p: 10 },
      { date: '2025-12-21', item: 'Nike 👟 B & W', q: 2, p: 10 },
      { date: '2025-12-21', item: 'Nike 👟 B & W', q: 1, p: 10 },
      { date: '2025-12-22', item: 'Nike 👟 Black', q: 1, p: 10 },
      { date: '2025-12-22', item: 'Nike 👟 White', q: 1, p: 10 },
      { date: '2025-12-22', item: 'Nike 👟 B & W', q: 1, p: 10 },
      { date: '2025-12-23', item: 'Nike 👟 B & W', q: 1, p: 10 },
      { date: '2025-12-23', item: 'Nike 👟 B & W', q: 1, p: 10 },
      { date: '2025-12-23', item: 'Nike 👟 White', q: 1, p: 10 },
      { date: '2025-12-24', item: 'Nike 👟 White', q: 1, p: 10 },
      { date: '2025-12-24', item: 'Nike 👟 B & W', q: 1, p: 10 },
      { date: '2025-12-24', item: 'Nike 👟 White', q: 2, p: 10 },
      { date: '2025-12-25', item: 'Nike 👟 W & B', q: 1, p: 10 },
      { date: '12/25/2025', item: 'Nike 👟 White', q: 1, p: 10 },
      { date: '12/25/2025', item: 'Nike 👟 White', q: 1, p: 10 },
      { date: '01/01/2026', item: 'Nike 👟 White', q: 1, p: 10 },
      { date: '01/01/2026', item: 'Nike 👟 Black', q: 1, p: 13 },
      { date: '01/01/2026', item: 'Nike 👟 White', q: 2, p: 12 }
    ];

    for (const s of salesRaw) {
      const productId = productMap[s.item] || productMap['Nike 👟 White'];
      await fetch(`${API_URL}/sales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product: productId,
          quantitySold: s.q,
          revenue: s.p * s.q,
          createdAt: new Date(s.date)
        })
      });
      console.log(`✅ Logged Sale: ${s.item}`);
    }

    console.log("🏆 MIGRATION SUCCESSFUL! Dashboard updated with real business data.");

  } catch (err) {
    console.error("❌ Migration failed:", err.message);
  }
}

migrate();
