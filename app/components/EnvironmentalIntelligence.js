'use client';
import { useEffect, useState } from 'react';

function useSessionData() {
  const [data, setData] = useState(null);

  useEffect(() => {
    function calc() {
      const now = new Date();
      const et  = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
      const h   = et.getHours(), m = et.getMinutes(), d = et.getDay();
      const mins = h * 60 + m;

      let session, londonCarryover, usOpenLiquidity;

      if (d === 0 || d === 6) {
        session = 'Weekend - Markets Closed';
        londonCarryover = 'N/A';
        usOpenLiquidity = 'N/A';
      } else if (mins >= 240 && mins < 510) {
        session = 'Pre-Market';
        londonCarryover = 'Active';
        usOpenLiquidity = 'Forming';
      } else if (mins >= 510 && mins < 600) {
        session = 'US Open - High Activity';
        londonCarryover = 'Elevated volatility';
        usOpenLiquidity = 'Detected';
      } else if (mins >= 600 && mins < 780) {
        session = 'US Midday';
        londonCarryover = 'Fading';
        usOpenLiquidity = 'Normalizing';
      } else if (mins >= 780 && mins < 960) {
        session = 'US Regular Hours';
        londonCarryover = 'Resolved';
        usOpenLiquidity = 'Normal';
      } else if (mins >= 960 && mins < 1080) {
        session = 'After-Hours';
        londonCarryover = 'N/A';
        usOpenLiquidity = 'Thin';
      } else {
        session = 'Overnight';
        londonCarryover = 'Asia handoff';
        usOpenLiquidity = 'N/A';
      }

      const hasVolumeAnomaly = mins >= 570 && mins <= 600; // open window

      setData({ session, londonCarryover, usOpenLiquidity, hasVolumeAnomaly });
    }
    calc();
    const id = setInterval(calc, 60000);
    return () => clearInterval(id);
  }, []);

  return data;
}

const INDICATOR_STYLE = (val) => {
  if (val === 'N/A' || val === 'Resolved' || val === 'Normal' || val === 'Fading') {
    return { color: '#94a3b8' };
  }
  if (val === 'Active' || val === 'Detected' || val === 'Elevated volatility' || val === 'Forming') {
    return { color: '#f59e0b' };
  }
  if (val === 'Asia handoff' || val === 'Normalizing') {
    return { color: '#00d4ff' };
  }
  return { color: '#475569' };
};

export default function EnvironmentalIntelligence() {
  const data = useSessionData();

  if (!data) return (
    <div className="panel h-full flex items-center justify-center">
      <div className="skeleton w-3/4 h-4" />
    </div>
  );

  const rows = [
    { label: 'Session',                   value: data.session },
    { label: 'London Carryover',          value: data.londonCarryover },
    { label: 'US Open Liquidity Imbalance', value: data.usOpenLiquidity === 'Detected' ? 'Detected' : data.usOpenLiquidity },
    { label: 'Volume Anomaly',            value: data.hasVolumeAnomaly ? 'Detected' : 'None' },
  ];

  return (
    <div className="panel h-full flex flex-col">
      <div className="px-4 pt-3 pb-2 border-b border-white/[0.04]">
        <span className="section-label">ENVIRONMENTAL INTELLIGENCE</span>
      </div>

      <div className="flex-1 px-4 py-3 flex flex-col gap-2">
        {rows.map(row => {
          const style = INDICATOR_STYLE(row.value);
          return (
            <div key={row.label} className="flex items-start justify-between gap-2 py-0.5">
              <span className="text-[9px] text-slate-500 shrink-0">{row.label}</span>
              <span
                className="text-[9px] font-medium text-right"
                style={style}
              >
                {row.value}
              </span>
            </div>
          );
        })}

        <div className="mt-auto pt-2 border-t border-white/[0.04] text-[8px] text-slate-700">
          CROSS-VENUE INTELLIGENCE FEED
        </div>
      </div>
    </div>
  );
}
