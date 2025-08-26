
'use client'
import { useEffect, useState } from 'react';
function pushLog(entry){
  const key='genyon_logs'; const arr=JSON.parse(localStorage.getItem(key)||'[]');
  arr.unshift({...entry, ts: Date.now()}); localStorage.setItem(key, JSON.stringify(arr.slice(0,500)));
}
export default function Page(){
  const [venue,setVenue]=useState('alpaca'); const [symbol,setSymbol]=useState('NVDA'); const [qty,setQty]=useState('1'); const [side,setSide]=useState('buy');
  const [err,setErr]=useState(null), [resp,setResp]=useState(null);
  const submit=async()=>{
    setErr(null); setResp(null);
    try{
      const r = await fetch(`/api/${venue}/order`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ symbol, qty, side }) });
      const j = await r.json(); if(!r.ok) throw new Error(j.error||'Falha');
      pushLog({ type:'exec', symbol, msg:`${side.toUpperCase()} ${qty} @ ${venue}`, raw:j });
      setResp(j);
    }catch(e){ setErr(e.message) }
  };
  return (
    <div>
      <h1>Ordens (Semi-Automático)</h1>
      <div className="panel">
        <p><strong>Aviso:</strong> Só executa se <code>ALLOW_TRADING=true</code> e chaves definidas.</p>
        <div className="grid3">
          <div><label>Venue</label><br/><select value={venue} onChange={e=>setVenue(e.target.value)}>
            <option value="alpaca">Alpaca (stocks)</option><option value="binance">Binance (crypto)</option></select></div>
          <div><label>Symbol</label><br/><input value={symbol} onChange={e=>setSymbol(e.target.value)} placeholder="NVDA ou ETHUSDT"/></div>
          <div><label>Qty</label><br/><input value={qty} onChange={e=>setQty(e.target.value)}/></div>
        </div>
        <div style={{marginTop:8}}><label>Lado</label><br/><select value={side} onChange={e=>setSide(e.target.value)}><option value="buy">buy</option><option value="sell">sell</option></select></div>
        <div style={{marginTop:12}}><button onClick={submit}>Enviar ordem MARKET</button></div>
        {err && <p className="danger badge">Erro: {err}</p>}{resp && <p className="success badge">OK</p>}
      </div>
    </div>
  )
}
