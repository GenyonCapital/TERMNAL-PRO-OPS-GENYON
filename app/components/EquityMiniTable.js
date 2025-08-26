
'use client'
import { useEffect, useState } from 'react';
import { fmt, pct } from './helpers';
async function getQuote(symbol){
  const r = await fetch(`/api/equities/quote?symbol=${encodeURIComponent(symbol)}`);
  if(!r.ok) throw new Error(await r.text());
  return r.json();
}
export default function EquityMiniTable({ list }){
  const [rows,setRows]=useState([]), [err,setErr]=useState(null), [loading,setLoading]=useState(true);
  useEffect(()=>{
    let cancel=false;
    (async()=>{
      setLoading(true); try{
        const out=[];
        for(const s of list){ const q=await getQuote(s); out.push({symbol:s, price:q.c, changePct:q.dp}); }
        if(!cancel) setRows(out.sort((a,b)=> b.changePct - a.changePct));
      }catch(e){ if(!cancel) setErr(e.message) } finally{ if(!cancel) setLoading(false) }
    })();
    const id=setInterval(async()=>{
      for(const s of list){ try{ const q=await getQuote(s); setRows(prev=>prev.map(r=> r.symbol===s?{...r, price:q.c, changePct:q.dp}:r)); }catch{} }
    }, 10000);
    return ()=>{ cancel=true; clearInterval(id); }
  },[list]);
  if(loading) return <div>Carregando…</div>;
  if(err) return <div className="danger badge">Erro: {err}</div>;
  return (<table className="table"><thead><tr><th>Ticker</th><th>Preço</th><th>% Dia</th></tr></thead>
    <tbody>{rows.map(r=>{const cls=r.changePct>0?'success badge':(r.changePct<0?'danger badge':'badge');
      return (<tr key={r.symbol}><td>{r.symbol}</td><td>${fmt(r.price)}</td><td><span className={cls}>{pct(r.changePct)}</span></td></tr>)})}
    </tbody></table>);
}
