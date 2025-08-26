
'use client'
import { useEffect, useState } from 'react';
function useLogs(){ const key='genyon_logs'; const [items,setItems]=useState([]);
  useEffect(()=>{ setItems(JSON.parse(localStorage.getItem(key)||'[]')); const id=setInterval(()=> setItems(JSON.parse(localStorage.getItem(key)||'[]')), 2000); return ()=>clearInterval(id); },[]);
  return items;
}
function tsStr(ts){ try{ return new Date(ts).toLocaleString(); }catch{return ts} }
export default function Page(){
  const items = useLogs();
  return (<div><h1>Logs</h1><div className="panel">{items.length===0? <p>Sem eventos.</p> :
      <table className="table"><thead><tr><th>Quando</th><th>Tipo</th><th>Ticker</th><th>Mensagem</th></tr></thead>
      <tbody>{items.map((x,i)=>(<tr key={i}><td>{tsStr(x.ts)}</td><td>{x.type}</td><td>{x.symbol||'-'}</td><td>{x.msg}</td></tr>))}</tbody></table>}
    </div></div>)
}
