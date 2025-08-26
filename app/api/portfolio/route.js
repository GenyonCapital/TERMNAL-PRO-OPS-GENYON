// app/api/portfolio/route.js
import fs from "fs";
import path from "path";

export const runtime = "nodejs";       // preciso para usar fs na Vercel
export const dynamic = "force-dynamic";

async function finnhubQuote(symbol) {
  const token = process.env.FINNHUB_API_KEY || "";
  if (!token) return null;
  try {
    const url = new URL("https://finnhub.io/api/v1/quote");
    url.searchParams.set("symbol", symbol);
    url.searchParams.set("token", token);
    const r = await fetch(url, { cache: "no-store" });
    const j = await r.json();
    const p = Number(j.c || 0);
    return p > 0 ? p : null;
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const INITIAL = Number(process.env.INITIAL_CAPITAL || 200000);
    const AK = process.env.ALPACA_API_KEY || "";
    const AS = process.env.ALPACA_SECRET_KEY || "";

    // ==========================
    // SEM ALPACA -> usar ficheiro local app/config/portfolio.json
    // ==========================
    if (!AK || !AS) {
      const filePath = path.join(process.cwd(), "app", "config", "portfolio.json");

      let cfg = { initial_capital: INITIAL, positions: [] };
      try {
        const raw = fs.readFileSync(filePath, "utf8");
        cfg = JSON.parse(raw);
        if (!cfg.initial_capital) cfg.initial_capital = INITIAL;
      } catch (e) {
        console.error("Erro a ler portfolio.json:", e);
        // devolve vazio mas com nota
        return Response.json({
          initial_capital: INITIAL,
          current_value: null,
          pnl_abs: null,
          pnl_pct: null,
          cash: null,
          positions: [],
          note: "portfolio.json não encontrado"
        });
      }

      // calcular valores com preços live (qty) e somar 'value' quando existir
      let sum = 0;
      const rows = [];
      for (const p of cfg.positions || []) {
        if (p.value != null) {
          const v = Number(p.value) || 0;
          rows.push({ symbol: p.symbol, qty: null, last: null, market_value: v });
          sum += v;
        } else {
          const qty = Number(p.qty) || 0;
          const last = await finnhubQuote(p.symbol);
          const mv = (last || 0) * qty;
          rows.push({ symbol: p.symbol, qty, last, market_value: mv });
          sum += mv;
        }
      }

      const initial = Number(cfg.initial_capital || INITIAL);
      const pnl_abs = sum - initial;
      const pnl_pct = initial ? (pnl_abs / initial) * 100 : null;

      return Response.json({
        initial_capital: initial,
        current_value: sum,
        pnl_abs,
        pnl_pct,
        cash: null,
        positions: rows,
        note: "Baseline local (app/config/portfolio.json)."
      });
    }

    // ==========================
    // COM ALPACA -> conta real + preços Finnhub
    // ==========================
    const hdr = {
      "APCA-API-KEY-ID": AK,
      "APCA-API-SECRET-KEY": AS,
      accept: "application/json"
    };

    const acctRes = await fetch("https://paper-api.alpaca.markets/v2/account", {
      headers: hdr,
      cache: "no-store"
    });
    if (!acctRes.ok) return new Response(await acctRes.text(), { status: 502 });
    const acct = await acctRes.json();
    const cash = Number(acct.cash || 0);

    const posRes = await fetch("https://paper-api.alpaca.markets/v2/positions", {
      headers: hdr,
      cache: "no-store"
    });
    if (!posRes.ok) return new Response(await posRes.text(), { status: 502 });
    const positionsRaw = await posRes.json();

    let equity = 0;
    const detailed = [];
    for (const p of positionsRaw) {
      const symbol = p.symbol;
      const qty = Number(p.qty) || 0;
      const last = await finnhubQuote(symbol);
      const mv = (last || 0) * qty;
      equity += mv;
      detailed.push({ symbol, qty, last, market_value: mv });
    }

    const current_value = cash + equity;
    const pnl_abs = current_value - INITIAL;
    const pnl_pct = INITIAL ? (pnl_abs / INITIAL) * 100 : null;

    return Response.json({
      initial_capital: INITIAL,
      current_value,
      pnl_abs,
      pnl_pct,
      cash,
      positions: detailed,
      note: "Dados Alpaca + preços Finnhub."
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
}
