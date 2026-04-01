const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Expense = require('../models/Expense');
const Production = require('../models/Production');

// GET unified dashboard summary payload
router.get('/summary', async (req, res) => {
  try {
    // 1. Fire queries concurrently in parallel at the database level
    const [sales, expenses, products, customersCount, productions] = await Promise.all([
      Sale.find().populate('product').populate('customer'),
      Expense.find(),
      Product.find(),
      Customer.countDocuments(),
      Production.find()
    ]);

    // 2. Compute Finance (P&L)
    let totalRevenue = 0;
    let totalCOGS = 0;
    const now = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(now.getMonth() - 5); // To include current month, go back 5 full months

    const monthlyMap = Array.from({length: 12}, () => ({ revenue: 0, orders: 0 }));

    sales.forEach(sale => {
      // Exclude refunded from P&L
      if (String(sale.status).toLowerCase().includes('refund')) return;

      // P&L
      if (sale.product) {
        totalRevenue += sale.revenue;
        const cp = sale.product.cost_price || sale.product.costPrice || 0;
        totalCOGS += (cp * sale.quantitySold);
      }
      
      // Monthly Chart Data
      const saleDate = new Date(sale.createdAt);
      if (saleDate >= sixMonthsAgo) {
         const m = saleDate.getMonth();
         monthlyMap[m].revenue += sale.revenue;
         monthlyMap[m].orders += 1;
      }
    });

    const grossProfit = totalRevenue - totalCOGS;
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = grossProfit - totalExpenses;

    const finance = {
      totalRevenue, grossProfit, totalExpenses, netProfit, totalSalesVolume: sales.length
    };

    // Format Monthly Chart dynamically for last 6 months
    const monthsStr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
       let d = new Date(now.getFullYear(), now.getMonth() - i, 1);
       monthlyData.push({
         month: monthsStr[d.getMonth()],
         revenue: monthlyMap[d.getMonth()].revenue,
         orders: monthlyMap[d.getMonth()].orders
       });
    }

    // 3. Compute Stock Alerts
    const stockAlerts = products.filter(p => p.stockLevel <= p.min_stock_level);
    
    // 4. Compute Active Production
    const activeProductionCount = productions.filter(p => p.status !== 'Delivered').length;

    // 5. Build recent sales (last 5)
    // Sort reverse chronological
    const sortedSales = [...sales].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
    const recentSales = sortedSales.slice(0, 5);

    // Assemble unified response payload
    res.status(200).json({
      finance,
      monthlyData,
      stockAlerts,
      recentSales,
      totalCustomers: customersCount,
      totalProducts: products.length,
      activeProduction: activeProductionCount
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error generating dashboard combined view', error: error.message });
  }
});

module.exports = router;
