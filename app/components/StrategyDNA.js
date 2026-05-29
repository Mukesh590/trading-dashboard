'use client';
import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const MONTHLY_PNL = [
  { month: 'Dec', pnl: 3200 },
  { month: 'Jan', pnl: -1800 },
  { month: 'Feb', pnl: 5400 },
  { month: 'Mar', pnl: 2900 },
  { month: 'Apr', pnl: -2600 },
  { month: 'May', pnl: 6100 },
];

const STRATEGY_STATS = [
  { name: 'Cash Secured Put', short: 'CSP', wins: 7, total: 8, avgCredit: 840, avgPnl: 712 },
  { name: 'Call Credit Spread', short: 'CCS', wins: 5, total: 7, avgCredit: 1380, avgPnl: 960 },
  { name: 'Naked Call', short: 'NC', wins: 1, total: 2, avgCredit: 980, avgPnl: -140 },
];

function WinRateBars() {
  return (
    <div className="space-y-3">
      {STRATEGY_STATS.map(s => {
        const rate = (s.wins / s.total) * 100;
        const color = rate >= 70 ? '#00ff88' : rate >= 50 ? '#00d4ff' : '#ff3366';
        return (
          <div key={s.short}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span
                  className="text-[8px] px-1.5 py-0.5 rounded-sm border"
                  style={{ color: '#00d4ff', borderColor: 'rgba(0,212,255,0.3)', background: 'rgba(0,212,255,0.06)' }}
                >
                  {s.short}
                </span>
                <span className="text-[9px] text-slate-400 hidden sm:block">{s.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[8px] text-slate-600 tabular-nums">{s.wins}/{s.total}</span>
                <span className="text-[10px] tabular-nums font-medium" style={{ color }}>{rate.toFixed(0)}%</span>
              </div>
            </div>
            <div className="progress-bar h-[5px]">
              <div className="progress-fill h-full" style={{ width: `${rate}%`, background: color }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MonthlyChart() {
  const chartRef = useRef(null);
  const instanceRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current) return;
    const ctx = chartRef.current.getContext('2d');
    if (instanceRef.current) instanceRef.current.destroy();

    instanceRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: MONTHLY_PNL.map(m => m.month),
        datasets: [{
          data: MONTHLY_PNL.map(m => m.pnl),
          backgroundColor: MONTHLY_PNL.map(m => m.pnl >= 0 ? 'rgba(0,255,136,0.5)' : 'rgba(255,51,102,0.5)'),
          borderColor:      MONTHLY_PNL.map(m => m.pnl >= 0 ? '#00ff88' : '#ff3366'),
          borderWidth: 1,
          borderRadius: 2,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 600 },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => {
                const v = ctx.raw;
                return ` ${v >= 0 ? '+' : ''}$${Math.abs(v).toLocaleString()}`;
              },
            },
            bodyFont: { family: 'var(--font-mono)', size: 10 },
            backgroundColor: 'rgba(13,13,22,0.95)',
            borderColor: 'rgba(255,255,255,0.08)',
            borderWidth: 1,
          },
        },
        scales: {
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: { color: '#475569', font: { family: 'var(--font-mono)', size: 9 } },
          },
          y: {
            grid: { color: 'rgba(255,255,255,0.04)' },
            border: { display: false },
            ticks: {
              color: '#475569',
              font: { family: 'var(--font-mono)', size: 9 },
              callback: v => v >= 0 ? `+$${v/1000}k` : `-$${Math.abs(v)/1000}k`,
            },
          },
        },
      },
    });

    return () => { if (instanceRef.current) instanceRef.current.destroy(); };
  }, []);

  return <canvas ref={chartRef} aria-label="Monthly P&L bar chart" role="img" />;
}

const QUANT_METRICS = [
  { label: 'SHARPE RATIO',    value: '1.84',  color: 'text-[#00d4ff]' },
  { label: 'SORTINO RATIO',   value: '2.31',  color: 'text-[#00d4ff]' },
  { label: 'MAX DRAWDOWN',    value: '-4.2%', color: 'text-[#ff3366]' },
  { label: 'RECOVERY FACTOR', value: '3.7x',  color: 'text-[#00ff88]' },
];

export default function StrategyDNA({ orders, compact = false }) {
  const best = { symbol: 'SPXW', pnl: 3500, pct: 100 };
  const worst = { symbol: 'SPY', pnl: -640, pct: -18 };
  if (compact) {
    return (
      <div className="panel h-full flex flex-col">
        <div className="px-4 pt-3 pb-2 border-b border-white/[0.04]">
          <span className="section-label">STRATEGY DNA</span>
        </div>
        <div className="flex-1 px-4 py-3 flex flex-col gap-3">
          <WinRateBars />
          <div className="grid grid-cols-2 gap-2">
            {QUANT_METRICS.map(m => (
              <div key={m.label} className="bg-white/[0.02] rounded-sm px-2 py-1.5">
                <div className="text-[8px] text-slate-600 tracking-[0.1em] mb-0.5">{m.label}</div>
                <div className={`text-[11px] tabular-nums font-medium ${m.color}`}>{m.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="panel h-full flex flex-col">
      <div className="px-4 pt-3 pb-2 border-b border-white/[0.04]">
        <span className="section-label">STRATEGY DNA</span>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-white/[0.04]">

        {/* Left: win rates + quant metrics */}
        <div className="px-4 py-3 flex flex-col gap-4">
          <div>
            <div className="text-[9px] text-slate-500 tracking-widest mb-2">WIN RATE BY STRATEGY</div>
            <WinRateBars />
          </div>

          <div className="border-t border-white/[0.04] pt-3">
            <div className="text-[9px] text-slate-500 tracking-widest mb-2">PERFORMANCE METRICS</div>
            <div className="grid grid-cols-2 gap-2">
              {QUANT_METRICS.map(m => (
                <div key={m.label} className="bg-white/[0.02] rounded-sm px-2 py-1.5">
                  <div className="text-[8px] text-slate-600 tracking-[0.1em] mb-0.5">{m.label}</div>
                  <div className={`text-[11px] tabular-nums font-medium ${m.color}`}>{m.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Best / worst */}
          <div className="grid grid-cols-2 gap-2">
            <div className="border border-[rgba(0,255,136,0.2)] bg-[rgba(0,255,136,0.04)] rounded-sm px-2 py-1.5">
              <div className="text-[8px] text-slate-600 tracking-widest mb-0.5">BEST TRADE</div>
              <div className="text-[10px] font-medium text-slate-300">{best.symbol}</div>
              <div className="text-[10px] tabular-nums text-[#00ff88]">+${best.pnl.toLocaleString()}</div>
            </div>
            <div className="border border-[rgba(255,51,102,0.2)] bg-[rgba(255,51,102,0.04)] rounded-sm px-2 py-1.5">
              <div className="text-[8px] text-slate-600 tracking-widest mb-0.5">WORST TRADE</div>
              <div className="text-[10px] font-medium text-slate-300">{worst.symbol}</div>
              <div className="text-[10px] tabular-nums text-[#ff3366]">${worst.pnl.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Right: monthly chart */}
        <div className="px-4 py-3 flex flex-col">
          <div className="text-[9px] text-slate-500 tracking-widest mb-2">MONTHLY P&L</div>
          <div className="flex-1" style={{ minHeight: '160px' }}>
            <MonthlyChart />
          </div>
        </div>
      </div>
    </div>
  );
}
