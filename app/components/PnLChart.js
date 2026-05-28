'use client';
import { useState, useEffect, useCallback } from 'react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { getMockPortfolioData } from '../lib/mockData';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler);

const PERIODS = ['1D', '1W', '1M', 'ALL'];

function interpolateNulls(arr) {
  const out = [...arr];
  for (let i = 0; i < out.length; i++) {
    if (out[i] == null) {
      const prev = i > 0 ? out[i - 1] : null;
      let j = i + 1;
      while (j < out.length && out[j] == null) j++;
      const next = j < out.length ? out[j] : prev;
      if (prev != null && next != null) {
        const steps = j - i + 1;
        for (let k = i; k < j; k++) {
          out[k] = prev + (next - prev) * ((k - i + 1) / steps);
        }
      }
    }
  }
  return out;
}

function formatAxisLabel(ts, period) {
  const d = new Date(ts * 1000);
  if (period === '1D') {
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  }
  if (period === '1W') {
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatTooltipDate(ts, period) {
  const d = new Date(ts * 1000);
  if (period === '1D') {
    return d.toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: false,
    });
  }
  return d.toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  });
}

function buildChartConfig(timestamps, equities, baseline, period) {
  const tooltipDates = timestamps.map(ts => formatTooltipDate(ts, period));
  const labels = timestamps.map(ts => formatAxisLabel(ts, period));

  const makeGradient = (ctx) => {
    const chart = ctx.chart;
    const { chartArea, scales } = chart;
    if (!chartArea || !scales.y) return 'rgba(34,197,94,0.08)';
    const yBase = scales.y.getPixelForValue(baseline);
    const top = chartArea.top;
    const bottom = chartArea.bottom;
    const frac = Math.max(0.001, Math.min(0.999, (yBase - top) / (bottom - top)));
    const grad = chart.ctx.createLinearGradient(0, top, 0, bottom);
    grad.addColorStop(0, 'rgba(34,197,94,0.25)');
    grad.addColorStop(Math.max(0, frac - 0.001), 'rgba(34,197,94,0.04)');
    grad.addColorStop(frac, 'rgba(239,68,68,0.04)');
    grad.addColorStop(Math.min(1, frac + 0.001), 'rgba(239,68,68,0.04)');
    grad.addColorStop(1, 'rgba(239,68,68,0.22)');
    return grad;
  };

  const data = {
    labels,
    datasets: [{
      label: 'Portfolio Value',
      data: equities,
      borderColor: '#22c55e',
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 5,
      pointHoverBackgroundColor: '#22d3ee',
      pointHoverBorderColor: '#22d3ee',
      pointHoverBorderWidth: 2,
      tension: 0.35,
      fill: { value: baseline },
      backgroundColor: makeGradient,
      segment: {
        borderColor: ctx => {
          const mid = (ctx.p0.parsed.y + ctx.p1.parsed.y) / 2;
          return mid >= baseline ? '#22c55e' : '#ef4444';
        },
      },
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 250 },
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#050f05',
        borderColor: '#22d3ee',
        borderWidth: 1,
        titleColor: '#6b7280',
        bodyColor: '#d1fae5',
        bodyFont: { family: "'Courier New', monospace", size: 12 },
        titleFont: { family: "'Courier New', monospace", size: 10 },
        padding: 12,
        callbacks: {
          title: ([ctx]) => tooltipDates[ctx.dataIndex] ?? ctx.label,
          label: ctx => {
            const val = ctx.parsed.y;
            const diff = val - baseline;
            const pct = ((diff / baseline) * 100).toFixed(2);
            const sign = diff >= 0 ? '+' : '';
            return [
              `  $${val.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
              `  ${sign}$${Math.abs(diff).toLocaleString('en-US', { minimumFractionDigits: 2 })} (${sign}${pct}%)`,
            ];
          },
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.04)', drawTicks: false },
        ticks: {
          color: '#4b5563',
          font: { family: "'Courier New', monospace", size: 10 },
          maxTicksLimit: 8,
          maxRotation: 0,
        },
        border: { color: '#1a2e1a' },
      },
      y: {
        position: 'right',
        grid: { color: 'rgba(255,255,255,0.04)', drawTicks: false },
        ticks: {
          color: '#4b5563',
          font: { family: "'Courier New', monospace", size: 10 },
          callback: v => `$${(v / 1000).toFixed(0)}k`,
        },
        border: { color: '#1a2e1a' },
      },
    },
  };

  return { data, options };
}

export default function PnLChart({ demo }) {
  const [period, setPeriod] = useState('1M');
  const [chartState, setChartState] = useState({ data: null, options: null, baseline: 0, loading: true });

  const load = useCallback(async (p) => {
    setChartState(s => ({ ...s, loading: true }));

    let portfolio;
    if (demo) {
      portfolio = getMockPortfolioData(p);
    } else {
      try {
        const res = await fetch(`/api/alpaca/portfolio?period=${p}`, { cache: 'no-store' });
        portfolio = await res.json();
      } catch {
        portfolio = getMockPortfolioData(p);
      }
    }

    if (!portfolio?.timestamp?.length) {
      setChartState({ data: null, options: null, baseline: 0, loading: false });
      return;
    }

    const timestamps = portfolio.timestamp;
    const equities = interpolateNulls(portfolio.equity ?? []);

    // Drop leading zero/null values (pre-account-creation)
    const firstValid = equities.findIndex(v => v > 0);
    const ts = firstValid > 0 ? timestamps.slice(firstValid) : timestamps;
    const eq = firstValid > 0 ? equities.slice(firstValid) : equities;

    const baseline = portfolio.base_value ?? eq[0] ?? 500_000;
    const { data, options } = buildChartConfig(ts, eq, baseline, p);

    setChartState({ data, options, baseline, loading: false });
  }, [demo]);

  useEffect(() => { load(period); }, [period, load]);

  const lastVal = chartState.data?.datasets?.[0]?.data?.slice(-1)?.[0] ?? 0;
  const diff = lastVal - chartState.baseline;
  const pct = chartState.baseline > 0 ? ((diff / chartState.baseline) * 100).toFixed(2) : '0.00';
  const isUp = diff >= 0;

  return (
    <div className="terminal-card p-4">
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-xs text-cyan-400 tracking-widest font-bold mb-1">◈ PORTFOLIO VALUE</div>
          {!chartState.loading && lastVal > 0 && (
            <div className="flex items-baseline gap-3">
              <span className="text-lg font-bold text-green-300 font-mono">
                ${lastVal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <span className={`text-xs font-mono ${isUp ? 'text-green-400' : 'text-red-400'}`}>
                {isUp ? '+' : '-'}${Math.abs(diff).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                &nbsp;({isUp ? '+' : ''}{pct}%)
              </span>
            </div>
          )}
        </div>

        {/* Period zoom buttons */}
        <div className="flex gap-1">
          {PERIODS.map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={[
                'px-2.5 py-1 text-[10px] font-mono tracking-widest border transition-colors',
                period === p
                  ? 'border-cyan-400/60 text-cyan-400 bg-cyan-400/10'
                  : 'border-gray-700 text-gray-600 hover:border-gray-500 hover:text-gray-400',
              ].join(' ')}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Chart area */}
      <div className="h-64 relative">
        {chartState.loading && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-600 text-xs tracking-widest">
            LOADING<span className="blink">_</span>
          </div>
        )}
        {!chartState.loading && !chartState.data && (
          <div className="flex items-center justify-center h-full text-gray-600 text-sm">
            NO PORTFOLIO DATA
          </div>
        )}
        {!chartState.loading && chartState.data && (
          <Line data={chartState.data} options={chartState.options} />
        )}
      </div>

      {/* Baseline label */}
      {!chartState.loading && chartState.baseline > 0 && (
        <div className="mt-2 text-[10px] text-gray-700 font-mono">
          BASELINE ${chartState.baseline.toLocaleString('en-US', { minimumFractionDigits: 0 })}
          {period === 'ALL' ? ' — ACCOUNT CREATION' : ` — ${period} START`}
        </div>
      )}
    </div>
  );
}
