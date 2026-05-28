import { NextResponse } from 'next/server';

const BASE = 'https://paper-api.alpaca.markets/v2';

function headers() {
  return {
    'APCA-API-KEY-ID': process.env.NEXT_PUBLIC_ALPACA_KEY || '',
    'APCA-API-SECRET-KEY': process.env.NEXT_PUBLIC_ALPACA_SECRET || '',
    'Content-Type': 'application/json',
  };
}

export async function GET() {
  try {
    const res = await fetch(`${BASE}/orders?status=closed&limit=50`, {
      headers: headers(),
      cache: 'no-store',
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
