'use client';
import { useState } from 'react';
import { useAlpacaData } from './hooks/useAlpacaData';
import { calcMetrics, groupPositions } from './lib/utils';
import { DashboardProvider, useDashboard } from './context/DashboardContext';

import TerminalHeader          from './components/TerminalHeader';
import PortfolioChart          from './components/PortfolioChart';
import MarketRegime            from './components/MarketRegime';
import RiskSentinel            from './components/RiskSentinel';
import LivePositions           from './components/LivePositions';
import StrategyDNA             from './components/StrategyDNA';
import TradeAttribution        from './components/TradeAttribution';
import TradeHistoryTable       from './components/TradeHistoryTable';
import AlphaStream             from './components/AlphaStream';
import StressTest              from './components/StressTest';
import StrategicIntent         from './components/StrategicIntent';
import MachineMemory           from './components/MachineMemory';
import InfrastructureStatus    from './components/InfrastructureStatus';
import DecisionVelocity        from './components/DecisionVelocity';
import ProprietarySignals      from './components/ProprietarySignals';
import TemporalStructure       from './components/TemporalStructure';
import EnvironmentalIntelligence from './components/EnvironmentalIntelligence';

const VIX = 18.3;

/* ── Tier label ─────────────────────────────────────────────────── */
function TierLabel({ label }) {
  return (
    <div className="flex items-center gap-3 mb-2">
      <div className="h-px flex-1 bg-white/[0.04]" aria-hidden="true" />
      <span className="text-[8px] tracking-[0.22em] text-slate-700 font-medium">{label}</span>
      <div className="h-px flex-1 bg-white/[0.04]" aria-hidden="true" />
    </div>
  );
}

/* ── Strategic silence overlay ──────────────────────────────────── */
function StrategicSilence() {
  return (
    <div className="panel py-10 flex flex-col items-center justify-center gap-3 text-center">
      <div className="w-1.5 h-1.5 rounded-full bg-slate-600" aria-hidden="true" />
      <div className="text-[11px] text-slate-500 tracking-[0.25em]">MONITORING - NO ACTIVE EXPOSURE</div>
      <div className="text-[9px] text-slate-700 max-w-xs">
        Autonomous engine is scanning for qualifying entries. Discipline maintained.
      </div>
    </div>
  );
}

/* ── Defensive posture banner ───────────────────────────────────── */
function DefensiveBanner({ drawdownPct }) {
  return (
    <div
      className="defensive-banner flex items-center justify-center gap-3 py-1.5 rounded-sm border text-[9px] tracking-[0.18em] font-medium"
      style={{ color: '#f59e0b', borderColor: 'rgba(245,158,11,0.25)', background: 'rgba(245,158,11,0.04)' }}
      role="alert"
      aria-live="polite"
    >
      <span className="status-dot bg-amber-400" aria-hidden="true" />
      DEFENSIVE POSTURE ENGAGED - DRAWDOWN {drawdownPct.toFixed(2)}% - CAPITAL PRESERVATION PRIORITY
    </div>
  );
}

/* ── Inner dashboard (needs context) ───────────────────────────── */
function DashboardInner({ metrics, strategies, positions, orders, demo, lastUpdated, onRefresh, spinning, todayCount }) {
  const { operatorMode, underStress, drawdownPct, hasPositions } = useDashboard();
  const modeClass = `mode-${operatorMode.toLowerCase().replace('_', '-')}`;

  return (
    <div
      className={`min-h-dvh scanlines ${underStress ? 'stress-mode' : ''}`}
      style={{ background: 'var(--bg-base)', fontFamily: 'var(--font-mono)' }}
    >
      <TerminalHeader
        metrics={metrics}
        demo={demo}
        lastUpdated={lastUpdated}
        onRefresh={onRefresh}
        spinning={spinning}
      />

      <main className={`max-w-[1800px] mx-auto px-3 py-3 space-y-2 ${modeClass}`}>

        {/* Defensive posture banner */}
        {underStress && <DefensiveBanner drawdownPct={drawdownPct} />}

        {/* ── TIER 1: COMMAND INTELLIGENCE ────────────────────────── */}
        <div className="tier-command space-y-2">
          <TierLabel label="COMMAND INTELLIGENCE" />
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px_280px] gap-2">
            <StrategicIntent />
            <ProprietarySignals />
            <InfrastructureStatus />
          </div>
        </div>

        {/* ── TIER 2: SITUATIONAL AWARENESS ───────────────────────── */}
        <div className="tier-situational space-y-2">
          <TierLabel label="SITUATIONAL AWARENESS" />
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-2">
            <div style={{ minHeight: '260px' }}>
              <PortfolioChart demo={demo} />
            </div>
            <div className="risk-focus">
              <RiskSentinel metrics={metrics} positions={strategies} todayCount={todayCount} />
            </div>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_240px_240px] gap-2">
            <MarketRegime />
            <TemporalStructure />
            <EnvironmentalIntelligence />
          </div>
        </div>

        {/* ── TIER 3: CURRENT EXPOSURE ─────────────────────────────── */}
        <div className="tier-exposure space-y-2">
          <TierLabel label="CURRENT EXPOSURE" />
          {hasPositions
            ? <LivePositions positions={strategies} todayCount={todayCount} />
            : <StrategicSilence />
          }
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-2">
            <DecisionVelocity />
            <MachineMemory />
            <StrategyDNA orders={orders} compact />
          </div>
        </div>

        {/* ── TIER 4: EXECUTION RECORD + ANALYTICS ─────────────────── */}
        <div className="tier-analytics space-y-2">
          <TierLabel label="EXECUTION RECORD + ANALYTICS" />
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
            <TradeAttribution />
            <StressTest />
          </div>
          <div style={{ minHeight: '320px' }}>
            <TradeHistoryTable orders={orders} />
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
            <div style={{ minHeight: '260px' }}>
              <AlphaStream positions={positions} orders={orders} demo={demo} />
            </div>
            <StrategyDNA orders={orders} />
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-white/[0.04] pt-3 pb-6 flex flex-wrap items-center justify-between gap-2">
          <div className="text-[9px] text-slate-700 tracking-[0.15em]">
            QUANT TERMINAL v3.0 - INTELLIGENCE INFRASTRUCTURE
          </div>
          <div className="flex gap-5 flex-wrap text-[9px] text-slate-700 tracking-[0.12em]">
            <span>MODE: {operatorMode.replace('_', ' ')}</span>
            <span>VIX: {VIX}</span>
            <span>AUTO-REFRESH 60s</span>
          </div>
        </footer>
      </main>
    </div>
  );
}

/* ── Loading screen ─────────────────────────────────────────────── */
function LoadingScreen() {
  return (
    <div
      className="min-h-dvh flex items-center justify-center"
      style={{ background: '#0a0a0f', fontFamily: 'var(--font-mono)' }}
      aria-live="polite"
      aria-busy="true"
    >
      <div className="text-center space-y-4">
        <div className="text-lg font-light tracking-[0.4em] uppercase glow-cyan" style={{ color: '#00d4ff' }}>
          QUANT TERMINAL
        </div>
        <div className="text-[10px] tracking-[0.2em] text-slate-500">
          INITIALIZING INTELLIGENCE INFRASTRUCTURE<span className="blink">_</span>
        </div>
        <div className="space-y-1.5 text-[9px] text-slate-700 text-left max-w-xs mx-auto mt-4">
          {[
            'Connecting to Alpaca execution layer...',
            'Loading portfolio history...',
            'Calibrating volatility framework...',
            'Initializing regime detection...',
            'Syncing proprietary signal stack...',
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

/* ── Root component ─────────────────────────────────────────────── */
export default function Dashboard() {
  const { account, positions, orders, portfolio, loading, demo, lastUpdated, refresh } = useAlpacaData();
  const [spinning, setSpinning] = useState(false);

  if (loading) return <LoadingScreen />;

  const metrics    = calcMetrics(account, orders, portfolio, positions);
  const strategies = groupPositions(positions);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayCount = orders.filter(o =>
    o.side === 'sell' && o.status === 'filled' && o.filled_at && new Date(o.filled_at) >= todayStart
  ).length;

  async function handleRefresh() {
    setSpinning(true);
    await refresh();
    setTimeout(() => setSpinning(false), 800);
  }

  return (
    <DashboardProvider metrics={metrics} positions={strategies} vix={VIX}>
      <DashboardInner
        metrics={metrics}
        strategies={strategies}
        positions={positions}
        orders={orders}
        demo={demo}
        lastUpdated={lastUpdated}
        onRefresh={handleRefresh}
        spinning={spinning}
        todayCount={todayCount}
      />
    </DashboardProvider>
  );
}
