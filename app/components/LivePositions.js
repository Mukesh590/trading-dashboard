'use client';
import { useState } from 'react';
import { CaretDown, CaretUp, Clock, TrendDown, Warning } from '@phosphor-icons/react';
import { statusColor } from '../lib/utils';
import { MAX_POSITIONS, MAX_INTRADAY_POSITIONS } from '../lib/config';

const STRATEGY_SHORT = { 'Call Credit Spread': 'CCS', 'Cash Secured Put': 'CSP', 'Naked Call': 'NC' };

// Tickers with upcoming earnings (within 14 days)
const EARNINGS_PROXIMITY = { SPXW: 7, QQQ: 12 };

function hasEarningsRisk(symbol) {
  return EARNINGS_PROXIMITY[symbol] !== undefined && EARNINGS_PROXIMITY[symbol] <= 14;
}

const MOCK_GREEKS = {
  delta: -0.22,
  theta: 18.40,
  vega:  -42.30,
  iv:    24.8,
  gamma: 0.008,
};

function dteDays(expiry) {
  if (!expiry) return null;
  const [mm, dd, yy] = expiry.split('/');
  const exp = new Date(`20${yy}-${mm}-${dd}`);
  const now = new Date();
  const diff = Math.ceil((exp - now) / 86400000);
  return Math.max(0, diff);
}

function PositionCard({ pos }) {
  const [expanded, setExpanded] = useState(false);
  const dte = dteDays(pos.expiry);
  const dteTotal = dte !== null ? Math.max(dte, 1) : 30;
  const dteUsed = dte !== null ? Math.min(((dteTotal - dte) / dteTotal) * 100, 100) : 50;

  const isProfit = pos.pnl >= 0;
  const pnlColor = isProfit ? 'text-[#00ff88]' : 'text-[#ff3366]';
  const pnlBg    = isProfit ? 'rgba(0,255,136,0.06)' : 'rgba(255,51,102,0.06)';
  const pnlBorder = isProfit ? 'rgba(0,255,136,0.2)' : 'rgba(255,51,102,0.2)';
  const earningsRisk = hasEarningsRisk(pos.symbol);
  const earningsDte  = EARNINGS_PROXIMITY[pos.symbol];

  const stratShort = STRATEGY_SHORT[pos.strategy] || pos.strategy;
  const greeks = MOCK_GREEKS;

  const closeTarget = pos.status === 'CLOSE TARGET' || pos.status === 'CLOSE NOW';

  return (
    <div
      className={`panel rounded-sm overflow-hidden ${earningsRisk ? 'earnings-risk' : ''}`}
      style={{ borderColor: earningsRisk ? 'rgba(255,51,102,0.3)' : isProfit ? 'rgba(0,255,136,0.15)' : 'rgba(255,51,102,0.15)' }}
    >
      {/* Header row */}
      <div className="px-3 pt-3 pb-2">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-wider text-white">{pos.symbol}</span>
            <span
              className="text-[8px] px-1.5 py-0.5 rounded-sm border font-medium tracking-wider"
              style={{ color: '#00d4ff', borderColor: 'rgba(0,212,255,0.3)', background: 'rgba(0,212,255,0.06)' }}
            >
              {stratShort}
            </span>
            {closeTarget && (
              <span
                className="text-[8px] px-1.5 py-0.5 rounded-sm border font-medium tracking-wider animate-pulse"
                style={{ color: '#f59e0b', borderColor: 'rgba(245,158,11,0.4)', background: 'rgba(245,158,11,0.06)' }}
              >
                CLOSE TARGET
              </span>
            )}
            {earningsRisk && (
              <span
                className="flex items-center gap-1 text-[8px] px-1.5 py-0.5 rounded-sm border font-medium tracking-wider"
                style={{ color: '#ff3366', borderColor: 'rgba(255,51,102,0.4)', background: 'rgba(255,51,102,0.06)' }}
                title={`Earnings proximity risk: ${earningsDte} days`}
              >
                <Warning size={8} aria-hidden="true" />
                EARNINGS RISK {earningsDte}d
              </span>
            )}
          </div>

          {/* P&L badge */}
          <div
            className="flex flex-col items-end px-2 py-1 rounded-sm border shrink-0"
            style={{ background: pnlBg, borderColor: pnlBorder }}
          >
            <span className={`text-[11px] tabular-nums font-medium ${pnlColor}`}>
              {pos.pnl >= 0 ? '+' : '-'}${Math.abs(pos.pnl).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className={`text-[9px] tabular-nums ${pnlColor}`}>
              {pos.pnlPct >= 0 ? '+' : ''}{pos.pnlPct.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Strikes + expiry */}
        <div className="flex items-center gap-3 text-[9px] text-slate-500 mb-2">
          <span className="text-slate-400">{pos.strikes}</span>
          <span className="text-slate-700">|</span>
          <span className="flex items-center gap-1">
            <Clock size={9} aria-hidden="true" />
            {pos.expiry}
            {dte !== null && (
              <span className={dte <= 7 ? 'text-[#ff3366]' : dte <= 14 ? 'text-amber-400' : 'text-slate-500'}>
                {' '}({dte}d)
              </span>
            )}
          </span>
          <span className="text-slate-700">|</span>
          <span>x{pos.qty}</span>
        </div>

        {/* Credit vs current */}
        <div className="flex items-center justify-between text-[9px] mb-2">
          <div className="flex gap-3">
            <div>
              <span className="text-slate-600">ENTRY </span>
              <span className="text-slate-300 tabular-nums">${Math.abs(pos.entryCredit).toFixed(2)}</span>
            </div>
            <div>
              <span className="text-slate-600">CURRENT </span>
              <span className="text-slate-300 tabular-nums">${Math.abs(pos.currentValue).toFixed(2)}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[#00d4ff]">
            <TrendDown size={9} aria-hidden="true" />
            <span className="tabular-nums">+${greeks.theta.toFixed(2)}/day</span>
          </div>
        </div>

        {/* DTE progress */}
        <div className="progress-bar mb-0.5">
          <div
            className="progress-fill"
            style={{ width: `${dteUsed}%`, background: dte !== null && dte <= 7 ? '#ff3366' : '#00d4ff' }}
            role="progressbar"
            aria-valuenow={dteUsed}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Days held progress: ${dte} DTE remaining`}
          />
        </div>
        <div className="text-[8px] text-slate-700 tabular-nums">
          {dte !== null ? `${dte} DTE remaining` : 'DTE unavailable'}
        </div>
      </div>

      {/* Expand toggle */}
      <button
        className="w-full flex items-center justify-center gap-1 py-1.5 border-t border-white/[0.04] text-[8px] text-slate-600 hover:text-slate-400 hover:bg-white/[0.02] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00d4ff] focus-visible:outline-offset-1"
        onClick={() => setExpanded(e => !e)}
        aria-expanded={expanded}
        aria-label={`${expanded ? 'Hide' : 'Show'} Greeks for ${pos.symbol}`}
      >
        {expanded ? <CaretUp size={8} aria-hidden="true" /> : <CaretDown size={8} aria-hidden="true" />}
        {expanded ? 'HIDE GREEKS' : 'VIEW GREEKS'}
      </button>

      {/* Greeks panel */}
      {expanded && (
        <div className="grid grid-cols-5 border-t border-white/[0.04] divide-x divide-white/[0.04]">
          {[
            { k: 'DELTA', v: greeks.delta.toFixed(3) },
            { k: 'THETA', v: `+${greeks.theta.toFixed(2)}` },
            { k: 'VEGA',  v: greeks.vega.toFixed(2) },
            { k: 'IV',    v: `${greeks.iv.toFixed(1)}%` },
            { k: 'GAMMA', v: greeks.gamma.toFixed(4) },
          ].map(g => (
            <div key={g.k} className="px-2 py-2 flex flex-col items-center gap-0.5">
              <span className="text-[7px] text-slate-600 tracking-[0.12em]">{g.k}</span>
              <span className={`text-[10px] tabular-nums font-medium ${
                g.k === 'THETA' ? 'text-[#00ff88]' :
                g.k === 'VEGA'  ? 'text-[#ff3366]' :
                'text-slate-300'
              }`}>{g.v}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function LivePositions({ positions, todayCount = 0 }) {
  if (!positions?.length) {
    return (
      <div className="panel p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-slate-600 text-[10px] tracking-widest mb-1">NO OPEN POSITIONS</div>
          <div className="text-slate-700 text-[9px]">Bot is scanning for entries</div>
        </div>
      </div>
    );
  }

  const strats = positions;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="section-label">CURRENT EXPOSURE</span>
        <span className="text-[9px] text-slate-500 tabular-nums">
          {strats.length}/{MAX_POSITIONS} holds | {todayCount}/{MAX_INTRADAY_POSITIONS} today
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {strats.map(pos => (
          <PositionCard key={pos.id} pos={pos} />
        ))}
      </div>
    </div>
  );
}
