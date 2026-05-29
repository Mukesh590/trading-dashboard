'use client';
import { useState } from 'react';
import { ShieldCheck, ShieldWarning, ShieldSlash, Prohibit } from '@phosphor-icons/react';

const DD_LIMIT = 2.5;

export default function RiskSentinel({ metrics }) {
  const [killConfirm, setKillConfirm] = useState(false);

  const equity     = parseFloat(metrics?.equity ?? 521600);
  const totalPnL   = parseFloat(metrics?.totalPnL ?? 0);
  const base       = 500000;
  const todayPnL   = parseFloat(metrics?.todayPnL ?? 2400);

  const ddPct = Math.abs(Math.min(0, (todayPnL / equity) * 100));
  const ddUsed = Math.min(ddPct / DD_LIMIT * 100, 100);
  const vixBreaker = 18.3 < 25;
  const execHealth = ddPct < 1.5 ? 'STABLE' : ddPct < 2.0 ? 'WARNING' : 'CRITICAL';

  const healthIcon = {
    STABLE:   <ShieldCheck  size={12} weight="fill" className="text-[#00ff88]" aria-hidden="true" />,
    WARNING:  <ShieldWarning size={12} weight="fill" className="text-amber-400" aria-hidden="true" />,
    CRITICAL: <ShieldSlash  size={12} weight="fill" className="text-[#ff3366]"  aria-hidden="true" />,
  }[execHealth];

  const healthColor = {
    STABLE:   'text-[#00ff88]',
    WARNING:  'text-amber-400',
    CRITICAL: 'text-[#ff3366]',
  }[execHealth];

  const ddColor = ddUsed < 50 ? '#00ff88' : ddUsed < 80 ? '#f59e0b' : '#ff3366';

  return (
    <div className="panel panel-red h-full flex flex-col">
      <div className="px-4 pt-3 pb-2 border-b border-white/[0.04] flex items-center justify-between">
        <span className="section-label">RISK SENTINEL</span>
        <div className="flex items-center gap-1.5">
          {healthIcon}
          <span className={`text-[9px] tracking-[0.12em] font-semibold ${healthColor}`}>
            {execHealth}
          </span>
        </div>
      </div>

      <div className="flex-1 px-4 py-3 flex flex-col gap-4">
        {/* Daily drawdown limit */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] text-slate-500 tracking-widest">DAILY DRAWDOWN LIMIT</span>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-[11px] tabular-nums font-medium ${ddPct > 0 ? 'text-[#ff3366]' : 'text-[#00ff88]'}`}>
                {ddPct.toFixed(2)}%
              </span>
              <span className="text-[9px] text-slate-600">/ {DD_LIMIT}%</span>
            </div>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${ddUsed}%`, background: ddColor }}
              role="progressbar"
              aria-valuenow={ddPct}
              aria-valuemin={0}
              aria-valuemax={DD_LIMIT}
              aria-label={`Daily drawdown: ${ddPct.toFixed(2)} of ${DD_LIMIT} percent limit`}
            />
          </div>
          <div className="flex justify-between mt-1 text-[8px] text-slate-700 tabular-nums">
            <span>0%</span>
            <span>{DD_LIMIT * 0.5}%</span>
            <span>{DD_LIMIT}%</span>
          </div>
        </div>

        {/* Status grid */}
        <div className="grid grid-cols-2 gap-2">
          <StatusRow
            label="EXECUTION"
            value={execHealth}
            color={healthColor}
          />
          <StatusRow
            label="VIX BREAKER"
            value={vixBreaker ? 'CLEAR' : 'TRIPPED'}
            color={vixBreaker ? 'text-[#00ff88]' : 'text-[#ff3366]'}
          />
          <StatusRow
            label="POSITION CAP"
            value={`${(metrics?.totalTrades ?? 0) > 0 ? '3/3' : '0/3'}`}
            color="text-amber-400"
          />
          <StatusRow
            label="TODAY P&L"
            value={`${todayPnL >= 0 ? '+' : ''}$${Math.abs(todayPnL).toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
            color={todayPnL >= 0 ? 'text-[#00ff88]' : 'text-[#ff3366]'}
          />
        </div>

        {/* Kill switch */}
        <div className="mt-auto pt-2 border-t border-white/[0.04]">
          {!killConfirm ? (
            <button
              className="kill-switch w-full flex items-center justify-center gap-2"
              onClick={() => setKillConfirm(true)}
              aria-label="Activate kill switch to halt all trading"
            >
              <Prohibit size={11} aria-hidden="true" />
              KILL SWITCH
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                className="flex-1 text-[9px] tracking-[0.1em] py-1.5 border border-[rgba(255,51,102,0.5)] bg-[rgba(255,51,102,0.12)] text-[#ff3366] rounded-sm hover:bg-[rgba(255,51,102,0.2)] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#ff3366] focus-visible:outline-offset-2"
                onClick={() => setKillConfirm(false)}
                aria-label="Confirm halt all trading"
              >
                CONFIRM HALT
              </button>
              <button
                className="flex-1 text-[9px] tracking-[0.1em] py-1.5 border border-white/10 text-slate-400 rounded-sm hover:border-white/20 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
                onClick={() => setKillConfirm(false)}
                aria-label="Cancel kill switch"
              >
                CANCEL
              </button>
            </div>
          )}
          <div className="text-[8px] text-slate-700 text-center mt-1.5 tracking-wider">
            VISUAL ONLY - NO EXECUTION
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusRow({ label, value, color }) {
  return (
    <div className="flex flex-col gap-0.5 bg-white/[0.02] rounded-sm px-2 py-1.5">
      <span className="text-[8px] text-slate-600 tracking-[0.15em]">{label}</span>
      <span className={`text-[10px] font-medium tabular-nums ${color}`}>{value}</span>
    </div>
  );
}
