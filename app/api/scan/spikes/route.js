
import { UNIVERSE } from '../../../config/defaults';
export const dynamic = 'force-dynamic';

async function polygonStats(sym, key){
  const now = new Date();
  const y = now.getFullYear(), m = String(now.getMonth()+1).padStart(2,'0'), d = String(now.getDate()).padStart(2,'0');
  const today = `${y}-${m}-${d}`;
  const prev = await fetch(`https://api.polygon.io/v2/aggs/ticker/${encodeURIComponent(sym)}/prev?adjusted=true&apiKey=${key}`);
  const last = await fetch(`https://api.polygon.io/v2/last/trade/${encodeURIComponent(sym)}?apiKey=${key}`);
  const hist = await fetch(`https://api.polygon.io/v2/aggs/ticker/${encodeURIComponent(sym)}/range/1/day/${today}/${today}?adjusted=true&apiKey=${key}`);
  const ma = await fetch(`https://api.polygon.io/v2/aggs/ticker/${encodeURIComponent(sym)}/range/1/day/${y-1}-${m}-${d}/${today}?adjusted=true&apiKey=${key}`);
  if(!prev.ok || !last.ok || !ma.ok) throw new Error('polygon fail');
  const jp = await prev.json(); const jl = await last.json(); const jm = await ma.json(); const jh = await hist.json();
  const c = jl?.results?.price ?? jl?.results?.p ?? 0;
  const open = jh?.results?.[0]?.o ?? jp?.results?.[0]?.c ?? 0;
  let vol30=0, n=0; for(const row of (jm?.results||[]).slice(-30)){ vol30 += row.v||0; n++; }
  const avg30 = n? vol30/n : 0;
  const volToday = jh?.results?.[0]?.v ?? 0;
  const movePct = open? ((c-open)/open)*100 : 0;
  const volRatio = avg30? (volToday/avg30) : 0;
  return { symbol:sym, price:c, movePct, volRatio };
}

export async function GET(){
  const key = process.env.POLYGON_API_KEY;
  if(!key) return new Response(JSON.stringify({error:'POLYGON_API_KEY necessário para Spikes'}),{status:500});
  const out=[];
  for(const s of UNIVERSE){
    try{
      const st = await polygonStats(s, key);
      if(Math.abs(st.movePct)>=8 && st.volRatio>=2) out.push(st);
    }catch{}
  }
  out.sort((a,b)=> Math.abs(b.movePct)-Math.abs(a.movePct));
  return Response.json({ items: out.slice(0, 10) });
}
