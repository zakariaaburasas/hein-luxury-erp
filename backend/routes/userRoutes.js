const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Management endpoints
router.get('/', async (req, res) => {
  try {
    const users = await User.find({}, '-password').sort({ role: 1, name: 1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    res.json(newUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id, '-password');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, avatar, email, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id, 
      { $set: { name, avatar, email, phone } },
      { new: true, select: '-password' }
    );
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    if (req.params.id === '1') return res.status(403).json({ message: 'Primary admin protected.' });
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User revoked.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update only the last seen timestamp (Ping)
router.put('/ping/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { lastSeen: new Date() }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ success: true, lastSeen: user.lastSeen });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
