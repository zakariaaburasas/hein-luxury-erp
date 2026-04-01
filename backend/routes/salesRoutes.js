const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const Customer = require('../models/Customer');

// GET all sales (populated)
router.get('/', async (req, res) => {
  try {
    const sales = await Sale.find()
      .populate('product')
      .populate('customer')
      .populate('staff', 'name username role')
      .sort({ createdAt: -1 });
    res.status(200).json(sales);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sales', error: error.message });
  }
});

// POST new sale — auto-decrements stock and specific size quantity
router.post('/', async (req, res) => {
  try {
    const { product, customer, quantitySold, revenue, status, payment_method, notes, customerName, customerPhone, vipStatus, staff, size_sold, sizes_sold } = req.body;

    let finalCustomer = (customer && customer.trim() !== '') ? customer : undefined;
    
    // Inline CRM Creation Logic
    if (!finalCustomer && customerName && customerName.trim() !== '') {
        const newCust = await Customer.create({
            name: customerName.trim(),
            phoneNumber: customerPhone ? customerPhone.trim() : '',
            vipStatus: vipStatus || 'None'
        });
        finalCustomer = newCust._id;
    }

    const productRecord = await Product.findById(product);
    if (!productRecord) return res.status(404).json({ message: 'Product not found' });
    if (productRecord.stockLevel < quantitySold) {
      return res.status(400).json({ message: 'Insufficient stock to complete this sale' });
    }

    // Handle sizes logic
    if (sizes_sold && sizes_sold.length > 0) {
      // Loop to thoroughly check first to avoid partial commits
      for (const reqSize of sizes_sold) {
        const sizeEntry = productRecord.sizes.find(s => s.size === reqSize.size);
        if (!sizeEntry) return res.status(400).json({ message: `Size ${reqSize.size} not found in inventory for ${productRecord.name}` });
        if (sizeEntry.quantity < reqSize.quantity) return res.status(400).json({ message: `Only ${sizeEntry.quantity} units of size ${reqSize.size} available` });
      }
      // Everything passed, apply decrements
      for (const reqSize of sizes_sold) {
        const sizeEntry = productRecord.sizes.find(s => s.size === reqSize.size);
        sizeEntry.quantity -= reqSize.quantity;
      }
    } else if (size_sold && productRecord.sizes && productRecord.sizes.length > 0) {
      const sizeEntry = productRecord.sizes.find(s => s.size === size_sold);
      if (!sizeEntry) return res.status(400).json({ message: `Size ${size_sold} not found in inventory` });
      if (sizeEntry.quantity < quantitySold) return res.status(400).json({ message: `Only ${sizeEntry.quantity} units of size ${size_sold} available` });
      sizeEntry.quantity -= quantitySold;
    }

    // 1. Create Sale
    const newSale = new Sale({ product, customer: finalCustomer, quantitySold, revenue, status, payment_method, notes, staff, size_sold: size_sold || '', sizes_sold: sizes_sold || [] });
    const savedSale = await newSale.save();

    // 2. Decrement total inventory
    productRecord.stockLevel -= quantitySold;
    await productRecord.save();

    // 3. Link to Customer purchase history
    if (finalCustomer) {
      await Customer.findByIdAndUpdate(finalCustomer, {
        $push: { purchaseHistory: savedSale._id }
      });
    }

    // 4. Low stock alert check
    let lowStockAlert = null;
    if (productRecord.stockLevel <= productRecord.min_stock_level) {
      const skuLabel = productRecord.sku_code || productRecord.name;
      lowStockAlert = {
        triggered: true,
        sku: skuLabel,
        remaining: productRecord.stockLevel,
        message: `⚠️ ${skuLabel} is ending: Only ${productRecord.stockLevel} unit(s) remaining`
      };
    }

    res.status(201).json({ sale: savedSale, lowStockAlert });
  } catch (error) {
    res.status(400).json({ message: 'Error processing sale', error: error.message });
  }
});

// GET low stock products
router.get('/low-stock', async (req, res) => {
  try {
    const allProducts = await Product.find();
    const lowStock = allProducts.filter(p => p.stockLevel <= p.min_stock_level);
    res.status(200).json(lowStock);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching low stock alerts', error: error.message });
  }
});

// DELETE /api/sales/:id — restores stock and size quantity
router.delete('/:id', async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) return res.status(404).json({ message: 'Sale not found' });

    // 1. Restore total stock
    const productRecord = await Product.findById(sale.product);
    if (productRecord) {
      productRecord.stockLevel += sale.quantitySold;

      // Also restore the specific size quantity if applicable
      if (sale.sizes_sold && sale.sizes_sold.length > 0) {
        for (const saledSize of sale.sizes_sold) {
          const sizeEntry = productRecord.sizes.find(s => s.size === saledSize.size);
          if (sizeEntry) sizeEntry.quantity += saledSize.quantity;
        }
      } else if (sale.size_sold && productRecord.sizes && productRecord.sizes.length > 0) {
        const sizeEntry = productRecord.sizes.find(s => s.size === sale.size_sold);
        if (sizeEntry) sizeEntry.quantity += sale.quantitySold;
      }
      await productRecord.save();
    }

    // 2. Remove from customer purchase history
    if (sale.customer) {
      await Customer.findByIdAndUpdate(sale.customer, {
        $pull: { purchaseHistory: sale._id }
      });
    }

    // 3. Delete the sale
    await Sale.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Sale voided and stock restored successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error voiding sale', error: error.message });
  }
});

// UPDATE sale status (e.g., Unpaid -> Paid)
router.put('/:id/status', async (req, res) => {
  try {
    const sale = await Sale.findByIdAndUpdate(
      req.params.id, 
      { status: req.body.status },
      { new: true }
    ).populate('product').populate('customer');
    if (!sale) return res.status(404).json({ message: 'Sale not found' });
    res.status(200).json(sale);
  } catch (error) {
    res.status(500).json({ message: 'Error updating sale status', error: error.message });
  }
});

module.exports = router;
