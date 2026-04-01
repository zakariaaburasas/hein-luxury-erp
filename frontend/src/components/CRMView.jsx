import React, { useState, useEffect } from 'react';
import { User, Phone, MapPin, Award, Trash2, Edit3, Plus, ChevronDown, ChevronUp, ShoppingBag, Calendar } from 'lucide-react';
import API_URL from '../api/config';

const VIP_COLORS = {
  'Bronze': 'text-amber-600 border-amber-600/30 bg-amber-600/10',
  'Silver': 'text-gray-300 border-gray-300/30 bg-gray-300/10',
  'Gold':   'text-brand-gold border-brand-gold/30 bg-brand-gold/10',
  'VIP':    'text-purple-400 border-purple-400/30 bg-purple-400/10',
};

export default function CRMView({ searchQuery }) {
  const [customers, setCustomers] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [formData, setFormData] = useState({
    name: '', email: '', phoneNumber: '', address: '', vipStatus: 'Bronze'
  });

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes((searchQuery || '').toLowerCase()) ||
    (c.email || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
    (c.phoneNumber || '').includes((searchQuery || ''))
  );

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [cRes, sRes] = await Promise.all([
        fetch(`${API_URL}/api/customers`),
        fetch(`${API_URL}/api/sales`)
      ]);
      if (cRes.ok) setCustomers(await cRes.json());
      if (sRes.ok) setSales(await sRes.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  // Get all sales for a specific customer by ID
  const getCustomerSales = (customerId) =>
    sales.filter(s => s.customer?._id === customerId || s.customer === customerId)
         .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const getCustomerSpend = (customerId) =>
    getCustomerSales(customerId)
      .filter(s => !String(s.status).toLowerCase().includes('refund'))
      .reduce((sum, s) => sum + (s.revenue || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isEdit = !!editingCustomer;
    const url = isEdit
      ? `${API_URL}/api/customers/${editingCustomer._id}`
      : `${API_URL}/api/customers`;
    try {
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        const saved = await res.json();
        setCustomers(prev => isEdit ? prev.map(c => c._id === saved._id ? saved : c) : [saved, ...prev]);
        setShowForm(false);
        setEditingCustomer(null);
        setFormData({ name: '', email: '', phoneNumber: '', address: '', vipStatus: 'Bronze' });
      }
    } catch (e) { console.error(e); }
  };

  const deleteCustomer = async (id) => {
    if (!window.confirm('Delete this client record permanently?')) return;
    try {
      const res = await fetch(`${API_URL}/api/customers/${id}`, { method: 'DELETE' });
      if (res.ok) setCustomers(prev => prev.filter(c => c._id !== id));
    } catch (e) { console.error(e); }
  };

  const startEdit = (c) => {
    setEditingCustomer(c);
    setFormData({ name: c.name, email: c.email || '', phoneNumber: c.phoneNumber || '', address: c.address || '', vipStatus: c.vipStatus || 'Bronze' });
    setShowForm(true);
  };

  if (loading) return <div className="text-brand-gold animate-pulse text-sm uppercase py-12 tracking-widest font-bold">Syncing client network...</div>;

  return (
    <div className="space-y-10">
      <header className="flex items-center justify-between border-b border-brand-border pb-6">
        <div>
          <h2 className="font-serif text-2xl tracking-wide text-txt-main">VIP Network (CRM)</h2>
          <p className="mt-1 text-sm text-txt-muted">
            {customers.length} client{customers.length !== 1 ? 's' : ''} registered · full purchase history and spend tracking.
          </p>
        </div>
        <button className="btn-gold flex items-center gap-2" onClick={() => { setShowForm(!showForm); setEditingCustomer(null); setFormData({ name: '', email: '', phoneNumber: '', address: '', vipStatus: 'Bronze' }); }}>
          <Plus size={16} /> {showForm ? 'Cancel' : 'Register VIP'}
        </button>
      </header>

      {showForm && (
        <div className="rounded-[1.25rem] border border-brand-border bg-bg-card p-6 md:p-8 shadow-xl">
          <h3 className="mb-6 font-serif text-lg text-brand-gold font-bold">{editingCustomer ? 'Update Client Profile' : 'New VIP Registration'}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2"><label className="text-[10px] uppercase tracking-widest text-txt-muted font-bold">Full Name</label><input className="form-control" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Zakaria Aburasas" /></div>
            <div className="space-y-2"><label className="text-[10px] uppercase tracking-widest text-txt-muted font-bold">Phone Number</label><input className="form-control font-mono" value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} placeholder="+252 ..." /></div>
            <div className="space-y-2"><label className="text-[10px] uppercase tracking-widest text-txt-muted font-bold">Email (Optional)</label><input type="email" className="form-control" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="client@example.com" /></div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-txt-muted font-bold">VIP Tier</label>
              <select className="form-control" value={formData.vipStatus} onChange={e => setFormData({...formData, vipStatus: e.target.value})}>
                <option value="Bronze">Bronze Status</option>
                <option value="Silver">Silver Status</option>
                <option value="Gold">Gold Status</option>
                <option value="VIP">Platinum VIP Status</option>
              </select>
            </div>
            <div className="md:col-span-2 space-y-2"><label className="text-[10px] uppercase tracking-widest text-txt-muted font-bold">City / Region</label><input className="form-control" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="e.g. Hargeisa, Somaliland" /></div>
            <button type="submit" className="btn-gold md:col-span-2 mt-2 py-4 text-sm font-bold tracking-widest uppercase">{editingCustomer ? '💾 Update Record' : '💎 Complete Registration'}</button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCustomers.length === 0 ? (
          <div className="col-span-full text-center py-20 text-txt-muted font-mono text-sm border border-brand-border border-dashed rounded-xl bg-bg-card/50">
            {searchQuery ? `No clients found for "${searchQuery}"` : 'No clients registered yet.'}
          </div>
        ) : filteredCustomers.map(c => {
          const custSales = getCustomerSales(c._id);
          const totalSpend = getCustomerSpend(c._id);
          const isExpanded = expandedId === c._id;
          const tierStyle = VIP_COLORS[c.vipStatus] || VIP_COLORS['Bronze'];

          return (
            <div
              key={c._id}
              className="group relative rounded-[1.25rem] border border-brand-border bg-bg-card transition-all hover:border-brand-gold/40 hover:shadow-2xl overflow-hidden"
            >
              {/* Card Header */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-gold/10 text-brand-gold border border-brand-gold/20">
                    <User size={22} />
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEdit(c)} className="p-1.5 text-txt-muted hover:text-brand-gold bg-bg-main/50 border border-brand-border/50 rounded-lg"><Edit3 size={13} /></button>
                    <button onClick={() => deleteCustomer(c._id)} className="p-1.5 text-txt-muted hover:text-red-500 bg-bg-main/50 border border-brand-border/50 rounded-lg"><Trash2 size={13} /></button>
                  </div>
                </div>

                <h4 className="font-serif text-lg text-txt-main mb-1 font-bold">{c.name}</h4>
                <span className={`inline-flex items-center gap-1.5 text-[0.6rem] font-bold uppercase tracking-widest px-2 py-1 rounded-full border ${tierStyle}`}>
                  <Award size={10} /> {c.vipStatus} Status
                </span>

                <div className="space-y-2 mt-4 pt-4 border-t border-brand-border/40">
                  {c.phoneNumber && (
                    <div className="flex items-center gap-2 text-sm text-txt-muted">
                      <Phone size={13} className="text-brand-gold shrink-0 opacity-70" />
                      <span className="font-mono text-xs">{c.phoneNumber}</span>
                    </div>
                  )}
                  {c.address && (
                    <div className="flex items-center gap-2 text-sm text-txt-muted">
                      <MapPin size={13} className="text-brand-gold shrink-0 opacity-70" />
                      <span className="text-xs">{c.address}</span>
                    </div>
                  )}
                </div>

                {/* Stats Row */}
                <div className="mt-4 pt-4 border-t border-brand-border/30 flex justify-between items-end">
                  <div>
                    <p className="text-[0.6rem] uppercase text-txt-muted tracking-widest font-bold opacity-60">Total Spend</p>
                    <p className={`font-serif font-bold text-lg ${totalSpend > 0 ? 'text-brand-gold' : 'text-txt-muted opacity-40'}`}>
                      ${totalSpend.toLocaleString()}
                    </p>
                    <p className="text-[0.6rem] text-txt-muted font-medium italic">{custSales.length} purchase{custSales.length !== 1 ? 's' : ''}</p>
                  </div>
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : c._id)}
                    className="flex items-center gap-1.5 text-[0.65rem] uppercase tracking-widest font-black text-brand-gold hover:underline transition-all"
                  >
                    {isExpanded ? 'Hide' : 'View History'}
                    {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>
                </div>
              </div>

              {/* Purchase History Panel */}
              {isExpanded && (
                <div className="border-t border-brand-border bg-bg-main/50 px-6 py-4 space-y-3">
                  <p className="text-[0.6rem] uppercase tracking-widest text-txt-muted font-black mb-3">Purchase History</p>
                  {custSales.length === 0 ? (
                    <p className="text-xs text-txt-muted font-mono py-2 italic text-center">No purchases recorded yet.</p>
                  ) : custSales.map(s => (
                    <div key={s._id} className="flex items-center justify-between py-2 border-b border-brand-border/30 last:border-0">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 p-1 rounded-md bg-brand-gold/10 text-brand-gold border border-brand-gold/20">
                          <ShoppingBag size={11} />
                        </div>
                        <div>
                          <p className="text-xs text-txt-main font-bold">
                            {s.product?.name || 'Deleted Product'}
                            <span className="text-txt-muted font-mono ml-1.5 opacity-60">×{s.quantitySold}</span>
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Calendar size={10} className="text-txt-muted opacity-40" />
                            <span className="text-[0.6rem] font-mono text-txt-muted opacity-60">
                              {new Date(s.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                            <span className={`text-[0.55rem] font-bold uppercase px-1.5 py-0.5 rounded-full ${
                              String(s.status).toLowerCase().includes('refund') ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                              String(s.status).toLowerCase().includes('unpaid') ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                              'bg-green-500/10 text-green-500 border border-green-500/20'
                            }`}>{s.status || 'Paid'}</span>
                          </div>
                        </div>
                      </div>
                      <span className={`font-serif font-bold text-sm shrink-0 ${String(s.status).toLowerCase().includes('refund') ? 'text-red-500 line-through opacity-40' : 'text-brand-gold'}`}>
                        ${s.revenue?.toLocaleString()}
                      </span>
                    </div>
                  ))}
                  {custSales.length > 0 && (
                    <div className="flex justify-between pt-3 mt-1 border-t border-brand-border/50">
                      <span className="text-[0.6rem] uppercase tracking-widest text-txt-muted font-bold">Net Lifetime Value</span>
                      <span className="font-serif font-bold text-brand-gold tabular-nums">${totalSpend.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
