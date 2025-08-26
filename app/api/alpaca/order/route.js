
export const dynamic = 'force-dynamic';
export async function POST(req){
  if(process.env.ALLOW_TRADING !== 'true'){
    return new Response(JSON.stringify({error:'Trading desativado (ALLOW_TRADING!=true)'}),{status:403});
  }
  const { symbol, qty, side='buy' } = await req.json();
  if(!symbol || !qty) return new Response(JSON.stringify({error:'symbol e qty obrigatórios'}),{status:400});
  const key = process.env.ALPACA_KEY; const sec = process.env.ALPACA_SECRET;
  const env = process.env.ALPACA_ENV || 'paper';
  if(!key || !sec) return new Response(JSON.stringify({error:'Faltam chaves Alpaca'}),{status:500});
  const base = env==='live' ? 'https://api.alpaca.markets' : 'https://paper-api.alpaca.markets';
  const url = base + '/v2/orders';
  const body = { symbol, qty: String(qty), side, type: 'market', time_in_force: 'gtc' };
  const r = await fetch(url, { method:'POST', headers:{ 'APCA-API-KEY-ID': key, 'APCA-API-SECRET-KEY': sec, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const j = await r.json(); if(!r.ok) return new Response(JSON.stringify({error:j?.message||'alpaca order fail', raw:j}),{status:r.status});
  return Response.json({ok:true, order:j});
}
