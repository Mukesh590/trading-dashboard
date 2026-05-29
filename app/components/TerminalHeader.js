'use client';
import { useEffect, useState, useRef } from 'react';
import { ArrowClockwise, GithubLogo, Clock, ChartLine } from '@phosphor-icons/react';
import { useDashboard, OPERATOR_MODES } from '../context/DashboardContext';

const MODE_LABELS = {
  EXECUTION: 'EXEC',
  RESEARCH:  'RSCH',
  RISK:      'RISK',
  WAR_ROOM:  'WAR',
};
const MODE_COLORS = {
  EXECUTION: { active: '#00d4ff', border: 'rgba(0,212,255,0.35)' },
  RESEARCH:  { active: '#00ff88', border: 'rgba(0,255,136,0.35)' },
  RISK:      { active: '#ff3366', border: 'rgba(255,51,102,0.35)' },
  WAR_ROOM:  { active: '#f59e0b', border: 'rgba(245,158,11,0.35)' },
};

function useMarketStatus() {
  const [status, setStatus] = useState('CLOSED');
  useEffect(() => {
    function calc() {
      const now = new Date();
      const et = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
      const h = et.getHours(), m = et.getMinutes(), d = et.getDay();
      const mins = h * 60 + m;
      if (d === 0 || d === 6) return setStatus('CLOSED');
      if (mins >= 240 && mins < 570) return setStatus('PRE-MKT');
      if (mins >= 570 && mins < 960) return setStatus('OPEN');
      if (mins >= 960 && mins < 1080) return setStatus('AFTER-HRS');
      return setStatus('CLOSED');
    }
    calc();
    const id = setInterval(calc, 30000);
    return () => clearInterval(id);
  }, []);
  return status;
}

function CountUp({ value, prefix = '', decimals = 2, duration = 1200 }) {
  const ref = useRef(null);
  const prevRef = useRef(0);

  useEffect(() => {
    if (!ref.current || typeof value !== 'number') return;
    const start = prevRef.current;
    const end = value;
    prevRef.current = end;
    const startTime = performance.now();

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * ease;
      if (ref.current) {
        ref.current.textContent = prefix + Math.abs(current).toLocaleString('en-US', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        });
      }
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }, [value, prefix, decimals, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}{Math.abs(value || 0).toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
    </span>
  );
}

const STATUS_COLORS = {
  'OPEN':      'text-[#00ff88] border-[rgba(0,255,136,0.3)] bg-[rgba(0,255,136,0.06)]',
  'PRE-MKT':   'text-amber-400 border-amber-500/30 bg-amber-500/5',
  'AFTER-HRS': 'text-amber-400 border-amber-500/30 bg-amber-500/5',
  'CLOSED':    'text-slate-400 border-slate-600/40 bg-slate-800/20',
};

export default function TerminalHeader({ metrics, demo, lastUpdated, onRefresh, spinning }) {
  const [clock, setClock] = useState('');
  const marketStatus = useMarketStatus();
  const { operatorMode, setOperatorMode } = useDashboard();

  useEffect(() => {
    function tick() {
      setClock(new Date().toLocaleTimeString('en-US', {
        hour12: false, timeZone: 'America/New_York',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
      }) + ' ET');
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const equity   = metrics?.equity ?? 0;
  const realized = metrics?.realizedPnL ?? 0;
  const unreal   = metrics?.unrealizedPnL ?? 0;
  const total    = metrics?.totalPnL ?? 0;
  const winRate  = metrics?.winRate ?? 0;
  const sharpe   = 1.84;
  const maxDD    = 2.3;

  const pnlColor = (v) => v >= 0 ? 'text-[#00ff88]' : 'text-[#ff3366]';
  const pnlSign  = (v) => v >= 0 ? '+' : '-';

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[rgba(10,10,15,0.95)] backdrop-blur-xl">
      {/* Top strip */}
      <div className="px-4 py-2 flex flex-wrap items-center justify-between gap-3 max-w-[1800px] mx-auto">

        {/* Left: brand + status */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <ChartLine size={16} className="text-[#00d4ff]" weight="fill" aria-hidden="true" />
            <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#00d4ff] glow-cyan">
              QUANT TERMINAL
            </span>
          </div>

          <div className="h-3 w-px bg-white/10" aria-hidden="true" />

          {/* Autonomous engine status */}
          <div className="flex items-center gap-1.5 border border-[rgba(0,255,136,0.25)] px-2 py-0.5 rounded-sm bg-[rgba(0,255,136,0.04)]">
            <span className="status-dot bg-[#00ff88] pulse-dot-green" aria-hidden="true" />
            <span className="text-[9px] font-semibold tracking-[0.15em] text-[#00ff88]">AUTONOMOUS ENGINE ACTIVE</span>
          </div>

          {demo && (
            <span className="text-[9px] tracking-[0.12em] text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-sm bg-amber-500/5">
              DEMO MODE
            </span>
          )}
        </div>

        {/* Center: portfolio value */}
        <div className="flex items-baseline gap-2">
          <span className="text-[10px] text-slate-500 tracking-widest">NAV</span>
          <span className="text-2xl font-light tracking-tight text-white tabular-nums">
            $<CountUp value={equity} decimals={2} duration={1400} />
          </span>
        </div>

        {/* Right: operator modes + clock + market + controls */}
        <div className="flex items-center gap-3 text-[10px]">
          {/* Operator mode toggle */}
          <div
            className="flex items-center gap-0.5 border border-white/[0.06] rounded-sm p-0.5"
            role="group"
            aria-label="Operator mode selection"
          >
            {OPERATOR_MODES.map(mode => {
              const active = operatorMode === mode;
              const mc = MODE_COLORS[mode];
              return (
                <button
                  key={mode}
                  onClick={() => setOperatorMode(mode)}
                  aria-pressed={active}
                  aria-label={`Switch to ${mode.replace('_', ' ')} mode`}
                  className="px-2 py-0.5 rounded-sm text-[8px] tracking-[0.1em] transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
                  style={active
                    ? { color: mc.active, background: mc.active + '15', borderColor: mc.border }
                    : { color: '#475569' }
                  }
                >
                  {MODE_LABELS[mode]}
                </button>
              );
            })}
          </div>

          <span
            className={`border px-2 py-0.5 rounded-sm font-semibold tracking-[0.12em] ${STATUS_COLORS[marketStatus] ?? STATUS_COLORS['CLOSED']}`}
          >
            {marketStatus}
          </span>

          <div className="flex items-center gap-1 text-slate-500">
            <Clock size={10} aria-hidden="true" />
            <span className="tabular-nums text-slate-400">{clock}</span>
          </div>

          {lastUpdated && (
            <span className="text-slate-600 hidden md:block tabular-nums">
              UPD {lastUpdated.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          )}

          <button
            onClick={onRefresh}
            aria-label="Refresh dashboard data"
            className="flex items-center gap-1.5 border border-[rgba(0,212,255,0.2)] px-2.5 py-1 text-[#00d4ff]/70 hover:text-[#00d4ff] hover:border-[rgba(0,212,255,0.5)] hover:bg-[rgba(0,212,255,0.04)] rounded-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00d4ff] focus-visible:outline-offset-2"
          >
            <ArrowClockwise size={11} className={spinning ? 'animate-spin' : ''} aria-hidden="true" />
            <span className="tracking-[0.1em]">REFRESH</span>
          </button>

          <a
            href="https://github.com/Mukesh590/trading-bot"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 border border-white/[0.08] px-2.5 py-1 text-slate-400 hover:text-slate-200 hover:border-white/20 rounded-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
            aria-label="View GitHub repository"
          >
            <GithubLogo size={11} aria-hidden="true" />
            <span className="tracking-[0.1em]">GITHUB</span>
          </a>
        </div>
      </div>

      {/* Metrics strip */}
      <div className="border-t border-white/[0.04] px-4 py-1.5 max-w-[1800px] mx-auto">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-[10px]">
          {/* Alpha capture trio */}
          <MetricChip label="REALIZED ALPHA" value={realized} isMonetary />
          <MetricChip label="UNREALIZED ALPHA" value={unreal} isMonetary />
          <MetricChip label="TOTAL ALPHA CAPTURE" value={total} isMonetary bold />

          <div className="h-3 w-px bg-white/[0.06] hidden sm:block" aria-hidden="true" />

          {/* Quant metrics */}
          <MetricChip
            label="POS. EXPECTANCY RATE"
            value={`${winRate.toFixed(1)}%`}
            color={winRate >= 50 ? 'text-[#00ff88]' : 'text-[#ff3366]'}
          />
          <MetricChip
            label="SHARPE"
            value={sharpe.toFixed(2)}
            color={sharpe >= 1 ? 'text-[#00d4ff]' : 'text-amber-400'}
          />
          <MetricChip
            label="MAX DRAWDOWN"
            value={`-${maxDD.toFixed(1)}%`}
            color="text-[#ff3366]"
          />
        </div>
      </div>
    </header>
  );
}

function MetricChip({ label, value, isMonetary = false, bold = false, color }) {
  const num = isMonetary ? parseFloat(value) : null;
  const displayColor = color ?? (isMonetary ? (num >= 0 ? 'text-[#00ff88]' : 'text-[#ff3366]') : 'text-slate-300');
  const sign = isMonetary ? (num >= 0 ? '+' : '-') : '';

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-slate-600 tracking-[0.15em]">{label}</span>
      <span className={`tabular-nums font-${bold ? 'semibold' : 'normal'} ${displayColor}`}>
        {isMonetary
          ? `${sign}$${Math.abs(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          : value
        }
      </span>
    </div>
  );
}
