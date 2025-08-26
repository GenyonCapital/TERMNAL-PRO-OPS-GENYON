import fs from "fs";
import path from "path";

if (!AK || !AS) {
  // tenta carregar config local
  const filePath = path.join(process.cwd(), "app/config/portfolio.json");
  let config = {};
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    config = JSON.parse(raw);
  } catch (e) {
    console.error("Erro a ler portfolio.json:", e);
  }

  return Response.json(config);
}
