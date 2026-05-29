'use client';
import { useDashboard } from '../context/DashboardContext';

const INTENT_MAP = {
  low: {
    objective: "Accumulating premium exposure during volatility compression ahead of potential momentum expansion.",
    posture: "CONSTRUCTIVE",
    confidence: 88,
    notes: [
      "VIX compression favors short-vol strategies. Widening credit spread width to capture elevated skew.",
      "Theta decay accelerating into low-vol regime. Prioritizing near-expiry premium collection.",
    ],
  },
  normal: {
    objective: "Deploying systematic premium collection across major indices while maintaining defined-risk structure.",
    posture: "NEUTRAL",
    confidence: 74,
    notes: [
      "Balanced regime supports both momentum and mean-reversion entries. Monitoring SPX term structure.",
      "Credit spreads performing within expected parameters. Alpha decay rate nominal.",
    ],
  },
  elevated: {
    objective: "Defensive premium collection with reduced sizing. Maintaining wide buffers above market price.",
    posture: "DEFENSIVE",
    confidence: 58,
    notes: [
      "Elevated VIX warrants reduced position sizing and wider spread widths. Monitoring for capitulation signal.",
      "Mean-reversion probability increasing. Watching for volatility collapse entry.",
    ],
  },
  high: {
    objective: "Capital preservation priority. Suspending new entries pending volatility normalization.",
    posture: "RISK-OFF",
    confidence: 31,
    notes: [
      "VIX circuit breaker approaching threshold. Existing positions hedged with protective spreads.",
      "Monitoring for vol-of-vol normalization before resuming systematic deployment.",
    ],
  },
};

const POSTURE_COLORS = {
  CONSTRUCTIVE: { color: '#00ff88', border: 'rgba(0,255,136,0.25)', bg: 'rgba(0,255,136,0.06)' },
  NEUTRAL:      { color: '#00d4ff', border: 'rgba(0,212,255,0.25)', bg: 'rgba(0,212,255,0.06)' },
  DEFENSIVE:    { color: '#f59e0b', border: 'rgba(245,158,11,0.25)', bg: 'rgba(245,158,11,0.06)' },
  'RISK-OFF':   { color: '#ff3366', border: 'rgba(255,51,102,0.25)', bg: 'rgba(255,51,102,0.06)' },
};

export default function StrategicIntent() {
  const { vixRegime, vix, stressLevel } = useDashboard();
  const intent = INTENT_MAP[vixRegime] || INTENT_MAP.normal;
  const postureStyle = POSTURE_COLORS[intent.posture] || POSTURE_COLORS.NEUTRAL;

  return (
    <div className="panel h-full flex flex-col">
      <div className="px-4 pt-3 pb-2 border-b border-white/[0.04] flex items-center justify-between">
        <span className="section-label">STRATEGIC OBJECTIVE</span>
        <div
          className="flex items-center gap-1.5 px-2 py-0.5 rounded-sm border text-[9px] font-semibold tracking-[0.12em]"
          style={{ color: postureStyle.color, borderColor: postureStyle.border, background: postureStyle.bg }}
        >
          {intent.posture}
        </div>
      </div>

      <div className="flex-1 px-4 py-3 flex flex-col gap-3">
        {/* Main objective */}
        <div
          className="px-3 py-2.5 rounded-sm border-l-2"
          style={{ borderLeftColor: postureStyle.color, background: postureStyle.bg + '80' }}
        >
          <p className="text-[11px] text-slate-200 leading-relaxed" style={{ fontStyle: 'italic' }}>
            "{intent.objective}"
          </p>
        </div>

        {/* Confidence score */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[8px] text-slate-600 tracking-widest">SYSTEM CONFIDENCE</span>
            <span className="text-[10px] tabular-nums" style={{ color: postureStyle.color }}>
              {intent.confidence}%
            </span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill transition-all duration-1000"
              style={{ width: `${intent.confidence}%`, background: postureStyle.color }}
            />
          </div>
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-1.5">
          {intent.notes.map((note, i) => (
            <div key={i} className="flex gap-2 text-[9px] text-slate-500 leading-relaxed">
              <span style={{ color: postureStyle.color, flexShrink: 0 }}>-</span>
              <span>{note}</span>
            </div>
          ))}
        </div>

        {/* VIX context */}
        <div className="mt-auto pt-2 border-t border-white/[0.04] flex items-center justify-between text-[8px] text-slate-700">
          <span>VIX {vix.toFixed(1)} - REGIME: {vixRegime.toUpperCase()}</span>
          <span className="tabular-nums">UPDATED NOW</span>
        </div>
      </div>
    </div>
  );
}
