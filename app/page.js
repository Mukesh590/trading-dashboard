'use client';
import { useAlpacaData } from './hooks/useAlpacaData';
import { calcMetrics, groupPositions } from './lib/utils';
import Header from './components/Header';
import MetricsRow from './components/MetricsRow';
import PnLChart from './components/PnLChart';
import ActivePositions from './components/ActivePositions';
import TradeHistory from './components/TradeHistory';
import StrategyRules from './components/StrategyRules';
import ActivityLog from './components/ActivityLog';

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#050a05] flex items-center justify-center font-mono">
      <div className="text-center space-y-4">
        <div className="text-cyan-400 text-2xl font-bold tracking-widest glow-cyan">
          ⟨ ALGO TRADING BOT ⟩
        </div>
        <div className="text-green-400 text-sm">
          INITIALIZING DASHBOARD<span className="blink">_</span>
        </div>
        <div className="text-gray-700 text-xs mt-4 space-y-1">
          <div>› Connecting to Alpaca Paper Trading API...</div>
          <div>› Loading portfolio history...</div>
          <div>› Fetching active positions...</div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { account, positions, orders, portfolio, loading, demo, lastUpdated, refresh } = useAlpacaData();

  if (loading) return <LoadingScreen />;

  const metrics      = calcMetrics(account, orders, portfolio);
  const activeStrats = groupPositions(positions);

  return (
    <div className="min-h-screen bg-[#050a05] flex flex-col">
      <Header
        online={true}
        demo={demo}
        lastUpdated={lastUpdated}
        onRefresh={refresh}
      />

      <main className="flex-1 px-4 py-4 space-y-4 max-w-[1600px] w-full mx-auto">
        {/* Key Metrics */}
        <section>
          <div className="text-[10px] text-gray-700 tracking-widest mb-2">── PERFORMANCE OVERVIEW ──</div>
          <MetricsRow metrics={metrics} activeCount={activeStrats.length} />
        </section>

        {/* P&L Chart */}
        <section>
          <div className="text-[10px] text-gray-700 tracking-widest mb-2">── PORTFOLIO CHART ──</div>
          <PnLChart demo={demo} />
        </section>

        {/* Active Positions */}
        <section>
          <div className="text-[10px] text-gray-700 tracking-widest mb-2">── OPEN POSITIONS ──</div>
          <ActivePositions positions={positions} />
        </section>

        {/* Trade History + Strategy Rules */}
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2">
            <div className="text-[10px] text-gray-700 tracking-widest mb-2">── CLOSED TRADES ──</div>
            <TradeHistory orders={orders} />
          </div>
          <div>
            <div className="text-[10px] text-gray-700 tracking-widest mb-2">── STRATEGY RULES ──</div>
            <StrategyRules />
          </div>
        </section>

        {/* Activity Log */}
        <section>
          <div className="text-[10px] text-gray-700 tracking-widest mb-2">── BOT LOG ──</div>
          <ActivityLog positions={positions} orders={orders} demo={demo} />
        </section>

        {/* Footer */}
        <footer className="border-t border-green-900/20 pt-3 pb-6 flex flex-wrap items-center justify-between gap-2 text-[10px] text-gray-700">
          <div>ALGO TRADING BOT v1.0.0 — PAPER TRADING MODE</div>
          <div className="flex gap-6 flex-wrap">
            <span>AUTO-REFRESH: 60s</span>
            {demo && <span className="text-yellow-600">⚠ DEMO DATA — SET ALPACA KEYS TO GO LIVE</span>}
            <span>© 2026 MUKESH</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
