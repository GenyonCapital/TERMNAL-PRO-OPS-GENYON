
'use client'
import { useEffect, useState } from 'react';
export default function Page(){
  const [rows,setRows]=useState([]), [err,setErr]=useState(null), [loading,setLoading]=useState(true);
  useEffect(()=>{
    (async()=>{
      setLoading(true);
      try{
        const r = await fetch('/api/scan/gainers'); const j=await r.json();
        if(!r.ok) throw new Error(j.error||'Falha');
        setRows(j.items||[]);
      }catch(e){ setErr(e.message) } finally{ setLoading(false) }
    })();
  },[]);
  return (
    <div>
      <h1>Gainers/Losers (1D)</h1>
      <div className="panel">
        <p>Ordenado por variação do dia dentro do universo GENYON. (Polygon/Finnhub)</p>
        {err && <p className="danger badge">Erro: {err}</p>}
      </div>
      <div className="panel">
        {loading? <p>Carregando…</p> : rows.length===0? <p>Sem dados.</p> :
        <table className="table">
          <thead><tr><th>Ticker</th><th>% Dia</th><th>Preço</th></tr></thead>
          <tbody>{rows.map((x,i)=>(<tr key={i}><td>{x.symbol}</td><td>{x.dp.toFixed(2)}%</td><td>${x.c.toFixed(2)}</td></tr>))}</tbody>
        </table>}
      </div>
    </div>
  )
}
