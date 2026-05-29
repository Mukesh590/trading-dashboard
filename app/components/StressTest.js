'use client';
import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const SCENARIOS = [
  { label: '2008 GFC',        drawdown: -38.4, color: '#ff3366',  duration: '18 months' },
  { label: '2020 COVID',      drawdown: -14.2, color: '#f59e0b',  duration: '33 days' },
  { label: '2022 Bear',       drawdown: -11.8, color: '#f59e0b',  duration: '9 months' },
  { label: 'Flash Crash',     drawdown: -6.1,  color: '#00d4ff',  duration: '1 day' },
  { label: 'Baseline',        drawdown: -2.3,  color: '#94a3b8',  duration: 'current' },
];

export default function StressTest() {
  const chartRef = useRef(null);
  const instanceRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current) return;
    const ctx = chartRef.current.getContext('2d');
    if (instanceRef.current) instanceRef.current.destroy();

    instanceRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: SCENARIOS.map(s => s.label),
        datasets: [{
          data: SCENARIOS.map(s => Math.abs(s.drawdown)),
          backgroundColor: SCENARIOS.map(s => s.color + '40'),
          borderColor:     SCENARIOS.map(s => s.color),
          borderWidth: 1,
          borderRadius: 2,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        animation: { duration: 700 },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => ` -${ctx.raw.toFixed(1)}% projected drawdown`,
            },
            bodyFont: { family: 'var(--font-mono)', size: 10 },
            backgroundColor: 'rgba(13,13,22,0.95)',
            borderColor: 'rgba(255,255,255,0.08)',
            borderWidth: 1,
          },
        },
        scales: {
          x: {
            reverse: false,
            grid: { color: 'rgba(255,255,255,0.04)' },
            border: { display: false },
            ticks: {
              color: '#475569',
              font: { family: 'var(--font-mono)', size: 9 },
              callback: v => `-${v}%`,
            },
          },
          y: {
            grid: { display: false },
            border: { display: false },
            ticks: {
              color: '#64748b',
              font: { family: 'var(--font-mono)', size: 9 },
            },
          },
        },
      },
    });

    return () => { if (instanceRef.current) instanceRef.current.destroy(); };
  }, []);

  return (
    <div className="panel h-full flex flex-col">
      <div className="px-4 pt-3 pb-2 border-b border-white/[0.04] flex items-center justify-between">
        <span className="section-label">PORTFOLIO STRESS TEST</span>
        <span className="text-[8px] text-slate-600 tracking-widest">PROJECTED DD</span>
      </div>

      <div className="flex-1 px-4 py-3 flex flex-col gap-3">
        <div className="flex-1" style={{ minHeight: '160px' }}>
          <canvas ref={chartRef} aria-label="Portfolio stress test drawdown chart" role="img" />
        </div>

        <div className="border-t border-white/[0.04] pt-3 grid grid-cols-1 gap-1">
          {SCENARIOS.map(s => (
            <div key={s.label} className="flex items-center justify-between text-[9px]">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: s.color }} aria-hidden="true" />
                <span className="text-slate-500">{s.label}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-slate-600">{s.duration}</span>
                <span className="tabular-nums font-medium" style={{ color: s.color }}>
                  {s.drawdown.toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="text-[8px] text-slate-700 tracking-wider border-t border-white/[0.04] pt-2">
          BASED ON CURRENT POSITION SIZING - SIMULATED SCENARIOS
        </div>
      </div>
    </div>
  );
}
