// app/api/portfolio/route.js
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const INITIAL = Number(process.env.INITIAL_CAPITAL || 200000);
    const AK = process.env.ALPACA_API_KEY || "";
    const AS = process.env.ALPACA_SECRET_KEY || "";

    // ✅ SEM ALPACA: ler baseline local (app/config/portfolio.json)
    if (!AK || !AS) {
      const filePath = path.join(process.cwd(), "app", "config", "portfolio.json");
      try {
        const raw = fs.readFileSync(filePath, "utf8");
        const cfg = JSON.parse(raw);
        // caso falte initial_capital no ficheiro, aplica o default
        if (!cfg.initial_capital) cfg.initial_capital = INITIAL;
        return Response.json(cfg);
      } catch (e) {
        console.error("Erro a ler portfolio.json:", e);
        return Response.json({
          initial_capital: INITIAL,
          positions: [],
          note: "portfolio.json não encontrado"
        });
      }
    }

    // ✅ COM ALPACA: (deixa o que já tinhas aqui, se quiseres)
    return Response.json({
      initial_capital: INITIAL,
      positions: [],
      note: "Dados Alpaca desativados nesta build"
    });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
