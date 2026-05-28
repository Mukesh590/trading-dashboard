// Demo data shown when API keys are not configured

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

// 30-day portfolio equity curve (options premium selling: lumpy gains)
const BASE = 100000;
const EQUITY = [
  100000, 100000, 100175, 100175, 100175,
  100175, 100420, 100420, 100420, 100420,
  100695, 100695, 100695, 100940, 100940,
  100940, 101245, 101245, 101245, 101580,
  101580, 101580, 101580, 101965, 101965,
  102280, 102280, 102280, 103040, 103680,
];

function buildTimestamps() {
  const ts = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    ts.push(Math.floor(d.getTime() / 1000));
  }
  return ts;
}

export const MOCK_PORTFOLIO = {
  timestamp: buildTimestamps(),
  equity: EQUITY,
  profit_loss: EQUITY.map(e => e - BASE),
  profit_loss_pct: EQUITY.map(e => (e - BASE) / BASE),
  base_value: BASE,
  timeframe: '1D',
};

export const MOCK_ACCOUNT = {
  id: 'PA3DEMO000001',
  account_number: 'PA3DEMO000001',
  status: 'ACTIVE',
  currency: 'USD',
  cash: '48450.00',
  portfolio_value: '103680.00',
  equity: '103680.00',
  last_equity: '103040.00',
  long_market_value: '55230.00',
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
  // Trade 1: SPXW CCS — closed 70% profit
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
  // Trade 2: SPY CSP — expired worthless
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
  // Trade 3: QQQ CCS — closed 65% profit
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
  // Trade 4: SPY CSP — loss (closed early)
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
  // Trade 5: SPXW CCS — expired worthless
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
  // Trade 6: SPY CCS — 50% profit
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
  // Trade 7: QQQ CSP — 70% profit
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
  // Trade 8: SPXW CCS — loss
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
  // Trade 9: SPY CSP — expired
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
  // Trade 10: QQQ CCS — 60% profit
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
