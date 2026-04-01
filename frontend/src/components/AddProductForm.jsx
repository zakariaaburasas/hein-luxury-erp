import React, { useState, useRef } from 'react';
import { X, Package, Upload, Camera, Plus, Trash2 } from 'lucide-react';

export default function AddProductForm({ onAdd, onCancel, initialData }) {
  // Build initial sizes from existing data
  const getInitialSizes = () => {
    if (initialData?.sizes && initialData.sizes.length > 0) {
      return initialData.sizes;
    }
    // If old product had size_run text, start with empty sizes
    return [{ size: '', quantity: '' }];
  };

  const [formData, setFormData] = useState(initialData || {
    name: '',
    sku_code: '',
    category: 'Footwear',
    season_collection: '',
    colorway: '',
    cost_price: '',
    selling_price: '',
    max_discount_allowed: 0,
    stockLevel: '',
    min_stock_level: 10,
    manufacturer: '',
    image_url: ''
  });

  const [sizes, setSizes] = useState(getInitialSizes());
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
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const max_size = 800;
          if (width > height) {
            if (width > max_size) { height *= max_size / width; width = max_size; }
          } else {
            if (height > max_size) { width *= max_size / height; height = max_size; }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
          setFormData(f => ({ ...f, image_url: compressedBase64 }));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };

  // Size management handlers
  const addSizeRow = () => setSizes(s => [...s, { size: '', quantity: '' }]);
  
  const removeSizeRow = (index) => setSizes(s => s.filter((_, i) => i !== index));
  
  const updateSize = (index, field, value) => {
    setSizes(s => s.map((entry, i) => i === index ? { ...entry, [field]: value } : entry));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Build valid sizes array (filter out empty rows)
    const validSizes = sizes
      .filter(s => s.size.trim() !== '' && s.quantity !== '')
      .map(s => ({ size: s.size.trim(), quantity: parseInt(s.quantity) || 0 }));

    // Auto-calculate total stock from sizes if sizes are defined
    const totalStockFromSizes = validSizes.length > 0
      ? validSizes.reduce((sum, s) => sum + s.quantity, 0)
      : parseInt(formData.stockLevel) || 0;

    const payload = {
      ...formData,
      cost_price: parseFloat(formData.cost_price),
      selling_price: parseFloat(formData.selling_price),
      costPrice: parseFloat(formData.cost_price),
      salePrice: parseFloat(formData.selling_price),
      max_discount_allowed: parseFloat(formData.max_discount_allowed) || 0,
      stockLevel: totalStockFromSizes,
      min_stock_level: parseInt(formData.min_stock_level),
      sku_code: formData.sku_code.toUpperCase(),
      sizes: validSizes,
      // Build human-readable size_run for display
      size_run: validSizes.map(s => s.size).join(', ')
    };
    onAdd(payload);
  };

  // Calculate total units from sizes for live display
  const totalUnits = sizes
    .filter(s => s.size.trim() !== '' && s.quantity !== '')
    .reduce((sum, s) => sum + (parseInt(s.quantity) || 0), 0);

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
              <p className="text-[10px] text-txt-muted uppercase tracking-widest font-bold font-sans">Inventory Ledger v3.0 — Size Tracking</p>
           </div>
        </div>
        <button type="button" onClick={onCancel} className="p-2 rounded-lg hover:bg-brand-gold/10 transition-colors text-txt-muted hover:text-txt-main">
          <X size={20} />
        </button>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Image + Name/SKU */}
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
                <input type="text" name="name" className="form-control font-sans" required value={formData.name} onChange={handleChange} placeholder="e.g. HEIN Nike Premium" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold font-sans">SKU Code</label>
                <input type="text" name="sku_code" className="form-control font-mono" required value={formData.sku_code} onChange={handleChange} placeholder="HEIN-NK-001" />
              </div>
           </div>
        </div>

        {/* Category + Collection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-gray-400 font-sans">Category</label>
            <select name="category" className="form-control font-sans" value={formData.category} onChange={handleChange}>
              <option value="Footwear">Footwear</option>
              <option value="Apparel">Apparel</option>
              <option value="Accessories">Accessories</option>
              <option value="Furniture">Furniture</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-gray-400 font-sans">Collection</label>
            <input type="text" name="season_collection" className="form-control font-sans" value={formData.season_collection} onChange={handleChange} placeholder="e.g. Summer 2024" />
          </div>
        </div>

        {/* Color + Manufacturer */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-gray-400 font-sans">Color/Finish</label>
            <input type="text" name="colorway" className="form-control font-sans" value={formData.colorway} onChange={handleChange} placeholder="e.g. Obsidian Black" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-gray-400 font-sans">Manufacturer</label>
            <input type="text" name="manufacturer" className="form-control font-sans" required value={formData.manufacturer} onChange={handleChange} placeholder="e.g. Nike / China Cargo" />
          </div>
        </div>

        {/* ═══ SIZE INVENTORY SECTION ═══ */}
        <div className="rounded-[1.25rem] border border-brand-gold/30 bg-brand-gold/5 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-brand-gold font-bold text-sm uppercase tracking-widest">Size Inventory</h4>
              <p className="text-[10px] text-txt-muted mt-0.5">Add each size with its exact quantity. The system auto-tracks what's left per size.</p>
            </div>
            {totalUnits > 0 && (
              <div className="text-right">
                <p className="text-[10px] text-txt-muted uppercase tracking-widest">Total Units</p>
                <p className="font-serif text-2xl font-bold text-brand-gold">{totalUnits}</p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {/* Header row */}
            <div className="grid grid-cols-[1fr_1fr_40px] gap-3">
              <p className="text-[10px] uppercase tracking-widest text-txt-muted font-bold px-1">Size</p>
              <p className="text-[10px] uppercase tracking-widest text-txt-muted font-bold px-1">Qty in Stock</p>
              <div />
            </div>

            {sizes.map((entry, index) => (
              <div key={index} className="grid grid-cols-[1fr_1fr_40px] gap-3 items-center">
                <input
                  type="text"
                  className="form-control font-mono text-center"
                  placeholder="e.g. 40"
                  value={entry.size}
                  onChange={e => updateSize(index, 'size', e.target.value)}
                />
                <input
                  type="number"
                  className="form-control font-sans text-center"
                  placeholder="e.g. 150"
                  min="0"
                  value={entry.quantity}
                  onChange={e => updateSize(index, 'quantity', e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => removeSizeRow(index)}
                  disabled={sizes.length === 1}
                  className="w-10 h-10 flex items-center justify-center rounded-lg text-txt-muted hover:text-red-500 hover:bg-red-500/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addSizeRow}
              className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-brand-gold/40 rounded-xl text-brand-gold text-sm hover:bg-brand-gold/10 transition-all font-bold tracking-widest"
            >
              <Plus size={16} />
              Add Size
            </button>
          </div>
        </div>

        {/* Pricing */}
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
            <input type="number" name="max_discount_allowed" className="form-control border-brand-gold/30 font-sans" value={formData.max_discount_allowed} onChange={handleChange} />
          </div>
        </div>

        {/* Stock threshold */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-gray-400 font-sans">
              {totalUnits > 0 ? `Total Units (auto: ${totalUnits})` : 'Units in Stock (if no sizes)'}
            </label>
            <input
              type="number"
              name="stockLevel"
              className="form-control font-sans"
              value={totalUnits > 0 ? totalUnits : formData.stockLevel}
              onChange={handleChange}
              readOnly={totalUnits > 0}
              placeholder={totalUnits > 0 ? 'Auto-calculated from sizes' : 'Enter total units'}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-gray-400 font-sans">Low Stock Alert Threshold</label>
            <input type="number" name="min_stock_level" className="form-control font-sans" required value={formData.min_stock_level} onChange={handleChange} />
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
