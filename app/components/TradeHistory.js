'use client';
import { pairOrders, fmtRaw$, fmt$, fmtPct, colorPnl } from '../lib/utils';

const TH = ({ children, right }) => (
  <th className={`py-2 px-3 text-[10px] font-normal tracking-widest text-gray-600 border-b border-green-900/30 ${right ? 'text-right' : 'text-left'}`}>
    {children}
  </th>
);
const TD = ({ children, className = '', right }) => (
  <td className={`py-2.5 px-3 text-xs border-b border-green-900/20 ${right ? 'text-right' : ''} ${className}`}>
    {children}
  </td>
);

export default function TradeHistory({ orders }) {
  const trades = pairOrders(orders);

  return (
    <div className="terminal-card">
      <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-green-900/30">
        <div className="text-xs text-cyan-400 tracking-widest font-bold">≡ TRADE HISTORY</div>
        <span className="text-[10px] text-gray-600">{trades.length} CLOSED TRADES</span>
      </div>

      {trades.length === 0 ? (
        <div className="px-4 py-8 text-center text-gray-600 text-sm">NO CLOSED TRADES</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <TH>SYMBOL</TH>
                <TH>STRATEGY</TH>
                <TH>OPENED</TH>
                <TH>CLOSED</TH>
                <TH right>CREDIT REC.</TH>
                <TH right>CLOSE COST</TH>
                <TH right>P&amp;L</TH>
                <TH right>RETURN</TH>
                <TH>RESULT</TH>
              </tr>
            </thead>
            <tbody>
              {trades.map(t => {
                const pnlColor = colorPnl(t.pnl);
                return (
                  <tr key={t.id} className="table-row-hover">
                    <TD className="text-cyan-300 font-bold">{t.symbol}</TD>
                    <TD>
                      <span className="text-[10px] bg-cyan-400/5 border border-cyan-400/20 px-1.5 py-0.5 text-cyan-400">
                        {t.strategy === 'Call Credit Spread' ? 'CCS' : t.strategy === 'Cash Secured Put' ? 'CSP' : t.strategy.slice(0,3).toUpperCase()}
                      </span>
                    </TD>
                    <TD className="text-gray-500">{t.openDate}</TD>
                    <TD className="text-gray-500">
                      {t.closeDate === 'Expired'
                        ? <span className="text-emerald-600">EXPIRED ✓</span>
                        : t.closeDate}
                    </TD>
                    <TD right className="text-green-400">{fmtRaw$(t.credit)}</TD>
                    <TD right className="text-gray-400">{fmtRaw$(t.closeCost)}</TD>
                    <TD right className={pnlColor}>{fmt$(t.pnl)}</TD>
                    <TD right className={pnlColor}>{fmtPct(t.pnlPct)}</TD>
                    <TD>
                      {t.won ? (
                        <span className="text-[10px] border border-green-400/30 px-1.5 py-0.5 text-green-400 bg-green-400/5">WIN</span>
                      ) : (
                        <span className="text-[10px] border border-red-400/30 px-1.5 py-0.5 text-red-400 bg-red-400/5">LOSS</span>
                      )}
                    </TD>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
