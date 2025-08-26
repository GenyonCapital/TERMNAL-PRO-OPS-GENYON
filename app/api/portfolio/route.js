import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const INITIAL = Number(process.env.INITIAL_CAPITAL || 200000);
    const AK = process.env.ALPACA_API_KEY || "";
    const AS = process.env.ALPACA_SECRET_KEY || "";
    const FINN = process.env.FINNHUB_API_KEY || "";

    // Se não houver Alpaca, carregar portfolio.json
    if (!AK || !AS) {
      const filePath = path.join(process.cwd(), "app/config/portfolio.json");
      let config = {
        initial_capital: INITIAL,
        positions: [],
        note: "portfolio.json não encontrado"
      };

      try {
        const raw = fs.readFileSync(filePath, "utf8");
        config = JSON.parse(raw);
      } catch (e) {
        console.error("Erro a ler portfolio.json:", e);
      }

      return Response.json(config);
    }

    // --- código normal com Alpaca (mantém o teu aqui) ---
    const hdr = {
      "APCA-API-KEY-ID": AK,
      "APCA-API-SECRET-KEY": AS,
      accept: "application/json"
    };

    const acct = await fetch("https://paper-api.alpaca.markets/v2/account", {
      headers: hdr,
      cache: "no-store"
    });

    if (!acct.ok) return new Response(await acct.text(), { status: 502 });

    const cash = Number((await acct.json()).cash || 0);

    return Response.json({
      initial_capital: INITIAL,
      cash,
      note: "Dados carregados de Alpaca"
    });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
