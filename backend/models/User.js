const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, default: '' },
  role: { type: String, enum: ['admin', 'staff', 'manager'], default: 'staff' },
  avatar: { type: String, default: '' },
  email: { type: String, sparse: true },
  firebaseUid: { type: String, sparse: true },
  phone: { type: String },
  lastLogin: { type: Date },
  lastSeen: { type: Date },
  status: { type: String, default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
