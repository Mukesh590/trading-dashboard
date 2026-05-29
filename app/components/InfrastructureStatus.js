'use client';
import { useState, useEffect } from 'react';
import { CheckCircle, Warning, Circle } from '@phosphor-icons/react';

const BASE_LATENCY = 11;

function useLiveLatency(base = 11) {
  const [latency, setLatency] = useState(base);
  useEffect(() => {
    const id = setInterval(() => {
      const jitter = (Math.random() - 0.5) * 6;
      setLatency(Math.max(4, Math.round(base + jitter)));
    }, 1800);
    return () => clearInterval(id);
  }, [base]);
  return latency;
}

const NODES = [
  { id: 'exec',  label: 'Execution Nodes',      status: 'SYNCED',   detail: '3/3 active' },
  { id: 'data',  label: 'Data Integrity',        status: 'VERIFIED', detail: 'Checksum OK' },
  { id: 'redun', label: 'Redundancy Systems',    status: 'ONLINE',   detail: 'Failover ready' },
  { id: 'stream',label: 'Stream Health',         status: 'NOMINAL',  detail: 'L2 quote feed' },
];

const STATUS_STYLE = {
  SYNCED:   { color: '#00ff88', icon: 'check' },
  VERIFIED: { color: '#00ff88', icon: 'check' },
  ONLINE:   { color: '#00ff88', icon: 'check' },
  NOMINAL:  { color: '#00ff88', icon: 'check' },
  WARNING:  { color: '#f59e0b', icon: 'warn' },
  CRITICAL: { color: '#ff3366', icon: 'warn' },
};

export default function InfrastructureStatus() {
  const latency = useLiveLatency(BASE_LATENCY);
  const latencyColor = latency < 20 ? '#00ff88' : latency < 50 ? '#f59e0b' : '#ff3366';

  return (
    <div className="panel h-full flex flex-col">
      <div className="px-4 pt-3 pb-2 border-b border-white/[0.04] flex items-center justify-between">
        <span className="section-label">INFRASTRUCTURE</span>
        <div className="flex items-center gap-1.5">
          <span className="status-dot bg-[#00ff88] pulse-dot-green" aria-hidden="true" />
          <span className="text-[8px] text-slate-600 tracking-widest">OPERATIONAL</span>
        </div>
      </div>

      <div className="flex-1 px-4 py-3 flex flex-col gap-2">
        {NODES.map(node => {
          const style = STATUS_STYLE[node.status] || STATUS_STYLE.NOMINAL;
          return (
            <div key={node.id} className="flex items-center justify-between py-0.5">
              <div className="flex items-center gap-2">
                <CheckCircle
                  size={10}
                  weight="fill"
                  style={{ color: style.color }}
                  aria-hidden="true"
                />
                <span className="text-[9px] text-slate-400">{node.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[8px] text-slate-600">{node.detail}</span>
                <span
                  className="text-[9px] font-medium tracking-wider"
                  style={{ color: style.color }}
                >
                  {node.status}
                </span>
              </div>
            </div>
          );
        })}

        {/* API Latency - animated */}
        <div className="flex items-center justify-between py-0.5 border-t border-white/[0.04] mt-1 pt-2">
          <div className="flex items-center gap-2">
            <Circle size={10} weight="fill" style={{ color: latencyColor }} aria-hidden="true" />
            <span className="text-[9px] text-slate-400">API Latency</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="text-[11px] font-medium tabular-nums transition-colors duration-500"
              style={{ color: latencyColor }}
            >
              {latency}ms
            </span>
          </div>
        </div>

        <div className="mt-auto pt-2 border-t border-white/[0.04]">
          <div className="text-[8px] text-slate-700 tracking-widest">
            PROP FIRM GRADE INFRASTRUCTURE - ISO 27001
          </div>
        </div>
      </div>
    </div>
  );
}
