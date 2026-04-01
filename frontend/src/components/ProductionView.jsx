import React, { useState, useEffect } from 'react';
import { Factory, Truck, CheckCircle, Clock, Plus, Trash2, ChevronRight } from 'lucide-react';
import API_URL from '../api/config';

export default function ProductionView() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    poNumber: '',
    factory: '',
    productName: '',
    quantity: '',
    expectedArrival: '',
    status: 'In Production'
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/api/production`);
      if (res.ok) setOrders(await res.json());
    } catch (e) {
      console.error('Production link failed:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrder = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/production`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        const newOrder = await res.json();
        setOrders([newOrder, ...orders]);
        setShowForm(false);
        setFormData({ poNumber: '', factory: '', productName: '', quantity: '', expectedArrival: '', status: 'In Production' });
      }
    } catch (e) {
      console.error('Failed to log manufacturing order:', e);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`${API_URL}/api/production/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        const updated = await res.json();
        setOrders(orders.map(o => o._id === id ? updated : o));
      }
    } catch (e) {
      console.error('Status sync failed:', e);
    }
  };

  const deleteOrder = async (id) => {
    if (!window.confirm('Terminate this manufacturing file?')) return;
    try {
      const res = await fetch(`${API_URL}/api/production/${id}`, { method: 'DELETE' });
      if (res.ok) setOrders(orders.filter(o => o._id !== id));
    } catch (e) {
      console.error('Order deletion failed:', e);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Shipped': return <Truck size={14} className="text-blue-400" />;
      case 'Delivered': return <CheckCircle size={14} className="text-green-400" />;
      case 'Customs Clearance': return <Clock size={14} className="text-amber-400" />;
      default: return <Clock size={14} className="text-gray-400" />;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Shipped': return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'Delivered': return 'bg-green-500/10 text-green-400 border-green-500/30';
      case 'Customs Clearance': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
    }
  };

  if (loading) return <div className="text-brand-gold animate-pulse text-sm uppercase tracking-widest py-10 font-bold">Initializing Manufacture Logs...</div>;

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between border-b border-brand-border pb-8 gap-6">
        <div>
          <h2 className="font-serif text-3xl tracking-wide text-txt-main font-bold">Manufacturing & Global Logistics</h2>
          <p className="mt-1 text-sm text-txt-muted italic font-medium">Tracking VIP stock production across international factory clusters.</p>
        </div>
        <button
          className="btn-gold flex items-center gap-2 px-6 py-3"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'View PO Ledger' : <><Plus size={18} /> Issue Production Order</>}
        </button>
      </header>

      {showForm ? (
        <div className="rounded-[1.25rem] border border-brand-border bg-bg-card p-6 md:p-10 shadow-xl max-w-4xl mx-auto border-t-4 border-brand-gold">
          <h3 className="mb-8 font-serif text-2xl text-brand-gold font-bold uppercase tracking-widest">New Production Order</h3>
          <form onSubmit={handleAddOrder} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-txt-muted font-bold">PO Number</label>
                <input type="text" value={formData.poNumber} onChange={e => setFormData({...formData, poNumber: e.target.value})} className="form-control" placeholder="PO-2026-XXX" required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-txt-muted font-bold">Target Factory</label>
                <input type="text" value={formData.factory} onChange={e => setFormData({...formData, factory: e.target.value})} className="form-control" placeholder="OEM Location" required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-txt-muted font-bold">Product Line</label>
                <input type="text" value={formData.productName} onChange={e => setFormData({...formData, productName: e.target.value})} className="form-control" placeholder="Item Name" required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-txt-muted font-bold">Quantity Units</label>
                <input type="number" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} className="form-control" placeholder="e.g. 500" required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-txt-muted font-bold">Arrival Spectrum (Date)</label>
                <input type="date" value={formData.expectedArrival} onChange={e => setFormData({...formData, expectedArrival: e.target.value})} className="form-control" required />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-brand-border/40">
              <button type="submit" className="btn-gold flex-1 order-1 sm:order-2 py-4 text-sm font-black tracking-widest uppercase">Issue Production Order</button>
              <button type="button" className="p-3 px-8 text-txt-muted hover:text-txt-main transition-all order-2 sm:order-1 text-xs font-bold uppercase tracking-widest" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 animate-[fadeIn_0.4s_ease-out]">
          {orders.length === 0 ? (
            <div className="text-center py-24 text-txt-muted font-mono text-sm border border-brand-border border-dashed rounded-xl bg-bg-card/40 italic">
              No active production orders found in the global registry.
            </div>
          ) : (
            orders.map(order => (
              <div key={order._id} className="group relative rounded-[1.25rem] border border-brand-border bg-bg-card p-4 md:p-6 transition-all hover:border-brand-gold/40 shadow-sm hover:shadow-xl">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex items-center gap-4 md:gap-6">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-bg-main flex items-center justify-center text-brand-gold border border-brand-border/50 group-hover:border-brand-gold/30 transition-all shrink-0 shadow-inner">
                      <Factory size={26} />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="font-mono text-[0.65rem] text-brand-gold font-black tracking-[0.2em] bg-brand-gold/10 px-2.5 py-1 rounded border border-brand-gold/20 shrink-0 uppercase">{order.poNumber}</span>
                        <h4 className="font-serif text-base md:text-xl text-txt-main font-bold">{order.productName}</h4>
                      </div>
                      <p className="text-[10px] md:text-sm text-txt-muted font-medium uppercase tracking-[0.1em] opacity-80">
                        {order.factory} · <span className="text-brand-gold font-black underline decoration-brand-gold/40 underline-offset-4">{order.quantity.toLocaleString()} UNITS</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between lg:justify-end gap-6 md:gap-12 border-t border-brand-border/40 lg:border-0 pt-4 lg:pt-0">
                    <div className="lg:text-right">
                      <p className="text-[0.6rem] text-txt-muted uppercase tracking-[0.2em] mb-1.5 font-black opacity-60">Estimated Ingress</p>
                      <p className="text-xs md:text-sm font-bold text-txt-main tabular-nums">{new Date(order.expectedArrival).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                       <span className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[0.65rem] font-black uppercase tracking-[0.1em] border shadow-sm ${getStatusClass(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status}
                      </span>
                      <div className="flex items-center gap-3 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-0 lg:translate-x-4">
                        <select
                          className="bg-bg-main border border-brand-border text-[10px] font-bold uppercase tracking-wider rounded-lg px-3 py-1.5 text-txt-muted focus:border-brand-gold outline-none transition-all cursor-pointer shadow-sm"
                          value={order.status}
                          onChange={(e) => updateStatus(order._id, e.target.value)}
                        >
                          <option value="In Production">In Production</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Customs Clearance">Customs Clearance</option>
                          <option value="Delivered">Delivered</option>
                        </select>
                        <button onClick={() => deleteOrder(order._id)} className="p-2 text-red-500/40 hover:text-red-500 transition-all rounded-lg hover:bg-red-500/10 border border-transparent hover:border-red-500/20" title="Delete PO">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
}
