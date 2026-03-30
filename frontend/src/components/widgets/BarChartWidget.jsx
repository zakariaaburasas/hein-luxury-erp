import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function BarChartWidget({ data }) {
  return (
    <div className="rounded-[1.25rem] bg-brand-gray p-6 border border-brand-border shadow-lg flex flex-col justify-between h-full">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-serif tracking-wide text-white">Sales Demographics</h3>
          <p className="text-xs text-gray-400 tracking-wide mt-1">Track your product movement</p>
        </div>
      </div>
      
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
            <Tooltip 
              cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
              contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#27272a', borderRadius: '8px', color: '#D4AF37' }} 
            />
            <Bar dataKey="footwear" fill="#D4AF37" radius={[4, 4, 0, 0]} barSize={12} />
            <Bar dataKey="apparel" fill="#4b5563" radius={[4, 4, 0, 0]} barSize={12} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
