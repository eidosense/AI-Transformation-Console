import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { AuditMetrics } from '../types';

interface CompetitorChartProps {
  target: AuditMetrics;
}

const CompetitorChart: React.FC<CompetitorChartProps> = ({ target }) => {
  const benchmark = target.benchmark;
  
  // If no benchmark, we can't compare.
  if (!benchmark) return null;

  // Prepare data. We need to handle the scale differences.
  // We will create normalized values (0-100) for the bars, 
  // but store original values for the tooltip display.
  
  const metrics = [
    {
      name: 'Reviews',
      targetRaw: target.reviewCount,
      benchmarkRaw: benchmark.reviewCount,
      // Normalize to the larger of the two + padding
      max: Math.max(target.reviewCount, benchmark.reviewCount, 1)
    },
    {
      name: 'Rating',
      targetRaw: target.reviewRating,
      benchmarkRaw: benchmark.rating,
      max: 5 // Rating is always out of 5
    },
    {
      name: 'Photos',
      targetRaw: target.photoCount,
      benchmarkRaw: benchmark.photoCount || 0, // Fallback if missing
      max: Math.max(target.photoCount, benchmark.photoCount || 0, 1)
    }
  ];

  const data = metrics.map(m => ({
    name: m.name,
    Target: (m.targetRaw / m.max) * 100,
    Competitor: (m.benchmarkRaw / m.max) * 100,
    targetRaw: m.targetRaw,
    benchmarkRaw: m.benchmarkRaw,
    unit: m.name === 'Rating' ? '★' : ''
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const metric = data.find(d => d.name === label);
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded shadow-xl">
          <p className="font-bold text-slate-200 mb-2">{label}</p>
          <div className="space-y-1">
             <div className="flex items-center gap-2 text-cyan-400">
               <span className="w-2 h-2 bg-cyan-500 rounded-full"></span>
               <span className="text-xs uppercase">You:</span>
               <span className="font-bold font-mono">{metric?.targetRaw} {metric?.unit}</span>
             </div>
             <div className="flex items-center gap-2 text-red-400">
               <span className="w-2 h-2 bg-red-500 rounded-full"></span>
               <span className="text-xs uppercase">Competitor:</span>
               <span className="font-bold font-mono">{metric?.benchmarkRaw} {metric?.unit}</span>
             </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-80 bg-slate-900 border border-slate-800 rounded-xl p-6 mt-6">
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-6">Competitor Intelligence (Normalized)</h3>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart
          data={data}
          layout="vertical"
          barGap={4}
          barCategoryGap={12}
          margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} vertical={true} />
          <XAxis type="number" hide domain={[0, 100]} />
          <YAxis 
            dataKey="name" 
            type="category" 
            tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} 
            width={60}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{fill: '#1e293b', opacity: 0.5}} />
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
          <Bar dataKey="Target" name="You" fill="#06b6d4" radius={[0, 4, 4, 0]} barSize={16} />
          <Bar dataKey="Competitor" name="Benchmark" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={16} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CompetitorChart;