import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, ShoppingBag, Package, User, Tag } from 'lucide-react';
import API_URL from '../api/config';

const STATUS_COLORS = {
  paid: 'text-green-400',
  unpaid: 'text-amber-400',
  refund: 'text-red-400',
};

function getStatusColor(status) {
  const s = String(status).toLowerCase();
  if (s.includes('refund')) return STATUS_COLORS.refund;
  if (s.includes('unpaid')) return STATUS_COLORS.unpaid;
  return STATUS_COLORS.paid;
}

export default function GlobalSearch({ onNavigate }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const ref = useRef(null);

  // Load all data once on mount
  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/api/sales`).then(r => r.json()),
      fetch(`${API_URL}/api/products`).then(r => r.json()),
      fetch(`${API_URL}/api/customers`).then(r => r.json()),
    ]).then(([s, p, c]) => {
      setSales(Array.isArray(s) ? s : []);
      setProducts(Array.isArray(p) ? p : []);
      setCustomers(Array.isArray(c) ? c : []);
      setLoaded(true);
    }).catch(console.error);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const q = query.trim().toLowerCase();

  // Filter sales: by client name, phone, product name, SKU, status
  const matchedSales = !q ? [] : sales.filter(s =>
    (s.customer?.name || '').toLowerCase().includes(q) ||
    (s.customer?.phoneNumber || '').includes(q) ||
    (s.product?.name || '').toLowerCase().includes(q) ||
    (s.product?.sku_code || '').toLowerCase().includes(q) ||
    String(s.status || '').toLowerCase().includes(q) ||
    String(s.payment_method || '').toLowerCase().includes(q)
  ).slice(0, 6);

  // Filter products: by name, SKU, category
  const matchedProducts = !q ? [] : products.filter(p =>
    p.name.toLowerCase().includes(q) ||
    (p.sku_code || '').toLowerCase().includes(q) ||
    (p.category || '').toLowerCase().includes(q) ||
    (p.colorway || '').toLowerCase().includes(q)
  ).slice(0, 4);

  // Filter customers: by name, phone
  const matchedCustomers = !q ? [] : customers.filter(c =>
    c.name.toLowerCase().includes(q) ||
    (c.phoneNumber || '').includes(q) ||
    (c.vipStatus || '').toLowerCase().includes(q)
  ).slice(0, 4);

  const totalResults = matchedSales.length + matchedProducts.length + matchedCustomers.length;
  const hasResults = totalResults > 0;

  return (
    <div ref={ref} className="relative">
      {/* Search Input */}
      <div className="relative group">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand-gold transition-colors pointer-events-none" />
        <input
          type="text"
          placeholder="Search products, SKUs, clients..."
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          className="bg-brand-gray border border-brand-border rounded-full pl-9 pr-8 py-2 text-xs w-full sm:w-72 focus:outline-none focus:border-brand-gold/50 sm:focus:w-96 transition-all duration-300 text-white placeholder:text-gray-500 shadow-inner"
        />
        {query && (
          <button onClick={() => { setQuery(''); setOpen(false); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition">
            <X size={12} />
          </button>
        )}
        {/* Result count badge */}
        {query && loaded && (
          <span className="absolute -top-1.5 -right-1.5 bg-brand-gold text-black text-[0.55rem] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none shadow-md">
            {totalResults}
          </span>
        )}
      </div>

      {/* Results Dropdown */}
      {open && query && loaded && (
        <div className="absolute top-full -right-4 sm:right-0 mt-2 w-[calc(100vw-2rem)] sm:w-[520px] max-w-[520px] rounded-[1rem] border border-brand-border bg-brand-black/95 backdrop-blur-xl shadow-2xl z-[100] overflow-hidden">
          {!hasResults ? (
            <div className="px-5 py-6 text-center">
              <p className="text-gray-500 text-xs font-mono">No results for "{query}"</p>
            </div>
          ) : (
            <div className="max-h-[480px] overflow-y-auto">
              <div className="flex items-center justify-between px-5 py-3 border-b border-brand-border/50">
                <span className="text-[0.6rem] uppercase tracking-widest text-gray-500 font-bold">Global Search</span>
                <span className="text-[0.6rem] text-brand-gold font-bold">{totalResults} result{totalResults !== 1 ? 's' : ''}</span>
              </div>

              {/* Sales Results */}
              {matchedSales.length > 0 && (
                <div>
                  <div className="px-5 py-2 flex items-center gap-2 bg-white/[0.02]">
                    <ShoppingBag size={11} className="text-brand-gold" />
                    <span className="text-[0.6rem] uppercase tracking-widest text-brand-gold font-bold">Sales ({matchedSales.length})</span>
                  </div>
                  {matchedSales.map(s => (
                    <button key={s._id}
                      onClick={() => { onNavigate('transactions'); setOpen(false); setQuery(''); }}
                      className="w-full flex items-center justify-between px-5 py-3 hover:bg-white/5 transition-colors border-b border-brand-border/20 last:border-0 text-left">
                      <div>
                        <p className="text-sm text-white font-medium">
                          {s.product?.name || 'Product'}
                          <span className="text-xs text-gray-500 font-mono ml-2">×{s.quantitySold}</span>
                          <span className="text-[0.6rem] font-mono text-brand-gold ml-2">{s.product?.sku_code}</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {s.customer?.name || 'Walk-in'}
                          {s.customer?.phoneNumber && <span className="ml-2 font-mono">{s.customer.phoneNumber}</span>}
                          <span className="ml-2">· {new Date(s.createdAt).toLocaleDateString()}</span>
                        </p>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <p className="font-serif font-bold text-brand-gold">${s.revenue?.toLocaleString()}</p>
                        <p className={`text-[0.6rem] uppercase font-bold ${getStatusColor(s.status)}`}>{s.status || 'Paid'}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Product Results */}
              {matchedProducts.length > 0 && (
                <div>
                  <div className="px-5 py-2 flex items-center gap-2 bg-white/[0.02]">
                    <Package size={11} className="text-blue-400" />
                    <span className="text-[0.6rem] uppercase tracking-widest text-blue-400 font-bold">Inventory ({matchedProducts.length})</span>
                  </div>
                  {matchedProducts.map(p => (
                    <button key={p._id}
                      onClick={() => { onNavigate('inventory'); setOpen(false); setQuery(''); }}
                      className="w-full flex items-center justify-between px-5 py-3 hover:bg-white/5 transition-colors border-b border-brand-border/20 last:border-0 text-left">
                      <div>
                        <p className="text-sm text-white font-medium">{p.name}
                          <span className="text-[0.6rem] font-mono text-brand-gold ml-2">{p.sku_code}</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">{p.category} · {p.colorway || '—'} · {p.size_run || '—'}</p>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <p className="font-serif font-bold text-white">${p.selling_price}</p>
                        <p className={`text-[0.6rem] font-bold ${p.stockLevel <= p.min_stock_level ? 'text-amber-400' : 'text-gray-500'}`}>{p.stockLevel} in stock</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Customer Results */}
              {matchedCustomers.length > 0 && (
                <div>
                  <div className="px-5 py-2 flex items-center gap-2 bg-white/[0.02]">
                    <User size={11} className="text-purple-400" />
                    <span className="text-[0.6rem] uppercase tracking-widest text-purple-400 font-bold">VIP Clients ({matchedCustomers.length})</span>
                  </div>
                  {matchedCustomers.map(c => (
                    <button key={c._id}
                      onClick={() => { onNavigate('consumer'); setOpen(false); setQuery(''); }}
                      className="w-full flex items-center justify-between px-5 py-3 hover:bg-white/5 transition-colors border-b border-brand-border/20 last:border-0 text-left">
                      <div>
                        <p className="text-sm text-white font-medium">{c.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{c.phoneNumber || 'No phone'} · {c.address || 'No address'}</p>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <span className="text-[0.6rem] uppercase tracking-widest font-bold text-brand-gold px-2 py-1 rounded-full bg-brand-gold/10 border border-brand-gold/20">{c.vipStatus}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
