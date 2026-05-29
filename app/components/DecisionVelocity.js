'use client';
import { useDashboard } from '../context/DashboardContext';

const VELOCITY_MAP = {
  low: {
    signalStability:   { value: 'Strong',    color: '#00ff88' },
    transitionSpeed:   { value: 'Low',       color: '#00ff88' },
    reactionThreshold: { value: 'Relaxed',   color: '#00ff88' },
    alphaDecayRate:    { value: '1.2%/hr',   color: '#00ff88' },
    overallVelocity:   { value: 'HIGH',      color: '#00ff88', score: 88 },
  },
  normal: {
    signalStability:   { value: 'Stable',    color: '#00d4ff' },
    transitionSpeed:   { value: 'Moderate',  color: '#00d4ff' },
    reactionThreshold: { value: 'Normal',    color: '#94a3b8' },
    alphaDecayRate:    { value: '2.3%/hr',   color: '#00d4ff' },
    overallVelocity:   { value: 'NOMINAL',   color: '#00d4ff', score: 64 },
  },
  elevated: {
    signalStability:   { value: 'Declining', color: '#f59e0b' },
    transitionSpeed:   { value: 'High',      color: '#f59e0b' },
    reactionThreshold: { value: 'Tightened', color: '#f59e0b' },
    alphaDecayRate:    { value: '4.7%/hr',   color: '#f59e0b' },
    overallVelocity:   { value: 'STRESSED',  color: '#f59e0b', score: 41 },
  },
  high: {
    signalStability:   { value: 'Noise',     color: '#ff3366' },
    transitionSpeed:   { value: 'Critical',  color: '#ff3366' },
    reactionThreshold: { value: 'Maximum',   color: '#ff3366' },
    alphaDecayRate:    { value: '9.1%/hr',   color: '#ff3366' },
    overallVelocity:   { value: 'CRITICAL',  color: '#ff3366', score: 18 },
  },
};

export default function DecisionVelocity() {
  const { vixRegime } = useDashboard();
  const data = VELOCITY_MAP[vixRegime] || VELOCITY_MAP.normal;

  const rows = [
    { label: 'Signal Stability',         ...data.signalStability },
    { label: 'Market Transition Speed',  ...data.transitionSpeed },
    { label: 'Reaction Threshold',       ...data.reactionThreshold },
    { label: 'Alpha Decay Rate',         ...data.alphaDecayRate },
  ];

  return (
    <div className="panel h-full flex flex-col">
      <div className="px-4 pt-3 pb-2 border-b border-white/[0.04] flex items-center justify-between">
        <span className="section-label">DECISION VELOCITY</span>
        <span
          className="text-[9px] font-semibold tracking-wider"
          style={{ color: data.overallVelocity.color }}
        >
          {data.overallVelocity.value}
        </span>
      </div>

      <div className="flex-1 px-4 py-3 flex flex-col gap-3">
        {/* Overall velocity gauge */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[8px] text-slate-600 tracking-widest">VELOCITY SCORE</span>
            <span className="text-[10px] tabular-nums" style={{ color: data.overallVelocity.color }}>
              {data.overallVelocity.score}/100
            </span>
          </div>
          <div className="progress-bar h-[5px]">
            <div
              className="progress-fill transition-all duration-1000"
              style={{ width: `${data.overallVelocity.score}%`, background: data.overallVelocity.color }}
            />
          </div>
        </div>

        {/* Metric rows */}
        <div className="flex flex-col gap-1.5">
          {rows.map(row => (
            <div key={row.label} className="flex items-center justify-between">
              <span className="text-[9px] text-slate-500">{row.label}</span>
              <span className="text-[9px] font-medium" style={{ color: row.color }}>
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
