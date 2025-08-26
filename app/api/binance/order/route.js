
import crypto from 'crypto';
export const dynamic = 'force-dynamic';
function signQuery(query, secret){ return crypto.createHmac('sha256', secret).update(query).digest('hex'); }
export async function POST(req){
  if(process.env.ALLOW_TRADING !== 'true'){
    return new Response(JSON.stringify({error:'Trading desativado (ALLOW_TRADING!=true)'}),{status:403});
  }
  const { symbol, qty, side='BUY' } = await req.json();
  if(!symbol || !qty) return new Response(JSON.stringify({error:'symbol e qty obrigatórios'}),{status:400});
  const key = process.env.BINANCE_KEY; const sec = process.env.BINANCE_SECRET;
  const base = process.env.BINANCE_BASE || 'https://api.binance.com';
  if(!key || !sec) return new Response(JSON.stringify({error:'Faltam chaves Binance'}),{status:500});
  const timestamp = Date.now();
  const params = new URLSearchParams({ symbol: symbol.toUpperCase(), side: side.toUpperCase(), type:'MARKET', quantity:String(qty), recvWindow:'5000', timestamp:String(timestamp) }).toString();
  const signature = signQuery(params, sec);
  const url = base + '/api/v3/order?' + params + '&signature=' + signature;
  const r = await fetch(url, { method:'POST', headers:{ 'X-MBX-APIKEY': key } });
  const j = await r.json(); if(!r.ok) return new Response(JSON.stringify({error:j?.msg||'binance order fail', raw:j}),{status:r.status});
  return Response.json({ok:true, order:j});
}
