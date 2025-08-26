
export const dynamic = 'force-dynamic';
async function polygonQuote(sym, key){
  const last = await fetch(`https://api.polygon.io/v2/last/trade/${encodeURIComponent(sym)}?apiKey=${key}`);
  const prev = await fetch(`https://api.polygon.io/v2/aggs/ticker/${encodeURIComponent(sym)}/prev?adjusted=true&apiKey=${key}`);
  if(!last.ok || !prev.ok) throw new Error('polygon fail');
  const jl = await last.json(); const jp = await prev.json();
  const c = jl?.results?.price ?? jl?.results?.p ?? 0;
  const pc = jp?.results?.[0]?.c ?? 0;
  const dp = pc? ((c - pc) / pc) * 100 : 0;
  return { c, pc, dp };
}
async function finnhubQuote(sym, key){
  const r = await fetch(`https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(sym)}&token=${key}`);
  if(!r.ok) throw new Error('finnhub fail');
  const j = await r.json();
  return { c: j.c, pc: j.pc, dp: j.dp };
}
export async function GET(req){
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get('symbol');
  if(!symbol) return new Response(JSON.stringify({error:'symbol required'}),{status:400});
  const pk = process.env.POLYGON_API_KEY; const fk = process.env.FINNHUB_API_KEY;
  try{
    if(pk){ const q = await polygonQuote(symbol, pk); return Response.json(q); }
    if(fk){ const q = await finnhubQuote(symbol, fk); return Response.json(q); }
    return new Response(JSON.stringify({error:'Missing POLYGON_API_KEY or FINNHUB_API_KEY'}),{status:500});
  }catch(e){
    if(fk){ try{ const q=await finnhubQuote(symbol, fk); return Response.json(q); }catch{} }
    return new Response(JSON.stringify({error:'quote failed'}),{status:500});
  }
}
