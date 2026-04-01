import React, { useState, useEffect } from 'react';
import AddProductForm from './AddProductForm';
import { AlertTriangle, Edit3, Trash2 } from 'lucide-react';
import API_URL from '../api/config';

export default function InventoryView({ searchQuery, userId }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/products`);
      if (response.ok) setProducts(await response.json());
    } catch (error) {
      console.error('Failed fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (productData) => {
    try {
      const isEdit = !!editingProduct;
      const url = isEdit ? `${API_URL}/api/products/${editingProduct._id}` : `${API_URL}/api/products`;
      const method = isEdit ? 'PUT' : 'POST';

      const payload = { ...productData };
      if (!isEdit) payload.createdBy = userId; // Track who added it

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const savedDoc = await res.json();
        if (isEdit) {
          setProducts(prev => prev.map(p => p._id === savedDoc._id ? savedDoc : p));
        } else {
          setProducts(prev => [savedDoc, ...prev]);
        }
        setShowAddForm(false);
        setEditingProduct(null);
      } else {
        const err = await res.json().catch(() => ({ message: res.statusText }));
        alert(`Engine Error: ${err.message || 'The server rejected the entry'}`);
      }
    } catch (error) {
      alert(`Network Failure: Could not reach ${API_URL}`);
      console.error('Error saving product:', error);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this SKU forever?')) return;
    try {
      const res = await fetch(`${API_URL}/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts(prev => prev.filter(p => p._id !== id));
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes((searchQuery || '').toLowerCase()) ||
    (p.sku_code || '').toLowerCase().includes((searchQuery || '').toLowerCase())
  );

  const lowStockCount = products.filter(p => p.stockLevel <= p.min_stock_level).length;

  if (loading) return <div className="text-brand-gold animate-pulse tracking-widest text-sm uppercase py-12">Syncing inventory ledger...</div>;

  if (showAddForm || editingProduct) return (
    <AddProductForm 
      initialData={editingProduct}
      onCancel={() => { setShowAddForm(false); setEditingProduct(null); }} 
      onAdd={handleAddProduct} 
    />
  );

  return (
    <div>
      <header className="mb-10 flex items-center justify-between border-b border-brand-border pb-6">
        <div>
          <h2 className="font-serif text-2xl tracking-wide text-txt-main">Inventory Master</h2>
          <p className="mt-1 text-sm text-txt-muted">
            {products.length} SKU{products.length !== 1 ? 's' : ''} registered
            {lowStockCount > 0 && (
              <span className="ml-3 text-amber-500 font-bold dark:text-amber-400">
                · <AlertTriangle size={12} className="inline mb-0.5" /> {lowStockCount} low stock alert{lowStockCount > 1 ? 's' : ''}
              </span>
            )}
          </p>
        </div>
        <button className="btn-gold" onClick={() => setShowAddForm(true)}>+ Register New SKU</button>
      </header>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-24 text-gray-500 font-mono text-sm border border-brand-border border-dashed rounded-xl">
          {searchQuery ? `No results found for "${searchQuery}"` : "No products registered. Add your first SKU above."}
        </div>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
            {filteredProducts.map(p => {
              const isLow = p.stockLevel <= p.min_stock_level;
              const isCritical = p.stockLevel <= Math.floor(p.min_stock_level / 2);
              return (
                <div key={p._id} className={`rounded-[1.25rem] border p-5 bg-bg-card transition-all ${
                  isCritical ? 'border-red-500/50' : isLow ? 'border-amber-500/50' : 'border-brand-border'
                }`}>
                  <div className="flex gap-4 mb-4">
                    <div className="w-16 h-16 shrink-0 rounded-lg bg-bg-main overflow-hidden border border-brand-border">
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-txt-muted">N/A</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-[10px] font-bold text-brand-gold truncate">{p.sku_code}</span>
                        {isLow && <AlertTriangle size={10} className={isCritical ? 'text-red-500' : 'text-amber-500'} />}
                      </div>
                      <h4 className="text-sm font-semibold text-txt-main truncate">{p.name}</h4>
                      <p className="text-[10px] text-txt-muted uppercase tracking-widest mt-1">{p.category} · {p.colorway}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 pb-4 border-b border-brand-border/50">
                    <div>
                      <p className="text-[10px] text-txt-muted uppercase tracking-widest mb-0.5">Stock</p>
                      <p className={`text-sm font-bold ${isLow ? (isCritical ? 'text-red-500' : 'text-amber-500') : 'text-txt-main'}`}>
                        {p.stockLevel} units
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-txt-muted uppercase tracking-widest mb-0.5">Retail Price</p>
                      <p className="text-sm font-serif font-bold text-brand-gold">${p.selling_price || p.salePrice || '0'}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-4">
                    <div className="text-[10px] text-txt-muted font-mono">
                      {p.season_collection}
                    </div>
                    <div className="flex gap-2">
                       <button onClick={() => setEditingProduct(p)} className="p-2 bg-bg-main border border-brand-border rounded-lg text-txt-muted hover:text-brand-gold transition-colors">
                         <span className="sr-only">Edit</span>
                         <Edit3 size={14} />
                       </button>
                       <button onClick={() => handleDeleteProduct(p._id)} className="p-2 bg-bg-main border border-brand-border rounded-lg text-txt-muted hover:text-red-500 transition-colors">
                         <span className="sr-only">Delete</span>
                         <Trash2 size={14} />
                       </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View */}
          <section className="hidden lg:block overflow-x-auto rounded-[1.25rem] border border-brand-border bg-bg-card shadow-xl">
            <table className="w-full text-left text-sm">
              <thead className="bg-bg-main/50 text-xs uppercase tracking-widest text-brand-gold">
                <tr>
                  <th className="border-b border-brand-border px-5 py-4">Image</th>
                  <th className="border-b border-brand-border px-5 py-4">SKU Code</th>
                  <th className="border-b border-brand-border px-5 py-4">Product Name</th>
                  <th className="border-b border-brand-border px-5 py-4">Collection</th>
                  <th className="border-b border-brand-border px-5 py-4">Colorway</th>
                  <th className="border-b border-brand-border px-5 py-4">Sizes</th>
                  <th className="border-b border-brand-border px-5 py-4">Category</th>
                  <th className="border-b border-brand-border px-5 py-4">Stock</th>
                  <th className="border-b border-brand-border px-5 py-4">Cost</th>
                  <th className="border-b border-brand-border px-5 py-4">Retail</th>
                  <th className="border-b border-brand-border px-5 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {filteredProducts.map(p => {
                  const isLow = p.stockLevel <= p.min_stock_level;
                  const isCritical = p.stockLevel <= Math.floor(p.min_stock_level / 2);
                  return (
                    <tr
                      key={p._id}
                      className={`transition-colors ${
                        isCritical ? 'bg-red-500/5 hover:bg-red-500/10 text-red-500' :
                        isLow ? 'bg-amber-500/5 hover:bg-amber-500/10' :
                        'hover:bg-brand-gold/5'
                      }`}
                    >
                      <td className="px-5 py-4">
                        {p.image_url ? (
                          <div className="w-12 h-12 rounded bg-bg-main flex items-center justify-center overflow-hidden border border-brand-border shadow-md">
                            <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded bg-bg-main border border-brand-border/50 border-dashed flex items-center justify-center text-txt-muted font-mono text-[0.55rem] tracking-widest text-center shadow-inner">
                            N/A
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {isLow && <AlertTriangle size={12} className={isCritical ? 'text-red-500' : 'text-amber-500'} />}
                          <span className={`font-mono text-xs font-bold ${isLow ? (isCritical ? 'text-red-500' : 'text-amber-500') : 'text-brand-gold'}`}>
                            {p.sku_code || '—'}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-medium text-txt-main">{p.name}</td>
                      <td className="px-5 py-4 text-xs text-txt-muted">{p.season_collection || '—'}</td>
                      <td className="px-5 py-4 text-xs text-txt-muted">{p.colorway || '—'}</td>
                      <td className="px-5 py-4 text-xs text-txt-muted font-mono">{p.size_run || '—'}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${
                          p.category === 'Footwear' ? 'bg-brand-gold/10 text-brand-gold border-brand-gold/30' :
                          p.category === 'Apparel' ? 'bg-blue-500/10 text-blue-500 border-blue-500/10' :
                          p.category === 'Furniture' ? 'bg-purple-500/10 text-purple-500 border-purple-500/10' :
                          'bg-txt-muted/10 text-txt-muted border-txt-muted/10'
                        }`}>
                          {p.category}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {isLow ? (
                          <span className={`font-bold ${isCritical ? 'text-red-500' : 'text-amber-500'}`}>
                            {p.stockLevel} ⚠
                          </span>
                        ) : (
                          <span className="text-txt-main font-bold">{p.stockLevel}</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-txt-muted font-mono text-xs">${p.cost_price || p.costPrice || '—'}</td>
                      <td className="px-5 py-4 font-serif text-base font-bold text-brand-gold">${p.selling_price || p.salePrice || '—'}</td>
                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <button 
                            title="Edit SKU" 
                            onClick={() => setEditingProduct(p)}
                            className="p-1.5 text-txt-muted hover:text-brand-gold hover:bg-brand-gold/10 rounded-md transition-all"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button 
                            title="Delete SKU" 
                            onClick={() => handleDeleteProduct(p._id)}
                            className="p-1.5 text-txt-muted hover:text-red-500 hover:bg-red-500/10 rounded-md transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        </>
      )}
    </div>
  );
}
