// Demo data shown when API keys are not configured

const BASE = 500_000;

// 90 trading-day delta array — realistic premium selling with two dips below $500k baseline
const DAILY_DELTAS = [
  // Week 1: first positions open, nothing closed yet
  0, 0, 0, 0, 0,
  // Week 2: first small credit realized
  800, 0, 0, 0, 0,
  // Week 3: solid gain then a loss that pushes below baseline
  1200, 0, 0, 0, -3500,
  // Week 4: slow recovery
  0, 0, 0, 2200, 0,
  // Week 5: more recovery
  0, 0, 1800, 0, 0,
  // Week 6: another position goes wrong — brief second dip
  0, 0, 0, -2600, 0,
  // Week 7: recovery, back above baseline for good
  0, 0, 2800, 0, 0,
  // Week 8
  0, 0, 0, 0, 2200,
  // Week 9
  0, 0, 0, 0, 1950,
  // Week 10
  0, 0, 0, 0, 2400,
  // Week 11
  0, 0, 0, 0, 2900,
  // Week 12: quiet week
  0, 0, 0, 0, 0,
  // Week 13: nice pop from multiple closures
  2500, 0, 0, 0, 0,
  // Week 14: moderate loss (market spike)
  0, 0, 0, -2800, 0,
  // Week 15: recovery
  0, 0, 0, 1950, 0,
  // Week 16
  0, 2600, 0, 0, 0,
  // Week 17
  0, 0, 0, 2800, 0,
  // Week 18: final stretch
  0, 2400, 0, 0, 0,
];

// Build 90-day equity curve from deltas
function buildEquityCurve() {
  let equity = BASE;
  return DAILY_DELTAS.map(delta => {
    equity += delta;
    return Math.round(equity * 100) / 100;
  });
}

const EQUITY_90D = buildEquityCurve();

// Generate trading-day timestamps working back from today
function getTradingDayTimestamps(count, endDate = new Date()) {
  const timestamps = [];
  const d = new Date(endDate);
  d.setHours(16, 0, 0, 0); // 4 PM close
  while (timestamps.length < count) {
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) timestamps.unshift(Math.floor(d.getTime() / 1000));
    d.setDate(d.getDate() - 1);
  }
  return timestamps;
}

// Generate intraday 5-min bars for a single trading day
function buildIntraday1D(baseEquity) {
  const timestamps = [];
  const equities = [];
  const now = new Date();
  const open = new Date(now);
  open.setHours(9, 30, 0, 0);

  // 78 bars: 9:30 AM → 4:00 PM (5-min intervals)
  let equity = baseEquity;
  // small-cap random walk within ±0.4%
  const seed = [0, 0.0002, 0, 0.0003, -0.0001, 0.0001, 0.0002, 0, -0.0002, 0.0003,
    0, 0.0001, -0.0001, 0.0002, 0, 0.0001, 0.0002, -0.0001, 0, 0.0002,
    0.0001, 0, -0.0001, 0.0002, 0, 0, 0.0001, 0.0002, -0.0001, 0,
    0.0002, 0, 0.0001, -0.0001, 0.0002, 0, 0.0001, 0, 0.0002, -0.0001,
    0.0001, 0, 0.0002, 0, -0.0001, 0.0001, 0.0002, 0, 0, 0.0001,
    0.0002, -0.0001, 0, 0.0001, 0.0002, 0, -0.0001, 0.0001, 0, 0.0002,
    0.0001, 0, -0.0001, 0.0002, 0, 0.0001, 0, 0.0002, -0.0001, 0.0001,
    0, 0.0002, 0.0001, 0, -0.0001, 0.0001, 0, 0.0001];

  for (let i = 0; i < 78; i++) {
    const t = new Date(open.getTime() + i * 5 * 60 * 1000);
    // Only include bars up to now (or all if market is closed)
    if (t <= now || now < open) {
      timestamps.push(Math.floor(t.getTime() / 1000));
      equity = equity * (1 + (seed[i] || 0));
      equities.push(Math.round(equity * 100) / 100);
    }
  }

  return { timestamps, equities };
}

export function getMockPortfolioData(period) {
  const currentEquity = EQUITY_90D[EQUITY_90D.length - 1];

  if (period === '1D') {
    // Yesterday's close = second to last value, or approximate
    const prevClose = EQUITY_90D[EQUITY_90D.length - 2] || currentEquity;
    const { timestamps, equities } = buildIntraday1D(prevClose);
    return {
      timestamp: timestamps,
      equity: equities,
      base_value: prevClose,
      timeframe: '5Min',
    };
  }

  const allTimestamps = getTradingDayTimestamps(90);

  if (period === '1W') {
    const slice = EQUITY_90D.slice(-5);
    return {
      timestamp: allTimestamps.slice(-5),
      equity: slice,
      base_value: slice[0],
      timeframe: '1D',
    };
  }

  if (period === '1M') {
    const slice = EQUITY_90D.slice(-22);
    return {
      timestamp: allTimestamps.slice(-22),
      equity: slice,
      base_value: slice[0],
      timeframe: '1D',
    };
  }

  // ALL
  return {
    timestamp: allTimestamps,
    equity: EQUITY_90D,
    base_value: BASE,
    timeframe: '1D',
  };
}

// Legacy export — used by useAlpacaData and calcMetrics
export const MOCK_PORTFOLIO = getMockPortfolioData('1M');

export const MOCK_ACCOUNT = {
  id: 'PA3DEMO000001',
  account_number: 'PA3DEMO000001',
  status: 'ACTIVE',
  currency: 'USD',
  cash: '448450.00',
  portfolio_value: '521600.00',
  equity: '521600.00',
  last_equity: '519200.00',
  long_market_value: '73150.00',
  short_market_value: '0.00',
  pattern_day_trader: false,
  trading_blocked: false,
  daytrade_count: 0,
};

// Active option positions (2 call credit spreads + 1 CSP)
export const MOCK_POSITIONS = [
  // SPXW Call Credit Spread — short leg
  {
    symbol: 'SPXW260606C05300000',
    asset_class: 'us_option',
    qty: '-2',
    side: 'short',
    avg_entry_price: '8.50',
    current_price: '3.20',
    lastday_price: '4.10',
    unrealized_pl: '1060.00',
    unrealized_plpc: '0.6235',
    market_value: '-640.00',
    cost_basis: '-1700.00',
  },
  // SPXW Call Credit Spread — long leg
  {
    symbol: 'SPXW260606C05350000',
    asset_class: 'us_option',
    qty: '2',
    side: 'long',
    avg_entry_price: '0.80',
    current_price: '0.60',
    lastday_price: '0.75',
    unrealized_pl: '40.00',
    unrealized_plpc: '0.25',
    market_value: '120.00',
    cost_basis: '160.00',
  },
  // SPY Cash Secured Put
  {
    symbol: 'SPY260620P00535000',
    asset_class: 'us_option',
    qty: '-2',
    side: 'short',
    avg_entry_price: '4.20',
    current_price: '2.35',
    lastday_price: '2.80',
    unrealized_pl: '370.00',
    unrealized_plpc: '0.4405',
    market_value: '-470.00',
    cost_basis: '-840.00',
  },
  // QQQ Call Credit Spread — short leg
  {
    symbol: 'QQQ260620C00490000',
    asset_class: 'us_option',
    qty: '-3',
    side: 'short',
    avg_entry_price: '3.80',
    current_price: '3.05',
    lastday_price: '3.20',
    unrealized_pl: '225.00',
    unrealized_plpc: '0.1974',
    market_value: '-915.00',
    cost_basis: '-1140.00',
  },
  // QQQ Call Credit Spread — long leg
  {
    symbol: 'QQQ260620C00500000',
    asset_class: 'us_option',
    qty: '3',
    side: 'long',
    avg_entry_price: '0.60',
    current_price: '0.45',
    lastday_price: '0.50',
    unrealized_pl: '45.00',
    unrealized_plpc: '0.25',
    market_value: '135.00',
    cost_basis: '180.00',
  },
];

// Closed trade pairs for history
export const MOCK_ORDERS = [
  {
    id: 'order-001', symbol: 'SPXW260523C05200000', side: 'sell',
    status: 'filled', filled_qty: '2', filled_avg_price: '9.20',
    filled_at: new Date(Date.now() - 22 * 86400000).toISOString(),
  },
  {
    id: 'order-002', symbol: 'SPXW260523C05200000', side: 'buy',
    status: 'filled', filled_qty: '2', filled_avg_price: '2.76',
    filled_at: new Date(Date.now() - 8 * 86400000).toISOString(),
  },
  {
    id: 'order-003', symbol: 'SPY260509P00520000', side: 'sell',
    status: 'filled', filled_qty: '2', filled_avg_price: '3.85',
    filled_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 'order-004', symbol: 'SPY260509P00520000', side: 'buy',
    status: 'filled', filled_qty: '2', filled_avg_price: '0.05',
    filled_at: new Date(Date.now() - 17 * 86400000).toISOString(),
  },
  {
    id: 'order-005', symbol: 'QQQ260516C00475000', side: 'sell',
    status: 'filled', filled_qty: '3', filled_avg_price: '4.10',
    filled_at: new Date(Date.now() - 28 * 86400000).toISOString(),
  },
  {
    id: 'order-006', symbol: 'QQQ260516C00475000', side: 'buy',
    status: 'filled', filled_qty: '3', filled_avg_price: '1.44',
    filled_at: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
  {
    id: 'order-007', symbol: 'SPY260502P00515000', side: 'sell',
    status: 'filled', filled_qty: '2', filled_avg_price: '3.60',
    filled_at: new Date(Date.now() - 35 * 86400000).toISOString(),
  },
  {
    id: 'order-008', symbol: 'SPY260502P00515000', side: 'buy',
    status: 'filled', filled_qty: '2', filled_avg_price: '6.80',
    filled_at: new Date(Date.now() - 24 * 86400000).toISOString(),
  },
  {
    id: 'order-009', symbol: 'SPXW260430C05150000', side: 'sell',
    status: 'filled', filled_qty: '2', filled_avg_price: '8.75',
    filled_at: new Date(Date.now() - 40 * 86400000).toISOString(),
  },
  {
    id: 'order-010', symbol: 'SPXW260430C05150000', side: 'buy',
    status: 'filled', filled_qty: '2', filled_avg_price: '0.05',
    filled_at: new Date(Date.now() - 26 * 86400000).toISOString(),
  },
  {
    id: 'order-011', symbol: 'SPY260425C00560000', side: 'sell',
    status: 'filled', filled_qty: '2', filled_avg_price: '5.20',
    filled_at: new Date(Date.now() - 45 * 86400000).toISOString(),
  },
  {
    id: 'order-012', symbol: 'SPY260425C00560000', side: 'buy',
    status: 'filled', filled_qty: '2', filled_avg_price: '2.60',
    filled_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 'order-013', symbol: 'QQQ260418P00455000', side: 'sell',
    status: 'filled', filled_qty: '3', filled_avg_price: '4.40',
    filled_at: new Date(Date.now() - 50 * 86400000).toISOString(),
  },
  {
    id: 'order-014', symbol: 'QQQ260418P00455000', side: 'buy',
    status: 'filled', filled_qty: '3', filled_avg_price: '1.32',
    filled_at: new Date(Date.now() - 34 * 86400000).toISOString(),
  },
  {
    id: 'order-015', symbol: 'SPXW260411C05050000', side: 'sell',
    status: 'filled', filled_qty: '2', filled_avg_price: '7.60',
    filled_at: new Date(Date.now() - 55 * 86400000).toISOString(),
  },
  {
    id: 'order-016', symbol: 'SPXW260411C05050000', side: 'buy',
    status: 'filled', filled_qty: '2', filled_avg_price: '14.20',
    filled_at: new Date(Date.now() - 42 * 86400000).toISOString(),
  },
  {
    id: 'order-017', symbol: 'SPY260404P00505000', side: 'sell',
    status: 'filled', filled_qty: '2', filled_avg_price: '3.20',
    filled_at: new Date(Date.now() - 58 * 86400000).toISOString(),
  },
  {
    id: 'order-018', symbol: 'SPY260404P00505000', side: 'buy',
    status: 'filled', filled_qty: '2', filled_avg_price: '0.05',
    filled_at: new Date(Date.now() - 44 * 86400000).toISOString(),
  },
  {
    id: 'order-019', symbol: 'QQQ260328C00465000', side: 'sell',
    status: 'filled', filled_qty: '2', filled_avg_price: '4.85',
    filled_at: new Date(Date.now() - 62 * 86400000).toISOString(),
  },
  {
    id: 'order-020', symbol: 'QQQ260328C00465000', side: 'buy',
    status: 'filled', filled_qty: '2', filled_avg_price: '1.94',
    filled_at: new Date(Date.now() - 48 * 86400000).toISOString(),
  },
];

// Activity log entries
export function buildActivityLog(positions, trades) {
  const now = Date.now();
  const log = [
    { ts: now - 2000,            level: 'INFO',    msg: 'DATA_FETCH: Portfolio data refreshed successfully' },
    { ts: now - 180000,          level: 'INFO',    msg: 'RISK_CHECK: VIX at 18.3 — all systems clear for new positions' },
    { ts: now - 3600000,         level: 'SUCCESS', msg: 'SIGNAL: SPXW CCS at 62% profit — monitoring for close target' },
    { ts: now - 7200000,         level: 'INFO',    msg: 'SCHEDULE: Next market scan in 15 minutes' },
    { ts: now - 1 * 86400000,    level: 'SUCCESS', msg: 'EXECUTED: Opened QQQ 490/500 Call Spread @ $3.20 net credit (x3)' },
    { ts: now - 1.2 * 86400000,  level: 'INFO',    msg: 'SCAN: Checked 47 strike candidates — 3 passed all filters' },
    { ts: now - 2 * 86400000,    level: 'SUCCESS', msg: 'CLOSED: SPY 535P @ $0.90 debit — P&L: +$370 (+44%)' },
    { ts: now - 2.5 * 86400000,  level: 'WARNING', msg: 'RISK: Position size check — 3/3 slots used, no new trades' },
    { ts: now - 3 * 86400000,    level: 'SUCCESS', msg: 'EXECUTED: Opened SPY 535 CSP @ $4.20 credit (x2)' },
    { ts: now - 3.5 * 86400000,  level: 'INFO',    msg: 'MARKET_CLOSE: EOD sweep complete — all positions nominal' },
  ];

  return log
    .sort((a, b) => b.ts - a.ts)
    .slice(0, 10)
    .map(entry => ({
      ...entry,
      time: new Date(entry.ts).toLocaleString('en-US', {
        month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: false,
      }),
    }));
}
