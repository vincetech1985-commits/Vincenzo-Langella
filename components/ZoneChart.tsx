import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine
} from 'recharts';
import { HeartRateZone } from '../types';

interface ZoneChartProps {
  zones: HeartRateZone[];
  maxHr: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as HeartRateZone;
    return (
      <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-lg">
        <p className="font-bold text-slate-800">{data.name}</p>
        <p className="text-sm text-slate-600">
          {data.minBpm} - {data.maxBpm} BPM
        </p>
        <p className="text-xs text-slate-500 mt-1">{data.goal}</p>
      </div>
    );
  }
  return null;
};

export const ZoneChart: React.FC<ZoneChartProps> = ({ zones, maxHr }) => {
  return (
    <div className="h-[300px] w-full mt-6 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
      <h3 className="text-lg font-semibold text-slate-700 mb-4">Distribuzione Zone Cardiache</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={zones}
          margin={{
            top: 20,
            right: 30,
            left: 0,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12 }} 
            interval={0}
            tickFormatter={(value) => value.split(' ')[0]} // Shorten label
          />
          <YAxis 
            domain={[0, maxHr + 10]} 
            tick={{ fontSize: 12 }}
            label={{ value: 'BPM', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
          <ReferenceLine y={maxHr} label="Max HR" stroke="red" strokeDasharray="3 3" />
          <Bar dataKey="maxBpm" radius={[4, 4, 0, 0]}>
            {zones.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};