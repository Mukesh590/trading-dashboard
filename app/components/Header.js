'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Header({ online = true, demo = false, lastUpdated = null, onRefresh }) {
  const [clock, setClock] = useState('');

  useEffect(() => {
    const tick = () => setClock(new Date().toUTCString().replace('GMT', 'UTC').slice(0, -4));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="border-b border-green-900/40 bg-[#030703] px-6 py-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Logo / Title */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-cyan-400 text-lg font-bold tracking-widest glow-cyan">
              ⟨ ALGO TRADING BOT ⟩
            </span>
            <span className="blink text-cyan-400 text-lg font-bold">_</span>
          </div>

          {/* Bot status */}
          <div className="flex items-center gap-2 border border-green-900/50 px-3 py-1 bg-[#071207]">
            <span
              className={`w-2 h-2 rounded-full inline-block pulse-dot ${online ? 'bg-green-400' : 'bg-red-400'}`}
            />
            <span className={`text-xs font-bold tracking-widest ${online ? 'text-green-400 glow-green' : 'text-red-400'}`}>
              {online ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>

          {demo && (
            <span className="text-xs text-yellow-400 border border-yellow-400/30 px-2 py-1 bg-yellow-400/5">
              DEMO MODE
            </span>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4 text-xs text-gray-500">
          {lastUpdated && (
            <span className="hidden sm:block">
              UPDATED: <span className="text-gray-400">
                {lastUpdated.toLocaleTimeString('en-US', { hour12: false })}
              </span>
            </span>
          )}
          <span className="hidden md:block text-gray-600">{clock}</span>

          <button
            onClick={onRefresh}
            className="text-cyan-400/70 hover:text-cyan-400 border border-cyan-900/50 hover:border-cyan-700 px-3 py-1 transition-colors"
          >
            [REFRESH]
          </button>

          <Link
            href="https://github.com/Mukesh590/trading-bot"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400/70 hover:text-cyan-400 border border-cyan-900/50 hover:border-cyan-700 px-3 py-1 transition-colors"
          >
            [GITHUB]
          </Link>
        </div>
      </div>
    </header>
  );
}
