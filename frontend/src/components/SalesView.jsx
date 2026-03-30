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
  const [formData, setFormData] = useState({ 
    product: '', 
    customer: '', 
    customerName: '', 
    customerPhone: '', 
    addToVip: false, 
    quantitySold: 1, 
    discountAmount: 0, 
    status: 'Paid ', 
    payment_method: 'Zaad' 
  });
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
        body: JSON.stringify({ ...formData, revenue })
      });
      const data = await res.json();

      if (res.ok) {
        const newSale = data.sale;
        newSale.product = selectedProduct;
        newSale.customer = customers.find(c => c._id === formData.customer) || null;
        setSales(prev => [newSale, ...prev]);

        setProducts(prev => prev.map(p =>
          p._id === selectedProduct._id
            ? { ...p, stockLevel: p.stockLevel - formData.quantitySold }
            : p
        ));

        if (data.lowStockAlert?.triggered) {
          setToast({ type: 'alert', message: data.lowStockAlert.message });
        } else {
          setToast({ type: 'success', message: `Sale of ${formData.quantitySold}x ${selectedProduct.name} recorded.` });
        }

        setShowForm(false);
        setFormData({ product: '', customer: '', customerName: '', customerPhone: '', addToVip: false, quantitySold: 1, discountAmount: 0, status: 'Paid ', payment_method: 'Zaad' });
        setSelectedProduct(null);
        
        const cRes = await fetch(`${API_URL}/api/customers`);
        if (cRes.ok) setCustomers(await cRes.json());
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
    <div className="relative">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <header className="mb-10 flex items-center justify-between border-b border-brand-border pb-6">
        <div>
          <h2 className="font-serif text-2xl tracking-wide text-white">Point of Sale</h2>
          <p className="mt-1 text-sm text-gray-400">Inventory decrements in real-time.</p>
        </div>
        <button className="btn-gold" onClick={() => setShowForm(!showForm)}>
          {showForm ? '← Back to Ledger' : '+ Process Transaction'}
        </button>
      </header>

      {!showForm && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4 mb-8">
          <div className="rounded-[1rem] border border-brand-border bg-brand-gray/50 shadow-inner p-4 md:p-5 text-center sm:text-left">
            <p className="text-[0.65rem] uppercase tracking-widest text-gray-400">Today</p>
            <h3 className="font-serif text-xl md:text-2xl text-white font-bold mt-1">{salesToday}</h3>
          </div>
          <div className="rounded-[1rem] border border-brand-border bg-brand-gray/50 shadow-inner p-4 md:p-5 text-center sm:text-left">
            <p className="text-[0.65rem] uppercase tracking-widest text-gray-400">Month</p>
            <h3 className="font-serif text-xl md:text-2xl text-white font-bold mt-1">{salesMonth}</h3>
          </div>
          <div className="rounded-[1rem] border border-red-900/40 bg-red-900/10 shadow-inner p-4 md:p-5 text-center sm:text-left text-red-400">
            <p className="text-[0.65rem] uppercase tracking-widest">Refunds</p>
            <h3 className="font-serif text-xl md:text-2xl font-bold mt-1">{refundsMonth}</h3>
          </div>
          <div className="rounded-[1rem] border border-brand-border bg-brand-gray/50 shadow-inner p-4 md:p-5 text-center sm:text-left">
            <p className="text-[0.65rem] uppercase tracking-widest text-gray-400">Year</p>
            <h3 className="font-serif text-xl md:text-2xl text-white font-bold mt-1">{salesYear}</h3>
          </div>
          <div className="rounded-[1rem] border border-brand-border bg-brand-gray/50 shadow-inner p-4 md:p-5 text-center sm:text-left col-span-1 sm:col-span-2 lg:col-span-1">
            <p className="text-[0.65rem] uppercase tracking-widest text-brand-gold">Total</p>
            <h3 className="font-serif text-xl md:text-2xl text-brand-gold font-bold mt-1">{sales.length}</h3>
          </div>
        </div>
      )}

      {showForm ? (
        <div className="rounded-[1.25rem] border border-brand-border bg-brand-gray p-6 md:p-10 shadow-xl">
          <h3 className="mb-6 md:mb-8 font-serif text-xl text-brand-gold">New Transaction</h3>
          <form onSubmit={executeSale} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-gray-400">Select Product</label>
                <select className="form-control" required value={formData.product} onChange={e => handleProductSelect(e.target.value)}>
                  <option value="">Choose product...</option>
                  {products.map(p => (
                    <option key={p._id} value={p._id}>[{p.sku_code}] {p.name} — ${p.selling_price || p.salePrice}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-4">
                <label className="text-xs uppercase tracking-widest text-gray-400">Customer</label>
                <select className="form-control" value={formData.customer} onChange={e => setFormData(f => ({ ...f, customer: e.target.value }))}>
                  <option value="">Walk-In</option>
                  {customers.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
                {formData.customer === '' && (
                  <div className="space-y-3 pt-2 border-t border-brand-border/40">
                    <div className="grid grid-cols-2 gap-4">
                      <input type="text" className="form-control text-sm" placeholder="Name" value={formData.customerName} onChange={e => setFormData(f => ({...f, customerName: e.target.value}))} />
                      <input type="text" className="form-control text-sm" placeholder="Phone" value={formData.customerPhone} onChange={e => setFormData(f => ({...f, customerPhone: e.target.value}))} />
                    </div>
                    {formData.customerName.trim() !== '' && (
                      <div className="flex items-center gap-3 cursor-pointer" onClick={() => setFormData(f => ({...f, addToVip: !f.addToVip}))}>
                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${formData.addToVip ? 'bg-brand-gold border-brand-gold text-black' : 'border-gray-600'}`}>
                          {formData.addToVip && '✓'}
                        </div>
                        <span className="text-xs text-gray-400">Add to VIP Client List</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {selectedProduct && (
              <div className="rounded-xl bg-black/40 border border-brand-gold/20 p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest">Details</p>
                  <p className="text-white font-medium">{selectedProduct.name}</p>
                  <p className="text-[10px] text-brand-gold font-mono">SKU: {selectedProduct.sku_code}</p>
                </div>
                <div className="sm:text-right border-t border-brand-border sm:border-0 pt-3 sm:pt-0 w-full sm:w-auto">
                  <p className="text-[10px] text-gray-500">Stock</p>
                  <p className="text-xl font-serif font-bold text-white">{selectedProduct.stockLevel} left</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-gray-400">Quantity</label>
                <input type="number" min="1" className="form-control" value={formData.quantitySold} onChange={e => setFormData(f => ({ ...f, quantitySold: parseInt(e.target.value) || 1 }))} required />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-gray-400">Discount ($)</label>
                <input type="number" min="0" className="form-control" value={formData.discountAmount} onChange={e => setFormData(f => ({ ...f, discountAmount: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-gray-400">Total Price</label>
                <div className="form-control flex items-center bg-brand-black/40 border-brand-border">
                  <span className="font-serif text-xl text-brand-gold font-bold w-full text-center">${liveRevenue.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <select className="form-control" value={formData.status} onChange={e => setFormData(f => ({ ...f, status: e.target.value }))}>
                <option value="Paid ">Paid</option>
                <option value="Unpaid ">Unpaid</option>
              </select>
              <select className="form-control" value={formData.payment_method} onChange={e => setFormData(f => ({ ...f, payment_method: e.target.value }))}>
                <option value="Zaad">Zaad</option>
                <option value="Edahab">eDahab</option>
                <option value="Bank">Bank</option>
                <option value="Cash">Cash</option>
              </select>
            </div>

            <button type="submit" disabled={submitting || !formData.product} className="btn-gold w-full text-base disabled:opacity-50">
              {submitting ? 'Executing...' : '🔒 Confirm Sale'}
            </button>
          </form>
        </div>
      ) : (
        <>
          {/* Mobile Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
            {filteredSales.map(s => (
              <div key={s._id} className="rounded-[1.25rem] border border-brand-border bg-brand-gray p-5 shadow-lg">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-mono text-gray-500">{new Date(s.createdAt).toLocaleDateString()}</span>
                  <span className={`text-[10px] font-bold uppercase ${String(s.status).toLowerCase().includes('refund') ? 'text-red-400' : 'text-green-400'}`}>
                    {s.status}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-white mb-1">{s.product?.name || 'Product'}</h4>
                <p className="text-[10px] text-gray-400 mb-4">Qty: {s.quantitySold} · {s.payment_method}</p>
                <div className="flex justify-between items-center border-t border-brand-border/50 pt-4">
                  <span className="font-serif text-lg font-bold text-brand-gold">${s.revenue?.toLocaleString()}</span>
                  <div className="flex gap-2">
                    {!isRefunded(s) && (
                      <button onClick={() => markRefunded(s)} className="p-2 border border-brand-border rounded-lg text-gray-500 hover:text-brand-gold transition-colors">
                        <RotateCcw size={14} />
                      </button>
                    )}
                    <button onClick={() => voidSale(s._id)} className="p-2 border border-brand-border rounded-lg text-gray-500 hover:text-red-400 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <section className="hidden lg:block overflow-x-auto rounded-[1.25rem] border border-brand-border bg-brand-gray">
            <table className="w-full text-left text-sm">
              <thead className="bg-black/40 text-[10px] uppercase tracking-widest text-brand-gold">
                <tr>
                  <th className="p-4">Date</th>
                  <th className="p-4">SKU</th>
                  <th className="p-4">Product</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Revenue</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {filteredSales.map(s => (
                  <tr key={s._id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-mono text-xs text-gray-500">{new Date(s.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 font-mono text-xs text-brand-gold">{s.product?.sku_code}</td>
                    <td className="p-4 text-white">{s.product?.name} <span className="text-[10px] opacity-40">x{s.quantitySold}</span></td>
                    <td className={`p-4 font-bold text-[10px] uppercase ${isRefunded(s) ? 'text-red-400' : 'text-green-400'}`}>{s.status}</td>
                    <td className={`p-4 font-serif font-bold text-right ${isRefunded(s) ? 'line-through opacity-40' : 'text-brand-gold'}`}>${s.revenue?.toLocaleString()}</td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-2">
                        {!isRefunded(s) && (
                          <button onClick={() => markRefunded(s)} className="text-gray-500 hover:text-brand-gold"><RotateCcw size={14} /></button>
                        )}
                        <button onClick={() => voidSale(s._id)} className="text-gray-500 hover:text-red-400"><Trash2 size={14} /></button>
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
