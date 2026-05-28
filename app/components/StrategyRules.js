export default function StrategyRules() {
  const rules = [
    {
      label: 'CALL CREDIT SPREAD',
      color: 'text-cyan-400',
      border: 'border-cyan-400/20',
      bg: 'bg-cyan-400/5',
      items: [
        'Sell 2.5% OTM call (short leg)',
        'Buy 5 strikes higher (long hedge)',
        'Target: $50–$200 net credit per spread',
        'Close at 50–70% profit target',
      ],
    },
    {
      label: 'CASH SECURED PUT',
      color: 'text-green-400',
      border: 'border-green-400/20',
      bg: 'bg-green-400/5',
      items: [
        'Sell 2.5% OTM put, cash secured',
        'Target: $200–$500 premium per contract',
        'Close at 50–70% profit target',
        'Let expire worthless if far OTM',
      ],
    },
    {
      label: 'VIX GATES',
      color: 'text-yellow-400',
      border: 'border-yellow-400/20',
      bg: 'bg-yellow-400/5',
      items: [
        'VIX > 40: NO new trades (market halt)',
        'VIX 30–40: Half position size',
        'VIX < 30: Full position size',
        'Check VIX at market open + every hour',
      ],
    },
    {
      label: 'RISK MANAGEMENT',
      color: 'text-red-400',
      border: 'border-red-400/20',
      bg: 'bg-red-400/5',
      items: [
        'Max 3 concurrent open positions',
        'Close losers at 2× credit received',
        'No new trades during earnings week',
        'Max 5% portfolio per position',
      ],
    },
  ];

  return (
    <div className="terminal-card">
      <div className="px-4 pt-3 pb-2 border-b border-green-900/30">
        <div className="text-xs text-cyan-400 tracking-widest font-bold">✦ STRATEGY RULES</div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4">
        {rules.map(rule => (
          <div key={rule.label} className={`border ${rule.border} ${rule.bg} p-3`}>
            <div className={`text-[10px] font-bold tracking-widest mb-2 ${rule.color}`}>
              {rule.label}
            </div>
            <ul className="space-y-1">
              {rule.items.map((item, i) => (
                <li key={i} className="text-xs text-gray-400 flex gap-2">
                  <span className={`${rule.color} opacity-60 shrink-0`}>›</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
