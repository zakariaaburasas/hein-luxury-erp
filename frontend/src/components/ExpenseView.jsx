import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const CATEGORY_COLORS = {
  'Advertising': '#D4AF37',
  'Shipping': '#60a5fa',
  'Materials': '#a78bfa',
  'Operations': '#34d399',
  'Other': '#9ca3af',
  'Variable Costs': '#f87171',
  'Fixed Costs': '#fbbf24',
  'Occasional Costs': '#c084fc'
};

export default function ExpenseView() {
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    category: 'Fixed Costs',
    amount: '',
    description: '',
    payment_method: '',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [eRes, sRes] = await Promise.all([
        fetch('http://localhost:5000/api/expenses'),
        fetch('http://localhost:5000/api/expenses/summary')
      ]);
      if (eRes.ok) setExpenses(await eRes.json());
      if (sRes.ok) setSummary(await sRes.json());
    } catch (e) { console.error(e); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('http://localhost:5000/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, amount: parseFloat(formData.amount) })
      });
      if (res.ok) {
        const saved = await res.json();
        setExpenses(prev => [saved, ...prev]);
        setFormData({ category: 'Fixed Costs', amount: '', description: '', payment_method: '', notes: '', date: new Date().toISOString().split('T')[0] });
        setShowForm(false);
        fetchAll(); // refresh summary
      }
    } catch (e) { console.error(e); }
    finally { setSubmitting(false); }
  };

  const totalSpend = expenses.reduce((sum, e) => sum + e.amount, 0);

  const pieData = summary.map(s => ({
    name: s._id,
    value: s.total
  }));

  return (
    <div>
      <header className="mb-10 flex items-center justify-between border-b border-brand-border pb-6">
        <div>
          <h2 className="font-serif text-2xl tracking-wide text-white">Expense Tracker</h2>
          <p className="mt-1 text-sm text-gray-400">Log business costs to calculate accurate Net Profit.</p>
        </div>
        <button className="btn-gold" onClick={() => setShowForm(!showForm)}>
          {showForm ? '← View Ledger' : '+ Log Expense'}
        </button>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="rounded-[1.25rem] border border-brand-border bg-brand-gray p-6 col-span-1">
          <p className="text-xs uppercase tracking-widest text-gray-400">Total Expenses</p>
          <h3 className="font-serif text-3xl text-red-400 font-bold mt-2">${totalSpend.toLocaleString()}</h3>
          <p className="text-xs text-gray-500 mt-1">{expenses.length} logged entries</p>
        </div>
        {summary.slice(0, 2).map(s => (
          <div key={s._id} className="rounded-[1.25rem] border border-brand-border bg-brand-gray p-6">
            <p className="text-xs uppercase tracking-widest text-gray-400">{s._id}</p>
            <h3 className="font-serif text-3xl text-white font-bold mt-2">${s.total.toLocaleString()}</h3>
            <p className="text-xs text-gray-500 mt-1">{s.count} transactions</p>
          </div>
        ))}
      </div>

      {showForm ? (
        <div className="rounded-[1.25rem] border border-brand-border bg-brand-gray p-10 shadow-xl">
          <h3 className="mb-8 font-serif text-xl text-brand-gold">Log Business Expense</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-gray-400">Category</label>
                <select className="form-control" value={formData.category} onChange={e => setFormData(f => ({ ...f, category: e.target.value }))}>
                  {['Advertising', 'Shipping', 'Materials', 'Operations', 'Variable Costs', 'Fixed Costs', 'Occasional Costs', 'Other'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-gray-400">Amount ($)</label>
                <input type="number" min="0" step="0.01" className="form-control" required value={formData.amount} onChange={e => setFormData(f => ({ ...f, amount: e.target.value }))} placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-gray-400">Date</label>
                <input type="date" className="form-control" value={formData.date} onChange={e => setFormData(f => ({ ...f, date: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-gray-400">Description</label>
                <input type="text" className="form-control" value={formData.description} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} placeholder="e.g. Rent, Utilities, Facebook Ads" />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-gray-400">Payment Method</label>
                <input type="text" className="form-control" value={formData.payment_method} onChange={e => setFormData(f => ({ ...f, payment_method: e.target.value }))} placeholder="e.g. Bank, Zaad, Cash" />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-gray-400">Notes</label>
                <input type="text" className="form-control" value={formData.notes} onChange={e => setFormData(f => ({ ...f, notes: e.target.value }))} placeholder="Optional notes" />
              </div>
            </div>
            <button type="submit" disabled={submitting} className="btn-gold mt-4 disabled:opacity-50">
              {submitting ? 'Saving...' : 'Log Expense'}
            </button>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-6">
          {/* Expense Chart */}
          {pieData.length > 0 && (
            <div className="col-span-4 rounded-[1.25rem] border border-brand-border bg-brand-gray p-6">
              <h4 className="font-serif text-base mb-4 text-white">Spend by Category</h4>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={CATEGORY_COLORS[entry.name] || '#6b7280'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [`$${v.toLocaleString()}`, '']} contentStyle={{ background: '#0a0a0a', border: '1px solid #27272a', borderRadius: 8, color: '#D4AF37' }} />
                  <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-xs text-gray-400">{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Expense Table */}
          <div className={`${pieData.length > 0 ? 'col-span-8' : 'col-span-12'}`}>
            {expenses.length === 0 ? (
              <div className="text-center py-24 text-gray-500 font-mono text-sm border border-brand-border border-dashed rounded-xl">
                No expenses logged yet.
              </div>
            ) : (
              <section className="overflow-hidden rounded-[1.25rem] border border-brand-border bg-brand-gray shadow-xl">
                <table className="w-full text-left text-sm">
                  <thead className="bg-black/40 text-xs uppercase tracking-widest text-brand-gold">
                    <tr>
                      <th className="border-b border-brand-border px-5 py-4">Date</th>
                      <th className="border-b border-brand-border px-5 py-4">Category</th>
                      <th className="border-b border-brand-border px-5 py-4">Description</th>
                      <th className="border-b border-brand-border px-5 py-4">Payment</th>
                      <th className="border-b border-brand-border px-5 py-4">Notes</th>
                      <th className="border-b border-brand-border px-5 py-4 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border">
                    {expenses.map(e => (
                      <tr key={e._id} className="hover:bg-white/5 transition-colors">
                        <td className="px-5 py-4 font-mono text-xs text-gray-400">{new Date(e.date).toLocaleDateString()}</td>
                        <td className="px-5 py-4">
                          <span className="px-2 py-1 rounded-full text-[0.6rem] font-bold uppercase tracking-widest" style={{ background: `${CATEGORY_COLORS[e.category] || '#9ca3af'}20`, color: CATEGORY_COLORS[e.category] || '#9ca3af', border: `1px solid ${CATEGORY_COLORS[e.category] || '#9ca3af'}40` }}>
                            {e.category}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-gray-300 font-medium">{e.description || '—'}</td>
                        <td className="px-5 py-4 text-gray-400 text-xs">{e.payment_method || '—'}</td>
                        <td className="px-5 py-4 text-gray-500 text-xs italic">{e.notes || '—'}</td>
                        <td className="px-5 py-4 font-serif text-base font-bold text-red-400 text-right">-${e.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
