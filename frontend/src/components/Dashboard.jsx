import React, { useState, useEffect, useCallback } from 'react';
import API_URL from '../api/config';
import {
  LayoutDashboard, Package, CreditCard, Users, BarChart2,
  Receipt, Search, Bell, User, TrendingUp, TrendingDown,
  DollarSign, ShoppingBag, AlertTriangle, ArrowUpRight, ArrowDownRight, Factory, BookOpen, Shield,
  Sun, Moon, LogOut
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
import ProfileView from './ProfileView';
import TeamView from './TeamView';

// Widgets
import RevenueChart from './widgets/RevenueChart';
import StockAlertWidget from './widgets/StockAlertWidget';

// ─── Stat Card ──────────────────────────────────────
function StatCard({ title, value, subtitle, trend, isPrimary, isNegative, icon: Icon }) {
  return (
    <div className={`rounded-[1.25rem] p-6 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 cursor-default ${
      isPrimary
        ? 'bg-gradient-to-br from-brand-gold to-yellow-600 text-brand-black shadow-[0_8px_30px_rgba(212,175,55,0.35)]'
        : 'bg-bg-card border border-brand-border text-txt-main shadow-lg'
    }`}>
      {Icon && (
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${
          isPrimary ? 'bg-black/15 text-brand-black' : 'bg-bg-main text-brand-gold border border-brand-border/50'
        }`}>
          <Icon size={20} />
        </div>
      )}
      {trend !== undefined && (
        <div className={`absolute top-5 right-5 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
          trend > 0
            ? isPrimary ? 'bg-black/20 text-black' : 'bg-green-500/15 text-green-600 dark:text-green-400'
            : isPrimary ? 'bg-black/20 text-black' : 'bg-red-500/15 text-red-600 dark:text-red-400'
        }`}>
          {trend > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {Math.abs(trend)}%
        </div>
      )}
      <p className={`text-xs font-medium tracking-widest uppercase mb-2 ${isPrimary ? 'text-black/60' : 'text-txt-muted opacity-70'}`}>{title}</p>
      <h3 className={`font-serif text-3xl font-bold tracking-wide ${isNegative && !isPrimary ? 'text-red-500' : ''}`}>{value}</h3>
      {subtitle && <p className={`text-xs mt-1.5 ${isPrimary ? 'text-black/50' : 'text-txt-muted opacity-60'}`}>{subtitle}</p>}
    </div>
  );
}

// ─── Main Dashboard ──────────────────────────────────────
export default function Dashboard({ user: initialUser, role, userId, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [finance, setFinance] = useState({ totalRevenue: 0, grossProfit: 0, totalExpenses: 0, netProfit: 0, totalSalesVolume: 0 });
  const [monthlyData, setMonthlyData] = useState([]);
  const [stockAlerts, setStockAlerts] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [activeProduction, setActiveProduction] = useState(0);
  const [loading, setLoading] = useState(true);

  // Theme State
  const [theme, setTheme] = useState(() => localStorage.getItem('hein_theme') || 'dark');

  // Profile State
  const [displayName, setDisplayName] = useState(() => localStorage.getItem(`hein_name_${role}`) || initialUser);
  const [avatarPath, setAvatarPath] = useState(() => localStorage.getItem(`hein_avatar_${role}`) || (role === 'admin' ? '/avatars/admin.png' : '/avatars/staff.png'));

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('hein_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const isStaff = role === 'staff';
  const isAdmin = role === 'admin';

  useEffect(() => {
    if (!userId) return;
    
    const pulseHeartbeat = async () => {
      try {
        const res = await fetch(`${API_URL}/api/users/ping/${userId}`, { 
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' }
        });
        if (!res.ok) console.warn('Heartbeat: Server heartbeat reject.');
      } catch (err) {
        console.warn('Heartbeat: Engine unreachable.');
      }
    };

    pulseHeartbeat(); // Immediate pulse on mount
    const pingInterval = setInterval(pulseHeartbeat, 30000); // 30s Pulse

    return () => clearInterval(pingInterval);
  }, [userId]);
  
  const handleProfileSave = (name, avatar) => {
    setDisplayName(name);
    setAvatarPath(avatar);
    localStorage.setItem(`hein_name_${role}`, name);
    localStorage.setItem(`hein_avatar_${role}`, avatar);
  };

  const hydrate = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/dashboard/summary`);
      if (res.ok) {
        const payload = await res.json();
        setFinance(payload.finance || { totalRevenue: 0, grossProfit: 0, totalExpenses: 0, netProfit: 0, totalSalesVolume: 0 });
        setMonthlyData(payload.monthlyData || []);
        setStockAlerts(payload.stockAlerts || []);
        setRecentSales(payload.recentSales || []);
        setTotalCustomers(payload.totalCustomers || 0);
        setTotalProducts(payload.totalProducts || 0);
        setActiveProduction(payload.activeProduction || 0);
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

  const NavItem = ({ id, label, Icon }) => {
    const isActive = activeTab === id;
    return (
      <button
        onClick={() => setActiveTab(id)}
        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-full transition-all duration-200 ${
          isActive
            ? 'bg-brand-gold text-white dark:text-brand-black shadow-[0_4px_14px_rgba(212,175,55,0.35)]'
            : 'text-txt-muted hover:text-txt-main hover:bg-brand-gold/10'
        }`}
      >
        <Icon size={17} strokeWidth={isActive ? 2.5 : 1.8} />
        <span className="tracking-wide">{label}</span>
      </button>
    );
  };

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
        {isAdmin && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
              <StatCard title="Total Revenue" value={`$${finance.totalRevenue.toLocaleString()}`} subtitle={`${finance.totalSalesVolume} transactions`} trend={finance.totalRevenue > 0 ? 12.4 : undefined} isPrimary icon={DollarSign} />
              <StatCard title="Gross Profit" value={`$${finance.grossProfit.toLocaleString()}`} subtitle="Revenue minus Inventory Costs" icon={TrendingUp} />
              <StatCard title="Total Expenses" value={`$${finance.totalExpenses.toLocaleString()}`} subtitle="Ads, Shipping, Materials" isNegative icon={Receipt} />
              <StatCard title="Net Profit" value={`$${finance.netProfit.toLocaleString()}`} subtitle="Gross Profit minus Expenses" trend={finance.netProfit >= 0 ? 8.2 : -5.1} icon={BarChart2} />
              <StatCard title="Manufacturing POs" value={activeProduction} subtitle="Active production cycles" trend={activeProduction > 0 ? 5 : 0} icon={Factory} />
            </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="col-span-1 lg:col-span-8 h-[280px] md:h-[320px]">
            <RevenueChart data={monthlyData} isRestricted={isStaff} />
          </div>
          <div className="col-span-1 lg:col-span-4 min-h-[320px]">
            <StockAlertWidget alerts={stockAlerts} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="col-span-1 lg:col-span-8 rounded-[1.25rem] bg-bg-card border border-brand-border p-5 md:p-6 shadow-lg overflow-x-auto">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-serif text-base text-txt-main font-bold">Recent Transactions</h3>
              <button onClick={() => setActiveTab('transactions')} className="text-xs text-brand-gold hover:underline tracking-wide">View All →</button>
            </div>
            {recentSales.length === 0 ? (
              <p className="text-gray-500 text-sm font-mono text-center py-8">No transactions yet.</p>
            ) : (
              <div className="space-y-3 min-w-[300px]">
                {recentSales.map(s => (
                  <div key={s._id} className="flex items-center justify-between py-3 border-b border-brand-border/50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-txt-main tracking-tight">{s.product?.name || 'Unknown'}</p>
                      <p className="text-[10px] text-txt-muted mt-0.5 font-mono">
                        {s.product?.sku_code && <span className="text-brand-gold font-bold">{s.product.sku_code} · </span>}
                        {s.customer?.name || 'Walk-in'} · ×{s.quantitySold}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-serif text-base font-bold text-txt-main tabular-nums">${isStaff ? '***' : s.revenue?.toLocaleString()}</p>
                      <p className="text-[0.65rem] text-txt-muted opacity-60 font-medium">{new Date(s.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="col-span-1 lg:col-span-4 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
            <div className="rounded-[1.25rem] bg-bg-card border border-brand-border p-5 flex items-center gap-4 transition-all hover:border-brand-gold/20 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-bg-main flex items-center justify-center shrink-0 border border-brand-border/50">
                <Package size={20} className="text-brand-gold" />
              </div>
              <div>
                <p className="text-[10px] text-txt-muted uppercase tracking-widest leading-tight font-bold">SKUs Catalogued</p>
                <p className="font-serif text-2xl font-bold text-txt-main">{totalProducts}</p>
              </div>
            </div>
            <div className="rounded-[1.25rem] bg-bg-card border border-brand-border p-5 flex items-center gap-4 transition-all hover:border-brand-gold/20 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-bg-main flex items-center justify-center shrink-0 border border-brand-border/50">
                <Users size={20} className="text-brand-gold" />
              </div>
              <div>
                <p className="text-[10px] text-txt-muted uppercase tracking-widest leading-tight font-bold">VIP Clients</p>
                <p className="font-serif text-2xl font-bold text-txt-main">{totalCustomers}</p>
              </div>
            </div>
            <div className="rounded-[1.25rem] bg-bg-card border border-brand-border p-5 flex items-center gap-4 transition-all hover:border-brand-gold/20 shadow-sm">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border border-brand-border/50 ${stockAlerts.length > 0 ? 'bg-amber-500/10' : 'bg-bg-main'}`}>
                <AlertTriangle size={20} className={stockAlerts.length > 0 ? 'text-amber-500' : 'text-txt-muted opacity-40'} />
              </div>
              <div>
                <p className="text-[10px] text-txt-muted uppercase tracking-widest leading-tight font-bold">Stock Alerts</p>
                <p className={`font-serif text-2xl font-bold ${stockAlerts.length > 0 ? 'text-amber-500' : 'text-txt-muted'}`}>
                  {stockAlerts.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (isStaff && (activeTab === 'report' || activeTab === 'expenses')) return <OverviewContent />;
    
    switch (activeTab) {
      case 'inventory':    return <InventoryView userId={userId} searchQuery={searchQuery} />;
      case 'transactions': return <SalesView searchQuery={searchQuery} userId={userId} />;
      case 'consumer':     return <CRMView searchQuery={searchQuery} />;
      case 'report':       return <FinanceView />;
      case 'expenses':     return <AccountingView />;
      case 'production':   return <ProductionView />;
      case 'team':         return <TeamView />;
      case 'profile':      return <ProfileView userId={userId} currentName={displayName} currentAvatar={avatarPath} onSave={handleProfileSave} />;
      case 'dashboard':
      default:             return <OverviewContent />;
    }
  };

  return (
    <div className="flex h-screen bg-bg-main text-txt-main font-sans overflow-hidden selection:bg-brand-gold selection:text-brand-black relative">
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden transition-opacity" onClick={() => setIsSidebarOpen(false)} />
      )}

      <aside className={`fixed inset-y-0 left-0 w-[270px] lg:relative lg:flex shrink-0 bg-bg-card border-r border-brand-border z-[70] transition-transform duration-300 transform ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      } flex flex-col pt-8 pb-6 px-4`}>
        <div className="flex items-center justify-between px-3 mb-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-gold flex items-center justify-center text-brand-black font-serif font-bold text-xl shadow-[0_0_16px_rgba(212,175,55,0.4)]">H</div>
            <div>
              <span className="font-serif tracking-[0.2em] text-xl font-bold block text-brand-gold leading-none">HEIN</span>
              <span className="text-[0.45rem] font-bold uppercase tracking-[0.2em] text-gray-500 mt-1 block">Elevating Men's Fashion</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-5 overflow-y-auto pr-1" onClick={() => setIsSidebarOpen(false)}>
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
          
          {isAdmin && (
            <div>
              <p className="px-3 text-[0.6rem] font-bold text-gray-600 dark:text-gray-500 uppercase tracking-widest mb-2">Financial</p>
              <div className="space-y-1">
                <NavItem id="report" label="P&L Reports" Icon={BarChart2} />
                <NavItem id="expenses" label="Accounting" Icon={BookOpen} />
                <NavItem id="team" label="Command Center" Icon={Shield} />
              </div>
            </div>
          )}

          <div>
             <p className="px-3 text-[0.6rem] font-bold text-gray-600 uppercase tracking-widest mb-2">Account</p>
             <div className="space-y-1">
                <NavItem id="profile" label="Profile Settings" Icon={User} />
             </div>
          </div>
        </nav>

        <div className="mx-1 mt-6 rounded-[1.25rem] bg-bg-card/50 border border-brand-border/60 p-4 relative overflow-hidden transition-all shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-brand-gold/10 border border-brand-gold/20 flex-shrink-0">
               <img src={avatarPath} alt="User Avatar" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
               <p className="text-xs font-bold text-txt-main truncate">{displayName}</p>
               <p className="text-[10px] text-brand-gold uppercase tracking-widest leading-none font-bold">{role}</p>
            </div>
            <button 
              onClick={onLogout}
              className="p-2 ml-auto text-gray-500 hover:text-red-500 transition-colors"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden w-full">
        <header className="shrink-0 flex items-center justify-between px-4 md:px-10 py-4 md:py-6 border-b border-brand-border bg-bg-card/80 backdrop-blur-sm relative z-50">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 rounded-lg bg-bg-card border border-brand-border text-brand-gold">
              <LayoutDashboard size={20} />
            </button>
            <div className="hidden sm:block">
              <h2 className="font-serif text-sm md:text-xl font-semibold text-txt-main capitalize tracking-wide">
                {activeTab === 'dashboard' ? 'Intelligence Overview' :
                 activeTab === 'inventory' ? 'Inventory Master' :
                 activeTab === 'transactions' ? 'Point of Sale' :
                 activeTab === 'consumer' ? 'VIP Network' :
                 activeTab === 'report' ? 'P&L Reports' :
                 activeTab === 'expenses' ? 'Accounting' : 
                 activeTab === 'production' ? 'Purchases' : 
                 activeTab === 'team' ? 'Command Center' : 
                 activeTab === 'profile' ? 'Profile Signature' : activeTab}
              </h2>
              <p className="text-[10px] text-brand-gold tracking-[0.15em] mt-0.5 uppercase">
                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 md:gap-6">
            <div className="hidden md:block w-[200px] lg:w-[350px] mr-2">
              <GlobalSearch onNavigate={setActiveTab} />
            </div>
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-bg-card border border-brand-border text-brand-gold hover:bg-brand-gold hover:text-white transition-all shadow-sm shrink-0"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className="shrink-0">
              <NotificationPanel onNavigate={setActiveTab} />
            </div>
            <div onClick={() => setActiveTab('profile')} className="flex items-center gap-2 md:gap-3 ml-2 pl-2 md:pl-6 border-l border-brand-border cursor-pointer shrink-0">
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-full overflow-hidden border-2 border-brand-gold/20 shadow-lg shrink-0">
                 <img src={avatarPath} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <div className="hidden xs:block">
                <p className="text-xs md:text-sm font-semibold text-txt-main leading-none">{displayName}</p>
                <p className="text-[8px] md:text-[0.6rem] text-brand-gold uppercase tracking-widest mt-0.5">{role}</p>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 md:px-10 py-6 md:py-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
