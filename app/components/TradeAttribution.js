'use client';

const ATTRIBUTIONS = [
  {
    id: 1,
    symbol: 'SPXW CCS 5300/5350',
    closeDate: 'May 21, 26',
    alphaSource: 'Theta Decay',
    grade: 'A',
    exitEfficiency: 87,
    entryCondition: 'VIX < 20, trend up',
    exitCondition: '62% profit target',
    marketCondition: 'Trending - Low Vol',
    pnl: 2088,
  },
  {
    id: 2,
    symbol: 'SPY CSP 535',
    closeDate: 'May 12, 26',
    alphaSource: 'Premium Selling',
    grade: 'A',
    exitEfficiency: 94,
    entryCondition: 'IV Rank > 30',
    exitCondition: 'Expired worthless',
    marketCondition: 'Mean-Reverting',
    pnl: 1680,
  },
  {
    id: 3,
    symbol: 'SPY CSP 505',
    closeDate: 'Mar 30, 26',
    alphaSource: 'Premium Selling',
    grade: 'C',
    exitEfficiency: 42,
    entryCondition: 'IV Rank > 30',
    exitCondition: 'Stop loss - 150%',
    marketCondition: 'Risk-Off - High Vol',
    pnl: -640,
  },
];

const GRADE_STYLES = {
  A: { color: '#00ff88', border: 'rgba(0,255,136,0.3)', bg: 'rgba(0,255,136,0.06)' },
  B: { color: '#00d4ff', border: 'rgba(0,212,255,0.3)', bg: 'rgba(0,212,255,0.06)' },
  C: { color: '#f59e0b', border: 'rgba(245,158,11,0.3)', bg: 'rgba(245,158,11,0.06)' },
  D: { color: '#ff3366', border: 'rgba(255,51,102,0.3)', bg: 'rgba(255,51,102,0.06)' },
};

export default function TradeAttribution() {
  return (
    <div className="panel h-full flex flex-col">
      <div className="px-4 pt-3 pb-2 border-b border-white/[0.04]">
        <span className="section-label">TRADE ATTRIBUTION</span>
      </div>
      <div className="flex-1 flex flex-col divide-y divide-white/[0.04] overflow-auto">
        {ATTRIBUTIONS.map(a => {
          const grade = GRADE_STYLES[a.grade] || GRADE_STYLES.C;
          const isWin = a.pnl >= 0;
          return (
            <div key={a.id} className="px-4 py-3">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-medium text-slate-300">{a.symbol}</span>
                    <span className="text-[8px] text-slate-600">{a.closeDate}</span>
                  </div>
                  <div className="text-[9px] text-slate-500">{a.alphaSource}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div
                    className="px-2 py-1 rounded-sm border text-center min-w-[28px]"
                    style={{ color: grade.color, borderColor: grade.border, background: grade.bg }}
                  >
                    <span className="text-[9px] tracking-widest">GRADE</span>
                    <div className="text-sm font-semibold">{a.grade}</div>
                  </div>
                  <div className={`text-[11px] tabular-nums font-medium ${isWin ? 'text-[#00ff88]' : 'text-[#ff3366]'}`}>
                    {isWin ? '+' : '-'}${Math.abs(a.pnl).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Exit efficiency bar */}
              <div className="mb-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[8px] text-slate-600 tracking-widest">EXIT EFFICIENCY</span>
                  <span className={`text-[9px] tabular-nums ${a.exitEfficiency >= 70 ? 'text-[#00ff88]' : a.exitEfficiency >= 40 ? 'text-amber-400' : 'text-[#ff3366]'}`}>
                    {a.exitEfficiency}%
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${a.exitEfficiency}%`,
                      background: a.exitEfficiency >= 70 ? '#00ff88' : a.exitEfficiency >= 40 ? '#f59e0b' : '#ff3366',
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[9px]">
                <div><span className="text-slate-600">Entry: </span><span className="text-slate-400">{a.entryCondition}</span></div>
                <div><span className="text-slate-600">Exit: </span><span className="text-slate-400">{a.exitCondition}</span></div>
                <div className="col-span-2"><span className="text-slate-600">Market: </span><span className="text-slate-400">{a.marketCondition}</span></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
