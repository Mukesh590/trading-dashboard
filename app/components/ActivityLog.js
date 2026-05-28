'use client';
import { buildActivityLog } from '../lib/mockData';

const levelStyle = {
  INFO:    'text-gray-500',
  SUCCESS: 'text-green-400',
  WARNING: 'text-yellow-400',
  ERROR:   'text-red-400',
};

const levelPrefix = {
  INFO:    '[INFO ]',
  SUCCESS: '[  OK ]',
  WARNING: '[ WARN]',
  ERROR:   '[ERROR]',
};

export default function ActivityLog({ positions, orders, demo }) {
  const entries = buildActivityLog(positions, orders);

  return (
    <div className="terminal-card">
      <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-green-900/30">
        <div className="text-xs text-cyan-400 tracking-widest font-bold">▸ BOT ACTIVITY LOG</div>
        <span className="text-[10px] text-gray-600">LAST 10 ENTRIES</span>
      </div>
      <div className="p-3 font-mono text-xs space-y-1 max-h-64 overflow-y-auto">
        {entries.map((entry, i) => (
          <div key={i} className="flex gap-2 group hover:bg-green-400/5 px-1 py-0.5 rounded-sm transition-colors">
            <span className="text-gray-700 shrink-0 hidden sm:block">{entry.time}</span>
            <span className={`shrink-0 ${levelStyle[entry.level] || 'text-gray-500'}`}>
              {levelPrefix[entry.level] || '[    ]'}
            </span>
            <span className={`${levelStyle[entry.level] || 'text-gray-500'} opacity-90`}>
              {entry.msg}
            </span>
          </div>
        ))}
        <div className="flex gap-2 px-1">
          <span className="text-gray-700 shrink-0 hidden sm:block">
            {new Date().toLocaleString('en-US', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit', hour12:false })}
          </span>
          <span className="text-cyan-400 shrink-0">[LIVE ]</span>
          <span className="text-cyan-400">WAITING FOR NEXT SCAN<span className="blink">_</span></span>
        </div>
      </div>
    </div>
  );
}
