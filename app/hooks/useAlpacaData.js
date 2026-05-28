'use client';
import { useState, useEffect, useCallback } from 'react';
import { MOCK_ACCOUNT, MOCK_POSITIONS, MOCK_ORDERS, MOCK_PORTFOLIO } from '../lib/mockData';

const REFRESH_MS = 60_000;

async function safeFetch(url) {
  try {
    const res = await fetch(url, { cache: 'no-store' });
    const data = await res.json();
    if (!res.ok) return { error: data };
    return data;
  } catch {
    return { error: 'network error' };
  }
}

function isError(d) {
  if (!d) return true;
  if (Array.isArray(d)) return false;
  // Alpaca error responses always have a 'message' field; valid data objects do not
  return (
    d.error !== undefined ||
    d.code !== undefined ||
    d.message !== undefined
  );
}

export function useAlpacaData() {
  const [state, setState] = useState({
    account: null,
    positions: [],
    orders: [],
    portfolio: null,
    loading: true,
    demo: false,
    lastUpdated: null,
  });

  const fetchAll = useCallback(async () => {
    const [account, positions, orders, portfolio] = await Promise.all([
      safeFetch('/api/alpaca/account'),
      safeFetch('/api/alpaca/positions'),
      safeFetch('/api/alpaca/orders'),
      safeFetch('/api/alpaca/portfolio'),
    ]);

    // Fall back to demo data if any critical endpoint fails
    const useDemoData =
      isError(account) || isError(portfolio) ||
      (Array.isArray(positions) && positions.length === 0 && isError(account));

    if (useDemoData) {
      setState({
        account: MOCK_ACCOUNT,
        positions: MOCK_POSITIONS,
        orders: MOCK_ORDERS,
        portfolio: MOCK_PORTFOLIO,
        loading: false,
        demo: true,
        lastUpdated: new Date(),
      });
    } else {
      setState({
        account,
        positions: Array.isArray(positions) ? positions : [],
        orders: Array.isArray(orders) ? orders : [],
        portfolio,
        loading: false,
        demo: false,
        lastUpdated: new Date(),
      });
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const id = setInterval(fetchAll, REFRESH_MS);
    return () => clearInterval(id);
  }, [fetchAll]);

  return { ...state, refresh: fetchAll };
}
