const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const Expense = require('../models/Expense');

// GET full profit/loss with expenses (Gross + Net)
router.get('/profit-loss', async (req, res) => {
  try {
    const sales = await Sale.find().populate('product');
    const expenses = await Expense.find();

    let totalRevenue = 0;
    let totalCOGS = 0;

    sales.forEach(sale => {
      if (sale.product) {
        totalRevenue += sale.revenue;
        const costPrice = sale.product.cost_price || sale.product.costPrice || 0;
        totalCOGS += (costPrice * sale.quantitySold);
      }
    });

    const grossProfit = totalRevenue - totalCOGS;
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = grossProfit - totalExpenses;

    res.status(200).json({
      totalRevenue,
      totalCOGS,
      grossProfit,
      totalExpenses,
      netProfit,
      totalSalesVolume: sales.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Error calculating profit/loss', error: error.message });
  }
});

// GET monthly revenue report (last 6 months)
router.get('/monthly', async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const data = await Sale.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$revenue' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formatted = data.map(d => ({
      month: months[d._id.month - 1],
      revenue: d.revenue,
      orders: d.orders
    }));

    res.status(200).json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Error generating monthly report', error: error.message });
  }
});

// GET weekly revenue report (last 8 weeks)
router.get('/weekly', async (req, res) => {
  try {
    const eightWeeksAgo = new Date();
    eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);

    const data = await Sale.aggregate([
      { $match: { createdAt: { $gte: eightWeeksAgo } } },
      {
        $group: {
          _id: { $week: '$createdAt' },
          revenue: { $sum: '$revenue' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const formatted = data.map((d, i) => ({
      week: `W${i + 1}`,
      revenue: d.revenue,
      orders: d.orders
    }));

    res.status(200).json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Error generating weekly report', error: error.message });
  }
});

module.exports = router;
