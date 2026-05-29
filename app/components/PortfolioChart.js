'use client';
import { useEffect, useRef, useState } from 'react';
import { Chart, registerables } from 'chart.js';
import { getMockPortfolioData } from '../lib/mockData';
import { buildChartData } from '../lib/utils';

Chart.register(...registerables);

const PERIODS = ['1D', '1W', '1M', 'ALL'];

function useFetchPortfolio(period, demo) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (demo) {
      setData(getMockPortfolioData(period));
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`/api/alpaca/portfolio?period=${period}`, { cache: 'no-store' })
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setData(getMockPortfolioData(period)); setLoading(false); });
  }, [period, demo]);

  return { data, loading };
}

export default function PortfolioChart({ demo }) {
  const [period, setPeriod] = useState('1M');
  const { data, loading } = useFetchPortfolio(period, demo);
  const chartRef = useRef(null);
  const instanceRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    if (!chartRef.current || loading || !data) return;
    const ctx = chartRef.current.getContext('2d');
    if (instanceRef.current) instanceRef.current.destroy();

    const chartData = buildChartData(data);
    if (!chartData) return;

    const { labels, equity, pnl } = chartData;
    const base = data.base_value || equity[0];
    const isUp = equity[equity.length - 1] >= base;

    const gradientFill = ctx.createLinearGradient(0, 0, 0, 240);
    if (isUp) {
      gradientFill.addColorStop(0, 'rgba(0,255,136,0.18)');
      gradientFill.addColorStop(0.5, 'rgba(0,255,136,0.05)');
      gradientFill.addColorStop(1, 'rgba(0,255,136,0)');
    } else {
      gradientFill.addColorStop(0, 'rgba(255,51,102,0.18)');
      gradientFill.addColorStop(0.5, 'rgba(255,51,102,0.05)');
      gradientFill.addColorStop(1, 'rgba(255,51,102,0)');
    }

    instanceRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          data: equity,
          borderColor: isUp ? '#00ff88' : '#ff3366',
          borderWidth: 1.5,
          backgroundColor: gradientFill,
          fill: true,
          tension: 0.3,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: isUp ? '#00ff88' : '#ff3366',
          pointHoverBorderColor: '#0a0a0f',
          pointHoverBorderWidth: 2,
          segment: {
            borderColor: ctx => {
              const v0 = ctx.p0.parsed.y, v1 = ctx.p1.parsed.y;
              if (v0 < base && v1 < base) return 'rgba(255,51,102,0.9)';
              return isUp ? 'rgba(0,255,136,0.9)' : 'rgba(255,51,102,0.9)';
            },
          },
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 600, easing: 'easeOutCubic' },
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: false,
            external: ({ chart, tooltip: tt }) => {
              if (tt.opacity === 0) { setTooltip(null); return; }
              const idx = tt.dataPoints?.[0]?.dataIndex ?? 0;
              const val = equity[idx];
              const lbl = labels[idx];
              const delta = val - base;
              setTooltip({
                x: tt.caretX,
                y: tt.caretY,
                label: lbl,
                value: val,
                delta,
              });
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: {
              color: '#475569',
              font: { family: 'var(--font-mono)', size: 9 },
              maxTicksLimit: period === '1D' ? 8 : 6,
              maxRotation: 0,
            },
          },
          y: {
            position: 'right',
            grid: {
              color: 'rgba(255,255,255,0.04)',
              lineWidth: 1,
            },
            border: { display: false, dash: [2, 4] },
            ticks: {
              color: '#475569',
              font: { family: 'var(--font-mono)', size: 9 },
              callback: v => {
                if (v >= 1000000) return `$${(v/1000000).toFixed(1)}M`;
                if (v >= 1000) return `$${(v/1000).toFixed(0)}k`;
                return `$${v}`;
              },
            },
          },
        },
      },
    });

    return () => { if (instanceRef.current) instanceRef.current.destroy(); };
  }, [data, loading, period]);

  const chartData = data ? buildChartData(data) : null;
  const delta = chartData ? chartData.equity[chartData.equity.length - 1] - (data.base_value || chartData.equity[0]) : 0;
  const deltaColor = delta >= 0 ? 'text-[#00ff88]' : 'text-[#ff3366]';

  return (
    <div className="panel panel-cyan h-full flex flex-col">
      <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-white/[0.04]">
        <div className="flex items-center gap-3">
          <span className="section-label">PORTFOLIO EQUITY</span>
          {!loading && chartData && (
            <span className={`text-[10px] tabular-nums font-medium ${deltaColor}`}>
              {delta >= 0 ? '+' : ''}{delta.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
          )}
        </div>
        <div className="flex gap-1" role="group" aria-label="Time period selection">
          {PERIODS.map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              aria-pressed={period === p}
              className={`text-[9px] tracking-[0.12em] px-2 py-1 rounded-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00d4ff] focus-visible:outline-offset-1 ${
                period === p
                  ? 'bg-[rgba(0,212,255,0.12)] text-[#00d4ff] border border-[rgba(0,212,255,0.3)]'
                  : 'text-slate-500 border border-transparent hover:text-slate-300 hover:border-white/[0.08]'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 relative px-2 pb-3 pt-2" style={{ minHeight: '200px' }}>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="skeleton w-full h-full mx-2" />
          </div>
        )}
        <canvas ref={chartRef} aria-label="Portfolio equity chart" role="img" />

        {/* Tooltip */}
        {tooltip && (
          <div
            className="absolute pointer-events-none z-10 px-2.5 py-2 rounded-sm border border-white/10 text-[10px]"
            style={{
              left: tooltip.x,
              top: Math.max(8, tooltip.y - 56),
              transform: 'translateX(-50%)',
              background: 'rgba(13,13,22,0.95)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <div className="text-slate-400 tabular-nums">{tooltip.label}</div>
            <div className="text-white font-medium tabular-nums">
              ${tooltip.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className={`tabular-nums ${tooltip.delta >= 0 ? 'text-[#00ff88]' : 'text-[#ff3366]'}`}>
              {tooltip.delta >= 0 ? '+' : ''}{tooltip.delta.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
