import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, Trash2, RotateCcw, User } from 'lucide-react';
import API_URL from '../api/config';

// Toast notification component
export function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const isAlert = toast.type === 'alert';

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-start gap-3 rounded-[1rem] border px-5 py-4 shadow-2xl backdrop-blur-md transition-all animate-[slideUp_0.3s_ease] max-w-sm ${
      isAlert
        ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:bg-amber-900/80 dark:border-amber-500/50 dark:text-amber-200'
        : 'bg-green-500/10 border-green-500/20 text-green-600 dark:bg-green-900/80 dark:border-green-500/50 dark:text-green-200'
    }`}>
      {isAlert
        ? <AlertTriangle size={20} className="text-amber-500 shrink-0 mt-0.5" />
        : <CheckCircle size={20} className="text-green-500 shrink-0 mt-0.5" />
      }
      <div className="flex-1">
        <p className="font-bold text-sm">{isAlert ? '⚠️ System Alert / Error' : '✅ Sale Recorded'}</p>
        <p className="text-xs mt-0.5 opacity-80">{toast.message}</p>
      </div>
      <button onClick={onClose} className="opacity-50 hover:opacity-100 transition shrink-0">
        <X size={16} />
      </button>
    </div>
  );
}

export default function SalesView({ searchQuery, userId }) {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({ 
    product: '', 
    customer: '', 
    customerName: '', 
    customerPhone: '', 
    vipStatus: 'None',
    quantitySold: 1, 
    discountAmount: 0, 
    status: 'Paid', 
    payment_method: 'Zaad' 
  });
  const [submitting, setSubmitting] = useState(false);

  const filteredSales = sales.filter(s => 
    (s.product?.name || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
    (s.customer?.name || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
    (s.product?.sku_code || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
    (s.staff?.name || '').toLowerCase().includes((searchQuery || '').toLowerCase())
  );

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [sRes, pRes, cRes] = await Promise.all([
        fetch(`${API_URL}/api/sales`),
        fetch(`${API_URL}/api/products`),
        fetch(`${API_URL}/api/customers`)
      ]);
      if (sRes.ok) setSales(await sRes.json());
      if (pRes.ok) setProducts(await pRes.json());
      if (cRes.ok) setCustomers(await cRes.json());
    } catch (e) { console.error('API error', e); }
  };

  const handleProductSelect = (id) => {
    const prod = products.find(p => p._id === id);
    setSelectedProduct(prod || null);
    setFormData(f => ({ ...f, product: id }));
  };

  const executeSale = async (e) => {
    e.preventDefault();
    if (!formData.product || !selectedProduct) return;
    
    if (selectedProduct.stockLevel < formData.quantitySold) {
      return setToast({ type: 'alert', message: `Only ${selectedProduct.stockLevel} units available for ${selectedProduct.name}` });
    }
    
    if (parseFloat(formData.discountAmount || 0) > (selectedProduct.max_discount_allowed || 0)) {
      return setToast({ type: 'alert', message: `Security Lock: Maximum discount allowed is $${selectedProduct.max_discount_allowed || 0}` });
    }

    const itemRevenue = (selectedProduct.selling_price || selectedProduct.salePrice || 0) - parseFloat(formData.discountAmount || 0);
    const revenue = itemRevenue * formData.quantitySold;
    setSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/api/sales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, revenue, staff: userId })
      });
      const data = await res.json();

      if (res.ok) {
        fetchAll(); // Refresh all to get joined data
        setToast({ type: 'success', message: `Sale of ${formData.quantitySold}x ${selectedProduct.name} recorded.` });
        setShowForm(false);
        setFormData({ product: '', customer: '', customerName: '', customerPhone: '', addToVip: false, quantitySold: 1, discountAmount: 0, status: 'Paid', payment_method: 'Zaad' });
        setSelectedProduct(null);
      } else {
        setToast({ type: 'alert', message: data.message || 'Sale failed.' });
      }
    } catch (err) {
      setToast({ type: 'alert', message: 'Server offline.' });
    } finally {
      setSubmitting(false);
    }
  };

  const voidSale = async (id) => {
    if (!window.confirm('Void this transaction? The items will be returned to inventory.')) return;
    try {
      const res = await fetch(`${API_URL}/api/sales/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSales(prev => prev.filter(s => s._id !== id));
        setToast({ type: 'success', message: 'Transaction voided and stock restored.' });
        fetchAll();
      }
    } catch (error) {
      console.error('Error voiding sale:', error);
    }
  };

  const markRefunded = async (sale) => {
    if (!window.confirm(`Mark this sale as Refunded? Stock will be restored to inventory.`)) return;
    try {
      const res = await fetch(`${API_URL}/api/sales/${sale._id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Refunded' })
      });
      if (res.ok) {
        setSales(prev => prev.map(s => s._id === sale._id ? { ...s, status: 'Refunded' } : s));
        fetchAll();
        setToast({ type: 'success', message: `Refund recorded.` });
      }
    } catch (error) {
      console.error('Error marking refund:', error);
    }
  };

  const liveDiscount = parseFloat(formData.discountAmount) || 0;
  const liveRevenue = selectedProduct
    ? (((selectedProduct.selling_price || selectedProduct.salePrice || 0) - liveDiscount) * formData.quantitySold)
    : 0;

  const now = new Date();
  const currMonth = now.getMonth();
  const currYear = now.getFullYear();

  const isRefunded = s => String(s.status).toLowerCase().includes('refund');
  const salesToday = sales.filter(s => !isRefunded(s) && new Date(s.createdAt).toDateString() === now.toDateString()).length;
  const salesMonth = sales.filter(s => !isRefunded(s) && new Date(s.createdAt).getMonth() === currMonth && new Date(s.createdAt).getFullYear() === currYear).length;
  const refundsMonth = sales.filter(s => isRefunded(s) && new Date(s.createdAt).getMonth() === currMonth).length;
  const salesYear = sales.filter(s => !isRefunded(s) && new Date(s.createdAt).getFullYear() === currYear).length;

  return (
    <div className="relative pb-20">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <header className="mb-10 flex items-center justify-between border-b border-brand-border pb-6">
        <div>
          <h2 className="font-serif text-2xl tracking-wide text-txt-main font-bold">Point of Sale</h2>
          <p className="mt-1 text-sm text-txt-muted italic">Inventory decrements in real-time. Staff tracking enabled.</p>
        </div>
        <button className="btn-gold" onClick={() => setShowForm(!showForm)}>
          {showForm ? '← Back to Ledger' : '+ Process Transaction'}
        </button>
      </header>

      {!showForm && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4 mb-8">
          <div className="rounded-[1rem] border border-brand-border bg-bg-card shadow-inner p-4 md:p-5 text-center sm:text-left transition-all hover:border-brand-gold/20">
            <p className="text-[0.65rem] uppercase tracking-widest text-txt-muted">Today</p>
            <h3 className="font-serif text-xl md:text-2xl text-txt-main font-bold mt-1">{salesToday}</h3>
          </div>
          <div className="rounded-[1rem] border border-brand-border bg-bg-card shadow-inner p-4 md:p-5 text-center sm:text-left transition-all hover:border-brand-gold/20">
            <p className="text-[0.65rem] uppercase tracking-widest text-txt-muted">Month</p>
            <h3 className="font-serif text-xl md:text-2xl text-txt-main font-bold mt-1">{salesMonth}</h3>
          </div>
          <div className="rounded-[1rem] border border-red-500/20 bg-red-500/5 shadow-inner p-4 md:p-5 text-center sm:text-left text-red-500 transition-all">
            <p className="text-[0.65rem] uppercase tracking-widest">Refunds</p>
            <h3 className="font-serif text-xl md:text-2xl font-bold mt-1">{refundsMonth}</h3>
          </div>
          <div className="rounded-[1rem] border border-brand-border bg-bg-card shadow-inner p-4 md:p-5 text-center sm:text-left transition-all hover:border-brand-gold/20">
            <p className="text-[0.65rem] uppercase tracking-widest text-txt-muted">Year</p>
            <h3 className="font-serif text-xl md:text-2xl text-txt-main font-bold mt-1">{salesYear}</h3>
          </div>
          <div className="rounded-[1rem] border border-brand-border bg-bg-card shadow-inner p-4 md:p-5 text-center sm:text-left col-span-1 sm:col-span-2 lg:col-span-1 transition-all hover:border-brand-gold/20">
            <p className="text-[0.65rem] uppercase tracking-widest text-brand-gold font-bold">Total Hub</p>
            <h3 className="font-serif text-xl md:text-2xl text-brand-gold font-bold mt-1 tabular-nums">{sales.length}</h3>
          </div>
        </div>
      )}

      {showForm ? (
        <div className="rounded-[1.25rem] border border-brand-border bg-bg-card p-6 md:p-10 shadow-xl max-w-5xl mx-auto border-t-4 border-brand-gold">
          <h3 className="mb-6 md:mb-8 font-serif text-xl text-brand-gold uppercase tracking-widest font-bold">Transaction Terminal</h3>
          <form onSubmit={executeSale} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-txt-muted font-bold">Select Merchandise</label>
                <select className="form-control" required value={formData.product} onChange={e => handleProductSelect(e.target.value)}>
                  <option value="">Choose product...</option>
                  {products.map(p => (
                    <option key={p._id} value={p._id}>[{p.sku_code}] {p.name} — ${p.selling_price || p.salePrice}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] uppercase tracking-widest text-txt-muted font-bold">Client Identification</label>
                <select className="form-control" value={formData.customer} onChange={e => setFormData(f => ({ ...f, customer: e.target.value }))}>
                  <option value="">Walk-In Client</option>
                  {customers.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
                {formData.customer === '' && (
                  <div className="space-y-3 pt-3 border-t border-brand-border/40 mt-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input type="text" className="form-control text-sm" placeholder="Client Name" value={formData.customerName} onChange={e => setFormData(f => ({...f, customerName: e.target.value}))} />
                      <input type="text" className="form-control text-sm" placeholder="Phone Number" value={formData.customerPhone} onChange={e => setFormData(f => ({...f, customerPhone: e.target.value}))} />
                      <select className="form-control text-sm" value={formData.vipStatus || 'None'} onChange={e => setFormData(f => ({...f, vipStatus: e.target.value}))}>
                        <option value="None">Not VIP (Standard)</option>
                        <option value="Bronze">Bronze VIP</option>
                        <option value="Silver">Silver VIP</option>
                        <option value="Gold">Gold VIP</option>
                        <option value="Platinum">Platinum VIP</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {selectedProduct && (
              <div className="rounded-xl bg-bg-main border border-brand-gold/20 p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-inner">
                <div>
                  <p className="text-[9px] text-txt-muted uppercase tracking-widest font-bold">Inventory Ref</p>
                  <p className="text-txt-main font-bold">{selectedProduct.name}</p>
                  <p className="text-[10px] text-brand-gold font-mono uppercase tracking-tighter">SKU ARCHIVE: {selectedProduct.sku_code}</p>
                </div>
                <div className="sm:text-right border-t border-brand-border sm:border-0 pt-3 sm:pt-0 w-full sm:w-auto">
                  <p className="text-[9px] text-txt-muted uppercase font-bold">Live Stock</p>
                  <p className={`text-xl font-serif font-bold tabular-nums ${selectedProduct.stockLevel < 5 ? 'text-red-500 animate-pulse' : 'text-txt-main'}`}>{selectedProduct.stockLevel} units</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-txt-muted font-bold">Quantity</label>
                <input type="number" min="1" className="form-control" value={formData.quantitySold} onChange={e => setFormData(f => ({ ...f, quantitySold: parseInt(e.target.value) || 1 }))} required />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-txt-muted font-bold">Discount ($)</label>
                <input type="number" min="0" className="form-control" value={formData.discountAmount} onChange={e => setFormData(f => ({ ...f, discountAmount: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-txt-muted font-bold">Final Settlement</label>
                <div className="form-control flex items-center bg-bg-main border-brand-border">
                  <span className="font-serif text-xl text-brand-gold font-bold w-full text-center tabular-nums">${liveRevenue.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1">
                 <label className="text-[10px] uppercase tracking-widest text-txt-muted font-bold">State</label>
                  <select className="form-control" value={formData.status} onChange={e => setFormData(f => ({ ...f, status: e.target.value }))}>
                    <option value="Paid">Cleared (Paid)</option>
                    <option value="Unpaid">Pending (Unpaid)</option>
                  </select>
              </div>
              <div className="space-y-1">
                 <label className="text-[10px] uppercase tracking-widest text-txt-muted font-bold">Modality</label>
                  <select className="form-control" value={formData.payment_method} onChange={e => setFormData(f => ({ ...f, payment_method: e.target.value }))}>
                    <option value="Zaad">Zaad Pay</option>
                    <option value="Edahab">eDahab</option>
                    <option value="Bank">Bank Wire</option>
                    <option value="Cash">Physical Cash</option>
                  </select>
              </div>
            </div>

            <button type="submit" disabled={submitting || !formData.product} className="btn-gold w-full text-sm font-bold tracking-[0.2em] disabled:opacity-50 py-5">
              {submitting ? 'RECONCILING LEDGER...' : '🔒 AUTHORIZE TRANSACTION'}
            </button>
          </form>
        </div>
      ) : (
        <>
          {/* Mobile Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
            {filteredSales.map(s => (
              <div key={s._id} className="rounded-[1.25rem] border border-brand-border bg-bg-card p-5 shadow-lg relative overflow-hidden group">
                <div className="flex justify-between items-start mb-3 relative z-10">
                  <span className="text-[10px] font-mono text-txt-muted uppercase tracking-tighter">{new Date(s.createdAt).toLocaleDateString()}</span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest border ${
                    String(s.status).toLowerCase().includes('refund') ? 'border-red-500/30 bg-red-500/10 text-red-500' : 'border-green-500/30 bg-green-500/10 text-green-500'
                  }`}>
                    {s.status}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-txt-main mb-1 truncate">{s.product?.name || 'Unknown Article'}</h4>
                <div className="flex items-center justify-between text-[10px] text-txt-muted mb-4">
                   <span>Qty: {s.quantitySold} · {s.payment_method}</span>
                   <span className="font-mono text-brand-gold bg-brand-gold/5 px-2 rounded tracking-tighter">{s.staff?.name || 'System'}</span>
                </div>
                <div className="flex justify-between items-center border-t border-brand-border/50 pt-4 relative z-10">
                  <span className="font-serif text-lg font-bold text-brand-gold tabular-nums">${s.revenue?.toLocaleString()}</span>
                  <div className="flex gap-2">
                    {!isRefunded(s) && (
                      <button onClick={() => markRefunded(s)} className="p-2 border border-brand-border rounded-lg text-txt-muted hover:text-brand-gold hover:border-brand-gold transition-all">
                        <RotateCcw size={14} />
                      </button>
                    )}
                    <button onClick={() => voidSale(s._id)} className="p-2 border border-brand-border rounded-lg text-txt-muted hover:text-red-500 hover:border-red-500 transition-all">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <section className="hidden lg:block overflow-hidden rounded-[1.25rem] border border-brand-border bg-bg-card shadow-xl">
            <table className="w-full text-left text-sm">
              <thead className="bg-bg-main text-[10px] uppercase tracking-[0.2em] text-brand-gold font-bold">
                <tr>
                  <th className="p-5">Timeline</th>
                  <th className="p-5">Signature</th>
                  <th className="p-5">Article & Personnel</th>
                  <th className="p-5">State</th>
                  <th className="p-5 text-right">Settlement</th>
                  <th className="p-5 text-center">Protocol</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/50">
                {filteredSales.map(s => (
                  <tr key={s._id} className="hover:bg-brand-gold/5 transition-colors group">
                    <td className="p-5 font-mono text-[10px] text-txt-muted uppercase tracking-tighter">{new Date(s.createdAt).toLocaleString()}</td>
                    <td className="p-5 font-mono text-[10px] text-brand-gold font-bold uppercase transition-transform group-hover:translate-x-1 inline-block">{s.product?.sku_code}</td>
                    <td className="p-5">
                       <div className="text-txt-main font-bold">{s.product?.name} <span className="text-[10px] text-txt-muted/60 opacity-60">x{s.quantitySold}</span></div>
                       <div className="text-[10px] text-txt-muted/80 flex items-center gap-1 mt-0.5 italic">
                          <User size={10} className="opacity-40" /> Handled by {s.staff?.name || 'Manual Terminal'}
                       </div>
                    </td>
                    <td className="p-5">
                       <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest border ${
                        isRefunded(s) ? 'border-red-500/30 bg-red-500/10 text-red-500' : 'border-green-500/30 bg-green-500/10 text-green-500'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className={`p-5 font-serif font-bold text-right tabular-nums ${isRefunded(s) ? 'line-through opacity-40 text-txt-muted' : 'text-brand-gold'}`}>${s.revenue?.toLocaleString()}</td>
                    <td className="p-5 text-center">
                      <div className="flex justify-center gap-3">
                        {!isRefunded(s) && (
                          <button onClick={() => markRefunded(s)} className="text-txt-muted hover:text-brand-gold transition-all" title="Issue Refund"><RotateCcw size={16} /></button>
                        )}
                        <button onClick={() => voidSale(s._id)} className="text-txt-muted hover:text-red-500 transition-all" title="Void Entry"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      )}
    </div>
  );
}
