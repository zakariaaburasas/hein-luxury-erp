const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    sparse: true
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  vipStatus: {
    type: String,
    enum: ['Bronze', 'Silver', 'Gold', 'VIP'],
    default: 'Bronze'
  },
  purchaseHistory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sale'
  }]
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);
