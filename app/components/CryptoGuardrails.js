
'use client'
import { useEffect, useState } from 'react';
import { fmt } from './helpers';
export default function CryptoGuardrails(){
  const [d,setD]=useState(null), [err,setErr]=useState(null);
  useEffect(()=>{ const load=()=>fetch('/api/crypto/prices').then(r=>r.json()).then(setD).catch(e=>setErr(e.message));
    load(); const id=setInterval(load,6000); return ()=>clearInterval(id) },[]);
  if(err) return <div className="danger badge">Erro: {err}</div>;
  if(!d) return <div>Carregando…</div>;
  const rows=[{sym:'ETH',p:d.eth,limit:4300},{sym:'TAO',p:d.tao,limit:320},{sym:'AKT',p:d.akt,limit:1.0},{sym:'RNDR',p:d.rndr,limit:5}];
  return (<table className="table"><thead><tr><th>Crypto</th><th>Preço</th><th>Guardrail</th><th>Status</th></tr></thead>
    <tbody>{rows.map(r=>{const ok=r.p>=r.limit; const cls=ok?'success badge':'danger badge';
      return (<tr key={r.sym}><td>{r.sym}</td><td>${fmt(r.p)}</td><td>${r.limit}</td><td><span className={cls}>{ok?'OK':'Abaixo'}</span></td></tr>)})}
    </tbody></table>)
}
