const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Hardcoded initial setup if no admin exists
router.post('/setup', async (req, res) => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) return res.status(400).json({ message: 'System already setup.' });

    const admin = new User({
      name: 'Zakaria Aburasas',
      username: 'Zakaria',
      password: 'Aburasas', // In a real app, use bcrypt
      role: 'admin',
      avatar: '/avatars/admin.png'
    });
    await admin.save();
    res.json({ message: 'Primary Admin Provisioned.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials. Access Denied.' });
    }
    
    user.lastLogin = new Date();
    await user.save();

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        username: user.username
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
