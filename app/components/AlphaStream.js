'use client';
import { buildActivityLog } from '../lib/mockData';
import { useMemo } from 'react';

const ACTION_COLORS = {
  OPENED:  { color: '#00d4ff', bg: 'rgba(0,212,255,0.06)', border: 'rgba(0,212,255,0.25)' },
  CLOSED:  { color: '#00ff88', bg: 'rgba(0,255,136,0.06)', border: 'rgba(0,255,136,0.25)' },
  SKIPPED: { color: '#94a3b8', bg: 'rgba(148,163,184,0.04)', border: 'rgba(148,163,184,0.15)' },
  WARNING: { color: '#f59e0b', bg: 'rgba(245,158,11,0.06)', border: 'rgba(245,158,11,0.25)' },
  ERROR:   { color: '#ff3366', bg: 'rgba(255,51,102,0.06)', border: 'rgba(255,51,102,0.25)' },
  INFO:    { color: '#64748b', bg: 'rgba(100,116,139,0.04)', border: 'rgba(100,116,139,0.12)' },
  SUCCESS: { color: '#00ff88', bg: 'rgba(0,255,136,0.06)', border: 'rgba(0,255,136,0.2)' },
  SIGNAL:  { color: '#00d4ff', bg: 'rgba(0,212,255,0.04)', border: 'rgba(0,212,255,0.2)' },
};

const EXTRA_STREAM = [
  { level: 'OPENED',  msg: '[OPENED] SPY CCS 776/800 - credit $634 (x2)',              time: '09:31' },
  { level: 'CLOSED',  msg: '[CLOSED +67%] MSFT CSP expired worthless +$1,800',         time: '16:00' },
  { level: 'SKIPPED', msg: '[SKIPPED] QQQ - earnings in 5 days, risk too high',        time: '10:15' },
  { level: 'WARNING', msg: '[RISK] VIX spiked to 24.1 - pausing new entries',          time: '11:42' },
  { level: 'OPENED',  msg: '[OPENED] SPXW CCS 5300/5350 - credit $2,088 (x2)',         time: '09:45' },
  { level: 'SUCCESS', msg: '[CLOSED +52%] SPY 535P closed at $0.90 debit +$330',       time: '14:22' },
  { level: 'INFO',    msg: '[SCAN] 47 candidates - 3 passed all filters',               time: '10:00' },
  { level: 'SIGNAL',  msg: '[SIGNAL] AAPL IV rank 42 - CSP candidate queued',          time: '13:15' },
  { level: 'INFO',    msg: '[RISK_CHECK] VIX 18.3 - all systems clear',                time: '09:30' },
  { level: 'SUCCESS', msg: '[CLOSED +100%] SPXW CCS expired worthless +$1,750',       time: '16:00' },
];

function levelKey(level) {
  if (level.includes('OPENED')) return 'OPENED';
  if (level.includes('CLOSED') || level.includes('SUCCESS')) return level.includes('CLOSED') ? 'CLOSED' : 'SUCCESS';
  if (level.includes('SKIPPED')) return 'SKIPPED';
  return level;
}

function StreamEntry({ entry }) {
  const key = levelKey(entry.level);
  const style = ACTION_COLORS[key] || ACTION_COLORS.INFO;

  return (
    <div className="flex items-start gap-2.5 py-2 px-3 border-b border-white/[0.03]">
      <span
        className="text-[8px] px-1.5 py-0.5 rounded-sm border shrink-0 mt-0.5 tracking-wider font-medium whitespace-nowrap"
        style={{ color: style.color, background: style.bg, borderColor: style.border }}
      >
        {key}
      </span>
      <span className="text-[9px] text-slate-400 leading-relaxed flex-1 min-w-0">{entry.msg}</span>
      <span className="text-[8px] text-slate-700 tabular-nums shrink-0 mt-0.5">{entry.time}</span>
    </div>
  );
}

export default function AlphaStream({ positions, orders, demo }) {
  const logEntries = useMemo(() => {
    const base = buildActivityLog(positions || [], orders || []);
    return [
      ...base.map(e => ({ level: e.level, msg: e.msg, time: e.time.split(',').pop()?.trim() ?? '' })),
      ...EXTRA_STREAM,
    ];
  }, [positions, orders]);

  // Duplicate for seamless infinite scroll
  const doubled = [...logEntries, ...logEntries];

  return (
    <div className="panel h-full flex flex-col">
      <div className="px-4 pt-3 pb-2 border-b border-white/[0.04] flex items-center justify-between">
        <span className="section-label">ALPHA STREAM</span>
        <div className="flex items-center gap-1.5">
          <span className="status-dot bg-[#00ff88] pulse-dot-green" aria-hidden="true" />
          <span className="text-[8px] text-slate-600 tracking-widest">LIVE</span>
        </div>
      </div>
      <div
        className="flex-1 overflow-hidden relative"
        style={{ minHeight: '220px' }}
        aria-label="Live alpha stream feed"
        aria-live="polite"
      >
        <div className="alpha-stream-inner">
          {doubled.map((entry, i) => (
            <StreamEntry key={i} entry={entry} />
          ))}
        </div>
        {/* Fade overlays */}
        <div className="absolute inset-x-0 top-0 h-8 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, var(--bg-panel-solid), transparent)' }} />
        <div className="absolute inset-x-0 bottom-0 h-8 pointer-events-none"
          style={{ background: 'linear-gradient(to top, var(--bg-panel-solid), transparent)' }} />
      </div>
    </div>
  );
}
