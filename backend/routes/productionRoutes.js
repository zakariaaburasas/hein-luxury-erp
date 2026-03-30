const express = require('express');
const router = express.Router();
const Production = require('../models/Production');

// GET all production orders
router.get('/', async (req, res) => {
  try {
    const orders = await Production.find().sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching production orders', error: error.message });
  }
});

// POST new production order
router.post('/', async (req, res) => {
  try {
    const newOrder = new Production(req.body);
    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(400).json({ message: 'Error creating production order', error: error.message });
  }
});

// PUT update production order (status, etc.)
router.put('/:id', async (req, res) => {
  try {
    const updatedOrder = await Production.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedOrder) return res.status(404).json({ message: 'Production order not found' });
    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: 'Error updating production order', error: error.message });
  }
});

// DELETE production order
router.delete('/:id', async (req, res) => {
  try {
    const deletedOrder = await Production.findByIdAndDelete(req.params.id);
    if (!deletedOrder) return res.status(404).json({ message: 'Production order not found' });
    res.status(200).json({ message: 'Production order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting production order', error: error.message });
  }
});

module.exports = router;
