export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const INITIAL = Number(process.env.INITIAL_CAPITAL || 200000);
    const AK = process.env.ALPACA_API_KEY || "";
    const AS = process.env.ALPACA_SECRET_KEY || "";
    const FINN = process.env.FINNHUB_API_KEY || "";

    if (!AK || !AS) {
      return Response.json({
        initial_capital: INITIAL,
        current_value: null,
        pnl_abs: null,
        pnl_pct: null,
        positions: [],
        cash: null,
        note: "Sem ALPACA_* → usa /portfolio/import para baseline manual."
      });
    }

    const hdr = { "APCA-API-KEY-ID": AK, "APCA-API-SECRET-KEY": AS, accept: "application/json" };

    const acct = await fetch("https://paper-api.alpaca.markets/v2/account", { headers: hdr, cache: "no-store" });
    if (!acct.ok) return new Response(await acct.text(), { status: 502 });
    const cash = Number((await acct.json()).cash || 0);

    const pos = await fetch("https://paper-api.alpaca.markets/v2/positions", { headers: hdr, cache: "no-store" });
    if (!pos.ok) return new Response(await pos.text(), { status: 502 });
    const positions = await pos.json();

    const quote = async (s) => {
      try {
        const u = new URL("https://finnhub.io/api/v1/quote");
        u.searchParams.set("symbol", s);
        const r = await fetch(u, { headers: { "X-Finnhub-Token": FINN }, cache: "no-store" });
        const j = await r.json();
        const p = Number(j.c || 0);
        return p > 0 ? p : null;
      } catch {
        return null;
      }
    };

    let eq = 0;
    const detailed = [];
    for (const p of positions) {
      const last = await quote(p.symbol);
      const qty = Number(p.qty);
      const mv = last ? last * qty : Number(p.market_value || 0);
      eq += mv;
      detailed.push({ symbol: p.symbol, qty, last, market_value: mv });
    }

    const current = cash + eq;
    const pnl_abs = current - INITIAL;
    const pnl_pct = INITIAL ? (pnl_abs / INITIAL) * 100 : null;

    return Response.json({
      initial_capital: INITIAL,
      current_value: current,
      pnl_abs,
      pnl_pct,
      cash,
      positions: detailed
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
}
