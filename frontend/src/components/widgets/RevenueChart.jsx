import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const CustomTooltip = ({ active, payload, label, isRestricted }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-bg-card border border-brand-gold/30 rounded-lg p-3 shadow-xl backdrop-blur-md">
        <p className="text-brand-gold text-xs font-bold uppercase tracking-widest">{label}</p>
        <p className="text-txt-main font-serif text-lg mt-1 font-bold">
          {isRestricted ? '***' : `$${payload[0].value.toLocaleString()}`}
        </p>
      </div>
    );
  }
  return null;
};

export default function RevenueChart({ data, isRestricted }) {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-[1.25rem] bg-bg-card border border-brand-border p-6 shadow-lg h-full flex flex-col justify-center items-center">
        <p className="text-txt-muted text-sm font-mono text-center">No revenue data yet. Log your first sale to see growth.</p>
      </div>
    );
  }

  return (
    <div className="rounded-[1.25rem] bg-bg-card border border-brand-border p-6 shadow-lg h-full flex flex-col relative overflow-hidden">
      {isRestricted && (
        <div className="absolute inset-0 z-10 bg-bg-main/40 backdrop-blur-md flex items-center justify-center p-8 text-center">
           <p className="text-brand-gold text-xs font-bold uppercase tracking-[0.2em] border border-brand-gold/30 px-4 py-2 rounded-full">Admin Eyes Only</p>
        </div>
      )}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-serif tracking-wide text-txt-main">Revenue Growth</h3>
          <p className="text-xs text-txt-muted mt-1 uppercase tracking-wider font-bold opacity-60">Monthly performance</p>
        </div>
        {!isRestricted && <span className="text-xs bg-brand-gold/10 border border-brand-gold/30 text-brand-gold px-3 py-1 rounded-full font-mono font-bold">LIVE</span>}
      </div>
      <div className={`flex-1 min-h-[200px] ${isRestricted ? 'blur-sm grayscale' : ''}`}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-brand-border" vertical={false} />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'currentColor', fontSize: 10, className: 'text-txt-muted' }} dy={10} />
            <YAxis hide={isRestricted} axisLine={false} tickLine={false} tick={{ fill: 'currentColor', fontSize: 10, className: 'text-txt-muted' }} tickFormatter={v => `$${v}`} />
            <Tooltip content={<CustomTooltip isRestricted={isRestricted} />} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#D4AF37"
              strokeWidth={2}
              fill="url(#goldGrad)"
              dot={{ fill: '#D4AF37', strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, fill: '#D4AF37', stroke: '#0a0a0a', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
