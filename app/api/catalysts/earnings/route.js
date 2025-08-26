
export const dynamic = 'force-dynamic';
export async function GET(){
  const fk = process.env.FINNHUB_API_KEY;
  if(!fk) return new Response(JSON.stringify({error:'FINNHUB_API_KEY necessário'}),{status:500});
  const now = new Date();
  const to = new Date(now.getTime()+72*3600*1000);
  const fmt = d=> d.toISOString().slice(0,10);
  const url = `https://finnhub.io/api/v1/calendar/earnings?from=${fmt(now)}&to=${fmt(to)}&token=${fk}`;
  const r = await fetch(url, { cache:'no-store' });
  const j = await r.json();
  const items = (j?.earningsCalendar||[]).map(x=> ({ date:x.date, symbol:x.symbol, time:x.hour || x.time || '' }));
  return Response.json({ items });
}
