'use client';
import { useState, useMemo } from 'react';
import { pairOrders } from '../lib/utils';
import { ArrowDown, ArrowUp, Export, Funnel } from '@phosphor-icons/react';

const STRATEGIES = ['All', 'Call Credit Spread', 'Cash Secured Put', 'Equity'];

function downloadCSV(trades) {
  const header = 'Symbol,Strategy,Open Date,Close Date,Credit,Close Cost,P&L,P&L%,Result';
  const rows = trades.map(t =>
    [t.symbol, t.strategy, t.openDate, t.closeDate,
     t.credit.toFixed(2), t.closeCost.toFixed(2),
     t.pnl.toFixed(2), t.pnlPct.toFixed(1), t.won ? 'WIN' : 'LOSS'
    ].join(',')
  );
  const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = 'trade_history.csv'; a.click();
  URL.revokeObjectURL(url);
}

export default function TradeHistoryTable({ orders }) {
  const [sortKey, setSortKey] = useState('closeDate');
  const [sortDir, setSortDir] = useState('desc');
  const [filterStrat, setFilterStrat] = useState('All');
  const [filterResult, setFilterResult] = useState('All');

  const allTrades = useMemo(() => pairOrders(orders || []), [orders]);

  const trades = useMemo(() => {
    let t = allTrades;
    if (filterStrat !== 'All') t = t.filter(x => x.strategy === filterStrat);
    if (filterResult === 'WIN')  t = t.filter(x => x.won);
    if (filterResult === 'LOSS') t = t.filter(x => !x.won);
    return [...t].sort((a, b) => {
      let av = a[sortKey], bv = b[sortKey];
      if (typeof av === 'string') { av = av.toLowerCase(); bv = bv.toLowerCase(); }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [allTrades, sortKey, sortDir, filterStrat, filterResult]);

  function toggleSort(key) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  }

  const SortIcon = ({ k }) => sortKey !== k ? null :
    sortDir === 'asc'
      ? <ArrowUp size={8} aria-hidden="true" />
      : <ArrowDown size={8} aria-hidden="true" />;

  const wins  = allTrades.filter(t => t.won).length;
  const total = allTrades.length;

  return (
    <div className="panel flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-3 pb-2 border-b border-white/[0.04] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="section-label">TRADE HISTORY</span>
          <span className="text-[9px] text-slate-600 tabular-nums">{total} trades</span>
          <span className={`text-[9px] tabular-nums ${wins/total >= 0.6 ? 'text-[#00ff88]' : 'text-[#ff3366]'}`}>
            {total > 0 ? ((wins/total)*100).toFixed(0) : 0}% win
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Filters */}
          <div className="flex items-center gap-1">
            <Funnel size={10} className="text-slate-600" aria-hidden="true" />
            <select
              value={filterStrat}
              onChange={e => setFilterStrat(e.target.value)}
              aria-label="Filter by strategy"
              className="text-[9px] bg-[rgba(255,255,255,0.03)] border border-white/[0.06] text-slate-400 px-2 py-1 rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00d4ff] focus-visible:outline-offset-1"
            >
              {STRATEGIES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select
              value={filterResult}
              onChange={e => setFilterResult(e.target.value)}
              aria-label="Filter by result"
              className="text-[9px] bg-[rgba(255,255,255,0.03)] border border-white/[0.06] text-slate-400 px-2 py-1 rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00d4ff] focus-visible:outline-offset-1"
            >
              {['All','WIN','LOSS'].map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <button
            onClick={() => downloadCSV(trades)}
            aria-label="Export trade history as CSV"
            className="flex items-center gap-1.5 text-[9px] tracking-[0.1em] border border-white/[0.08] px-2.5 py-1 text-slate-500 hover:text-slate-300 hover:border-white/20 rounded-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00d4ff] focus-visible:outline-offset-1"
          >
            <Export size={10} aria-hidden="true" />
            CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-[10px] border-collapse" role="table">
          <thead className="sticky top-0 bg-[#0d0d16]">
            <tr className="border-b border-white/[0.06]">
              {[
                { key: 'symbol',   label: 'SYMBOL' },
                { key: 'strategy', label: 'STRATEGY' },
                { key: 'openDate', label: 'OPEN' },
                { key: 'closeDate',label: 'CLOSE' },
                { key: 'credit',   label: 'CREDIT' },
                { key: 'pnl',      label: 'P&L' },
                { key: 'pnlPct',   label: '%' },
                { key: 'won',      label: 'RESULT' },
              ].map(col => (
                <th
                  key={col.key}
                  onClick={() => toggleSort(col.key)}
                  className="px-3 py-2 text-left text-[8px] tracking-[0.15em] text-slate-600 font-medium cursor-pointer hover:text-slate-400 transition-colors select-none whitespace-nowrap"
                  aria-sort={sortKey === col.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    <SortIcon k={col.key} />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {trades.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-6 text-center text-slate-600 text-[9px] tracking-widest">
                  NO TRADES MATCH FILTER
                </td>
              </tr>
            ) : (
              trades.map(t => {
                const win = t.won;
                return (
                  <tr
                    key={t.id}
                    className="tr-hover border-b border-white/[0.03] transition-colors"
                  >
                    <td className="px-3 py-2 font-medium text-slate-300 whitespace-nowrap">{t.symbol}</td>
                    <td className="px-3 py-2 text-slate-500 whitespace-nowrap">
                      {t.strategy === 'Call Credit Spread' ? 'CCS' :
                       t.strategy === 'Cash Secured Put'   ? 'CSP' : t.strategy}
                    </td>
                    <td className="px-3 py-2 text-slate-500 tabular-nums whitespace-nowrap">{t.openDate}</td>
                    <td className="px-3 py-2 text-slate-500 tabular-nums whitespace-nowrap">{t.closeDate}</td>
                    <td className="px-3 py-2 text-slate-400 tabular-nums whitespace-nowrap">
                      ${t.credit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className={`px-3 py-2 tabular-nums font-medium whitespace-nowrap ${win ? 'text-[#00ff88]' : 'text-[#ff3366]'}`}>
                      {t.pnl >= 0 ? '+' : '-'}${Math.abs(t.pnl).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className={`px-3 py-2 tabular-nums whitespace-nowrap ${win ? 'text-[#00ff88]' : 'text-[#ff3366]'}`}>
                      {t.pnlPct >= 0 ? '+' : ''}{t.pnlPct.toFixed(1)}%
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span
                        className="text-[8px] px-1.5 py-0.5 rounded-sm border tracking-wider font-medium"
                        style={win
                          ? { color: '#00ff88', borderColor: 'rgba(0,255,136,0.3)', background: 'rgba(0,255,136,0.06)' }
                          : { color: '#ff3366', borderColor: 'rgba(255,51,102,0.3)', background: 'rgba(255,51,102,0.06)' }
                        }
                      >
                        {win ? 'WIN' : 'LOSS'}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
