import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard, Package, CreditCard, Users, BarChart2,
  Receipt, Search, Bell, User, TrendingUp, TrendingDown,
  DollarSign, ShoppingBag, AlertTriangle, ArrowUpRight, ArrowDownRight, Factory, BookOpen
} from 'lucide-react';

// Subviews
import InventoryView from './InventoryView';
import CRMView from './CRMView';
import SalesView from './SalesView';
import FinanceView from './FinanceView';
import AccountingView from './AccountingView';
import ProductionView from './ProductionView';
import GlobalSearch from './GlobalSearch';
import NotificationPanel from './NotificationPanel';

// Widgets
import RevenueChart from './widgets/RevenueChart';
import StockAlertWidget from './widgets/StockAlertWidget';

// ─── Stat Card ──────────────────────────────────────
function StatCard({ title, value, subtitle, trend, isPrimary, isNegative, icon: Icon }) {
  return (
    <div className={`rounded-[1.25rem] p-6 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 cursor-default ${
      isPrimary
        ? 'bg-gradient-to-br from-brand-gold to-yellow-600 text-brand-black shadow-[0_8px_30px_rgba(212,175,55,0.35)]'
        : 'bg-brand-gray border border-brand-border text-white shadow-lg'
    }`}>
      {Icon && (
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${
          isPrimary ? 'bg-black/15 text-brand-black' : 'bg-brand-black text-brand-gold'
        }`}>
          <Icon size={20} />
        </div>
      )}
      {trend !== undefined && (
        <div className={`absolute top-5 right-5 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
          trend > 0
            ? isPrimary ? 'bg-black/20 text-black' : 'bg-green-500/15 text-green-400'
            : isPrimary ? 'bg-black/20 text-black' : 'bg-red-500/15 text-red-400'
        }`}>
          {trend > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {Math.abs(trend)}%
        </div>
      )}
      <p className={`text-xs font-medium tracking-widest uppercase mb-2 ${isPrimary ? 'text-black/60' : 'text-gray-400'}`}>{title}</p>
      <h3 className={`font-serif text-3xl font-bold tracking-wide ${isNegative && !isPrimary ? 'text-red-400' : ''}`}>{value}</h3>
      {subtitle && <p className={`text-xs mt-1.5 ${isPrimary ? 'text-black/50' : 'text-gray-500'}`}>{subtitle}</p>}
    </div>
  );
}

// ─── Main Dashboard ──────────────────────────────────────
export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  // Live metrics state
  const [finance, setFinance] = useState({ totalRevenue: 0, grossProfit: 0, totalExpenses: 0, netProfit: 0, totalSalesVolume: 0 });
  const [monthlyData, setMonthlyData] = useState([]);
  const [stockAlerts, setStockAlerts] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [activeProduction, setActiveProduction] = useState(0);
  const [loading, setLoading] = useState(true);

  const hydrate = useCallback(async () => {
    setLoading(true);
    try {
      const [finRes, monthRes, alertRes, salesRes, custRes, prodRes, shipyardRes] = await Promise.all([
        fetch('http://localhost:5000/api/finance/profit-loss'),
        fetch('http://localhost:5000/api/finance/monthly'),
        fetch('http://localhost:5000/api/sales/low-stock'),
        fetch('http://localhost:5000/api/sales'),
        fetch('http://localhost:5000/api/customers'),
        fetch('http://localhost:5000/api/products'),
        fetch('http://localhost:5000/api/production')
      ]);

      if (finRes.ok) setFinance(await finRes.json());
      if (monthRes.ok) setMonthlyData(await monthRes.json());
      if (alertRes.ok) setStockAlerts(await alertRes.json());
      if (salesRes.ok) {
        const all = await salesRes.json();
        setRecentSales(all.slice(0, 5));
      }
      if (custRes.ok) setTotalCustomers((await custRes.json()).length);
      if (prodRes.ok) setTotalProducts((await prodRes.json()).length);
      if (shipyardRes && shipyardRes.ok) {
        const prodData = await shipyardRes.json();
        setActiveProduction(prodData.filter(p => p.status !== 'Delivered').length);
      }
    } catch (e) {
      console.error('Dashboard hydration failed:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'dashboard') hydrate();
  }, [activeTab, hydrate]);

  // ─── Sidebar Nav Item ──────────────────────────────────────
  const NavItem = ({ id, label, Icon, section }) => {
    const isActive = activeTab === id;
    return (
      <button
        onClick={() => setActiveTab(id)}
        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-full transition-all duration-200 ${
          isActive
            ? 'bg-brand-gold text-brand-black shadow-[0_4px_14px_rgba(212,175,55,0.35)]'
            : 'text-gray-400 hover:text-white hover:bg-white/5'
        }`}
      >
        <Icon size={17} strokeWidth={isActive ? 2.5 : 1.8} />
        <span className="tracking-wide">{label}</span>
      </button>
    );
  };

  // ─── Overview Dashboard Content ──────────────────────────────────────
  const OverviewContent = () => {
    if (loading) return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm tracking-widest">Syncing live data...</p>
        </div>
      </div>
    );

    return (
      <div className="space-y-6 pb-12">
        {/* Zone 1: Financial Summary — 4 stat cards */}
        <div className="grid grid-cols-4 gap-5">
          <StatCard
            title="Total Revenue"
            value={`$${finance.totalRevenue.toLocaleString()}`}
            subtitle={`${finance.totalSalesVolume} transactions`}
            trend={finance.totalRevenue > 0 ? 12.4 : undefined}
            isPrimary
            icon={DollarSign}
          />
          <StatCard
            title="Gross Profit"
            value={`$${finance.grossProfit.toLocaleString()}`}
            subtitle="Revenue minus COGS"
            icon={TrendingUp}
          />
          <StatCard
            title="Total Expenses"
            value={`$${finance.totalExpenses.toLocaleString()}`}
            subtitle="Ads, Shipping, Materials"
            isNegative
            icon={Receipt}
          />
          <StatCard
            title="Net Profit"
            value={`$${finance.netProfit.toLocaleString()}`}
            subtitle="Gross Profit minus Expenses"
            trend={finance.netProfit >= 0 ? 8.2 : -5.1}
            icon={BarChart2}
          />
          <StatCard
            title="Manufacturing POs"
            value={activeProduction}
            subtitle="Active production cycles"
            trend={activeProduction > 0 ? 5 : 0}
            icon={Factory}
          />
        </div>

        {/* Zone 2: Revenue Chart + Stock Alerts */}
        <div className="grid grid-cols-12 gap-5">
          <div className="col-span-8 h-[320px]">
            <RevenueChart data={monthlyData} />
          </div>
          <div className="col-span-4 h-[320px]">
            <StockAlertWidget alerts={stockAlerts} />
          </div>
        </div>

        {/* Zone 3: Recent Sales + Quick Stats */}
        <div className="grid grid-cols-12 gap-5">
          {/* Recent Sales */}
          <div className="col-span-8 rounded-[1.25rem] bg-brand-gray border border-brand-border p-6 shadow-lg">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-serif text-base text-white">Recent Transactions</h3>
              <button onClick={() => setActiveTab('transactions')} className="text-xs text-brand-gold hover:underline tracking-wide">View All →</button>
            </div>
            {recentSales.length === 0 ? (
              <p className="text-gray-500 text-sm font-mono text-center py-8">No transactions yet.</p>
            ) : (
              <div className="space-y-3">
                {recentSales.map(s => (
                  <div key={s._id} className="flex items-center justify-between py-3 border-b border-brand-border/50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-white">{s.product?.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-500 mt-0.5 font-mono">
                        {s.product?.sku_code && <span className="text-brand-gold">{s.product.sku_code} · </span>}
                        {s.customer?.name || 'Walk-in'} · ×{s.quantitySold}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-serif text-base font-bold text-white">${s.revenue?.toLocaleString()}</p>
                      <p className="text-[0.65rem] text-gray-500">{new Date(s.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick stats */}
          <div className="col-span-4 space-y-4">
            <div className="rounded-[1.25rem] bg-brand-gray border border-brand-border p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-brand-black flex items-center justify-center">
                <Package size={20} className="text-brand-gold" />
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-widest">SKUs Catalogued</p>
                <p className="font-serif text-2xl font-bold text-white">{totalProducts}</p>
              </div>
            </div>
            <div className="rounded-[1.25rem] bg-brand-gray border border-brand-border p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-brand-black flex items-center justify-center">
                <Users size={20} className="text-brand-gold" />
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-widest">VIP Clients</p>
                <p className="font-serif text-2xl font-bold text-white">{totalCustomers}</p>
              </div>
            </div>
            <div className="rounded-[1.25rem] bg-brand-gray border border-brand-border p-5 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stockAlerts.length > 0 ? 'bg-amber-400/10' : 'bg-brand-black'}`}>
                <AlertTriangle size={20} className={stockAlerts.length > 0 ? 'text-amber-400' : 'text-gray-600'} />
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-widest">Stock Alerts</p>
                <p className={`font-serif text-2xl font-bold ${stockAlerts.length > 0 ? 'text-amber-400' : 'text-gray-500'}`}>
                  {stockAlerts.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ─── Render Active View ──────────────────────────────────────
  const renderContent = () => {
    switch (activeTab) {
      case 'inventory':    return <InventoryView searchQuery={searchQuery} />;
      case 'transactions': return <SalesView searchQuery={searchQuery} />;
      case 'consumer':     return <CRMView searchQuery={searchQuery} />;
      case 'report':       return <FinanceView />;
      case 'expenses':     return <AccountingView />;
      case 'production':   return <ProductionView />;
      case 'dashboard':
      default:             return <OverviewContent />;
    }
  };

  return (
    <div className="flex h-screen bg-brand-black text-white font-sans overflow-hidden selection:bg-brand-gold selection:text-brand-black">

      {/* ─── Sidebar ─────────────────────────────── */}
      <aside className="w-[270px] shrink-0 bg-brand-gray border-r border-brand-border flex flex-col pt-8 pb-6 px-4">
        {/* Logo */}
        <div className="flex items-center gap-3 px-3 mb-10">
          <div className="w-9 h-9 rounded-xl bg-brand-gold flex items-center justify-center text-brand-black font-serif font-bold text-xl shadow-[0_0_16px_rgba(212,175,55,0.4)]">H</div>
          <div>
            <span className="font-serif tracking-[0.2em] text-xl font-bold block text-brand-gold leading-none">HEIN</span>
            <span className="text-[0.45rem] font-bold uppercase tracking-[0.2em] text-gray-500 mt-1 block">Elevating Men's Fashion</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-5 overflow-y-auto pr-1">
          <div>
            <p className="px-3 text-[0.6rem] font-bold text-gray-600 uppercase tracking-widest mb-2">Core</p>
            <div className="space-y-1">
              <NavItem id="dashboard" label="Dashboard" Icon={LayoutDashboard} />
              <NavItem id="inventory" label="Inventory" Icon={Package} />
              <NavItem id="production" label="Purchases" Icon={Factory} />
              <NavItem id="transactions" label="Point of Sale" Icon={CreditCard} />
              <NavItem id="consumer" label="VIP Network" Icon={Users} />
            </div>
          </div>
          <div>
            <p className="px-3 text-[0.6rem] font-bold text-gray-600 uppercase tracking-widest mb-2">Financial</p>
            <div className="space-y-1">
              <NavItem id="report" label="P&L Reports" Icon={BarChart2} />
              <NavItem id="expenses" label="Accounting" Icon={BookOpen} />
            </div>
          </div>
        </nav>

        {/* Status Card at bottom */}
        <div className="mx-1 mt-6 rounded-[1.25rem] bg-black/40 border border-brand-border/60 p-4 relative overflow-hidden">
          <div className="absolute -top-6 -right-6 w-20 h-20 bg-brand-gold opacity-5 rounded-full blur-2xl"></div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            <span className="text-xs text-green-400 font-bold uppercase tracking-widest">Systems Online</span>
          </div>
          <p className="text-[0.65rem] text-gray-500 leading-relaxed">MongoDB · Port 5000 · Vite HMR active</p>
          {stockAlerts.length > 0 && (
            <div className="mt-3 flex items-center gap-2 text-amber-400">
              <AlertTriangle size={11} />
              <span className="text-[0.65rem] font-bold">{stockAlerts.length} SKU{stockAlerts.length > 1 ? 's' : ''} need restocking</span>
            </div>
          )}
        </div>
      </aside>

      {/* ─── Main Content ─────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="shrink-0 flex items-center justify-between px-10 py-6 border-b border-brand-border bg-brand-black/80 backdrop-blur-sm">
          <div>
            <h2 className="font-serif text-xl font-semibold text-white capitalize tracking-wide">
              {activeTab === 'dashboard' ? 'Intelligence Overview' :
               activeTab === 'inventory' ? 'Inventory Master' :
               activeTab === 'transactions' ? 'Point of Sale' :
               activeTab === 'consumer' ? 'VIP Network' :
               activeTab === 'report' ? 'P&L Reports' :
               activeTab === 'expenses' ? 'Accounting' : 
               activeTab === 'production' ? 'Purchases' : activeTab}
            </h2>
            <p className="text-xs text-brand-gold tracking-[0.15em] mt-0.5 uppercase">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <GlobalSearch onNavigate={setActiveTab} />
            
            <NotificationPanel onNavigate={setActiveTab} />
            <div className="flex items-center gap-3 ml-2 pl-4 border-l border-brand-border">
              <div className="w-9 h-9 rounded-full bg-brand-gold flex items-center justify-center text-black shadow-md">
                <User size={16} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white leading-none">Admin</p>
                <p className="text-[0.6rem] text-brand-gold uppercase tracking-widest mt-0.5">Root Access</p>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto px-10 py-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
