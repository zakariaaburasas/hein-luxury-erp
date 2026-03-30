import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, Trash2, RotateCcw } from 'lucide-react';
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
    <div className={`fixed bottom-6 right-6 z-50 flex items-start gap-3 rounded-[1rem] border px-5 py-4 shadow-2xl backdrop-blur-sm transition-all animate-[slideUp_0.3s_ease] max-w-sm ${
      isAlert
        ? 'bg-amber-900/80 border-amber-500/50 text-amber-200'
        : 'bg-green-900/80 border-green-500/50 text-green-200'
    }`}>
      {isAlert
        ? <AlertTriangle size={20} className="text-amber-400 shrink-0 mt-0.5" />
        : <CheckCircle size={20} className="text-green-400 shrink-0 mt-0.5" />
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

export default function SalesView({ searchQuery }) {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({ product: '', customer: '', customerName: '', customerPhone: '', addToVip: false, quantitySold: 1, discountAmount: 0, status: 'Paid ', payment_method: 'Zaad' });
  const [submitting, setSubmitting] = useState(false);

  const filteredSales = sales.filter(s => 
    (s.product?.name || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
    (s.customer?.name || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
    (s.product?.sku_code || '').toLowerCase().includes((searchQuery || '').toLowerCase())
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
    if (!formData.product) return;
    if (!selectedProduct) return;
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
        body: JSON.stringify({ ...formData, revenue })
      });
      const data = await res.json();

      if (res.ok) {
        // Patch the new sale for immediate local display
        const newSale = data.sale;
        newSale.product = selectedProduct;
        newSale.customer = customers.find(c => c._id === formData.customer) || null;
        setSales(prev => [newSale, ...prev]);

        // Update local stock level
        setProducts(prev => prev.map(p =>
          p._id === selectedProduct._id
            ? { ...p, stockLevel: p.stockLevel - formData.quantitySold }
            : p
        ));

        // Show alert or success toast
        if (data.lowStockAlert?.triggered) {
          setToast({ type: 'alert', message: data.lowStockAlert.message });
        } else {
          setToast({ type: 'success', message: `Sale of ${formData.quantitySold}x ${selectedProduct.name} — $${revenue.toLocaleString()} logged.` });
        }

        setShowForm(false);
        setFormData({ product: '', customer: '', customerName: '', customerPhone: '', addToVip: false, quantitySold: 1, discountAmount: 0, status: 'Paid ', payment_method: 'Zaad' });
        setSelectedProduct(null);
        // Fetch customers to update dropdown if a new one was auto-created
        const cRes = await fetch(`${API_URL}/api/customers`);
        if (cRes.ok) setCustomers(await cRes.json());
      } else {
        setToast({ type: 'alert', message: data.message || 'Sale failed.' });
      }
    } catch (err) {
      setToast({ type: 'alert', message: 'Server offline. Check backend.' });
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
        const pRes = await fetch(`${API_URL}/api/products`);
        if (pRes.ok) setProducts(await pRes.json());
      }
    } catch (error) {
      console.error('Error voiding sale:', error);
    }
  };

  const markRefunded = async (sale) => {
    if (!window.confirm(`Mark this sale as Refunded? Stock will be restored to inventory.`)) return;
    try {
      // 1. Update status to Refunded
      const res = await fetch(`${API_URL}/api/sales/${sale._id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Refunded' })
      });
      if (res.ok) {
        const updated = await res.json();
        setSales(prev => prev.map(s => s._id === updated._id ? { ...s, status: 'Refunded' } : s));
        // 2. Restore stock
        await fetch(`${API_URL}/api/products/${sale.product?._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stockLevel: (sale.product?.stockLevel || 0) + (sale.quantitySold || 0) })
        });
        setToast({ type: 'success', message: `Refund recorded. Stock restored for ${sale.product?.name}.` });
        const pRes = await fetch(`${API_URL}/api/products`);
        if (pRes.ok) setProducts(await pRes.json());
      }
    } catch (error) {
      console.error('Error marking refund:', error);
    }
  };

  const totalQty = formData.quantitySold;
  const liveDiscount = parseFloat(formData.discountAmount) || 0;
  const liveRevenue = selectedProduct
    ? (((selectedProduct.selling_price || selectedProduct.salePrice || 0) - liveDiscount) * totalQty)
    : 0;

  const now = new Date();
  const currMonth = now.getMonth();
  const currYear = now.getFullYear();

  const isThisMonth = s => {
    const d = new Date(s.createdAt);
    return d.getMonth() === currMonth && d.getFullYear() === currYear;
  };
  const isRefunded = s => String(s.status).toLowerCase().includes('refund');

  const salesToday = sales.filter(s => !isRefunded(s) && new Date(s.createdAt).toDateString() === now.toDateString()).length;
  const salesMonth = sales.filter(s => !isRefunded(s) && isThisMonth(s)).length;
  const refundsMonth = sales.filter(s => isRefunded(s) && isThisMonth(s)).length;
  const salesYear = sales.filter(s => !isRefunded(s) && new Date(s.createdAt).getFullYear() === currYear).length;

  return (
    <div className="relative">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <header className="mb-10 flex items-center justify-between border-b border-brand-border pb-6">
        <div>
          <h2 className="font-serif text-2xl tracking-wide text-white">Point of Sale</h2>
          <p className="mt-1 text-sm text-gray-400">Every sale auto-decrements your live inventory in real time.</p>
        </div>
        <button className="btn-gold" onClick={() => setShowForm(!showForm)}>
          {showForm ? '← Back to Ledger' : '+ Process Transaction'}
        </button>
      </header>

      {!showForm && (
        <div className="grid grid-cols-5 gap-4 mb-8">
          <div className="rounded-[1rem] border border-brand-border bg-brand-gray/50 shadow-inner p-5">
            <p className="text-[0.65rem] uppercase tracking-widest text-gray-400">Sales Today</p>
            <h3 className="font-serif text-2xl text-white font-bold mt-1">{salesToday}</h3>
          </div>
          <div className="rounded-[1rem] border border-brand-border bg-brand-gray/50 shadow-inner p-5">
            <p className="text-[0.65rem] uppercase tracking-widest text-gray-400">Sales This Month</p>
            <h3 className="font-serif text-2xl text-white font-bold mt-1">{salesMonth}</h3>
          </div>
          <div className="rounded-[1rem] border border-red-900/40 bg-red-900/10 shadow-inner p-5">
            <p className="text-[0.65rem] uppercase tracking-widest text-red-400">Refunds This Month</p>
            <h3 className="font-serif text-2xl text-red-400 font-bold mt-1">{refundsMonth}</h3>
          </div>
          <div className="rounded-[1rem] border border-brand-border bg-brand-gray/50 shadow-inner p-5">
            <p className="text-[0.65rem] uppercase tracking-widest text-gray-400">Sales This Year</p>
            <h3 className="font-serif text-2xl text-white font-bold mt-1">{salesYear}</h3>
          </div>
          <div className="rounded-[1rem] border border-brand-border bg-brand-gray/50 shadow-inner p-5">
            <p className="text-[0.65rem] uppercase tracking-widest text-gray-400">All-Time Sales</p>
            <h3 className="font-serif text-2xl text-brand-gold font-bold mt-1">{sales.length}</h3>
          </div>
        </div>
      )}

      {showForm ? (
        <div className="rounded-[1.25rem] border border-brand-border bg-brand-gray p-10 shadow-xl">
          <h3 className="mb-8 font-serif text-xl text-brand-gold">New Sale Transaction</h3>
          <form onSubmit={executeSale} className="space-y-6">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-gray-400">Select SKU / Product</label>
                <select
                  className="form-control"
                  required
                  value={formData.product}
                  onChange={e => handleProductSelect(e.target.value)}
                >
                  <option value="">Choose product...</option>
                  {products.map(p => (
                    <option key={p._id} value={p._id}>
                      [{p.sku_code || 'NO-SKU'}] {p.name} — ${p.selling_price || p.salePrice} ({p.stockLevel} in stock)
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-gray-400">Assign VIP Client (Optional)</label>
                  <select className="form-control" value={formData.customer} onChange={e => setFormData(f => ({ ...f, customer: e.target.value }))}>
                    <option value="">Walk-In / New Customer</option>
                    {customers.map(c => (
                      <option key={c._id} value={c._id}>{c.name} {c.phoneNumber ? `(${c.phoneNumber})` : ''}</option>
                    ))}
                  </select>
                </div>
                
                {/* Inline Walk-in Form (Only visible if Walk-In is selected) */}
                {formData.customer === '' && (
                  <div className="space-y-3 pt-2 border-t border-brand-border/40">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[0.65rem] uppercase tracking-widest text-brand-gold">New Client Name</label>
                        <input type="text" className="form-control text-sm" placeholder="Anonymous" value={formData.customerName} onChange={e => setFormData(f => ({...f, customerName: e.target.value}))} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[0.65rem] uppercase tracking-widest text-brand-gold">Phone Number</label>
                        <input type="text" className="form-control text-sm" placeholder="Optional" value={formData.customerPhone} onChange={e => setFormData(f => ({...f, customerPhone: e.target.value}))} />
                      </div>
                    </div>
                    {formData.customerName.trim() !== '' && (
                      <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => setFormData(f => ({...f, addToVip: !f.addToVip}))}>
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all shrink-0 ${formData.addToVip ? 'bg-brand-gold border-brand-gold' : 'border-gray-600 hover:border-brand-gold/50'}`}>
                          {formData.addToVip && <span className="text-black text-xs font-black leading-none">✓</span>}
                        </div>
                        <span className="text-xs text-gray-300">
                          Register <span className="text-brand-gold font-bold">{formData.customerName}</span> as VIP Network client (Bronze Tier)
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {selectedProduct && (
              <div className="rounded-xl bg-black/40 border border-brand-gold/20 p-5 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 uppercase tracking-widest">Selected Product Details</p>
                  <p className="text-white font-medium">{selectedProduct.name}</p>
                  <p className="text-xs text-gray-400 font-mono">
                    SKU: <span className="text-brand-gold">{selectedProduct.sku_code || 'N/A'}</span>
                    {selectedProduct.colorway && ` · ${selectedProduct.colorway}`}
                    {selectedProduct.size_run && ` · Sizes: ${selectedProduct.size_run}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Stock Remaining</p>
                  <p className={`text-2xl font-serif font-bold ${selectedProduct.stockLevel <= selectedProduct.min_stock_level ? 'text-amber-400' : 'text-white'}`}>
                    {selectedProduct.stockLevel}
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-8">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-gray-400">Quantity</label>
                <input
                  type="number"
                  min="1"
                  max={selectedProduct?.stockLevel || 999}
                  className="form-control"
                  value={formData.quantitySold}
                  onChange={e => setFormData(f => ({ ...f, quantitySold: parseInt(e.target.value) || 1 }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-gray-400">Discount Amount ($)</label>
                <input
                  type="number"
                  min="0"
                  max={selectedProduct?.max_discount_allowed || 0}
                  className="form-control border-brand-gold/30"
                  value={formData.discountAmount}
                  onChange={e => setFormData(f => ({ ...f, discountAmount: e.target.value }))}
                />
                {selectedProduct && (
                  <p className="text-[0.55rem] uppercase tracking-widest text-brand-gold mt-1">
                    Max Employee Discount: ${selectedProduct.max_discount_allowed || 0}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-gray-400">Calculated Revenue</label>
                <div className="form-control flex items-center cursor-not-allowed opacity-70">
                  <span className="font-serif text-xl text-brand-gold font-bold">${liveRevenue.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-gray-400">Payment Status</label>
                <select className="form-control" value={formData.status} onChange={e => setFormData(f => ({ ...f, status: e.target.value }))}>
                  <option value="Paid ">Paid (Completed)</option>
                  <option value="Unpaid ">Unpaid (Debt/Pending)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-gray-400">Payment Method</label>
                <select className="form-control" value={formData.payment_method} onChange={e => setFormData(f => ({ ...f, payment_method: e.target.value }))}>
                  <option value="Zaad">Zaad</option>
                  <option value="Edahab">eDahab</option>
                  <option value="Bank">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !formData.product}
              className="btn-gold w-full text-base mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Processing...' : '🔒 Confirm & Execute Sale'}
            </button>
          </form>
        </div>
      ) : filteredSales.length === 0 ? (
        <div className="text-center py-24 text-gray-500 font-mono text-sm border border-brand-border border-dashed rounded-xl">
          {searchQuery ? `No transactions found for "${searchQuery}"` : "No transactions yet. Process your first sale above."}
        </div>
      ) : (
        <section className="overflow-x-auto rounded-[1.25rem] border border-brand-border bg-brand-gray shadow-xl">
          <table className="w-full text-left text-sm">
            <thead className="bg-black/40 text-xs uppercase tracking-widest text-brand-gold">
              <tr>
                <th className="border-b border-brand-border px-4 py-4">Date</th>
                <th className="border-b border-brand-border px-4 py-4">SKU</th>
                <th className="border-b border-brand-border px-4 py-4">Product</th>
                <th className="border-b border-brand-border px-4 py-4">Client</th>
                <th className="border-b border-brand-border px-4 py-4">Status</th>
                <th className="border-b border-brand-border px-4 py-4">Method</th>
                <th className="border-b border-brand-border px-4 py-4 text-right">Revenue</th>
                <th className="border-b border-brand-border px-4 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {filteredSales.map(s => (
                <tr key={s._id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-4 font-mono text-xs text-gray-400">{new Date(s.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-4 font-mono text-xs text-brand-gold">{s.product?.sku_code || '—'}</td>
                  <td className="px-4 py-4 font-medium text-white">
                    {s.product?.name || 'Deleted'}
                    <span className="text-[0.6rem] text-gray-500 font-mono ml-2">×{s.quantitySold}</span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-300">
                    {s.customer?.name || 'Walk-in'}
                    {s.customer?.phoneNumber && <div className="text-[0.6rem] font-mono text-gray-500 mt-0.5">{s.customer.phoneNumber}</div>}
                  </td>
                  <td className={`px-4 py-4 font-bold text-[0.6rem] uppercase tracking-widest ${
                    String(s.status).toLowerCase().includes('refund') ? 'text-red-400' :
                    String(s.status).toLowerCase().includes('unpaid') ? 'text-amber-400' :
                    'text-green-400'
                  }`}>{s.status || 'Paid'}</td>
                  <td className="px-4 py-4 text-gray-500 text-xs font-mono">{s.payment_method || 'Zaad'}</td>
                  <td className={`px-4 py-4 font-serif text-base font-bold text-right ${
                    String(s.status).toLowerCase().includes('refund') ? 'text-red-400 line-through opacity-60' : 'text-brand-gold'
                  }`}>${s.revenue?.toLocaleString()}</td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {!String(s.status).toLowerCase().includes('refund') && (
                        <button
                          title="Mark as Refunded (Restores Stock)"
                          onClick={() => markRefunded(s)}
                          className="p-1.5 text-gray-400 hover:text-amber-400 hover:bg-amber-400/10 rounded-md transition-all"
                        >
                          <RotateCcw size={14} />
                        </button>
                      )}
                      <button 
                        title="Delete Record"
                        onClick={() => voidSale(s._id)}
                        className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
