const express = require('express');
const router = express.Router();
const User = require('../models/User');
const admin = require('../firebaseAdmin');

// Hardcoded initial setup if no admin exists
router.post('/setup', async (req, res) => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) return res.status(400).json({ message: 'System already setup.' });

    const adminUser = new User({
      name: 'Zakaria Aburasas',
      username: 'Zakaria',
      password: 'Aburasas',
      role: 'admin',
      email: 'zakaria@heinluxury.com',
      avatar: '/avatars/admin.png'
    });
    await adminUser.save();
    res.json({ message: 'Primary Admin Provisioned.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Legacy username/password login (kept for backward compatibility)
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
      user: { id: user._id, name: user.name, role: user.role, avatar: user.avatar, username: user.username }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// NEW: Firebase login (Google or Email/Password via Firebase)
router.post('/firebase-login', async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) return res.status(400).json({ message: 'No token provided.' });

  try {
    // Verify the Firebase ID token
    const decoded = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name, picture } = decoded;

    if (!email) return res.status(400).json({ message: 'No email associated with this account.' });

    // Find or create user in MongoDB
    let user = await User.findOne({ $or: [{ firebaseUid: uid }, { email }] });

    if (!user) {
      // Brand new user — check if there is ANY admin yet
      const adminExists = await User.findOne({ role: 'admin' });

      // First person ever to sign in becomes Admin automatically
      const role = adminExists ? 'staff' : 'admin';

      user = new User({
        name: name || email.split('@')[0],
        username: email.split('@')[0],
        email,
        firebaseUid: uid,
        role,
        avatar: picture || '',
        password: '' // No password needed for Firebase users
      });
      await user.save();
    } else {
      // Update firebase UID and last login if not already linked
      if (!user.firebaseUid) user.firebaseUid = uid;
      if (picture && !user.avatar) user.avatar = picture;
      user.lastLogin = new Date();
      await user.save();
    }

    res.json({
      success: true,
      user: { id: user._id, name: user.name, role: user.role, email: user.email, avatar: user.avatar || picture }
    });

  } catch (err) {
    console.error('Firebase login error:', err.message);
    res.status(401).json({ success: false, message: 'Authentication failed. Invalid or expired token.' });
  }
});

module.exports = router;
