import React, { useState, useEffect } from 'react';
import { Factory, Truck, CheckCircle, Clock, Plus, Trash2, ChevronRight } from 'lucide-react';

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
      const res = await fetch('http://localhost:5000/api/production');
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
      const res = await fetch('http://localhost:5000/api/production', {
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
      const res = await fetch(`http://localhost:5000/api/production/${id}`, {
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
      const res = await fetch(`http://localhost:5000/api/production/${id}`, { method: 'DELETE' });
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
        <div className="rounded-[1.25rem] border border-brand-border bg-brand-gray p-8 shadow-xl">
          <h3 className="mb-6 font-serif text-xl text-brand-gold">New Production Requisition</h3>
          <form onSubmit={handleAddOrder} className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[0.65rem] uppercase tracking-widest text-gray-500">PO Number</label>
              <input type="text" value={formData.poNumber} onChange={e => setFormData({...formData, poNumber: e.target.value})} className="form-control" placeholder="PO-2026-XXX" required />
            </div>
            <div className="space-y-2">
              <label className="text-[0.65rem] uppercase tracking-widest text-gray-500">Target Factory</label>
              <input type="text" value={formData.factory} onChange={e => setFormData({...formData, factory: e.target.value})} className="form-control" placeholder="OEM Location" required />
            </div>
            <div className="space-y-2">
              <label className="text-[0.65rem] uppercase tracking-widest text-gray-500">Product Line</label>
              <input type="text" value={formData.productName} onChange={e => setFormData({...formData, productName: e.target.value})} className="form-control" placeholder="Item Name" required />
            </div>
            <div className="space-y-2">
              <label className="text-[0.65rem] uppercase tracking-widest text-gray-500">Quantity Units</label>
              <input type="number" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} className="form-control" placeholder="e.g. 500" required />
            </div>
            <div className="space-y-2">
              <label className="text-[0.65rem] uppercase tracking-widest text-gray-500">Arrival Spectrum (Date)</label>
              <input type="date" value={formData.expectedArrival} onChange={e => setFormData({...formData, expectedArrival: e.target.value})} className="form-control" required title="Arrival Spectrum (Date)" placeholder="Select date" />
            </div>
            <div className="flex items-end gap-4">
              <button type="button" className="btn-gold border-gray-600 text-gray-500 hover:bg-gray-800" onClick={() => setShowForm(false)}>Abort</button>
              <button type="submit" className="btn-gold flex-1">Issue Requisition</button>
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
              <div key={order._id} className="group relative rounded-[1.25rem] border border-brand-border bg-brand-gray p-6 transition-all hover:bg-white/5 hover:border-brand-gold/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-xl bg-brand-black flex items-center justify-center text-brand-gold border border-brand-border/50 group-hover:border-brand-gold/20 transition-colors">
                      <Factory size={22} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[0.65rem] text-brand-gold font-bold tracking-widest bg-brand-gold/10 px-2 py-0.5 rounded">{order.poNumber}</span>
                        <h4 className="font-serif text-lg text-white">{order.productName}</h4>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest">
                        {order.factory} · <span className="text-brand-gold">{order.quantity.toLocaleString()} UNITS</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="text-[0.6rem] text-gray-600 uppercase tracking-widest mb-1.5">Estimated Ingress</p>
                      <p className="text-xs font-medium text-gray-300">{new Date(order.expectedArrival).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                       <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider border ${getStatusClass(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status}
                      </span>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <select
                          className="bg-brand-black border border-brand-border text-[0.6rem] rounded px-2 py-1 text-gray-400 focus:border-brand-gold outline-none"
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
