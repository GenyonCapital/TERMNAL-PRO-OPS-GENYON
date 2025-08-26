// app/api/portfolio/route.js
import fs from "fs";
import path from "path";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BUILD = 'r7'; // <- marcador para confirmares que este código foi para produção

export async function GET() {
  try {
    const INITIAL = Number(process.env.INITIAL_CAPITAL || 200000);
    const AK = process.env.ALPACA_API_KEY || "";
    const AS = process.env.ALPACA_SECRET_KEY || "";

    // ✅ Sem ALPACA: ler baseline local (app/config/portfolio.json)
    if (!AK || !AS) {
      const filePath = path.join(process.cwd(), "app", "config", "portfolio.json");
      try {
        const raw = fs.readFileSync(filePath, "utf8");
        const cfg = JSON.parse(raw);
        if (!cfg.initial_capital) cfg.initial_capital = INITIAL;
        return Response.json({ ...cfg, build: BUILD });
      } catch (e) {
        // ficheiro não encontrado ou inválido → devolve info mínima
        return Response.json({
          initial_capital: INITIAL,
          current_value: null,
          pnl_abs: null,
          positions: [],
          note: "portfolio.json não encontrado",
          build: BUILD
        });
      }
    }

    // (Opcional) Com ALPACA: aqui ligarias à API real se quiseres
    return Response.json({
      initial_capital: INITIAL,
      positions: [],
      note: "Dados Alpaca desativados nesta build",
      build: BUILD
    });
  } catch (err) {
    return Response.json({ error: String(err), build: BUILD }, { status: 500 });
  }
}
