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
    <div className="rounded-[1.25rem] border border-brand-border bg-brand-gray p-6 md:p-10 shadow-xl max-w-4xl mx-auto overflow-x-hidden">
      <header className="mb-6 md:mb-8 flex items-center justify-between">
        <h3 className="font-serif text-xl text-brand-gold">
          {initialData ? 'Edit Luxury SKU' : '+ Register New SKU'}
        </h3>
        <button type="button" onClick={onCancel} className="text-gray-500 hover:text-white transition-colors">
          <X size={20} />
        </button>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Row 1: Name + SKU */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-gray-400">Product Name</label>
            <input type="text" name="name" className="form-control" required value={formData.name} onChange={handleChange} placeholder="e.g. Italian Leather Sofa" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-gray-400">SKU Code</label>
            <input type="text" name="sku_code" className="form-control" required value={formData.sku_code} onChange={handleChange} placeholder="HEIN-SOFA-001" />
          </div>
        </div>

        {/* Row 2: Category + Collection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-gray-400">Category</label>
            <select name="category" className="form-control" value={formData.category} onChange={handleChange}>
              <option value="Furniture">Furniture</option>
              <option value="Footwear">Footwear</option>
              <option value="Apparel">Apparel</option>
              <option value="Accessories">Accessories</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-gray-400">Collection</label>
            <input type="text" name="season_collection" className="form-control" value={formData.season_collection} onChange={handleChange} placeholder="e.g. Summer 2024" />
          </div>
        </div>

        {/* Row 3: Colorway + Size Run */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-gray-400">Colorway / Finish</label>
            <input type="text" name="colorway" className="form-control" value={formData.colorway} onChange={handleChange} placeholder="e.g. Obsidian Black" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-gray-400">Size / Dimensions</label>
            <input type="text" name="size_run" className="form-control" value={formData.size_run} onChange={handleChange} placeholder="e.g. Large / 200x100cm" />
          </div>
        </div>

        {/* Row 4: Pricing Math */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-gray-400">Cost ($)</label>
            <input type="number" name="cost_price" className="form-control" required value={formData.cost_price} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-gray-400">Retail ($)</label>
            <input type="number" name="selling_price" className="form-control" required value={formData.selling_price} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-brand-gold">Max Discount ($)</label>
            <input type="number" name="max_discount_allowed" className="form-control border-brand-gold/30" required value={formData.max_discount_allowed} onChange={handleChange} />
          </div>
        </div>

        {/* Row 5: Stock Logic */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-gray-400">Units in Stock</label>
            <input type="number" name="stockLevel" className="form-control" required value={formData.stockLevel} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-gray-400">Low Stock Alert</label>
            <input type="number" name="min_stock_level" className="form-control" required value={formData.min_stock_level} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-gray-400">Manufacturer</label>
            <input type="text" name="manufacturer" className="form-control" required value={formData.manufacturer} onChange={handleChange} placeholder="e.g. HEIN Works" />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mt-10 pt-6 border-t border-brand-border/50">
          <button type="submit" className="btn-gold flex-1 order-1 sm:order-2">
            {initialData ? 'Save Changes' : 'Register SKU'}
          </button>
          <button type="button" onClick={onCancel} className="p-3 px-8 text-gray-500 hover:text-white transition-colors order-2 sm:order-1 text-center">
            Cancel
          </button>
        </div>
      </form>
    </div>

  );
}
