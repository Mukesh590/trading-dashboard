import { NextResponse } from 'next/server';

const BASE = 'https://paper-api.alpaca.markets/v2';

function headers() {
  return {
    'APCA-API-KEY-ID': process.env.ALPACA_API_KEY || '',
    'APCA-API-SECRET-KEY': process.env.ALPACA_API_SECRET || '',
    'Content-Type': 'application/json',
  };
}

const PERIOD_PARAMS = {
  '1D': { period: '1D', timeframe: '5Min' },
  '1W': { period: '1W', timeframe: '1H' },
  '1M': { period: '1M', timeframe: '1D' },
  'ALL': { period: '5A', timeframe: '1D' },
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const zoom = searchParams.get('period') || '1M';
  const { period, timeframe } = PERIOD_PARAMS[zoom] ?? PERIOD_PARAMS['1M'];

  try {
    const res = await fetch(
      `${BASE}/account/portfolio/history?period=${period}&timeframe=${timeframe}&extended_hours=false`,
      { headers: headers(), cache: 'no-store' }
    );
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
