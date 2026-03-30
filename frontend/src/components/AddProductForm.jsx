import React, { useState } from 'react';

export default function AddProductForm({ onAdd, onCancel, initialData }) {
  const [formData, setFormData] = useState(initialData || {
    name: '',
    sku_code: '',
    category: 'Footwear',
    season_collection: '',
    colorway: '',
    size_run: '',
    cost_price: '',
    selling_price: '',
    max_discount_allowed: 0,
    stockLevel: '',
    min_stock_level: 10,
    manufacturer: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      cost_price: parseFloat(formData.cost_price),
      selling_price: parseFloat(formData.selling_price),
      // backward compat aliases
      costPrice: parseFloat(formData.cost_price),
      salePrice: parseFloat(formData.selling_price),
      max_discount_allowed: parseFloat(formData.max_discount_allowed) || 0,
      stockLevel: parseInt(formData.stockLevel),
      min_stock_level: parseInt(formData.min_stock_level),
      sku_code: formData.sku_code.toUpperCase()
    };
    onAdd(payload);
  };



  return (
    <div className="rounded-[1.25rem] border border-brand-border bg-brand-gray p-10 shadow-xl">
      <h3 className="mb-8 font-serif text-xl text-brand-gold">+ Register New SKU</h3>
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Row 1: Name + SKU */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2"><label className="text-xs uppercase tracking-widest text-gray-400">Product Name</label><input type="text" name="name" className="form-control" required value={formData.name} onChange={handleChange} /></div>
          <div className="space-y-2"><label className="text-xs uppercase tracking-widest text-gray-400">SKU Code</label><input type="text" name="sku_code" className="form-control" required value={formData.sku_code} onChange={handleChange} /></div>
        </div>

        {/* Row 2: Category + Collection */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2"><label className="text-xs uppercase tracking-widest text-gray-400">Category</label>
            <select name="category" className="form-control" value={formData.category} onChange={handleChange}>
              <option value="Footwear">Footwear</option><option value="Apparel">Apparel</option><option value="Accessories">Accessories</option>
            </select>
          </div>
          <div className="space-y-2"><label className="text-xs uppercase tracking-widest text-gray-400">Collection</label><input type="text" name="season_collection" className="form-control" value={formData.season_collection} onChange={handleChange} /></div>
        </div>

        {/* Row 3: Colorway + Size Run */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2"><label className="text-xs uppercase tracking-widest text-gray-400">Colorway</label><input type="text" name="colorway" className="form-control" value={formData.colorway} onChange={handleChange} /></div>
          <div className="space-y-2"><label className="text-xs uppercase tracking-widest text-gray-400">Size Run</label><input type="text" name="size_run" className="form-control" value={formData.size_run} onChange={handleChange} /></div>
        </div>

        {/* Row 4: Pricing Math */}
        <div className="grid grid-cols-3 gap-6">
          <div className="space-y-2"><label className="text-xs uppercase tracking-widest text-gray-400">Cost Price ($)</label><input type="number" name="cost_price" className="form-control" required value={formData.cost_price} onChange={handleChange} /></div>
          <div className="space-y-2"><label className="text-xs uppercase tracking-widest text-gray-400">Selling Price ($)</label><input type="number" name="selling_price" className="form-control" required value={formData.selling_price} onChange={handleChange} /></div>
          <div className="space-y-2"><label className="text-xs uppercase tracking-widest text-brand-gold">Max Discount Allowed ($)</label><input type="number" name="max_discount_allowed" className="form-control border-brand-gold/30" required value={formData.max_discount_allowed} onChange={handleChange} /></div>
        </div>

        {/* Row 5: Stock Logic */}
        <div className="grid grid-cols-3 gap-6">
          <div className="space-y-2"><label className="text-xs uppercase tracking-widest text-gray-400">Initial Stock</label><input type="number" name="stockLevel" className="form-control" required value={formData.stockLevel} onChange={handleChange} /></div>
          <div className="space-y-2"><label className="text-xs uppercase tracking-widest text-gray-400">Low Stock Limit</label><input type="number" name="min_stock_level" className="form-control" required value={formData.min_stock_level} onChange={handleChange} /></div>
          <div className="space-y-2"><label className="text-xs uppercase tracking-widest text-gray-400">Manufacturer</label><input type="text" name="manufacturer" className="form-control" required value={formData.manufacturer} onChange={handleChange} /></div>
        </div>

        <div className="flex gap-4 mt-8">
          <button type="button" onClick={onCancel} className="btn-gold border-gray-600 text-gray-400 hover:bg-gray-800 hover:text-white">
            Cancel
          </button>
          <button type="submit" className="btn-gold">Register SKU</button>
        </div>
      </form>
    </div>
  );
}
