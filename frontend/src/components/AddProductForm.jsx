import React, { useState, useRef } from 'react';
import { X, Package, Upload, Camera } from 'lucide-react';

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
    manufacturer: '',
    image_url: ''
  });
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(f => ({ ...f, [name]: value }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(f => ({ ...f, image_url: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      cost_price: parseFloat(formData.cost_price),
      selling_price: parseFloat(formData.selling_price),
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
    <div className="rounded-[1.25rem] border border-brand-border bg-bg-card p-6 md:p-10 shadow-xl max-w-4xl mx-auto overflow-x-hidden animate-in fade-in zoom-in-95 duration-300">
      <header className="mb-8 flex items-center justify-between border-b border-brand-border pb-4">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-xl bg-brand-gold/10 flex items-center justify-center text-brand-gold border border-brand-gold/20">
              <Package size={20} />
           </div>
           <div>
              <h3 className="font-serif text-xl text-brand-gold">
                {initialData ? 'Update Product' : 'Add New Product'}
              </h3>
              <p className="text-[10px] text-txt-muted uppercase tracking-widest font-bold font-sans">Inventory Ledger v2.4</p>
           </div>
        </div>
        <button type="button" onClick={onCancel} className="p-2 rounded-lg hover:bg-brand-gold/10 transition-colors text-txt-muted hover:text-txt-main">
          <X size={20} />
        </button>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Asset Recognition (Image) */}
        <div className="flex flex-col md:flex-row gap-8 items-center">
           <div className="relative group">
              <div 
                onClick={() => fileInputRef.current.click()}
                className="w-40 h-40 rounded-[2rem] bg-black/40 border-2 border-brand-border overflow-hidden flex items-center justify-center relative cursor-pointer hover:border-brand-gold/50 transition-all shadow-inner"
              >
                 {formData.image_url ? (
                   <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                 ) : (
                   <div className="text-center p-4">
                      <Camera size={24} className="mx-auto mb-2 text-gray-600" />
                      <p className="text-[8px] uppercase tracking-widest text-gray-500 font-bold font-sans">Upload Photo</p>
                   </div>
                 )}
                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Upload size={24} className="text-white" />
                 </div>
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
           </div>

           <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold font-sans">Product Name</label>
                <input type="text" name="name" className="form-control font-sans" required value={formData.name} onChange={handleChange} placeholder="e.g. Italian Leather Sofa" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold font-sans">SKU Code</label>
                <input type="text" name="sku_code" className="form-control font-mono" required value={formData.sku_code} onChange={handleChange} placeholder="HEIN-XXXX-001" />
              </div>
           </div>
        </div>

        {/* Row 2: Category + Collection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-gray-400 font-sans">Category</label>
            <select name="category" className="form-control font-sans" value={formData.category} onChange={handleChange}>
              <option value="Furniture">Furniture</option>
              <option value="Footwear">Footwear</option>
              <option value="Apparel">Apparel</option>
              <option value="Accessories">Accessories</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-gray-400 font-sans">Collection</label>
            <input type="text" name="season_collection" className="form-control font-sans" value={formData.season_collection} onChange={handleChange} placeholder="e.g. Summer 2024" />
          </div>
        </div>

        {/* Row 3: Colorway + Size Run */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-gray-400 font-sans">Color/Finish</label>
            <input type="text" name="colorway" className="form-control font-sans" value={formData.colorway} onChange={handleChange} placeholder="e.g. Obsidian Black" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-gray-400 font-sans">Size/Dimensions</label>
            <input type="text" name="size_run" className="form-control font-sans" value={formData.size_run} onChange={handleChange} placeholder="e.g. Large" />
          </div>
        </div>

        {/* Row 4: Pricing Math */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-gray-400 font-sans">Cost ($)</label>
            <input type="number" name="cost_price" className="form-control font-sans" required value={formData.cost_price} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-gray-400 font-sans">Retail ($)</label>
            <input type="number" name="selling_price" className="form-control font-sans" required value={formData.selling_price} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-brand-gold font-sans font-bold">Max Discount ($)</label>
            <input type="number" name="max_discount_allowed" className="form-control border-brand-gold/30 font-sans" required value={formData.max_discount_allowed} onChange={handleChange} />
          </div>
        </div>

        {/* Row 5: Stock Logic */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-gray-400 font-sans">Units in Stock</label>
            <input type="number" name="stockLevel" className="form-control font-sans" required value={formData.stockLevel} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-gray-400 font-sans">Low Stock Alert</label>
            <input type="number" name="min_stock_level" className="form-control font-sans" required value={formData.min_stock_level} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-gray-400 font-sans">Manufacturer</label>
            <input type="text" name="manufacturer" className="form-control font-sans" required value={formData.manufacturer} onChange={handleChange} placeholder="e.g. HEIN Works" />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mt-10 pt-6 border-t border-brand-border/50">
          <button type="submit" className="btn-gold flex-1 order-1 sm:order-2 font-bold tracking-widest">
            {initialData ? 'Update Product' : 'Add Product'}
          </button>
          <button type="button" onClick={onCancel} className="p-3 px-8 text-txt-muted hover:text-txt-main transition-colors order-2 sm:order-1 text-center font-sans">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
