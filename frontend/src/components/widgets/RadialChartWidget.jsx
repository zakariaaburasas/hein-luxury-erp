import React from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';

export default function RadialChartWidget({ data, total }) {
  return (
    <div className="rounded-[1.25rem] bg-brand-gray p-6 border border-brand-border shadow-lg">
      <h3 className="text-lg font-serif tracking-wide text-white">Product Statistics</h3>
      <p className="text-xs text-gray-400 tracking-wide mt-1">Segment growth by category</p>
      
      <div className="flex items-center justify-between mt-6">
        <div className="h-[140px] w-[140px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="110%" barSize={8} data={data} startAngle={90} endAngle={-270}>
              <RadialBar minAngle={15} background={{ fill: '#141414' }} clockWise dataKey="value" cornerRadius={10} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-serif font-bold text-white">{total}</span>
            <span className="text-[0.6rem] text-brand-gold uppercase tracking-widest">+5.6%</span>
          </div>
        </div>
        
        <div className="space-y-4">
          {data.map((item, index) => (
             <div key={index} className="flex justify-between items-center text-sm gap-4">
                 <div className="flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full" style={{ background: item.fill }}></span>
                     <span className="text-gray-300">{item.name}</span>
                 </div>
                 <span className="text-white font-serif">{item.valueRaw}</span>
             </div>
          ))}
        </div>
      </div>
    </div>
  );
}
