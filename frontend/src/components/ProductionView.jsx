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

  if (loading) return <div className="text-brand-gold animate-pulse text-sm uppercase tracking-widest py-10">Initializing Manufacture Logs...</div>;

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between border-b border-brand-border pb-6">
        <div>
          <h2 className="font-serif text-2xl tracking-wide text-white">Manufacturing & Global Logistics</h2>
          <p className="mt-1 text-sm text-gray-400">Tracking VIP stock production across international factory clusters.</p>
        </div>
        <button
          className="btn-gold flex items-center gap-2"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'View PO Ledger' : <><Plus size={16} /> Register New PO</>}
        </button>
      </header>

      {showForm ? (
        <div className="rounded-[1.25rem] border border-brand-border bg-brand-gray p-6 md:p-10 shadow-xl max-w-4xl mx-auto">
          <h3 className="mb-6 md:mb-8 font-serif text-xl text-brand-gold">New Production Requisition</h3>
          <form onSubmit={handleAddOrder} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-gray-500">PO Number</label>
                <input type="text" value={formData.poNumber} onChange={e => setFormData({...formData, poNumber: e.target.value})} className="form-control" placeholder="PO-2026-XXX" required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-gray-500">Target Factory</label>
                <input type="text" value={formData.factory} onChange={e => setFormData({...formData, factory: e.target.value})} className="form-control" placeholder="OEM Location" required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-gray-500">Product Line</label>
                <input type="text" value={formData.productName} onChange={e => setFormData({...formData, productName: e.target.value})} className="form-control" placeholder="Item Name" required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-gray-500">Quantity Units</label>
                <input type="number" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} className="form-control" placeholder="e.g. 500" required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-gray-500">Arrival Spectrum (Date)</label>
                <input type="date" value={formData.expectedArrival} onChange={e => setFormData({...formData, expectedArrival: e.target.value})} className="form-control" required />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-brand-border/40">
              <button type="submit" className="btn-gold flex-1 order-1 sm:order-2 py-4">Issue PO Requisition</button>
              <button type="button" className="p-3 px-8 text-gray-500 hover:text-white transition-colors order-2 sm:order-1 text-center" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {orders.length === 0 ? (
            <div className="text-center py-20 text-gray-500 font-mono text-sm border border-brand-border border-dashed rounded-xl">
              No active production orders found.
            </div>
          ) : (
            orders.map(order => (
              <div key={order._id} className="group relative rounded-[1.25rem] border border-brand-border bg-brand-gray p-4 md:p-6 transition-all hover:bg-white/5 hover:border-brand-gold/30">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex items-center gap-4 md:gap-5">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-brand-black flex items-center justify-center text-brand-gold border border-brand-border/50 group-hover:border-brand-gold/20 transition-colors shrink-0">
                      <Factory size={22} />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[0.6rem] text-brand-gold font-bold tracking-widest bg-brand-gold/10 px-2 py-0.5 rounded shrink-0">{order.poNumber}</span>
                        <h4 className="font-serif text-sm md:text-lg text-white font-medium">{order.productName}</h4>
                      </div>
                      <p className="text-[10px] md:text-xs text-gray-500 mt-1 uppercase tracking-widest">
                        {order.factory} · <span className="text-brand-gold font-bold">{order.quantity.toLocaleString()} UNITS</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between lg:justify-end gap-6 md:gap-10 border-t border-brand-border/40 lg:border-0 pt-4 lg:pt-0">
                    <div className="lg:text-right">
                      <p className="text-[0.6rem] text-gray-600 uppercase tracking-widest mb-1">Estimated Ingress</p>
                      <p className="text-[10px] md:text-xs font-medium text-gray-300">{new Date(order.expectedArrival).toLocaleDateString()}</p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                       <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.6rem] font-bold uppercase tracking-wider border ${getStatusClass(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status}
                      </span>
                      <div className="flex items-center gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                        <select
                          className="bg-brand-black border border-brand-border text-[10px] rounded px-2 py-1 text-gray-400 focus:border-brand-gold outline-none"
                          value={order.status}
                          onChange={(e) => updateStatus(order._id, e.target.value)}
                        >
                          <option value="In Production">In Production</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Customs Clearance">Customs Clearance</option>
                          <option value="Delivered">Delivered</option>
                        </select>
                        <button onClick={() => deleteOrder(order._id)} className="p-1.5 text-red-500/50 hover:text-red-400 transition-colors rounded hover:bg-red-500/10">
                          <Trash2 size={13} />
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
