const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  },
  staff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  quantitySold: {
    type: Number,
    required: true,
    min: 1
  },
  // Keep for backward compatibility
  size_sold: {
    type: String,
    trim: true,
    default: ''
  },
  // NEW: Track multiple sizes and quantities
  sizes_sold: {
    type: [{ size: String, quantity: Number }],
    default: []
  },
  revenue: {
    type: Number,
    required: true
  },
  payment_method: {
    type: String,
    trim: true,
    default: ''
  },
  status: {
    type: String,
    trim: true,
    default: 'Paid'
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Sale', saleSchema);
