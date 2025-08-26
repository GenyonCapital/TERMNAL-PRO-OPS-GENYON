export const dynamic = 'force-dynamic';

import pf from '../../../config/portfolio.json' assert { type: 'json' };

async function finnhubQuote(symbol) {
  const key = process.env.FINNHUB_API_KEY || '';
  if (!key) return null;
  try {
    const url = new URL('https://finnhub.io/api/v1/quote');
    url.searchParams.set('symbol', symbol);
    url.searchParams.set('token', key);
    const r = await fetch(url, { cache: 'no-store' });
    const j = await r.json();
    const p = Number(j.c || 0);
    return p > 0 ? p : null;
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const AK = process.env.ALPACA_API_KEY || '';
    const AS = process.env.ALPACA_SECRET_KEY || '';
    const INITIAL = Number(process.env.INITIAL_CAPITAL || pf.initial_capital || 200000);

    // >>> Se tiver Alpaca, usa a conta real
    if (AK && AS) {
      const hdr = { 'APCA-API-KEY-ID': AK, 'APCA-API-SECRET-KEY': AS, accept: 'application/json' };

      const acct = await fetch('https://paper-api.alpaca.markets/v2/account', { headers: hdr, cache: 'no-store' });
      if (!acct.ok) return new Response(await acct.text(), { status: 502 });
      const cash = Number((await acct.json()).cash || 0);

      const posRes = await fetch('https://paper-api.alpaca.markets/v2/positions', { headers: hdr, cache: 'no-store' });
      if (!posRes.ok) return new Response(await posRes.text(), { status: 502 });
      const positionsRaw = await posRes.json();

      const detailed = [];
      let equity = 0;
      for (const p of positionsRaw) {
        const last = await finnhubQuote(p.symbol);
        const qty = Number(p.qty);
        const mv = last ? last * qty : Number(p.market_value || 0);
        equity += mv;
        detailed.push({ symbol: p.symbol, qty, last, market_value: mv });
      }

      const current = cash + equity;
      const pnl_abs = current - INITIAL;
      const pnl_pct = INITIAL ? (pnl_abs / INITIAL) * 100 : null;

      return Response.json({ initial_capital: INITIAL, current_value: current, pnl_abs, pnl_pct, cash, positions: detailed });
    }

    // >>> Fallback manual (sem Alpaca): usa config/portfolio.json + preços live
    let sum = 0;
    const rows = [];
    for (const p of pf.positions || []) {
      if (p.value != null) {
        const v = Number(p.value || 0);
        rows.push({ symbol: p.symbol, qty: null, last: null, market_value: v });
        sum += v;
      } else {
        const last = await finnhubQuote(p.symbol);
        const qty = Number(p.qty || 0);
        const mv = (last || 0) * qty;
        rows.push({ symbol: p.symbol, qty, last, market_value: mv });
        sum += mv;
      }
    }

    const pnl_abs = sum - INITIAL;
    const pnl_pct = INITIAL ? (pnl_abs / INITIAL) * 100 : null;

    return Response.json({
      initial_capital: INITIAL,
      current_value: sum,
      pnl_abs,
      pnl_pct,
      cash: null,
      positions: rows,
      note: 'Baseline manual (config/portfolio.json).'
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
}
