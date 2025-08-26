
import { UNIVERSE } from '../../../config/defaults';
export const dynamic = 'force-dynamic';
export async function GET(){
  const items=[];
  for(const s of UNIVERSE){
    try{
      const r = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL||''}/api/equities/quote?symbol=${encodeURIComponent(s)}`, { cache:'no-store' });
      const q = await r.json();
      if(r.ok) items.push({ symbol:s, c:q.c||0, dp:q.dp||0 });
    }catch{}
  }
  items.sort((a,b)=> b.dp - a.dp);
  return Response.json({ items });
}
