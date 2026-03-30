import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function StatCard({ title, value, subtitle, trend, isPrimary = false, icon: Icon }) {
  return (
    <div className={`rounded-[1.25rem] p-6 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 ${
      isPrimary 
        ? 'bg-gradient-to-br from-brand-gold to-yellow-600 text-brand-black shadow-[0_8px_30px_rgba(212,175,55,0.4)]' 
        : 'bg-brand-gray border border-brand-border text-white shadow-lg'
    }`}>
      {Icon && (
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${
          isPrimary ? 'bg-black/10 text-brand-black' : 'bg-brand-black text-brand-gold'
        }`}>
          <Icon size={20} />
        </div>
      )}
      
      {trend && (
        <div className={`absolute top-6 right-6 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
          trend > 0 
            ? isPrimary ? 'bg-black/20 text-brand-black' : 'bg-green-500/10 text-green-400' 
            : isPrimary ? 'bg-white/20 text-red-900' : 'bg-red-500/10 text-red-400'
        }`}>
          {trend > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {Math.abs(trend)}%
        </div>
      )}

      <p className={`text-sm mb-1 font-medium tracking-wide ${isPrimary ? 'text-black/70' : 'text-gray-400'}`}>{title}</p>
      <h3 className={`font-serif text-3xl font-bold tracking-wide mb-1`}>{value}</h3>
      {subtitle && (
        <p className={`text-xs ${isPrimary ? 'text-black/60' : 'text-gray-500'}`}>{subtitle}</p>
      )}
    </div>
  );
}
