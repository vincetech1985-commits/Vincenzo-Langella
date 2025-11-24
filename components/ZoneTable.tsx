import React from 'react';
import { HeartRateZone } from '../types';
import { Target } from 'lucide-react';

interface ZoneTableProps {
  zones: HeartRateZone[];
}

export const ZoneTable: React.FC<ZoneTableProps> = ({ zones }) => {
  return (
    <div className="overflow-x-auto mt-6 rounded-xl border border-slate-200 shadow-sm bg-white">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-6 py-3">Zona</th>
            <th className="px-6 py-3">Range BPM</th>
            <th className="px-6 py-3">Intensità</th>
            <th className="px-6 py-3">Durata Rec.</th>
            <th className="px-6 py-3">Obiettivo</th>
          </tr>
        </thead>
        <tbody>
          {zones.map((zone) => (
            <tr 
              key={zone.id} 
              className={`border-b border-slate-100 last:border-none hover:bg-slate-50 transition-colors ${zone.isTarget ? 'bg-indigo-50/60 hover:bg-indigo-50' : ''}`}
            >
              <td className="px-6 py-4 font-medium flex items-center gap-2">
                <span 
                  className="w-3 h-3 rounded-full inline-block" 
                  style={{ backgroundColor: zone.color }}
                ></span>
                <span className="text-slate-900 font-semibold">{zone.name}</span>
                {zone.isTarget && <Target className="w-4 h-4 text-indigo-600" />}
              </td>
              <td className="px-6 py-4 font-mono text-slate-700">
                {zone.minBpm} - {zone.maxBpm} bpm
              </td>
              <td className="px-6 py-4 text-slate-600">
                {zone.rangePercent}
              </td>
              <td className="px-6 py-4 text-slate-600">
                {zone.duration}
              </td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                  {zone.goal}
                </span>
                <p className="text-xs text-slate-500 mt-1">{zone.description}</p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};