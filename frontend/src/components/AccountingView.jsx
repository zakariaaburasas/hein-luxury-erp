import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
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
  <div className="rounded-[1.25rem] border border-brand-border bg-brand-gray p-6 relative overflow-hidden">
    <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-5"
      style={{ background: color === 'red' ? '#f87171' : color === 'green' ? '#34d399' : '#D4AF37' }} />
    <p className="text-[0.6rem] uppercase tracking-widest text-gray-400 mb-3">{label}</p>
    <h3 className={`font-serif text-3xl font-bold ${color === 'red' ? 'text-red-400' : color === 'green' ? 'text-green-400' : color === 'gold' ? 'text-brand-gold' : 'text-white'}`}>
      {value}
    </h3>
    {sub && <p className="text-[0.65rem] text-gray-500 mt-1">{sub}</p>}
    {trend !== undefined && (
      <div className={`mt-3 flex items-center gap-1 text-xs font-bold ${trend > 0 ? 'text-green-400' : trend < 0 ? 'text-red-400' : 'text-gray-500'}`}>
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
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border transition-all ${filter === f ? 'bg-brand-gold text-black border-brand-gold' : 'border-brand-border text-gray-400 hover:border-brand-gold/40'}`}>
              {f === 'all' ? 'All Entries' : f}
            </button>
          ))}
        </div>
        <div className="flex gap-3 items-center">
          <input type="month" className="form-control text-xs py-2 w-40" value={monthFilter}
            onChange={e => setMonthFilter(e.target.value)} />
          <button onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-brand-border text-xs text-gray-400 hover:text-brand-gold hover:border-brand-gold/40 transition-all">
            <Download size={13} /> Export CSV
          </button>
        </div>
      </div>

      {journal.length === 0 ? (
        <div className="text-center py-24 text-gray-500 font-mono text-sm border border-brand-border border-dashed rounded-xl">
          No journal entries for this filter.
        </div>
      ) : (
        <section className="overflow-x-auto rounded-[1.25rem] border border-brand-border bg-brand-gray shadow-xl">
          <table className="w-full text-left text-sm">
            <thead className="bg-black/40 text-xs uppercase tracking-widest text-brand-gold">
              <tr>
                <th className="border-b border-brand-border px-5 py-4">Date</th>
                <th className="border-b border-brand-border px-5 py-4">Type</th>
                <th className="border-b border-brand-border px-5 py-4">Category</th>
                <th className="border-b border-brand-border px-5 py-4">Description</th>
                <th className="border-b border-brand-border px-5 py-4">Method</th>
                <th className="border-b border-brand-border px-5 py-4">Status</th>
                <th className="border-b border-brand-border px-5 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {journal.map(j => (
                <tr key={j._id} className={`transition-colors hover:bg-white/5 ${j.type === 'Expense' ? 'bg-red-900/5' : ''}`}>
                  <td className="px-5 py-3 font-mono text-xs text-gray-400">{new Date(j.date).toLocaleDateString()}</td>
                  <td className="px-5 py-3">
                    <span className={`text-[0.6rem] font-bold uppercase tracking-widest px-2 py-1 rounded-full border ${j.type === 'Income' ? 'text-green-400 bg-green-400/10 border-green-400/30' : 'text-red-400 bg-red-400/10 border-red-400/30'}`}>
                      {j.type}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-300">{j.category}</td>
                  <td className="px-5 py-3 text-xs text-gray-400 max-w-[200px] truncate">{j.description}</td>
                  <td className="px-5 py-3 text-xs font-mono text-gray-500">{j.payment_method}</td>
                  <td className="px-5 py-3">
                    <span className={`text-[0.6rem] font-bold uppercase tracking-widest ${j.status === 'Paid' ? 'text-green-400' : j.status === 'Pending' ? 'text-amber-400' : 'text-red-400'}`}>
                      {j.status}
                    </span>
                  </td>
                  <td className={`px-5 py-3 font-serif font-bold text-base text-right ${j.type === 'Income' ? 'text-green-400' : 'text-red-400'}`}>
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
      <div className="grid grid-cols-3 gap-5 mb-8">
        <div className="rounded-[1.25rem] border border-red-900/40 bg-red-900/10 p-6">
          <p className="text-[0.6rem] uppercase tracking-widest text-red-400">Total Expenses (All Time)</p>
          <h3 className="font-serif text-3xl text-red-400 font-bold mt-2">${totalSpend.toLocaleString()}</h3>
          <p className="text-[0.65rem] text-gray-500 mt-1">{expenses.length} logged entries</p>
        </div>
        <div className="rounded-[1.25rem] border border-brand-border bg-brand-gray p-6">
          <p className="text-[0.6rem] uppercase tracking-widest text-gray-400">This Month's Spend</p>
          <h3 className="font-serif text-3xl text-white font-bold mt-2">${monthSpend.toLocaleString()}</h3>
          <p className="text-[0.65rem] text-gray-500 mt-1">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
        </div>
        <div className="rounded-[1.25rem] border border-brand-border bg-brand-gray p-6">
          <p className="text-[0.6rem] uppercase tracking-widest text-gray-400">Top Category</p>
          <h3 className="font-serif text-3xl text-brand-gold font-bold mt-2">
            {pieData.sort((a, b) => b.value - a.value)[0]?.name || '—'}
          </h3>
          <p className="text-[0.65rem] text-gray-500 mt-1">
            ${(pieData.sort((a, b) => b.value - a.value)[0]?.value || 0).toLocaleString()} total
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h4 className="font-serif text-lg text-white">Expense Ledger</h4>
        <button className="btn-gold" onClick={() => setShowForm(!showForm)}>
          {showForm ? '← Back to Ledger' : <><Plus size={14} className="inline mr-1" />Log Expense</>}
        </button>
      </div>

      {showForm && (
        <div className="rounded-[1.25rem] border border-brand-border bg-brand-gray p-8 mb-8 shadow-xl">
          <h3 className="mb-6 font-serif text-lg text-brand-gold">New Expense Entry</h3>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-3 gap-5">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-gray-400">Category</label>
                <select className="form-control" value={formData.category} onChange={e => setFormData(f => ({ ...f, category: e.target.value }))}>
                  {EXPENSE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
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
            <div className="grid grid-cols-3 gap-5">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-gray-400">Description</label>
                <input type="text" className="form-control" value={formData.description} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} placeholder="e.g. Monthly Rent, Facebook Ads" />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-gray-400">Payment Method</label>
                <select className="form-control" value={formData.payment_method} onChange={e => setFormData(f => ({ ...f, payment_method: e.target.value }))}>
                  {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-gray-400">Notes</label>
                <input type="text" className="form-control" value={formData.notes} onChange={e => setFormData(f => ({ ...f, notes: e.target.value }))} placeholder="Optional notes" />
              </div>
            </div>
            <button type="submit" disabled={submitting} className="btn-gold disabled:opacity-50">
              {submitting ? 'Saving...' : 'Save Expense Entry'}
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-12 gap-6">
        {pieData.length > 0 && (
          <div className="col-span-4 rounded-[1.25rem] border border-brand-border bg-brand-gray p-6">
            <h4 className="font-serif text-sm mb-4 text-white">Spend by Category</h4>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {pieData.map((entry, i) => <Cell key={i} fill={CATEGORY_COLORS[entry.name] || '#6b7280'} />)}
                </Pie>
                <Tooltip formatter={v => [`$${v.toLocaleString()}`, '']}
                  contentStyle={{ background: '#0a0a0a', border: '1px solid #27272a', borderRadius: 8, color: '#D4AF37' }} />
                <Legend iconType="circle" iconSize={8} formatter={v => <span className="text-xs text-gray-400">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className={pieData.length > 0 ? 'col-span-8' : 'col-span-12'}>
          {expenses.length === 0 ? (
            <div className="text-center py-24 text-gray-500 font-mono text-sm border border-brand-border border-dashed rounded-xl">
              No expenses logged yet. Log your first entry above.
            </div>
          ) : (
            <section className="overflow-hidden rounded-[1.25rem] border border-brand-border bg-brand-gray shadow-xl">
              <table className="w-full text-left text-sm">
                <thead className="bg-black/40 text-xs uppercase tracking-widest text-brand-gold">
                  <tr>
                    <th className="border-b border-brand-border px-5 py-4">Date</th>
                    <th className="border-b border-brand-border px-5 py-4">Category</th>
                    <th className="border-b border-brand-border px-5 py-4">Description</th>
                    <th className="border-b border-brand-border px-5 py-4">Method</th>
                    <th className="border-b border-brand-border px-5 py-4">Notes</th>
                    <th className="border-b border-brand-border px-5 py-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border">
                  {expenses.map(e => (
                    <tr key={e._id} className="hover:bg-white/5 transition-colors">
                      <td className="px-5 py-3 font-mono text-xs text-gray-400">{new Date(e.date).toLocaleDateString()}</td>
                      <td className="px-5 py-3">
                        <span className="px-2 py-1 rounded-full text-[0.6rem] font-bold uppercase tracking-widest"
                          style={{ background: `${CATEGORY_COLORS[e.category] || '#9ca3af'}20`, color: CATEGORY_COLORS[e.category] || '#9ca3af', border: `1px solid ${CATEGORY_COLORS[e.category] || '#9ca3af'}40` }}>
                          {e.category}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-300 text-sm">{e.description || '—'}</td>
                      <td className="px-5 py-3 text-gray-400 text-xs">{e.payment_method || '—'}</td>
                      <td className="px-5 py-3 text-gray-500 text-xs italic">{e.notes || '—'}</td>
                      <td className="px-5 py-3 font-serif text-base font-bold text-red-400 text-right">-${e.amount.toLocaleString()}</td>
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
      <div className="grid grid-cols-4 gap-5">
        <KPICard label="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} color="green" sub={`${sales.length} transactions`} />
        <KPICard label="Total Expenses" value={`$${totalExpenses.toLocaleString()}`} color="red" sub={`${expenses.length} entries`} />
        <KPICard label="Net Profit" value={`$${netProfit.toLocaleString()}`} color={netProfit >= 0 ? 'gold' : 'red'} sub="Revenue − Inventory Costs − Expenses" />
        <KPICard label="Net Margin %" value={`${margin.toFixed(1)}%`} color={margin >= 0 ? 'green' : 'red'} sub="Net Profit / Revenue" />
      </div>

      {/* Breakdown Row */}
      <div className="grid grid-cols-3 gap-5">
        <div className="rounded-[1.25rem] border border-brand-border bg-brand-gray p-6 space-y-4">
          <h4 className="font-serif text-base text-white">P&L Breakdown</h4>
          {[
            { label: 'Gross Revenue', value: totalRevenue, color: 'text-green-400' },
            { label: 'Inventory Costs', value: -totalCOGS, color: 'text-red-400' },
            { label: 'Gross Profit', value: grossProfit, color: 'text-brand-gold', divider: true },
            { label: 'Operating Expenses', value: -totalExpenses, color: 'text-red-400' },
            { label: 'Net Profit', value: netProfit, color: netProfit >= 0 ? 'text-green-400' : 'text-red-400', divider: true, bold: true },
          ].map((row, i) => (
            <div key={i}>
              {row.divider && <div className="border-t border-brand-border my-2" />}
              <div className="flex justify-between items-center">
                <span className={`text-xs text-gray-400 ${row.bold ? 'font-bold text-white' : ''}`}>{row.label}</span>
                <span className={`font-serif font-bold ${row.color} ${row.bold ? 'text-lg' : 'text-sm'}`}>
                  {row.value >= 0 ? '+' : ''}${row.value.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="col-span-2 rounded-[1.25rem] border border-brand-border bg-brand-gray p-6">
          <h4 className="font-serif text-base text-white mb-5">6-Month Revenue vs. Expenses</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData} barGap={4}>
              <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
              <Tooltip
                contentStyle={{ background: '#0a0a0a', border: '1px solid #27272a', borderRadius: 8 }}
                formatter={v => [`$${v.toLocaleString()}`, '']}
              />
              <Bar dataKey="revenue" fill="#34d399" radius={[4, 4, 0, 0]} name="Revenue" />
              <Bar dataKey="expenses" fill="#f87171" radius={[4, 4, 0, 0]} name="Expenses" />
              <Bar dataKey="profit" fill="#D4AF37" radius={[4, 4, 0, 0]} name="Net Profit" />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-6 mt-3 justify-center">
            {[['Revenue', '#34d399'], ['Expenses', '#f87171'], ['Net Profit', '#D4AF37']].map(([l, c]) => (
              <div key={l} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
                <span className="text-xs text-gray-400">{l}</span>
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

  if (loading) return <div className="text-brand-gold animate-pulse tracking-widest text-sm uppercase py-12">Syncing accounting ledger...</div>;

  return (
    <div>
      <header className="mb-8 border-b border-brand-border pb-6 flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl tracking-wide text-white">Accounting</h2>
          <p className="mt-1 text-sm text-gray-400">Full financial intelligence — journal, expenses, and profit & loss.</p>
        </div>
        <div className="flex gap-6 text-right">
          <div><p className="text-[0.6rem] uppercase tracking-widest text-gray-500">Revenue</p><p className="font-serif text-xl font-bold text-green-400">${totalRevenue.toLocaleString()}</p></div>
          <div><p className="text-[0.6rem] uppercase tracking-widest text-gray-500">Expenses</p><p className="font-serif text-xl font-bold text-red-400">${totalExpenses.toLocaleString()}</p></div>
          <div><p className="text-[0.6rem] uppercase tracking-widest text-gray-500">Net Profit</p><p className={`font-serif text-xl font-bold ${netProfit >= 0 ? 'text-brand-gold' : 'text-red-400'}`}>${netProfit.toLocaleString()}</p></div>
        </div>
      </header>

      {/* Tab Switcher */}
      <div className="flex gap-1 mb-8 bg-brand-gray rounded-xl p-1 border border-brand-border w-fit">
        {TABS.map(({ id, label, Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeTab === id ? 'bg-brand-gold text-black shadow-md' : 'text-gray-400 hover:text-white'}`}>
            <Icon size={13} />{label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'journal' && <JournalTab expenses={expenses} sales={sales} />}
      {activeTab === 'expenses' && <ExpensesTab expenses={expenses} onAdd={e => setExpenses(prev => [e, ...prev])} />}
      {activeTab === 'pl' && <PLTab expenses={expenses} sales={sales} />}
    </div>
  );
}
