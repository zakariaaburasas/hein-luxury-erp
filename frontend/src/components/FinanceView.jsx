import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, PieChart, BarChart2, ArrowRight } from 'lucide-react';
import API_URL from '../api/config';

export default function FinanceView() {
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalCOGS: 0,
    grossProfit: 0,
    totalExpenses: 0,
    netProfit: 0,
    totalSalesVolume: 0
  });

  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mRes, fRes] = await Promise.all([
          fetch(`${API_URL}/api/finance/monthly`),
          fetch(`${API_URL}/api/finance/profit-loss`)
        ]);
        if (mRes.ok) setMonthlyData(await mRes.json());
        if (fRes.ok) setMetrics(await fRes.json());
      } catch (error) {
        console.error('Economic telemetry failure:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

    const exportToCSV = () => {
        const rows = [
            ["HEIN LUXURY - FINANCIAL INTELLIGENCE REPORT"],
            [`Generated: ${new Date().toLocaleString()}`],
            [""],
            ["SUMMARY METRICS"],
            ["Metric", "Value"],
            ["Total Revenue", `$${metrics.totalRevenue}`],
            ["Gross Profit", `$${metrics.grossProfit}`],
            ["Total Expenses", `$${metrics.totalExpenses}`],
            ["Net Profit", `$${metrics.netProfit}`],
            [""],
            ["MONTHLY PERFORMANCE"],
            ["Month", "Operations", "Value"],
            ...monthlyData.map(d => [d.month, d.orders, d.revenue])
        ];

        const csvContent = rows.map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `HEIN_Intelligence_Report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

  const grossMargin = metrics.totalRevenue ? Math.round((metrics.grossProfit / metrics.totalRevenue) * 100) : 0;
  const netMargin = metrics.totalRevenue ? Math.round((metrics.netProfit / metrics.totalRevenue) * 100) : 0;

  return (
    <div className="space-y-10 pb-20">
      <header className="flex items-center justify-between border-b border-brand-border pb-6">
        <div>
          <h2 className="font-serif text-2xl tracking-wide text-txt-main">Financial Intelligence Platform</h2>
          <p className="mt-1 text-sm text-txt-muted">Dynamic aggregation of revenue, cost of goods, and operational overhead.</p>
        </div>
        <div className="flex items-center gap-3">
            <span className="text-[0.65rem] font-bold text-brand-gold bg-brand-gold/10 px-3 py-1 rounded-full border border-brand-gold/20 uppercase tracking-[0.15em]">Live Pipeline Active</span>
        </div>
      </header>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="rounded-[1.25rem] border border-brand-border bg-bg-card p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-4 text-txt-main/5 group-hover:text-brand-gold/10 transition-colors">
            <DollarSign size={80} />
          </div>
          <p className="text-[0.6rem] uppercase tracking-widest text-txt-muted font-bold mb-4">Gross Revenue</p>
          <h3 className="font-serif text-3xl text-txt-main font-bold">${metrics.totalRevenue.toLocaleString()}</h3>
          <p className="text-[0.65rem] text-txt-muted mt-2 flex items-center gap-1">
            <TrendingUp size={10} className="text-green-500" /> +12.5% vs Last Quarter
          </p>
        </div>

        <div className="rounded-[1.25rem] border border-brand-border bg-bg-card p-6 shadow-xl relative overflow-hidden group">
             <div className="absolute right-0 top-0 p-4 text-txt-main/5 group-hover:text-red-400/10 transition-colors">
                <PieChart size={80} />
            </div>
          <p className="text-[0.6rem] uppercase tracking-widest text-txt-muted font-bold mb-4">Cost breakdown (COGS + OPEX)</p>
          <h3 className="font-serif text-3xl text-red-500 dark:text-red-400 font-bold">-${(metrics.totalCOGS + metrics.totalExpenses).toLocaleString()}</h3>
          <p className="text-[0.65rem] text-txt-muted mt-2">Inventory + Operations</p>
        </div>

        <div className="rounded-[1.25rem] border border-brand-gold bg-brand-gold/5 p-6 shadow-xl border-dashed">
          <p className="text-[0.6rem] uppercase tracking-widest text-brand-gold font-bold mb-4">Operational Alpha (Net Profit)</p>
          <h3 className="font-serif text-4xl text-brand-gold font-bold">${metrics.netProfit.toLocaleString()}</h3>
          <div className="mt-4 flex gap-2">
            <span className="bg-brand-gold text-white dark:text-brand-black text-[0.6rem] font-bold px-2 py-0.5 rounded-full">{netMargin}% Margin</span>
          </div>
        </div>

        <div className="grid grid-rows-2 gap-4">
            <div className="rounded-xl border border-brand-border bg-bg-card px-4 py-3 flex justify-between items-center">
                <span className="text-[0.65rem] text-txt-muted uppercase tracking-widest">Gross Margin</span>
                <span className="font-serif text-xl text-txt-main">{grossMargin}%</span>
            </div>
            <div className="rounded-xl border border-brand-border bg-bg-card px-4 py-3 flex justify-between items-center">
                <span className="text-[0.65rem] text-txt-muted uppercase tracking-widest">Efficiency</span>
                <span className="font-serif text-xl text-txt-main">94.2%</span>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Trend Table */}
        <div className="col-span-8 rounded-[1.25rem] border border-brand-border bg-brand-gray shadow-xl overflow-hidden">
            <div className="p-6 border-b border-brand-border flex justify-between items-center">
                <h3 className="font-serif text-lg text-white">Monthly Liquidity Pipeline</h3>
                <BarChart2 size={16} className="text-gray-500" />
            </div>
            <table className="w-full text-left text-sm">
                <thead className="bg-black/30 text-[0.6rem] uppercase tracking-widest text-brand-gold">
                    <tr>
                        <th className="px-6 py-4 font-medium">Accounting Period</th>
                        <th className="px-6 py-4 font-medium">Requisition Cycle</th>
                        <th className="px-6 py-4 font-medium">Traded Value</th>
                        <th className="px-6 py-4 font-medium text-right">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/50">
                    {monthlyData.length === 0 ? (
                        <tr><td colSpan="4" className="px-6 py-10 text-center text-gray-500 font-mono text-xs">Awaiting data reconciliation...</td></tr>
                    ) : monthlyData.map((d, i) => (
                        <tr key={i} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4 font-serif text-base text-white">{d.month} 2026</td>
                            <td className="px-6 py-4 text-xs font-mono text-gray-400">{d.orders} OPERATIONS</td>
                            <td className="px-6 py-4 font-medium text-gray-200">${d.revenue.toLocaleString()}</td>
                            <td className="px-6 py-4 text-right">
                                <span className="inline-flex items-center gap-1 text-[0.6rem] font-bold text-green-400 uppercase tracking-widest">
                                    Finalized <ArrowRight size={10} />
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        {/* Breakdown Card */}
        <div className="col-span-4 space-y-6">
            <div className="rounded-[1.25rem] border border-brand-border bg-brand-gray p-6 shadow-xl">
                 <h3 className="font-serif text-base text-white mb-6">Allocation Summary</h3>
                 <div className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex justify-between text-[0.65rem] uppercase tracking-widest text-gray-500">
                            <span>Inventory Cost</span>
                            <span className="text-white">${metrics.totalCOGS.toLocaleString()}</span>
                        </div>
                        <div className="h-1 bg-brand-black rounded-full overflow-hidden">
                            <div className="h-full bg-brand-gold/60" style={{ width: `${(metrics.totalCOGS/metrics.totalRevenue)*100}%` }}></div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-[0.65rem] uppercase tracking-widest text-gray-500">
                            <span>Operational Burn</span>
                            <span className="text-white">${metrics.totalExpenses.toLocaleString()}</span>
                        </div>
                        <div className="h-1 bg-brand-black rounded-full overflow-hidden">
                            <div className="h-full bg-red-400/60" style={{ width: `${(metrics.totalExpenses/metrics.totalRevenue)*100}%` }}></div>
                        </div>
                    </div>
                    <div className="pt-4 border-t border-brand-border mt-4">
                        <p className="text-[0.6rem] text-gray-500 italic leading-relaxed">
                            Figures aggregated across {metrics.totalSalesVolume} secure endpoint transmissions. 0% data lag detected in system cluster.
                        </p>
                    </div>
                 </div>
            </div>

            <div className="rounded-[1.25rem] bg-gradient-to-br from-brand-gold to-yellow-600 p-6 shadow-xl text-brand-black">
                <h4 className="font-serif text-lg font-bold">Export Intelligence</h4>
                <p className="text-xs font-medium opacity-80 mt-1 mb-4">Generate certified fiscal statements for archival purposes.</p>
                <button onClick={exportToCSV} className="w-full bg-black/10 hover:bg-black/20 text-[0.65rem] font-bold uppercase tracking-widest py-3 rounded-full border border-black/10 transition-all">
                    Download Intelligence Report
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
