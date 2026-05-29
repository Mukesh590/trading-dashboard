'use client';
import { useState, useEffect, useRef } from 'react';

const MEMORIES = [
  { category: 'PATTERN RECOGNITION', text: 'False breakouts increasing during low-liquidity sessions. Reducing breakout aggression 12%.' },
  { category: 'TEMPORAL EDGE',        text: 'Optimal entry window identified: 9:45-10:30 AM ET. Signal density 34% above baseline.' },
  { category: 'CORRELATION ANALYSIS', text: 'VIX spike to CSP assignment correlation: 0.74. Tightening buffers on high-IV entries.' },
  { category: 'EXECUTION QUALITY',    text: 'Mid-price fills achievable 67% of time at open. Aggressive limit orders underperforming.' },
  { category: 'REGIME ADAPTATION',    text: 'Mean-reversion edge degrading in trending regimes. Switching to directional spreads above VIX 22.' },
  { category: 'LOSS PATTERN',         text: 'Losses concentrated post-FOMC 3-day window. Implementing event blackout protocol.' },
  { category: 'ALPHA DECAY',          text: 'Premium capture efficiency: 76% of theoretical max. Slippage accounts for 18% of variance.' },
  { category: 'LIQUIDITY MAPPING',    text: 'SPX weeklies illiquid below $0.15. Setting minimum credit threshold to preserve fill quality.' },
];

function useTypewriter(text, speed = 28) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed('');
    setDone(false);
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) { clearInterval(id); setDone(true); }
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);

  return { displayed, done };
}

export default function MachineMemory() {
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState('typing'); // 'typing' | 'hold' | 'clearing'
  const timerRef = useRef(null);

  const current = MEMORIES[idx];
  const { displayed, done } = useTypewriter(current.text, 24);

  useEffect(() => {
    if (done && phase === 'typing') {
      setPhase('hold');
      timerRef.current = setTimeout(() => {
        setPhase('clearing');
        timerRef.current = setTimeout(() => {
          setIdx(i => (i + 1) % MEMORIES.length);
          setPhase('typing');
        }, 600);
      }, 4200);
    }
    return () => clearTimeout(timerRef.current);
  }, [done, phase]);

  return (
    <div className="panel h-full flex flex-col">
      <div className="px-4 pt-3 pb-2 border-b border-white/[0.04] flex items-center justify-between">
        <span className="section-label">MACHINE MEMORY</span>
        <div className="flex items-center gap-1.5">
          <span className="text-[8px] text-slate-600 tracking-widest tabular-nums">
            {idx + 1}/{MEMORIES.length}
          </span>
        </div>
      </div>

      <div className="flex-1 px-4 py-3 flex flex-col gap-3">
        {/* Recent learning entry */}
        <div className="flex-1 flex flex-col gap-2">
          <div className="text-[8px] tracking-[0.15em]" style={{ color: '#00d4ff' }}>
            {current.category}
          </div>
          <div
            className="text-[10px] text-slate-300 leading-relaxed"
            style={{ opacity: phase === 'clearing' ? 0 : 1, transition: 'opacity 0.5s ease' }}
          >
            {displayed}
            {phase === 'typing' && <span className="blink" style={{ color: '#00d4ff' }}>_</span>}
          </div>
        </div>

        {/* Previous entries (dimmed) */}
        <div className="space-y-2 border-t border-white/[0.04] pt-2">
          <div className="text-[8px] text-slate-700 tracking-widest mb-1.5">RECENT LEARNINGS</div>
          {MEMORIES.slice(0, 3).filter((_, i) => i !== idx % 3).slice(0, 2).map((m, i) => (
            <div key={i} className="flex gap-2 text-[9px]">
              <span className="text-slate-700 shrink-0">-</span>
              <span className="text-slate-700 leading-relaxed line-clamp-1">{m.text}</span>
            </div>
          ))}
        </div>

        <div className="text-[8px] text-slate-700 border-t border-white/[0.04] pt-2 tabular-nums">
          ADAPTIVE LEARNING ENGINE v2.1 - CYCLES 45s
        </div>
      </div>
    </div>
  );
}
