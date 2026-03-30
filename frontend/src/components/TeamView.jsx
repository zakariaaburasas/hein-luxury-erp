import React, { useState, useEffect } from 'react';
import { User, Shield, Key, Mail, Phone, Plus, Trash2, Edit3, ShieldCheck, UserCog, TrendingUp, AlertTriangle, Check } from 'lucide-react';
import API_URL from '../api/config';

export default function TeamView() {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    username: '', 
    password: '', 
    role: 'staff', 
    email: '', 
    phone: '',
    status: 'active'
  });

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      const res = await fetch(`${API_URL}/api/users`);
      if (res.ok) {
        const data = await res.json();
        setTeam(data);
      }
    } catch (err) {
      console.error('Failed to fetch team:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (member) => {
    setEditingMember(member);
    setFormData({
      name: member.name || '',
      username: member.username || '',
      password: '', // Keep empty for security unless changing
      role: member.role || 'staff',
      email: member.email || '',
      phone: member.phone || '',
      status: member.status || 'active'
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const isEdit = !!editingMember;
      const url = isEdit ? `${API_URL}/api/users/${editingMember._id}` : `${API_URL}/api/users`;
      const method = isEdit ? 'PUT' : 'POST';
      
      const payload = { ...formData };
      if (isEdit && !payload.password) delete payload.password; // Don't send empty password on edit

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        fetchTeam();
        setFormData({ name: '', username: '', password: '', role: 'staff', email: '', phone: '', status: 'active' });
        setShowForm(false);
        setEditingMember(null);
      } else {
        const err = await res.json();
        alert(`Operation failed: ${err.message || 'Verification Error'}`);
      }
    } catch (err) {
      alert('System sync failed. Check connectivity.');
    }
  };

  const removeStaff = async (id) => {
    if (window.confirm('Revoke all system access for this member?')) {
      try {
        const res = await fetch(`${API_URL}/api/users/${id}`, { method: 'DELETE' });
        if (res.ok) fetchTeam();
      } catch (err) {
        alert('Failed to revoke access');
      }
    }
  };

  if (loading) return <div className="p-10 text-center animate-pulse text-brand-gold italic">Reconciling Command Cluster...</div>;

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <header className="flex items-center justify-between border-b border-brand-border pb-6">
        <div>
          <h2 className="font-serif text-2xl tracking-wide text-txt-main font-bold">Command & Personnel</h2>
          <p className="mt-1 text-sm text-txt-muted italic">Monitor operational efficiency and authorize access levels.</p>
        </div>
        <button className="btn-gold flex items-center gap-2" onClick={() => {
            if (showForm) {
                setShowForm(false);
                setEditingMember(null);
                setFormData({ name: '', username: '', password: '', role: 'staff', email: '', phone: '', status: 'active' });
            } else {
                setShowForm(true);
            }
        }}>
          {showForm ? 'Cancel Operation' : <><Plus size={16} /> Provision Access</>}
        </button>
      </header>

      {showForm && (
        <div className="rounded-[1.25rem] border border-brand-border bg-bg-card p-8 shadow-xl max-w-4xl mx-auto border-t-4 border-brand-gold animate-in slide-in-from-top-4 duration-300">
          <h3 className="mb-6 font-serif text-lg text-brand-gold uppercase tracking-widest">
            {editingMember ? `Refining ID: ${editingMember.username}` : 'Access Provisioning Protocol'}
          </h3>
          <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-txt-muted font-bold">Public Identity</label>
              <input className="form-control" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Display Name" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-txt-muted font-bold">System Username (Fixed)</label>
              <input className="form-control opacity-70" required readOnly={!!editingMember} value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} placeholder="User ID" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-txt-muted font-bold">Security Key {editingMember && '(Leave blank to keep current)'}</label>
              <input type="password" className="form-control" required={!editingMember} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="••••••••" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-brand-gold font-bold">Clearance Level</label>
              <select className="form-control border-brand-gold/30" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                <option value="staff">Operations Staff</option>
                <option value="manager">Managerial Oversight</option>
                <option value="admin">System Administrator</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-txt-muted font-bold">Digital Contact (Email)</label>
              <input type="email" className="form-control" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="email@hein.luxury" />
            </div>
            <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-txt-muted font-bold">Operational Status</label>
                <select className="form-control" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                    <option value="active">🟢 Active / Authorized</option>
                    <option value="pending">🟡 Pending Verification</option>
                    <option value="suspended">🔴 Access Suspended</option>
                </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] uppercase tracking-widest text-txt-muted font-bold">Direct Line (Phone)</label>
              <input className="form-control" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+..." />
            </div>
            <button type="submit" className="btn-gold md:col-span-2 mt-4 py-4 tracking-[0.2em] font-bold uppercase transition-all hover:scale-[1.01]">
                {editingMember ? 'AUTHORIZE CHANGES' : 'CONFIRM ACCESS PRIVILEGES'}
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {team.map(member => (
          <div key={member._id} className={`group rounded-[1.5rem] border p-6 transition-all hover:shadow-2xl relative overflow-hidden ${member.status === 'suspended' ? 'border-red-900/50 grayscale-[0.5]' : 'border-brand-border bg-bg-card hover:border-brand-gold/40'}`}>
            <div className={`absolute top-0 right-0 w-24 h-24 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity ${member.status === 'suspended' ? 'bg-red-500/10' : 'bg-brand-gold/5'}`}></div>
            
            <div className="flex items-start justify-between mb-5 relative z-10">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all ${member.role === 'admin' ? 'bg-brand-gold/10 border-brand-gold/30 text-brand-gold' : 'bg-bg-main border-brand-border text-txt-muted group-hover:border-brand-gold/20 group-hover:text-brand-gold'}`}>
                {member.role === 'admin' ? <Shield size={28} /> : (member.role === 'manager' ? <ShieldCheck size={28} /> : <User size={28} />)}
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEditClick(member)} className="p-2 text-txt-muted hover:text-brand-gold rounded-lg bg-bg-main border border-brand-border transition-colors"><Edit3 size={14} /></button>
                <button onClick={() => removeStaff(member._id)} className="p-2 text-txt-muted hover:text-red-400 rounded-lg bg-bg-main border border-brand-border transition-colors"><Trash2 size={14} /></button>
              </div>
            </div>

            <div className="space-y-1 relative z-10">
              <h4 className={`font-serif text-lg flex items-center gap-2 font-bold tabular-nums ${member.status === 'suspended' ? 'text-red-400' : 'text-txt-main'}`}>
                {member.name}
                {member.role === 'admin' && <ShieldCheck size={16} className="text-brand-gold" />}
              </h4>
              <div className="flex items-center gap-2">
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold tracking-widest uppercase border ${
                  member.role === 'admin' ? 'border-brand-gold/40 bg-brand-gold/10 text-brand-gold' : 
                  member.role === 'manager' ? 'border-blue-400/40 bg-blue-400/10 text-blue-400' :
                  'border-txt-muted/30 bg-bg-main text-txt-muted'
                }`}>
                  {member.role === 'admin' ? 'SYSTEM CMD' : (member.role === 'manager' ? 'MGMT OVERSEER' : 'OPERATIONS')}
                </span>
                <span className="text-[10px] text-txt-muted/60 font-mono">ID: {member.username}</span>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-brand-border/40 space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-txt-muted uppercase font-bold tracking-widest">Ops Efficiency</span>
                <div className={`flex items-center gap-1 font-bold text-xs ${member.status === 'suspended' ? 'text-gray-500' : 'text-green-500'}`}>
                  <TrendingUp size={12} /> {member.status === 'suspended' ? '0%' : '94%'}
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-txt-muted group-hover:text-txt-main transition-colors">
                  <Mail size={14} className="opacity-50" />
                  <span className="font-mono text-[10px] truncate">{member.email || 'no-email@hein.luxury'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-txt-muted group-hover:text-txt-main transition-colors">
                  <Phone size={14} className="opacity-50" />
                  <span className="font-mono text-[10px]">{member.phone || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${
                    member.status === 'active' ? 'bg-green-500 animate-pulse' : 
                    (member.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500')
                }`}></div>
                <span className={`text-[9px] uppercase font-bold tracking-widest ${
                     member.status === 'active' ? 'text-green-500' : 
                     (member.status === 'pending' ? 'text-yellow-500' : 'text-red-500')
                }`}>{member.status || 'Active'}</span>
              </div>
              <span className="text-[8px] text-txt-muted/40 italic font-mono">Last activity: {member.lastLogin ? new Date(member.lastLogin).toLocaleTimeString() : 'Never'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
