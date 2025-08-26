
'use client'
import { useEffect, useState } from 'react';
export default function Page(){
  const [rows,setRows]=useState([]), [err,setErr]=useState(null), [loading,setLoading]=useState(true);
  useEffect(()=>{
    let cancel=false;
    (async()=>{
      setLoading(true);
      try{
        const r = await fetch('/api/scan/spikes'); const j = await r.json();
        if(!r.ok) throw new Error(j.error||'Falha');
        if(!cancel) setRows(j.items||[]);
      }catch(e){ if(!cancel) setErr(e.message) } finally{ if(!cancel) setLoading(false) }
    })();
    const id=setInterval(async()=>{
      try{ const r = await fetch('/api/scan/spikes'); const j=await r.json(); if(r.ok) setRows(j.items||[]); }catch{}
    }, 30000);
    return ()=>clearInterval(id);
  },[]);
  return (
    <div>
      <h1>Volume Spikes (±8% &gt; 200% vol)</h1>
      <div className="panel">
        <p>Procuramos movimentos intraday fortes: preço ±8% desde a abertura e volume &gt; 200% da média 30d (Polygon necessário).</p>
        {err && <p className="danger badge">Erro: {err}</p>}
      </div>
      <div className="panel">
        {loading? <p>Carregando…</p> : rows.length===0? <p>Sem sinais no momento.</p> :
        <table className="table">
          <thead><tr><th>Ticker</th><th>% desde open</th><th>Vol vs 30d</th><th>Preço</th></tr></thead>
          <tbody>{rows.map((x,i)=>(<tr key={i}><td>{x.symbol}</td><td>{x.movePct.toFixed(2)}%</td><td>{x.volRatio.toFixed(1)}×</td><td>${x.price.toFixed(2)}</td></tr>))}</tbody>
        </table>}
      </div>
    </div>
  )
}
