'use client';
import { fmt$, fmtPct, colorPnl } from '../lib/utils';
import { MAX_POSITIONS } from '../lib/config';

function MetricCard({ label, value, sub, valueClass = 'text-cyan-400', icon }) {
  return (
    <div className="terminal-card flex-1 min-w-[160px] px-4 py-3 group hover:border-cyan-900/60 transition-colors">
      <div className="text-gray-600 text-[10px] tracking-widest mb-1 uppercase">{icon} {label}</div>
      <div className={`text-xl font-bold tracking-tight ${valueClass}`}>{value}</div>
      {sub && <div className="text-xs text-gray-600 mt-0.5">{sub}</div>}
    </div>
  );
}

export default function MetricsRow({ metrics, activeCount = 0 }) {
  if (!metrics) return null;

  const { realizedPnL, unrealizedPnL, totalPnL, totalPnLPct, todayPnL, todayPnLPct, winRate, totalTrades, equity } = metrics;

  return (
    <div className="flex flex-wrap gap-2">
      <MetricCard
        label="Portfolio Value"
        value={`$${parseFloat(equity || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        valueClass="text-cyan-400"
        icon="◈"
      />
      <MetricCard
        label="Realized P&amp;L"
        value={fmt$(realizedPnL)}
        sub="closed trades"
        valueClass={colorPnl(realizedPnL)}
        icon="✓"
      />
      <MetricCard
        label="Unrealized P&amp;L"
        value={fmt$(unrealizedPnL)}
        sub="open positions"
        valueClass={colorPnl(unrealizedPnL)}
        icon="◌"
      />
      <MetricCard
        label="Total P&amp;L"
        value={fmt$(totalPnL)}
        sub={fmtPct(totalPnLPct)}
        valueClass={colorPnl(totalPnL)}
        icon="◆"
      />
      <MetricCard
        label="Today's P&amp;L"
        value={fmt$(todayPnL)}
        sub={fmtPct(todayPnLPct)}
        valueClass={colorPnl(todayPnL)}
        icon="△"
      />
      <MetricCard
        label="Win Rate"
        value={winRate > 0 ? `${winRate.toFixed(1)}%` : '—'}
        sub={totalTrades > 0 ? `${totalTrades} closed trades` : 'no closed trades'}
        valueClass={winRate >= 60 ? 'text-green-400' : winRate > 0 ? 'text-yellow-400' : 'text-gray-500'}
        icon="✦"
      />
      <MetricCard
        label="Active Positions"
        value={activeCount}
        sub={`of ${MAX_POSITIONS} max`}
        valueClass={activeCount >= MAX_POSITIONS ? 'text-yellow-400' : 'text-green-400'}
        icon="◉"
      />
    </div>
  );
}
