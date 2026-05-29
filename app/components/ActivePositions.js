'use client';
import { groupPositions, fmtRaw$, fmt$, fmtPct, colorPnl, statusColor } from '../lib/utils';
import { MAX_POSITIONS } from '../lib/config';

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

export default function ActivePositions({ positions }) {
  const strategies = groupPositions(positions);

  return (
    <div className="terminal-card">
      <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-green-900/30">
        <div className="text-xs text-cyan-400 tracking-widest font-bold">◉ ACTIVE POSITIONS</div>
        <span className="text-[10px] text-gray-600">{strategies.length} / {MAX_POSITIONS} SLOTS</span>
      </div>

      {strategies.length === 0 ? (
        <div className="px-4 py-8 text-center text-gray-600 text-sm">
          NO OPEN POSITIONS
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <TH>SYMBOL</TH>
                <TH>STRATEGY</TH>
                <TH>EXPIRY</TH>
                <TH>STRIKES</TH>
                <TH right>QTY</TH>
                <TH right>ENTRY CREDIT</TH>
                <TH right>CURRENT VALUE</TH>
                <TH right>P&amp;L</TH>
                <TH right>%</TH>
                <TH>STATUS</TH>
              </tr>
            </thead>
            <tbody>
              {strategies.map(pos => {
                const sc = statusColor(pos.status);
                const pnlColor = colorPnl(pos.pnl);
                return (
                  <tr key={pos.id} className="table-row-hover">
                    <TD className="text-cyan-300 font-bold">{pos.symbol}</TD>
                    <TD className="text-gray-400">
                      <span className="text-[10px] bg-cyan-400/5 border border-cyan-400/20 px-1.5 py-0.5 text-cyan-400">
                        {pos.strategy === 'Call Credit Spread' ? 'CCS' : pos.strategy === 'Cash Secured Put' ? 'CSP' : 'NC'}
                      </span>
                      <span className="ml-2 text-gray-500 hidden lg:inline">{pos.strategy}</span>
                    </TD>
                    <TD className="text-gray-400">{pos.expiry}</TD>
                    <TD className="text-gray-300">{pos.strikes}</TD>
                    <TD right className="text-gray-400">{pos.qty}x</TD>
                    <TD right className="text-green-400">{fmtRaw$(pos.entryCredit)}</TD>
                    <TD right className="text-gray-400">{fmtRaw$(pos.currentValue)}</TD>
                    <TD right className={pnlColor}>{fmt$(pos.pnl)}</TD>
                    <TD right className={pnlColor}>{fmtPct(pos.pnlPct)}</TD>
                    <TD>
                      <span className={`text-[10px] border px-1.5 py-0.5 ${sc}`}>
                        {pos.status}
                      </span>
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
