'use client';
import { useDashboard } from '../context/DashboardContext';

const TEMPORAL_DATA = {
  low: [
    { label: 'Microstructure',   value: 'Bullish',    confidence: 81, color: '#00ff88' },
    { label: 'Intraday Flow',    value: 'Constructive', confidence: 72, color: '#00d4ff' },
    { label: 'Weekly Structure', value: 'Expansion',  confidence: 68, color: '#00d4ff' },
    { label: 'Macro Environment', value: 'Supportive', confidence: 61, color: '#00ff88' },
  ],
  normal: [
    { label: 'Microstructure',   value: 'Neutral',    confidence: 55, color: '#94a3b8' },
    { label: 'Intraday Flow',    value: 'Neutral',    confidence: 52, color: '#94a3b8' },
    { label: 'Weekly Structure', value: 'Expansion',  confidence: 67, color: '#00d4ff' },
    { label: 'Macro Environment', value: 'Fragile',   confidence: 44, color: '#f59e0b' },
  ],
  elevated: [
    { label: 'Microstructure',   value: 'Bearish',    confidence: 62, color: '#ff3366' },
    { label: 'Intraday Flow',    value: 'Risk-Off',   confidence: 71, color: '#ff3366' },
    { label: 'Weekly Structure', value: 'Contraction', confidence: 58, color: '#f59e0b' },
    { label: 'Macro Environment', value: 'Fragile',   confidence: 39, color: '#f59e0b' },
  ],
  high: [
    { label: 'Microstructure',   value: 'Bearish',    confidence: 83, color: '#ff3366' },
    { label: 'Intraday Flow',    value: 'Panic',      confidence: 79, color: '#ff3366' },
    { label: 'Weekly Structure', value: 'Breakdown',  confidence: 74, color: '#ff3366' },
    { label: 'Macro Environment', value: 'Crisis',    confidence: 67, color: '#ff3366' },
  ],
};

export default function TemporalStructure() {
  const { vixRegime, vix } = useDashboard();
  const rows = TEMPORAL_DATA[vixRegime] || TEMPORAL_DATA.normal;

  return (
    <div className="panel h-full flex flex-col">
      <div className="px-4 pt-3 pb-2 border-b border-white/[0.04]">
        <span className="section-label">TEMPORAL AWARENESS</span>
      </div>

      <div className="flex-1 px-4 py-3 flex flex-col gap-2">
        {rows.map(row => (
          <div key={row.label}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] text-slate-500">{row.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-[8px] text-slate-600 tabular-nums">{row.confidence}%</span>
                <span className="text-[9px] font-medium" style={{ color: row.color }}>
                  {row.value}
                </span>
              </div>
            </div>
            <div className="progress-bar h-[3px]">
              <div
                className="progress-fill"
                style={{
                  width: `${row.confidence}%`,
                  background: row.color,
                  opacity: 0.7,
                }}
              />
            </div>
          </div>
        ))}

        <div className="mt-auto pt-2 border-t border-white/[0.04] text-[8px] text-slate-700 tabular-nums">
          VIX {vix.toFixed(1)} - CONFIDENCE-WEIGHTED STRUCTURE
        </div>
      </div>
    </div>
  );
}
