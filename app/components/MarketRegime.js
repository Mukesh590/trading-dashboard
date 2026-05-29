'use client';
import { useEffect, useState } from 'react';

const MOCK_TICKERS = [
  { symbol: 'SPY',  price: 547.82, change: +0.68 },
  { symbol: 'QQQ',  price: 471.14, change: +1.23 },
  { symbol: 'MSFT', price: 432.57, change: -0.41 },
  { symbol: 'AAPL', price: 213.32, change: +0.92 },
];

const VIX_VALUE = 18.3;

const REGIMES = {
  TRENDING:        { label: 'TRENDING',         color: '#00d4ff',  desc: 'Directional momentum present' },
  MEAN_REVERTING:  { label: 'MEAN-REVERTING',   color: '#00ff88',  desc: 'Range-bound price action' },
  HIGH_VOL:        { label: 'HIGH VOLATILITY',  color: '#f59e0b',  desc: 'Elevated realized volatility' },
  RISK_OFF:        { label: 'RISK-OFF',          color: '#ff3366',  desc: 'Broad risk asset selling' },
  NEUTRAL:         { label: 'NEUTRAL',           color: '#94a3b8',  desc: 'Compression / consolidation' },
};

function vixToRegime(vix) {
  if (vix < 15) return REGIMES.MEAN_REVERTING;
  if (vix < 20) return REGIMES.TRENDING;
  if (vix < 28) return REGIMES.HIGH_VOL;
  if (vix < 40) return REGIMES.RISK_OFF;
  return { label: 'EXTREME', color: '#ff3366', desc: 'Crisis conditions' };
}

function vixZone(vix) {
  if (vix < 15) return { label: 'LOW',      color: '#00ff88' };
  if (vix < 20) return { label: 'NORMAL',   color: '#00d4ff' };
  if (vix < 28) return { label: 'ELEVATED', color: '#f59e0b' };
  if (vix < 40) return { label: 'HIGH',     color: '#ff3366' };
  return           { label: 'EXTREME',  color: '#ff3366' };
}

function VixGauge({ value }) {
  const maxVix = 50;
  const angle  = Math.min((value / maxVix) * 180, 180);
  const rad    = (angle - 180) * (Math.PI / 180);
  const cx = 80, cy = 80, r = 60;
  const needleX = cx + r * Math.cos(rad);
  const needleY = cy + r * Math.sin(rad);

  const zone = vixZone(value);

  const arcPath = (startDeg, endDeg, color, dashArray) => {
    const s = (startDeg - 180) * Math.PI / 180;
    const e = (endDeg - 180)   * Math.PI / 180;
    const x1 = cx + r * Math.cos(s), y1 = cy + r * Math.sin(s);
    const x2 = cx + r * Math.cos(e), y2 = cy + r * Math.sin(e);
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return (
      <path
        d={`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`}
        fill="none"
        stroke={color}
        strokeWidth={8}
        strokeLinecap="butt"
        opacity={0.7}
        strokeDasharray={dashArray}
      />
    );
  };

  return (
    <div className="flex flex-col items-center">
      <svg width="160" height="92" viewBox="0 0 160 92" className="vix-gauge" aria-label={`VIX gauge: ${value}, zone ${zone.label}`}>
        {/* Track */}
        {arcPath(0, 180, 'rgba(255,255,255,0.06)')}
        {/* Zone arcs */}
        {arcPath(0,   54, '#00ff88',  undefined)}
        {arcPath(54,  72, '#00d4ff',  undefined)}
        {arcPath(72, 100.8, '#f59e0b', undefined)}
        {arcPath(100.8, 144, '#ff3366', undefined)}
        {arcPath(144, 180, '#ff0040', undefined)}
        {/* Needle */}
        <line
          x1={cx} y1={cy}
          x2={needleX} y2={needleY}
          stroke="white"
          strokeWidth={1.5}
          strokeLinecap="round"
          opacity={0.9}
        />
        <circle cx={cx} cy={cy} r={4} fill="white" opacity={0.9} />
        {/* Value */}
        <text x={cx} y={cy - 14} textAnchor="middle" fill="white" fontSize="14" fontFamily="var(--font-mono)" fontWeight="300">
          {value.toFixed(1)}
        </text>
        <text x={cx} y={cy - 2} textAnchor="middle" fill={zone.color} fontSize="8" fontFamily="var(--font-mono)" letterSpacing="2">
          {zone.label}
        </text>
      </svg>
    </div>
  );
}

const EARNINGS_MOCK = [
  { symbol: 'MSFT', date: 'Jun 12', dte: 14, time: 'AMC' },
  { symbol: 'AAPL', date: 'Jul 9',  dte: 41, time: 'AMC' },
  { symbol: 'SPY',  date: 'N/A',   dte: null, time: 'ETF' },
];

export default function MarketRegime() {
  const regime = vixToRegime(VIX_VALUE);

  return (
    <div className="panel h-full flex flex-col gap-0">
      <div className="px-4 pt-3 pb-2 border-b border-white/[0.04]">
        <span className="section-label">MARKET REGIME DETECTION</span>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-white/[0.04]">

        {/* VIX Gauge */}
        <div className="px-4 py-3 flex flex-col items-center justify-center gap-2">
          <VixGauge value={VIX_VALUE} />
          <div className="text-center">
            <div className="text-[9px] text-slate-500 tracking-widest">CBOE VIX</div>
            <div className="flex items-center gap-2 justify-center mt-1">
              <span
                className="text-[10px] font-medium tracking-[0.12em] px-2 py-0.5 rounded-sm border"
                style={{
                  color: regime.color,
                  borderColor: regime.color + '40',
                  background: regime.color + '10',
                }}
              >
                {regime.label}
              </span>
            </div>
            <div className="text-[9px] text-slate-600 mt-1">{regime.desc}</div>
          </div>
        </div>

        {/* Live tickers */}
        <div className="px-4 py-3 flex flex-col gap-2">
          <div className="text-[9px] text-slate-500 tracking-widest mb-1">BENCHMARK PRICES</div>
          {MOCK_TICKERS.map(t => (
            <div key={t.symbol} className="flex items-center justify-between">
              <span className="text-[10px] font-medium text-slate-300 tracking-wider w-10">{t.symbol}</span>
              <div className="flex items-center gap-3">
                <span className="text-[11px] tabular-nums text-white">
                  ${t.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className={`text-[10px] tabular-nums w-16 text-right ${t.change >= 0 ? 'text-[#00ff88]' : 'text-[#ff3366]'}`}>
                  {t.change >= 0 ? '+' : ''}{t.change.toFixed(2)}%
                </span>
              </div>
            </div>
          ))}
          <div className="mt-1 pt-2 border-t border-white/[0.04] text-[8px] text-slate-600 tracking-widest">
            15MIN DELAY - DEMO DATA
          </div>
        </div>

        {/* Earnings calendar */}
        <div className="px-4 py-3 flex flex-col gap-2">
          <div className="text-[9px] text-slate-500 tracking-widest mb-1">EARNINGS WATCH</div>
          {EARNINGS_MOCK.map(e => (
            <div key={e.symbol} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-medium text-slate-300 w-10">{e.symbol}</span>
                <span className="text-[9px] text-slate-500">{e.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-slate-500">{e.time}</span>
                {e.dte !== null ? (
                  <span className={`text-[9px] tabular-nums px-1.5 py-0.5 rounded-sm border ${
                    e.dte <= 7
                      ? 'text-[#ff3366] border-[rgba(255,51,102,0.3)] bg-[rgba(255,51,102,0.06)]'
                      : 'text-amber-400 border-amber-500/30 bg-amber-500/5'
                  }`}>
                    {e.dte}d
                  </span>
                ) : (
                  <span className="text-[9px] text-slate-600 px-1.5">ETF</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
