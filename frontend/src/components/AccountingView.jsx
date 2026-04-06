import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, Plus, BookOpen, FileText, BarChart2, Download } from 'lucide-react';
import API_URL from '../api/config';

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORY_COLORS = {
  'Rent': '#f87171', 'Advertising': '#D4AF37', 'Shipping': '#60a5fa',
  'Materials': '#a78bfa', 'Salaries': '#34d399', 'Utilities': '#fb923c',
  'Variable Costs': '#f87171', 'Fixed Costs': '#fbbf24',
  'Occasional Costs': '#c084fc', 'Operations': '#34d399', 'Other': '#9ca3af'
};
const EXPENSE_CATEGORIES = [
  'Rent', 'Salaries', 'Advertising', 'Shipping', 'Materials',
  'Utilities', 'Variable Costs', 'Fixed Costs', 'Occasional Costs', 'Operations', 'Other'
];
const PAYMENT_METHODS = ['Bank Transfer', 'Zaad', 'eDahab', 'Cash', 'Other'];

const KPICard = ({ label, value, sub, color = 'white', trend }) => (
  <div className="rounded-[1.25rem] border border-brand-border bg-bg-card p-6 relative overflow-hidden transition-all hover:border-brand-gold/20 shadow-sm">
    <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-5"
      style={{ background: color === 'red' ? '#ef4444' : color === 'green' ? '#10b981' : '#D4AF37' }} />
    <p className="text-[0.6rem] uppercase tracking-widest text-txt-muted mb-3 font-bold opacity-70">{label}</p>
    <h3 className={`font-serif text-3xl font-bold ${color === 'red' ? 'text-red-500' : color === 'green' ? 'text-green-600 dark:text-green-400' : color === 'gold' ? 'text-brand-gold' : 'text-txt-main'}`}>
      {value}
    </h3>
    {sub && <p className="text-[0.65rem] text-txt-muted mt-1 font-medium">{sub}</p>}
    {trend !== undefined && (
      <div className={`mt-3 flex items-center gap-1 text-xs font-bold ${trend > 0 ? 'text-green-600 dark:text-green-400' : trend < 0 ? 'text-red-500' : 'text-txt-muted'}`}>
        {trend > 0 ? <TrendingUp size={13} /> : trend < 0 ? <TrendingDown size={13} /> : <Minus size={13} />}
        <span>{trend > 0 ? '+' : ''}{trend.toFixed(1)}% this month</span>
      </div>
    )}
  </div>
);

// ─── Tab: Journal ──────────────────────────────────────────────────────────────
function JournalTab({ expenses, sales }) {
  const [filter, setFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('');

  // Build unified journal: sales as Income, expenses as Expense
  const incomeEntries = sales.map(s => ({
    _id: s._id,
    date: s.createdAt,
    type: 'Income',
    category: s.product?.name || 'Sale',
    reference: s.product?.sku_code || '—',
    description: `${s.quantitySold}x ${s.product?.name || 'Product'} · ${s.customer?.name || 'Walk-in'}`,
    payment_method: s.payment_method || 'Zaad',
    amount: s.revenue || 0,
    status: String(s.status).toLowerCase().includes('refund') ? 'Refunded' :
            String(s.status).toLowerCase().includes('unpaid') ? 'Pending' : 'Paid'
  }));

  const expenseEntries = expenses.map(e => ({
    _id: e._id,
    date: e.date,
    type: 'Expense',
    category: e.category,
    reference: '—',
    description: e.description || e.category,
    payment_method: e.payment_method || '—',
    amount: e.amount,
    status: 'Paid'
  }));

  let journal = [...incomeEntries, ...expenseEntries].sort((a, b) => new Date(b.date) - new Date(a.date));

  if (filter !== 'all') journal = journal.filter(j => j.type === filter);
  if (monthFilter) {
    journal = journal.filter(j => {
      const d = new Date(j.date);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === monthFilter;
    });
  }

  const exportCSV = () => {
    const rows = [
      ['Date', 'Type', 'Category', 'Reference', 'Description', 'Payment Method', 'Amount', 'Status'],
      ...journal.map(j => [
        new Date(j.date).toLocaleDateString(), j.type, j.category, j.reference,
        j.description, j.payment_method, j.amount, j.status
      ])
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `HEIN_Journal_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div className="flex gap-2">
          {['all', 'Income', 'Expense'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border transition-all ${filter === f ? 'bg-brand-gold text-brand-black border-brand-gold' : 'border-brand-border text-txt-muted hover:border-brand-gold/40'}`}>
              {f === 'all' ? 'All Entries' : f}
            </button>
          ))}
        </div>
        <div className="flex gap-3 items-center">
          <input type="month" className="form-control text-xs py-2 w-42" value={monthFilter}
            onChange={e => setMonthFilter(e.target.value)} />
          <button onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-brand-border text-xs text-txt-muted hover:text-brand-gold hover:border-brand-gold/40 transition-all font-bold uppercase tracking-wider">
            <Download size={13} /> Export CSV
          </button>
        </div>
      </div>

      {journal.length === 0 ? (
        <div className="text-center py-24 text-txt-muted font-mono text-sm border border-brand-border border-dashed rounded-xl bg-bg-card/40">
          No journal entries for this filter.
        </div>
      ) : (
        <section className="overflow-x-auto rounded-[1.25rem] border border-brand-border bg-bg-card shadow-xl">
          <table className="w-full text-left text-sm">
            <thead className="bg-bg-main text-[10px] uppercase tracking-[0.2em] text-brand-gold font-bold">
              <tr>
                <th className="px-5 py-4">Timeline</th>
                <th className="px-5 py-4">Entry</th>
                <th className="px-5 py-4">Category</th>
                <th className="px-5 py-4">Context</th>
                <th className="px-5 py-4 text-center">Settlement</th>
                <th className="px-5 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/50">
              {journal.map(j => (
                <tr key={j._id} className={`transition-colors hover:bg-brand-gold/5 ${j.type === 'Expense' ? 'bg-red-500/5' : ''}`}>
                  <td className="px-5 py-4 font-mono text-[10px] text-txt-muted uppercase whitespace-nowrap">{new Date(j.date).toLocaleDateString()}</td>
                  <td className="px-5 py-4">
                    <span className={`text-[0.6rem] font-black uppercase tracking-widest px-2 py-1 rounded-full border ${j.type === 'Income' ? 'text-green-600 bg-green-500/10 border-green-500/30 dark:text-green-400' : 'text-red-500 bg-red-500/10 border-red-500/30'}`}>
                      {j.type}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs text-txt-main font-bold">{j.category}</td>
                  <td className="px-5 py-4 text-xs text-txt-muted truncate max-w-[200px] italic">{j.description}</td>
                  <td className="px-5 py-4 text-[10px] font-mono text-txt-muted text-center">
                    <span className={`px-2 py-0.5 rounded border ${j.status === 'Paid' ? 'border-green-500/20 text-green-600 dark:text-green-400' : 'border-amber-500/20 text-amber-600'}`}>{j.status}</span>
                  </td>
                  <td className={`px-5 py-4 font-serif font-bold text-base text-right tabular-nums ${j.type === 'Income' ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                    {j.type === 'Income' ? '+' : '-'}${j.amount.toLocaleString()}
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

// ─── Tab: Expenses ─────────────────────────────────────────────────────────────
function ExpensesTab({ expenses, onAdd }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    category: 'Rent', amount: '', description: '', payment_method: 'Bank Transfer',
    notes: '', date: new Date().toISOString().split('T')[0]
  });
  const [submitting, setSubmitting] = useState(false);

  const totalSpend = expenses.reduce((s, e) => s + e.amount, 0);
  const currMonth = new Date().getMonth();
  const currYear = new Date().getFullYear();
  const monthSpend = expenses.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === currMonth && d.getFullYear() === currYear;
  }).reduce((s, e) => s + e.amount, 0);

  const pieData = Object.entries(
    expenses.reduce((acc, e) => { acc[e.category] = (acc[e.category] || 0) + e.amount; return acc; }, {})
  ).map(([name, value]) => ({ name, value }));

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/expenses`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, amount: parseFloat(formData.amount) })
      });
      if (res.ok) {
        const saved = await res.json();
        onAdd(saved);
        setFormData({ category: 'Rent', amount: '', description: '', payment_method: 'Bank Transfer', notes: '', date: new Date().toISOString().split('T')[0] });
        setShowForm(false);
      }
    } catch (e) { console.error(e); }
    finally { setSubmitting(false); }
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="rounded-[1.25rem] border border-red-500/20 bg-red-500/5 p-6 shadow-sm">
          <p className="text-[0.6rem] uppercase tracking-widest text-red-500 font-bold">Total Expenses (All Time)</p>
          <h3 className="font-serif text-3xl text-red-500 font-bold mt-2 tabular-nums">${totalSpend.toLocaleString()}</h3>
          <p className="text-[0.65rem] text-txt-muted mt-1 opacity-70">{expenses.length} logged entries</p>
        </div>
        <div className="rounded-[1.25rem] border border-brand-border bg-bg-card p-6 shadow-sm">
          <p className="text-[0.6rem] uppercase tracking-widest text-txt-muted font-bold opacity-70">This Month's Spend</p>
          <h3 className="font-serif text-3xl text-txt-main font-bold mt-2 tabular-nums">${monthSpend.toLocaleString()}</h3>
          <p className="text-[0.65rem] text-txt-muted mt-1 underline decoration-brand-gold decoration-2 underline-offset-4">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
        </div>
        <div className="rounded-[1.25rem] border border-brand-border bg-bg-card p-6 shadow-sm">
          <p className="text-[0.6rem] uppercase tracking-widest text-brand-gold font-bold">Top Category</p>
          <h3 className="font-serif text-3xl text-brand-gold font-bold mt-2">
            {pieData.sort((a, b) => b.value - a.value)[0]?.name || '—'}
          </h3>
          <p className="text-[0.65rem] text-txt-muted mt-1 font-medium font-mono">
            ${(pieData.sort((a, b) => b.value - a.value)[0]?.value || 0).toLocaleString()} total
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h4 className="font-serif text-lg text-txt-main font-bold">Expense Ledger</h4>
        <button className="btn-gold" onClick={() => setShowForm(!showForm)}>
          {showForm ? '← Back to Ledger' : <><Plus size={14} className="inline mr-1" />Log Expense</>}
        </button>
      </div>

      {showForm && (
        <div className="rounded-[1.25rem] border border-brand-border bg-bg-card p-8 mb-8 shadow-xl border-t-4 border-brand-gold">
          <h3 className="mb-6 font-serif text-lg text-brand-gold font-bold uppercase tracking-widest">Add Expense Record</h3>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-txt-muted font-bold">Classification</label>
                <select className="form-control" value={formData.category} onChange={e => setFormData(f => ({ ...f, category: e.target.value }))}>
                  {EXPENSE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-txt-muted font-bold">Amount ($)</label>
                <input type="number" min="0" step="0.01" className="form-control" required value={formData.amount} onChange={e => setFormData(f => ({ ...f, amount: e.target.value }))} placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-txt-muted font-bold">Transaction Date</label>
                <input type="date" className="form-control" value={formData.date} onChange={e => setFormData(f => ({ ...f, date: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-txt-muted font-bold">Reference / Description</label>
                <input type="text" className="form-control" value={formData.description} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} placeholder="e.g. Office Rent, Marketing" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-txt-muted font-bold">Modality</label>
                <select className="form-control" value={formData.payment_method} onChange={e => setFormData(f => ({ ...f, payment_method: e.target.value }))}>
                  {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-txt-muted font-bold">Internal Notes</label>
                <input type="text" className="form-control" value={formData.notes} onChange={e => setFormData(f => ({ ...f, notes: e.target.value }))} placeholder="(Optional)" />
              </div>
            </div>
            <button type="submit" disabled={submitting} className="btn-gold w-full py-4 text-xs font-black tracking-widest uppercase disabled:opacity-50">
              {submitting ? 'RECONCILING...' : 'SAVE EXPENSE RECORD'}
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {pieData.length > 0 && (
          <div className="lg:col-span-4 rounded-[1.25rem] border border-brand-border bg-bg-card p-6 shadow-sm">
            <h4 className="font-serif text-sm mb-6 text-txt-main font-bold uppercase tracking-widest">Diversification</h4>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                    {pieData.map((entry, i) => <Cell key={i} fill={CATEGORY_COLORS[entry.name] || '#6b7280'} />)}
                  </Pie>
                  <Tooltip formatter={v => [`$${v.toLocaleString()}`, '']}
                    contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 12, color: 'var(--brand-gold)' }} />
                  <Legend iconType="circle" iconSize={8} formatter={v => <span className="text-[10px] text-txt-muted font-bold uppercase tracking-wider">{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <div className={pieData.length > 0 ? 'lg:col-span-8' : 'lg:col-span-12'}>
          {expenses.length === 0 ? (
            <div className="text-center py-24 text-txt-muted font-mono text-sm border border-brand-border border-dashed rounded-xl bg-bg-card/40">
              No expenses logged yet.
            </div>
          ) : (
            <section className="overflow-hidden rounded-[1.25rem] border border-brand-border bg-bg-card shadow-xl">
              <table className="w-full text-left text-sm">
                <thead className="bg-bg-main text-[10px] uppercase tracking-[0.2em] text-brand-gold font-bold">
                  <tr>
                    <th className="px-5 py-4">Timeline</th>
                    <th className="px-5 py-4">Category</th>
                    <th className="px-5 py-4">Basis</th>
                    <th className="px-5 py-4 text-right">Settlement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/50">
                  {expenses.map(e => (
                    <tr key={e._id} className="hover:bg-brand-gold/5 transition-colors group">
                      <td className="px-5 py-4 font-mono text-[10px] text-txt-muted uppercase whitespace-nowrap">{new Date(e.date).toLocaleDateString()}</td>
                      <td className="px-5 py-4">
                        <span className="px-2 py-0.5 rounded-full text-[0.6rem] font-black uppercase tracking-widest border"
                          style={{ background: `${CATEGORY_COLORS[e.category] || '#9ca3af'}15`, color: CATEGORY_COLORS[e.category] || '#9ca3af', borderColor: `${CATEGORY_COLORS[e.category] || '#9ca3af'}30` }}>
                          {e.category}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                         <div className="text-txt-main font-bold text-xs">{e.description || 'General Expense'}</div>
                         <div className="text-[10px] text-txt-muted italic mt-0.5 opacity-60">{e.payment_method} · {e.notes || 'No notes'}</div>
                      </td>
                      <td className="px-5 py-4 font-serif text-base font-bold text-red-500 text-right tabular-nums">-${e.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Tab: P&L Summary ─────────────────────────────────────────────────────────
function PLTab({ expenses, sales }) {
  const totalRevenue = sales.filter(s => !String(s.status).toLowerCase().includes('refund')).reduce((s, x) => s + (x.revenue || 0), 0);
  const totalCOGS = sales.filter(s => !String(s.status).toLowerCase().includes('refund')).reduce((s, x) => s + ((x.product?.cost_price || 0) * (x.quantitySold || 0)), 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const grossProfit = totalRevenue - totalCOGS;
  const netProfit = grossProfit - totalExpenses;
  const margin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  // Monthly chart data (last 6 months)
  const now = new Date();
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const month = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    const mSales = sales.filter(s => { const sd = new Date(s.createdAt); return sd.getMonth() === d.getMonth() && sd.getFullYear() === d.getFullYear() && !String(s.status).toLowerCase().includes('refund'); });
    const mExp = expenses.filter(e => { const ed = new Date(e.date); return ed.getMonth() === d.getMonth() && ed.getFullYear() === d.getFullYear(); });
    const revenue = mSales.reduce((s, x) => s + (x.revenue || 0), 0);
    const expTotal = mExp.reduce((s, e) => s + e.amount, 0);
    return { month, revenue, expenses: expTotal, profit: revenue - expTotal };
  });

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KPICard label="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} color="green" sub={`${sales.length} transactions`} />
        <KPICard label="Total Expenses" value={`$${totalExpenses.toLocaleString()}`} color="red" sub={`${expenses.length} entries`} />
        <KPICard label="Net Profit" value={`$${netProfit.toLocaleString()}`} color={netProfit >= 0 ? 'gold' : 'red'} sub="Rev − Inventory − Expenses" />
        <KPICard label="Net Margin %" value={`${margin.toFixed(1)}%`} color={margin >= 0 ? 'green' : 'red'} sub="Profit / Revenue Efficiency" />
      </div>

      {/* Breakdown Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-[1.25rem] border border-brand-border bg-bg-card p-6 shadow-sm space-y-4">
          <h4 className="font-serif text-base text-txt-main font-bold uppercase tracking-widest mb-2 opacity-80">Economic Architecture</h4>
          {[
            { label: 'Gross Revenue', value: totalRevenue, color: 'text-green-600 dark:text-green-400' },
            { label: 'Inventory (COGS)', value: -totalCOGS, color: 'text-red-500' },
            { label: 'Gross Profit', value: grossProfit, color: 'text-brand-gold', divider: true },
            { label: 'Operating Expenses', value: -totalExpenses, color: 'text-red-500' },
            { label: 'Net Profit', value: netProfit, color: netProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500', divider: true, bold: true },
          ].map((row, i) => (
            <div key={i}>
              {row.divider && <div className="border-t border-brand-border/40 my-3" />}
              <div className="flex justify-between items-center">
                <span className={`text-[11px] uppercase tracking-wider text-txt-muted font-bold ${row.bold ? 'text-txt-main' : 'opacity-70'}`}>{row.label}</span>
                <span className={`font-serif font-bold tabular-nums ${row.color} ${row.bold ? 'text-xl' : 'text-base'}`}>
                  ${Math.abs(row.value).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-2 rounded-[1.25rem] border border-brand-border bg-bg-card p-6 shadow-sm">
          <h4 className="font-serif text-base text-txt-main font-bold uppercase tracking-widest mb-6 opacity-80">6-Month Trend Analysis</h4>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.4} />
                <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} dy={5} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `$${(v/1000).toFixed(1)}k` : `$${v}`} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 12, color: 'var(--text-main)' }}
                  itemStyle={{ fontSize: 11, fontWeight: 'bold' }}
                />
                <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} name="Revenue" />
                <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} name="Expenses" />
                <Bar dataKey="profit" fill="#D4AF37" radius={[4, 4, 0, 0]} name="Profit" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-6 mt-6 justify-center">
            {[['Revenue', '#10b981'], ['Expenses', '#ef4444'], ['Net Profit', '#D4AF37']].map(([l, c]) => (
              <div key={l} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
                <span className="text-[10px] font-black uppercase tracking-widest text-txt-muted">{l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Accounting View ──────────────────────────────────────────────────────
export default function AccountingView() {
  const [activeTab, setActiveTab] = useState('journal');
  const [expenses, setExpenses] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/api/expenses`).then(r => r.json()),
      fetch(`${API_URL}/api/sales`).then(r => r.json())
    ]).then(([e, s]) => {
      setExpenses(Array.isArray(e) ? e : []);
      setSales(Array.isArray(s) ? s : []);
    }).catch(console.error)
    .finally(() => setLoading(false));
  }, []);

  const TABS = [
    { id: 'journal', label: 'Journal', Icon: BookOpen },
    { id: 'expenses', label: 'Expenses', Icon: FileText },
    { id: 'pl', label: 'P&L Summary', Icon: BarChart2 },
  ];

  const totalRevenue = sales.filter(s => !String(s.status).toLowerCase().includes('refund')).reduce((s, x) => s + (x.revenue || 0), 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;

  if (loading) return <div className="text-brand-gold animate-pulse tracking-[0.2em] font-black text-xs uppercase py-12 text-center">Syncing financial architecture...</div>;

  return (
    <div className="pb-12">
      <header className="mb-10 border-b border-brand-border pb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="font-serif text-3xl tracking-wide text-txt-main font-bold">Accounting</h2>
          <p className="mt-1 text-sm text-txt-muted italic font-medium">Full financial intelligence — journal, expenses, and profit & loss.</p>
        </div>
        <div className="flex gap-8 text-right bg-bg-card p-4 rounded-2xl border border-brand-border shadow-inner">
          <div><p className="text-[0.6rem] uppercase tracking-[0.1em] text-txt-muted font-bold opacity-60">Revenue</p><p className="font-serif text-xl font-bold text-green-600 dark:text-green-400 tabular-nums">${totalRevenue.toLocaleString()}</p></div>
          <div className="border-l border-brand-border/40 pl-8">
            <p className="text-[0.6rem] uppercase tracking-[0.1em] text-txt-muted font-bold opacity-60">Expenses</p>
            <p className="font-serif text-xl font-bold text-red-500 tabular-nums">${totalExpenses.toLocaleString()}</p>
          </div>
          <div className="border-l border-brand-border/40 pl-8">
            <p className="text-[0.6rem] uppercase tracking-[0.1em] text-brand-gold font-bold">Net Profit</p>
            <p className={`font-serif text-xl font-bold tabular-nums ${netProfit >= 0 ? 'text-brand-gold' : 'text-red-500'}`}>${netProfit.toLocaleString()}</p>
          </div>
        </div>
      </header>

      {/* Tab Switcher */}
      <div className="flex gap-1 mb-10 bg-bg-main rounded-2xl p-1.5 border border-brand-border w-fit shadow-inner">
        {TABS.map(({ id, label, Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 ${activeTab === id ? 'bg-brand-gold text-brand-black shadow-lg scale-105' : 'text-txt-muted hover:text-txt-main hover:bg-brand-gold/5'}`}>
            <Icon size={14} />{label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-[fadeIn_0.5s_ease-out]">
        {activeTab === 'journal' && <JournalTab expenses={expenses} sales={sales} />}
        {activeTab === 'expenses' && <ExpensesTab expenses={expenses} onAdd={e => setExpenses(prev => [e, ...prev])} />}
        {activeTab === 'pl' && <PLTab expenses={expenses} sales={sales} />}
      </div>
    </div>
  );
}
