'use client';
import { useEffect, useState } from 'react';
import { useDashboard } from '../context/DashboardContext';

const SIGNAL_LAYERS = [
  {
    id: 'micro',
    label: 'Microstructure Engine',
    baseStatus: 'ACTIVE',
    description: 'Order flow imbalance analysis',
  },
  {
    id: 'liquidity',
    label: 'Liquidity Mapping System',
    baseStatus: 'SCANNING',
    description: 'Real-time bid-ask spread monitoring',
  },
  {
    id: 'vol',
    label: 'Adaptive Volatility Framework',
    baseStatus: 'CALIBRATING',
    description: 'Term structure + skew normalization',
  },
  {
    id: 'exec',
    label: 'Execution Optimization Layer',
    baseStatus: 'OPTIMIZED',
    description: 'Fill quality + slippage minimization',
  },
  {
    id: 'regime',
    label: 'Regime Classification Model',
    baseStatus: 'MONITORING',
    description: 'HMM-based state transition detector',
  },
];

const STATUS_COLORS = {
  ACTIVE:       { color: '#00ff88',  pulse: 'pulse-dot-green' },
  SCANNING:     { color: '#00d4ff',  pulse: 'pulse-dot-cyan' },
  CALIBRATING:  { color: '#f59e0b',  pulse: '' },
  OPTIMIZED:    { color: '#00ff88',  pulse: 'pulse-dot-green' },
  MONITORING:   { color: '#94a3b8',  pulse: '' },
  STANDBY:      { color: '#475569',  pulse: '' },
};

function useCyclingStatus(baseStatus, interval = 8000) {
  const [status, setStatus] = useState(baseStatus);
  const statuses = Object.keys(STATUS_COLORS);

  useEffect(() => {
    // Occasionally flicker to adjacent status
    const id = setInterval(() => {
      if (Math.random() < 0.15) {
        const adjacent = statuses[Math.floor(Math.random() * statuses.length)];
        setStatus(adjacent);
        setTimeout(() => setStatus(baseStatus), 1200);
      }
    }, interval + Math.random() * 3000);
    return () => clearInterval(id);
  }, [baseStatus, interval]);

  return status;
}

function SignalRow({ layer }) {
  const status = useCyclingStatus(layer.baseStatus, 7000 + Math.random() * 5000);
  const style = STATUS_COLORS[status] || STATUS_COLORS.MONITORING;

  return (
    <div className="flex items-center justify-between py-1.5 border-b border-white/[0.03] last:border-b-0 group">
      <div className="flex items-center gap-2.5">
        <span
          className={`status-dot shrink-0 ${style.pulse}`}
          style={{ background: style.color }}
          aria-hidden="true"
        />
        <div>
          <div className="text-[9px] text-slate-300">{layer.label}</div>
          <div className="text-[8px] text-slate-700 group-hover:text-slate-500 transition-colors">
            {layer.description}
          </div>
        </div>
      </div>
      <span
        className="text-[9px] font-medium tracking-wider shrink-0 ml-2"
        style={{ color: style.color }}
      >
        {status}
      </span>
    </div>
  );
}

export default function ProprietarySignals() {
  const { vixRegime } = useDashboard();

  return (
    <div className="panel h-full flex flex-col">
      <div className="px-4 pt-3 pb-2 border-b border-white/[0.04]">
        <span className="section-label">PROPRIETARY INTELLIGENCE LAYER</span>
      </div>

      <div className="flex-1 px-4 py-2 flex flex-col justify-between">
        <div className="flex flex-col">
          {SIGNAL_LAYERS.map(layer => (
            <SignalRow key={layer.id} layer={layer} />
          ))}
        </div>

        <div className="pt-2 border-t border-white/[0.04] mt-2 flex items-center justify-between text-[8px] text-slate-700">
          <span>REGIME: {vixRegime.toUpperCase()}</span>
          <span className="tabular-nums">ALL SYSTEMS NOMINAL</span>
        </div>
      </div>
    </div>
  );
}
