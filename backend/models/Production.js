const mongoose = require('mongoose');

const productionSchema = new mongoose.Schema({
  poNumber: {
    type: String,
    required: true,
    unique: true
  },
  factory: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['In Production', 'Shipped', 'Customs Clearance', 'Delivered'],
    default: 'In Production'
  },
  expectedArrival: {
    type: Date,
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Production', productionSchema);
