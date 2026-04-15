import React, { useState, useEffect } from 'react';
import AddProductForm from './AddProductForm';
import { AlertTriangle, Edit3, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import API_URL from '../api/config';

// Size breakdown mini-table inside inventory
function SizeBreakdown({ sizes }) {
  if (!sizes || sizes.length === 0) return null;
  return (
    <div className="mt-3 pt-3 border-t border-brand-border/50">
      <p className="text-[9px] uppercase tracking-widest text-txt-muted font-bold mb-2">Sizes in Stock</p>
      <div className="flex flex-wrap gap-2">
        {sizes.map((s, i) => (
          <div key={i} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-bold font-mono ${
            s.quantity === 0
              ? 'border-red-500/30 bg-red-500/10 text-red-500'
              : s.quantity <= 5
              ? 'border-amber-500/30 bg-amber-500/10 text-amber-500'
              : 'border-brand-border bg-bg-main text-txt-main'
          }`}>
            <span>{s.size}</span>
            <span className="text-[10px] opacity-70">×{s.quantity}</span>
            {s.quantity === 0 && <span className="text-[8px] uppercase ml-0.5">SOLD OUT</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function InventoryView({ searchQuery, userId }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [expandedRows, setExpandedRows] = useState({});

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
      if (!isEdit) payload.createdBy = userId;

      const res = await fetch(url, {
        method,
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
        let errorDetails = 'Unknown Rejection';
        try {
          const rawText = await res.text();
          try {
            const errObj = JSON.parse(rawText);
            errorDetails = `HTTP ${res.status}: ${errObj.message || ''} | ${errObj.error || ''}`;
          } catch(e) {
            errorDetails = `HTTP ${res.status} [Platform Error]: ${res.statusText}`;
          }
        } catch(e) {
          errorDetails = `HTTP ${res.status} [Network Read Error]`;
        }
        alert(`Engine Status Alert: ${errorDetails}`);
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
      if (res.ok) setProducts(prev => prev.filter(p => p._id !== id));
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const toggleRow = (id) => setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));

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
            {products.length} SKU{products.length !== 1 ? 's' : ''} registered · {products.reduce((sum, p) => sum + (p.stockLevel || 0), 0).toLocaleString()} units in stock
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
              const hasSizes = p.sizes && p.sizes.length > 0;
              const isExpanded = expandedRows[p._id];
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
                      <p className="text-[10px] text-txt-muted uppercase tracking-widest mb-0.5">Total Stock</p>
                      <p className={`text-sm font-bold ${isLow ? (isCritical ? 'text-red-500' : 'text-amber-500') : 'text-txt-main'}`}>
                        {p.stockLevel} units
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-txt-muted uppercase tracking-widest mb-0.5">Retail Price</p>
                      <p className="text-sm font-serif font-bold text-brand-gold">${p.selling_price || p.salePrice || '0'}</p>
                    </div>
                  </div>

                  {/* Size breakdown toggle */}
                  {hasSizes && (
                    <button
                      onClick={() => toggleRow(p._id)}
                      className="w-full flex items-center justify-between py-2 text-[10px] text-brand-gold font-bold uppercase tracking-widest hover:opacity-80 transition"
                    >
                      Sizes ({p.sizes.length})
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  )}
                  {hasSizes && isExpanded && <SizeBreakdown sizes={p.sizes} />}

                  <div className="flex justify-between items-center mt-4">
                    <div className="text-[10px] text-txt-muted font-mono">{p.season_collection}</div>
                    <div className="flex gap-2">
                       <button onClick={() => setEditingProduct(p)} className="p-2 bg-bg-main border border-brand-border rounded-lg text-txt-muted hover:text-brand-gold transition-colors">
                         <Edit3 size={14} />
                       </button>
                       <button onClick={() => handleDeleteProduct(p._id)} className="p-2 bg-bg-main border border-brand-border rounded-lg text-txt-muted hover:text-red-500 transition-colors">
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
                  <th className="border-b border-brand-border px-5 py-4">Sizes Available</th>
                  <th className="border-b border-brand-border px-5 py-4">Category</th>
                  <th className="border-b border-brand-border px-5 py-4">Total Stock</th>
                  <th className="border-b border-brand-border px-5 py-4">Cost</th>
                  <th className="border-b border-brand-border px-5 py-4">Retail</th>
                  <th className="border-b border-brand-border px-5 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(p => {
                  const isLow = p.stockLevel <= p.min_stock_level;
                  const isCritical = p.stockLevel <= Math.floor(p.min_stock_level / 2);
                  const hasSizes = p.sizes && p.sizes.length > 0;
                  const isExpanded = expandedRows[p._id];
                  return (
                    <>
                      <tr
                        key={p._id}
                        className={`transition-colors border-b border-brand-border/30 ${
                          isCritical ? 'bg-red-500/5 hover:bg-red-500/10' :
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
                            <div className="w-12 h-12 rounded bg-bg-main border border-dashed border-brand-border/50 flex items-center justify-center text-txt-muted font-mono text-[0.55rem]">N/A</div>
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
                        <td className="px-5 py-4">
                          {hasSizes ? (
                            <button
                              onClick={() => toggleRow(p._id)}
                              className="flex items-center gap-1.5 text-brand-gold text-xs font-bold hover:opacity-80 transition"
                            >
                              {p.sizes.length} sizes
                              {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                            </button>
                          ) : (
                            <span className="text-xs text-txt-muted">—</span>
                          )}
                        </td>
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
                            <span className={`font-bold ${isCritical ? 'text-red-500' : 'text-amber-500'}`}>{p.stockLevel} ⚠</span>
                          ) : (
                            <span className="text-txt-main font-bold">{p.stockLevel}</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-txt-muted font-mono text-xs">${p.cost_price || p.costPrice || '—'}</td>
                        <td className="px-5 py-4 font-serif text-base font-bold text-brand-gold">${p.selling_price || p.salePrice || '—'}</td>
                        <td className="px-5 py-4 text-center">
                          <div className="flex items-center justify-center gap-3">
                            <button title="Edit SKU" onClick={() => setEditingProduct(p)} className="p-1.5 text-txt-muted hover:text-brand-gold hover:bg-brand-gold/10 rounded-md transition-all">
                              <Edit3 size={16} />
                            </button>
                            <button title="Delete SKU" onClick={() => handleDeleteProduct(p._id)} className="p-1.5 text-txt-muted hover:text-red-500 hover:bg-red-500/10 rounded-md transition-all">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {/* Expanded size row */}
                      {hasSizes && isExpanded && (
                        <tr key={`${p._id}-sizes`} className="bg-bg-main/30">
                          <td colSpan={11} className="px-8 py-4">
                            <div className="flex flex-wrap gap-2">
                              {p.sizes.map((s, i) => (
                                <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-xl border font-mono text-sm font-bold ${
                                  s.quantity === 0
                                    ? 'border-red-500/40 bg-red-500/10 text-red-400'
                                    : s.quantity <= 5
                                    ? 'border-amber-500/40 bg-amber-500/10 text-amber-400'
                                    : 'border-brand-gold/30 bg-brand-gold/5 text-brand-gold'
                                }`}>
                                  <span>Size {s.size}</span>
                                  <span className="text-xs opacity-70">— {s.quantity} left</span>
                                  {s.quantity === 0 && <span className="text-[9px] bg-red-500/20 px-1.5 py-0.5 rounded uppercase font-bold">Sold Out</span>}
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
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
