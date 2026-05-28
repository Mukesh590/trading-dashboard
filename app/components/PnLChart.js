'use client';
import { useRef, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { buildChartData } from '../lib/utils';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

function buildDataset(chartData) {
  const lastPnl = chartData.pnl[chartData.pnl.length - 1] || 0;
  const isPositive = lastPnl >= 0;

  return {
    labels: chartData.labels,
    datasets: [
      {
        label: 'Portfolio Value',
        data: chartData.equity,
        borderColor: isPositive ? '#22d3ee' : '#f87171',
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointHoverBackgroundColor: isPositive ? '#22d3ee' : '#f87171',
        tension: 0.3,
        fill: true,
        backgroundColor: (ctx) => {
          const canvas = ctx.chart.canvas;
          const gradient = canvas.getContext('2d').createLinearGradient(0, 0, 0, canvas.height);
          if (isPositive) {
            gradient.addColorStop(0, 'rgba(34,211,238,0.25)');
            gradient.addColorStop(0.6, 'rgba(34,211,238,0.05)');
            gradient.addColorStop(1, 'rgba(34,211,238,0)');
          } else {
            gradient.addColorStop(0, 'rgba(248,113,113,0.25)');
            gradient.addColorStop(0.6, 'rgba(248,113,113,0.05)');
            gradient.addColorStop(1, 'rgba(248,113,113,0)');
          }
          return gradient;
        },
      },
      {
        label: 'P&L',
        data: chartData.pnl,
        borderColor: isPositive ? '#4ade80' : '#f87171',
        borderWidth: 1.5,
        borderDash: [4, 4],
        pointRadius: 0,
        tension: 0.3,
        fill: false,
        yAxisID: 'pnl',
      },
    ],
  };
}

const OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index', intersect: false },
  plugins: {
    legend: {
      position: 'top',
      align: 'end',
      labels: {
        color: '#6b7280',
        font: { family: "'Courier New', monospace", size: 11 },
        boxWidth: 12,
        padding: 12,
      },
    },
    tooltip: {
      backgroundColor: '#0a120a',
      borderColor: '#22d3ee',
      borderWidth: 1,
      titleColor: '#22d3ee',
      bodyColor: '#d1fae5',
      bodyFont: { family: "'Courier New', monospace", size: 12 },
      titleFont: { family: "'Courier New', monospace", size: 11 },
      padding: 10,
      callbacks: {
        label: ctx => {
          const val = ctx.parsed.y;
          const prefix = ctx.dataset.label === 'P&L' ? (val >= 0 ? '+$' : '-$') : '$';
          return ` ${ctx.dataset.label}: ${prefix}${Math.abs(val).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
        },
      },
    },
  },
  scales: {
    x: {
      grid: { color: 'rgba(255,255,255,0.03)', drawTicks: false },
      ticks: { color: '#374151', font: { family: "'Courier New', monospace", size: 10 }, maxTicksLimit: 10 },
      border: { color: '#1a2e1a' },
    },
    y: {
      position: 'left',
      grid: { color: 'rgba(255,255,255,0.04)', drawTicks: false },
      ticks: {
        color: '#6b7280',
        font: { family: "'Courier New', monospace", size: 10 },
        callback: v => `$${(v / 1000).toFixed(0)}k`,
      },
      border: { color: '#1a2e1a' },
    },
    pnl: {
      position: 'right',
      grid: { display: false },
      ticks: {
        color: '#6b7280',
        font: { family: "'Courier New', monospace", size: 10 },
        callback: v => (v >= 0 ? '+$' : '-$') + Math.abs(v / 1000).toFixed(1) + 'k',
      },
      border: { color: '#1a2e1a' },
    },
  },
};

export default function PnLChart({ portfolio }) {
  const chartData = buildChartData(portfolio);

  return (
    <div className="terminal-card p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="text-xs text-cyan-400 tracking-widest font-bold">◈ PORTFOLIO VALUE / P&amp;L — 30D</div>
        <div className="flex gap-4 text-[10px] text-gray-600">
          <span>——&nbsp;EQUITY</span>
          <span className="opacity-60">- - P&amp;L</span>
        </div>
      </div>
      <div className="h-64">
        {chartData ? (
          <Line data={buildDataset(chartData)} options={OPTIONS} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-600 text-sm">
            NO PORTFOLIO DATA
          </div>
        )}
      </div>
    </div>
  );
}
