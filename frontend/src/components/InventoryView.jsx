import React, { useState, useEffect } from 'react';
import AddProductForm from './AddProductForm';
import { AlertTriangle, Edit3, Trash2 } from 'lucide-react';
import API_URL from '../api/config';

export default function InventoryView({ searchQuery }) {
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

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
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
      }
    } catch (error) {
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
          <h2 className="font-serif text-2xl tracking-wide text-white">Inventory Master</h2>
          <p className="mt-1 text-sm text-gray-400">
            {products.length} SKU{products.length !== 1 ? 's' : ''} registered
            {lowStockCount > 0 && (
              <span className="ml-3 text-amber-400 font-bold">
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
        <section className="overflow-x-auto rounded-[1.25rem] border border-brand-border bg-brand-gray shadow-xl">
          <table className="w-full text-left text-sm">
            <thead className="bg-black/40 text-xs uppercase tracking-widest text-brand-gold">
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
                      isCritical ? 'bg-red-900/5 hover:bg-red-900/10' :
                      isLow ? 'bg-amber-900/5 hover:bg-amber-900/10' :
                      'hover:bg-white/5'
                    }`}
                  >
                    <td className="px-5 py-4">
                      {p.image_url ? (
                        <div className="w-12 h-12 rounded bg-black flex items-center justify-center overflow-hidden border border-brand-border shadow-md">
                          <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded bg-brand-black border border-brand-border/50 border-dashed flex items-center justify-center text-gray-700 font-mono text-[0.55rem] tracking-widest text-center shadow-inner">
                          N/A
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {isLow && <AlertTriangle size={12} className={isCritical ? 'text-red-400' : 'text-amber-400'} />}
                        <span className={`font-mono text-xs font-bold ${isLow ? (isCritical ? 'text-red-400' : 'text-amber-400') : 'text-brand-gold'}`}>
                          {p.sku_code || '—'}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-medium text-white">{p.name}</td>
                    <td className="px-5 py-4 text-xs text-gray-400">{p.season_collection || '—'}</td>
                    <td className="px-5 py-4 text-xs text-gray-400">{p.colorway || '—'}</td>
                    <td className="px-5 py-4 text-xs text-gray-400 font-mono">{p.size_run || '—'}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold border ${
                        p.category === 'Footwear' ? 'bg-brand-gold/10 text-brand-gold border-brand-gold/30' :
                        p.category === 'Apparel' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                        'bg-gray-500/10 text-gray-400 border-gray-500/30'
                      }`}>
                        {p.category}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {isLow ? (
                        <span className={`font-bold ${isCritical ? 'text-red-400' : 'text-amber-400'}`}>
                          {p.stockLevel} ⚠
                        </span>
                      ) : (
                        <span className="text-gray-200">{p.stockLevel}</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-gray-400 font-mono text-xs">${p.cost_price || p.costPrice || '—'}</td>
                    <td className="px-5 py-4 font-serif text-base font-bold text-white">${p.selling_price || p.salePrice || '—'}</td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <button 
                          title="Edit SKU" 
                          onClick={() => setEditingProduct(p)}
                          className="p-1.5 text-gray-400 hover:text-brand-gold hover:bg-brand-gold/10 rounded-md transition-all"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button 
                          title="Delete SKU" 
                          onClick={() => handleDeleteProduct(p._id)}
                          className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-all"
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
      )}
    </div>
  );
}
