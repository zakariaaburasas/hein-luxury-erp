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

router.delete('/:id', async (req, res) => {
  try {
    if (req.params.id === '1') return res.status(403).json({ message: 'Primary admin protected.' });
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User revoked.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
