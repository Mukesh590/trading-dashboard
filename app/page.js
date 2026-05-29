'use client';
import { useState } from 'react';
import { useAlpacaData } from './hooks/useAlpacaData';
import { calcMetrics, groupPositions } from './lib/utils';

import TerminalHeader    from './components/TerminalHeader';
import PortfolioChart    from './components/PortfolioChart';
import MarketRegime      from './components/MarketRegime';
import RiskSentinel      from './components/RiskSentinel';
import LivePositions     from './components/LivePositions';
import StrategyDNA       from './components/StrategyDNA';
import TradeAttribution  from './components/TradeAttribution';
import TradeHistoryTable from './components/TradeHistoryTable';
import AlphaStream       from './components/AlphaStream';
import StressTest        from './components/StressTest';

function LoadingScreen() {
  return (
    <div
      className="min-h-dvh flex items-center justify-center"
      style={{ background: '#0a0a0f', fontFamily: 'var(--font-mono)' }}
      aria-live="polite"
      aria-busy="true"
    >
      <div className="text-center space-y-4">
        <div
          className="text-lg font-light tracking-[0.4em] uppercase glow-cyan"
          style={{ color: '#00d4ff' }}
        >
          QUANT TERMINAL
        </div>
        <div className="text-[10px] tracking-[0.2em] text-slate-500">
          INITIALIZING<span className="blink">_</span>
        </div>
        <div className="space-y-1.5 text-[9px] text-slate-700 text-left max-w-[260px] mx-auto mt-4">
          {[
            'Connecting to Alpaca API...',
            'Loading portfolio history...',
            'Fetching live positions...',
            'Calculating risk metrics...',
          ].map((line, i) => (
            <div key={i} className="flex items-center gap-2">
              <span style={{ color: '#00d4ff' }}>{'>'}</span>
              <span>{line}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { account, positions, orders, portfolio, loading, demo, lastUpdated, refresh } = useAlpacaData();
  const [spinning, setSpinning] = useState(false);

  if (loading) return <LoadingScreen />;

  const metrics    = calcMetrics(account, orders, portfolio, positions);
  const strategies = groupPositions(positions);

  async function handleRefresh() {
    setSpinning(true);
    await refresh();
    setTimeout(() => setSpinning(false), 800);
  }

  return (
    <div className="min-h-dvh scanlines" style={{ background: '#0a0a0f', fontFamily: 'var(--font-mono)' }}>
      {/* Sticky top bar */}
      <TerminalHeader
        metrics={metrics}
        demo={demo}
        lastUpdated={lastUpdated}
        onRefresh={handleRefresh}
        spinning={spinning}
      />

      <main className="max-w-[1800px] mx-auto px-3 py-3 space-y-3">

        {/* ROW 1: Portfolio chart (wide) + Risk sentinel (narrow) */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-3">
          <div style={{ minHeight: '280px' }}>
            <PortfolioChart demo={demo} />
          </div>
          <div>
            <RiskSentinel metrics={metrics} />
          </div>
        </div>

        {/* ROW 2: Market regime full width */}
        <div>
          <MarketRegime />
        </div>

        {/* ROW 3: Live positions */}
        <section aria-label="Live positions">
          <LivePositions positions={strategies} />
        </section>

        {/* ROW 4: Strategy DNA + Trade Attribution */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
          <div>
            <StrategyDNA orders={orders} />
          </div>
          <div>
            <TradeAttribution />
          </div>
        </div>

        {/* ROW 5: Trade History full width */}
        <div style={{ minHeight: '340px' }}>
          <TradeHistoryTable orders={orders} />
        </div>

        {/* ROW 6: Alpha Stream + Stress Test */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
          <div style={{ minHeight: '280px' }}>
            <AlphaStream positions={positions} orders={orders} demo={demo} />
          </div>
          <div>
            <StressTest />
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-white/[0.04] pt-3 pb-6 flex flex-wrap items-center justify-between gap-2">
          <div className="text-[9px] text-slate-700 tracking-[0.15em]">
            QUANT TERMINAL v2.0 - PAPER TRADING
          </div>
          <div className="flex gap-5 flex-wrap text-[9px] text-slate-700 tracking-[0.12em]">
            <span>AUTO-REFRESH 60s</span>
            {demo && <span className="text-amber-800">DEMO DATA - SET ALPACA KEYS TO GO LIVE</span>}
            <span>2026 MUKESH</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
