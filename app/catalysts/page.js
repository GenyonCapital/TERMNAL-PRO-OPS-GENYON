
'use client'
import { useEffect, useState } from 'react';
export default function Page(){
  const [items,setItems]=useState([]), [err,setErr]=useState(null), [loading,setLoading]=useState(true);
  useEffect(()=>{
    (async()=>{
      try{
        const r=await fetch('/api/catalysts/earnings'); const j=await r.json();
        if(!r.ok) throw new Error(j.error||'Falha');
        setItems(j.items||[]);
      }catch(e){ setErr(e.message) } finally{ setLoading(false) }
    })();
  },[]);
  return (
    <div>
      <h1>Catalisadores (earnings próximos)</h1>
      <div className="panel">
        <p>Próximas 72h (Finnhub). *Para FDA/biotech, adicionaremos fonte dedicada num upgrade.*</p>
        {err && <p className="danger badge">Erro: {err}</p>}
      </div>
      <div className="panel">
        {loading? <p>Carregando…</p> : items.length===0? <p>Sem eventos.</p> :
        <table className="table">
          <thead><tr><th>Data</th><th>Ticker</th><th>Hora</th></tr></thead>
          <tbody>{items.map((x,i)=>(<tr key={i}><td>{x.date}</td><td>{x.symbol}</td><td>{x.time||'-'}</td></tr>))}</tbody>
        </table>}
      </div>
    </div>
  )
}
