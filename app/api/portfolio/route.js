// app/api/portfolio/route.js
import fs from "fs";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const INITIAL = Number(process.env.INITIAL_CAPITAL || 200000);

    // caminho absoluto para o portfolio.json
    const filePath = path.join(process.cwd(), "app", "config", "portfolio.json");

    // tenta ler o ficheiro local
    let cfg;
    try {
      const raw = fs.readFileSync(filePath, "utf8");
      cfg = JSON.parse(raw);

      if (!cfg.initial_capital) cfg.initial_capital = INITIAL;

      return Response.json(cfg);
    } catch (e) {
      console.error("Erro a ler portfolio.json:", e);
      return Response.json({
        initial_capital: INITIAL,
        positions: [],
        note: "portfolio.json não encontrado ou inválido"
      });
    }

  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
