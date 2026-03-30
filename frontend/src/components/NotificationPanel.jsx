import React, { useState, useEffect, useRef } from 'react';
import { Bell, AlertTriangle, RotateCcw, CreditCard, Star, X, CheckCheck, Package } from 'lucide-react';

const TYPE_CONFIG = {
  low_stock:  { Icon: Package,       color: 'text-amber-400',  bg: 'bg-amber-400/10',  border: 'border-amber-400/20',  label: 'Low Stock'    },
  refund:     { Icon: RotateCcw,     color: 'text-red-400',    bg: 'bg-red-400/10',    border: 'border-red-400/20',    label: 'Refund'       },
  unpaid:     { Icon: CreditCard,    color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/20', label: 'Unpaid Sale'  },
  new_vip:    { Icon: Star,          color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20', label: 'New VIP'      },
};

function timeAgo(date) {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60)   return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function NotificationPanel({ onNavigate }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [dismissed, setDismissed] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hein_dismissed_notifs') || '[]'); } catch { return []; }
  });
  const ref = useRef(null);

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Build notifications from live data
  useEffect(() => {
    async function load() {
      try {
        const [sRes, pRes, cRes] = await Promise.all([
          fetch('http://localhost:5000/api/sales'),
          fetch('http://localhost:5000/api/products'),
          fetch('http://localhost:5000/api/customers'),
        ]);
        const sales    = sRes.ok    ? await sRes.json()    : [];
        const products = pRes.ok    ? await pRes.json()    : [];
        const customers = cRes.ok   ? await cRes.json()    : [];

        const notifs = [];

        // 1. Low stock alerts
        products.forEach(p => {
          if (p.stockLevel <= p.min_stock_level) {
            notifs.push({
              id: `low_${p._id}`,
              type: 'low_stock',
              title: `Low Stock: ${p.name}`,
              body: `Only ${p.stockLevel} unit${p.stockLevel !== 1 ? 's' : ''} remaining — restock soon.`,
              sku: p.sku_code,
              date: p.updatedAt || p.createdAt,
              nav: 'inventory',
            });
          }
        });

        // 2. Unpaid sales (last 30 days)
        const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
        sales.filter(s => String(s.status).toLowerCase().includes('unpaid') && new Date(s.createdAt) > cutoff)
          .forEach(s => {
            notifs.push({
              id: `unpaid_${s._id}`,
              type: 'unpaid',
              title: `Unpaid Sale — $${s.revenue?.toLocaleString()}`,
              body: `${s.product?.name || 'Product'} × ${s.quantitySold} · ${s.customer?.name || 'Walk-in'} · ${s.payment_method || 'Zaad'}`,
              date: s.createdAt,
              nav: 'transactions',
            });
          });

        // 3. Recent refunds (last 30 days)
        sales.filter(s => String(s.status).toLowerCase().includes('refund') && new Date(s.createdAt) > cutoff)
          .forEach(s => {
            notifs.push({
              id: `refund_${s._id}`,
              type: 'refund',
              title: `Refund Processed — $${s.revenue?.toLocaleString()}`,
              body: `${s.product?.name || 'Product'} · ${s.customer?.name || 'Walk-in'} · ${new Date(s.createdAt).toLocaleDateString()}`,
              date: s.createdAt,
              nav: 'transactions',
            });
          });

        // 4. New VIP clients (last 7 days)
        const vipCutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
        customers.filter(c => new Date(c.createdAt) > vipCutoff)
          .forEach(c => {
            notifs.push({
              id: `vip_${c._id}`,
              type: 'new_vip',
              title: `New VIP Client: ${c.name}`,
              body: `${c.vipStatus} tier · ${c.phoneNumber || 'No phone'} · Registered ${timeAgo(c.createdAt)}`,
              date: c.createdAt,
              nav: 'consumer',
            });
          });

        // Sort newest first
        notifs.sort((a, b) => new Date(b.date) - new Date(a.date));
        setNotifications(notifs);
      } catch (e) { console.error(e); }
    }
    load();
    const interval = setInterval(load, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const visible = notifications.filter(n => !dismissed.includes(n.id));
  const unread = visible.length;

  const dismiss = (id) => {
    const next = [...dismissed, id];
    setDismissed(next);
    localStorage.setItem('hein_dismissed_notifs', JSON.stringify(next));
  };

  const dismissAll = () => {
    const next = [...dismissed, ...visible.map(n => n.id)];
    setDismissed(next);
    localStorage.setItem('hein_dismissed_notifs', JSON.stringify(next));
  };

  return (
    <div ref={ref} className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all relative ${open ? 'bg-brand-gold/10 border-brand-gold/60 text-brand-gold' : 'border-brand-border bg-brand-gray text-gray-400 hover:text-brand-gold hover:border-brand-gold/40'}`}
      >
        <Bell size={17} className={unread > 0 ? 'animate-[wiggle_1s_ease-in-out_infinite]' : ''} />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[0.55rem] font-black flex items-center justify-center leading-none shadow">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div className="absolute top-full right-0 mt-2 w-[400px] rounded-[1rem] border border-brand-border bg-brand-black/95 backdrop-blur-md shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-brand-border/60">
            <div>
              <p className="text-sm font-bold text-white">Notifications</p>
              <p className="text-[0.6rem] text-gray-500 mt-0.5">{unread} unread alerts</p>
            </div>
            {unread > 0 && (
              <button onClick={dismissAll}
                className="flex items-center gap-1.5 text-[0.65rem] uppercase tracking-widest text-gray-400 hover:text-brand-gold transition font-bold">
                <CheckCheck size={12} /> Clear All
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-[420px] overflow-y-auto">
            {visible.length === 0 ? (
              <div className="flex flex-col items-center py-12 gap-3 text-gray-600">
                <Bell size={28} className="opacity-30" />
                <p className="text-xs font-mono">All caught up — no new alerts</p>
              </div>
            ) : (
              visible.map(n => {
                const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.unpaid;
                const Icon = cfg.Icon;
                return (
                  <div key={n.id}
                    className="flex items-start gap-3 px-5 py-4 border-b border-brand-border/30 last:border-0 hover:bg-white/[0.03] transition-colors group">
                    {/* Icon */}
                    <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border ${cfg.bg} ${cfg.border}`}>
                      <Icon size={14} className={cfg.color} />
                    </div>
                    {/* Content */}
                    <button className="flex-1 text-left"
                      onClick={() => { if (n.nav) { onNavigate(n.nav); setOpen(false); } }}>
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-bold text-white leading-tight">{n.title}</p>
                        <span className={`shrink-0 text-[0.55rem] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full border ${cfg.bg} ${cfg.border} ${cfg.color}`}>
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-[0.7rem] text-gray-500 mt-1 leading-relaxed">{n.body}</p>
                      <p className="text-[0.6rem] text-gray-600 mt-1.5">{timeAgo(n.date)}</p>
                    </button>
                    {/* Dismiss */}
                    <button onClick={() => dismiss(n.id)}
                      className="shrink-0 opacity-0 group-hover:opacity-100 transition p-1 text-gray-600 hover:text-white rounded">
                      <X size={12} />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-brand-border/40 bg-white/[0.02]">
            <p className="text-[0.6rem] text-gray-600 text-center">Refreshes every 60 seconds · Low stock · Unpaid · Refunds · New VIPs</p>
          </div>
        </div>
      )}
    </div>
  );
}
