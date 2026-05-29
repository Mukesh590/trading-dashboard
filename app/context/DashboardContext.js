'use client';
import { createContext, useContext, useState, useMemo } from 'react';

export const OPERATOR_MODES = ['EXECUTION', 'RESEARCH', 'RISK', 'WAR_ROOM'];

const DashboardContext = createContext(null);

export function DashboardProvider({ children, metrics, positions, vix = 18.3 }) {
  const [operatorMode, setOperatorMode] = useState('EXECUTION');

  const equity      = parseFloat(metrics?.equity  ?? 521600);
  const todayPnL    = parseFloat(metrics?.todayPnL ?? 0);
  const drawdownPct = Math.abs(Math.min(0, (todayPnL / equity) * 100));
  const hasPositions = positions?.length > 0;
  // stress: 0 = nominal, 1 = critical (at 2.5% DD limit)
  const stressLevel  = Math.min(drawdownPct / 2.5, 1);
  const underStress  = drawdownPct >= 1.0;
  const vixRegime    = vix < 15 ? 'low' : vix < 20 ? 'normal' : vix < 28 ? 'elevated' : 'high';

  const value = useMemo(() => ({
    operatorMode, setOperatorMode,
    vix, vixRegime,
    drawdownPct, stressLevel, underStress,
    hasPositions,
  }), [operatorMode, vix, vixRegime, drawdownPct, stressLevel, underStress, hasPositions]);

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export const useDashboard = () => {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error('useDashboard must be used inside DashboardProvider');
  return ctx;
};
