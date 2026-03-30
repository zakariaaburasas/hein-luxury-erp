import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function StockAlertWidget({ alerts }) {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="rounded-[1.25rem] bg-brand-gray border border-brand-border p-6 shadow-lg flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle size={16} className="text-brand-gold" />
          <h3 className="text-lg font-serif tracking-wide text-white">Stock Alerts</h3>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500 text-sm font-mono text-center">All inventory levels optimal. No alerts.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[1.25rem] bg-brand-gray border border-brand-border p-6 shadow-lg flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} className="text-amber-400" />
          <h3 className="text-lg font-serif tracking-wide text-white">Stock Alerts</h3>
        </div>
        <span className="text-xs font-bold text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2 py-1 rounded-full animate-pulse">
          {alerts.length} SKU{alerts.length > 1 ? 's' : ''} Critical
        </span>
      </div>
      <div className="space-y-3 overflow-y-auto max-h-[280px] pr-1">
        {alerts.map(p => {
          const criticallyLow = p.stockLevel <= Math.floor(p.min_stock_level / 2);
          return (
            <div
              key={p._id}
              className={`flex items-center justify-between rounded-xl px-4 py-3 border ${
                criticallyLow
                  ? 'bg-red-500/5 border-red-500/30'
                  : 'bg-amber-500/5 border-amber-500/20'
              }`}
            >
              <div>
                <p className={`text-sm font-bold tracking-widest font-mono ${criticallyLow ? 'text-red-400' : 'text-amber-400'}`}>
                  {p.sku_code || 'NO-SKU'}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{p.name}</p>
              </div>
              <div className="text-right">
                <p className={`text-xl font-serif font-bold ${criticallyLow ? 'text-red-400' : 'text-amber-400'}`}>
                  {p.stockLevel}
                </p>
                <p className="text-[0.6rem] uppercase tracking-widest text-gray-500">remaining</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
