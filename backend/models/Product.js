const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  sku_code: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    uppercase: true
  },
  category: {
    type: String,
    enum: ['Footwear', 'Apparel', 'Accessories', 'Furniture'],
    required: true
  },
  season_collection: {
    type: String,
    trim: true,
    default: ''
  },
  colorway: {
    type: String,
    trim: true,
    default: ''
  },
  size_run: {
    type: String,
    trim: true,
    default: ''
  },
  stockLevel: {
    type: Number,
    required: true,
    default: 0
  },
  min_stock_level: {
    type: Number,
    default: 10
  },
  cost_price: {
    type: Number,
    required: true
  },
  selling_price: {
    type: Number,
    required: true
  },
  max_discount_allowed: {
    type: Number,
    default: 0
  },
  // Keep old fields as aliases for backward compatibility
  costPrice: {
    type: Number
  },
  salePrice: {
    type: Number
  },
  manufacturer: {
    type: String,
    trim: true,
    default: ''
  },
  image_url: {
    type: String,
    trim: true,
    default: ''
  }
}, { timestamps: true });

// Virtual: is this product low on stock?
productSchema.virtual('isLowStock').get(function () {
  return this.stockLevel <= this.min_stock_level;
});

productSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
