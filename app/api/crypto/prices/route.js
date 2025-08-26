
export const dynamic = 'force-dynamic';
export async function GET(){
  const url = 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum,bittensor,akash-network,render-token&vs_currencies=usd';
  const r = await fetch(url, { cache: 'no-store' });
  if(!r.ok) return new Response(JSON.stringify({error:'Coingecko falhou'}),{status:500});
  const j = await r.json();
  const data = { eth: j.ethereum?.usd ?? 0, tao: j.bittensor?.usd ?? 0, akt: j['akash-network']?.usd ?? 0, rndr: j['render-token']?.usd ?? 0 };
  return Response.json(data);
}
