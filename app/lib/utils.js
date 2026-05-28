export function fmt$(val, decimals = 2) {
  const num = parseFloat(val) || 0;
  const abs = Math.abs(num).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return num >= 0 ? `+$${abs}` : `-$${abs}`;
}

export function fmtRaw$(val, decimals = 2) {
  const num = parseFloat(val) || 0;
  return `$${Math.abs(num).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

export function fmtPct(val, decimals = 2) {
  const num = parseFloat(val) || 0;
  return `${num >= 0 ? '+' : ''}${num.toFixed(decimals)}%`;
}

export function colorPnl(val) {
  return parseFloat(val) >= 0 ? 'text-green-400' : 'text-red-400';
}

// Parse OCC option symbol: TICKER + YYMMDD + C/P + 8-digit-strike
// e.g. SPY240119C00485000 -> { underlying:'SPY', expiry:'2024-01-19', type:'C', strike:485.00 }
export function parseOptionSymbol(symbol) {
  if (!symbol) return null;
  const m = symbol.match(/^([A-Z1-9]+?)(\d{2})(\d{2})(\d{2})([CP])(\d{8})$/);
  if (!m) return null;
  const [, underlying, yy, mm, dd, type, strikeStr] = m;
  return {
    underlying,
    expiry: `20${yy}-${mm}-${dd}`,
    displayExpiry: `${mm}/${dd}/${yy}`,
    type,
    strike: parseInt(strikeStr) / 1000,
    isCall: type === 'C',
    isPut: type === 'P',
  };
}

function positionStatus(pnl, credit) {
  if (!credit || credit <= 0) return 'OPEN';
  const pct = (pnl / credit) * 100;
  if (pct >= 70) return 'CLOSE NOW';
  if (pct >= 50) return 'CLOSE TARGET';
  if (pct >= 25) return 'WATCHING';
  return 'OPEN';
}

export function statusColor(status) {
  const map = {
    'CLOSE NOW': 'text-red-400 border-red-400/40',
    'CLOSE TARGET': 'text-yellow-400 border-yellow-400/40',
    'WATCHING': 'text-cyan-400 border-cyan-400/40',
    'OPEN': 'text-green-400 border-green-400/40',
  };
  return map[status] || 'text-gray-400 border-gray-400/40';
}

// Group Alpaca positions into option strategies
export function groupPositions(positions) {
  if (!positions?.length) return [];

  const opts = positions.filter(p => parseOptionSymbol(p.symbol));

  const shortCalls = opts.filter(p => parseOptionSymbol(p.symbol)?.isCall && parseFloat(p.qty) < 0);
  const longCalls  = opts.filter(p => parseOptionSymbol(p.symbol)?.isCall && parseFloat(p.qty) > 0);
  const shortPuts  = opts.filter(p => parseOptionSymbol(p.symbol)?.isPut  && parseFloat(p.qty) < 0);

  const result = [];
  const pairedIds = new Set();

  for (const sc of shortCalls) {
    const sp = parseOptionSymbol(sc.symbol);
    const qty = Math.abs(parseFloat(sc.qty));

    const lc = longCalls.find(l => {
      if (pairedIds.has(l.symbol)) return false;
      const lp = parseOptionSymbol(l.symbol);
      return (
        lp?.underlying === sp?.underlying &&
        lp?.expiry === sp?.expiry &&
        Math.abs(parseFloat(l.qty)) === qty &&
        lp?.strike > sp?.strike
      );
    });

    const shortCredit = parseFloat(sc.avg_entry_price) * qty * 100;
    const shortCurrent = parseFloat(sc.current_price) * qty * 100;

    if (lc) {
      pairedIds.add(lc.symbol);
      const lp = parseOptionSymbol(lc.symbol);
      const longCost    = parseFloat(lc.avg_entry_price) * qty * 100;
      const longCurrent = parseFloat(lc.current_price) * qty * 100;
      const netCredit  = shortCredit - longCost;
      const netCurrent = shortCurrent - longCurrent;
      const pnl = netCredit - netCurrent;
      result.push({
        id: sc.symbol,
        symbol: sp?.underlying,
        strategy: 'Call Credit Spread',
        expiry: sp?.displayExpiry,
        strikes: `$${sp?.strike} / $${lp?.strike}`,
        qty,
        entryCredit: netCredit,
        currentValue: netCurrent,
        pnl,
        pnlPct: netCredit > 0 ? (pnl / netCredit) * 100 : 0,
        status: positionStatus(pnl, netCredit),
      });
    } else {
      const pnl = shortCredit - shortCurrent;
      result.push({
        id: sc.symbol,
        symbol: sp?.underlying,
        strategy: 'Naked Call',
        expiry: sp?.displayExpiry,
        strikes: `$${sp?.strike}`,
        qty,
        entryCredit: shortCredit,
        currentValue: shortCurrent,
        pnl,
        pnlPct: shortCredit > 0 ? (pnl / shortCredit) * 100 : 0,
        status: positionStatus(pnl, shortCredit),
      });
    }
  }

  for (const sp of shortPuts) {
    const pp = parseOptionSymbol(sp.symbol);
    const qty = Math.abs(parseFloat(sp.qty));
    const credit  = parseFloat(sp.avg_entry_price) * qty * 100;
    const current = parseFloat(sp.current_price) * qty * 100;
    const pnl = credit - current;
    result.push({
      id: sp.symbol,
      symbol: pp?.underlying,
      strategy: 'Cash Secured Put',
      expiry: pp?.displayExpiry,
      strikes: `$${pp?.strike}`,
      qty,
      entryCredit: credit,
      currentValue: current,
      pnl,
      pnlPct: credit > 0 ? (pnl / credit) * 100 : 0,
      status: positionStatus(pnl, credit),
    });
  }

  return result;
}

// Pair closed orders into round-trip trades
export function pairOrders(orders) {
  if (!orders?.length) return [];

  const sorted = [...orders]
    .filter(o => o.status === 'filled' && o.filled_at)
    .sort((a, b) => new Date(a.filled_at) - new Date(b.filled_at));

  const bySymbol = {};
  for (const o of sorted) {
    if (!bySymbol[o.symbol]) bySymbol[o.symbol] = [];
    bySymbol[o.symbol].push(o);
  }

  const trades = [];

  for (const [symbol, symOrders] of Object.entries(bySymbol)) {
    const parsed = parseOptionSymbol(symbol);
    // For options premium selling: open=sell, close=buy
    // For stocks: open=buy, close=sell
    const opens  = symOrders.filter(o => parsed ? o.side === 'sell' : o.side === 'buy');
    const closes = symOrders.filter(o => parsed ? o.side === 'buy'  : o.side === 'sell');
    const pairs  = Math.min(opens.length, closes.length);

    for (let i = 0; i < pairs; i++) {
      const open  = opens[i];
      const close = closes[i];
      const oQty  = parseFloat(open.filled_qty  || open.qty  || 1);
      const cQty  = parseFloat(close.filled_qty || close.qty || 1);
      const mult  = parsed ? 100 : 1;
      const credit = parseFloat(open.filled_avg_price  || 0) * oQty * mult;
      const debit  = parseFloat(close.filled_avg_price || 0) * cQty * mult;
      const pnl    = parsed ? credit - debit : debit - credit;

      trades.push({
        id: open.id,
        symbol: parsed?.underlying || symbol,
        fullSymbol: symbol,
        strategy: parsed ? (parsed.isCall ? 'Call Credit Spread' : 'Cash Secured Put') : 'Equity',
        openDate:  new Date(open.filled_at).toLocaleDateString('en-US',  { month:'short', day:'numeric', year:'2-digit' }),
        closeDate: new Date(close.filled_at).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'2-digit' }),
        credit,
        closeCost: debit,
        pnl,
        pnlPct: credit > 0 ? (pnl / credit) * 100 : 0,
        won: pnl > 0,
      });
    }

    // Expired worthless = 100% profit
    for (let i = pairs; i < opens.length; i++) {
      const open = opens[i];
      const qty  = parseFloat(open.filled_qty || open.qty || 1);
      const mult = parsed ? 100 : 1;
      const credit = parseFloat(open.filled_avg_price || 0) * qty * mult;
      trades.push({
        id: open.id,
        symbol: parsed?.underlying || symbol,
        fullSymbol: symbol,
        strategy: parsed ? (parsed.isCall ? 'Call Credit Spread' : 'Cash Secured Put') : 'Equity',
        openDate:  new Date(open.filled_at).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'2-digit' }),
        closeDate: 'Expired',
        credit,
        closeCost: 0,
        pnl: credit,
        pnlPct: 100,
        won: true,
      });
    }
  }

  return trades.sort((a, b) => new Date(b.closeDate) - new Date(a.closeDate));
}

// Calculate metrics from raw Alpaca data
export function calcMetrics(account, orders, portfolio) {
  const equity    = parseFloat(account?.equity      || 0);
  const lastEquity = parseFloat(account?.last_equity || equity);
  const base      = parseFloat(portfolio?.base_value || 500_000);

  const totalPnL    = equity - base;
  const totalPnLPct = base > 0 ? (totalPnL / base) * 100 : 0;
  const todayPnL    = equity - lastEquity;
  const todayPnLPct = lastEquity > 0 ? (todayPnL / lastEquity) * 100 : 0;

  const trades = pairOrders(orders);
  const wins   = trades.filter(t => t.won).length;
  const winRate = trades.length > 0 ? (wins / trades.length) * 100 : 0;

  return { equity, totalPnL, totalPnLPct, todayPnL, todayPnLPct, winRate, totalTrades: trades.length };
}

// Build chart dataset from Alpaca portfolio history
export function buildChartData(portfolio) {
  if (!portfolio?.timestamp?.length) return null;
  const base = portfolio.base_value || 100000;
  return {
    labels: portfolio.timestamp.map(ts =>
      new Date(ts * 1000).toLocaleDateString('en-US', { month:'short', day:'numeric' })
    ),
    equity: portfolio.equity,
    pnl: portfolio.profit_loss || portfolio.equity.map(e => e - base),
  };
}
