'use client'
import { useState } from 'react'
const PREFILL=`NVDA, value=25000
MSFT, value=20000
ASML, value=15000
ETH, value=10000

PLTR, value=20000
SYM, value=15000
TSLA, value=10000
CRWD, value=5000

TAO, value=30000
CELC, value=20000
AKT, value=15000
SRRK, value=10000
RNDR, value=5000`
export default function ImportManual(){
  const [rows,setRows]=useState(PREFILL),[initial,setInitial]=useState(200000)
  const [out,setOut]=useState(null),[err,setErr]=useState('')
  async function calc(){
    try{
      setErr('')
      const lines=rows.split(/\r?\n/).map(s=>s.trim()).filter(Boolean)
      const items=[]
      for(const L of lines){
        if(L.toLowerCase().startsWith('symbol')) continue
        const m1=L.match(/^([A-Za-z0-9.\-:_]+)\s*,\s*([0-9]+(\.[0-9]+)?)$/)
        const m2=L.match(/^([A-Za-z0-9.\-:_]+).*value\s*=\s*([0-9]+(\.[0-9]+)?)$/i)
        if(m1) items.push({symbol:m1[1].toUpperCase(), qty:Number(m1[2])})
        else if(m2) items.push({symbol:m2[1].toUpperCase(), value:Number(m2[2])})
        else throw new Error(`Linha inválida: ${L}`)
      }
      const rowsOut=[]; let sum=0
      for(const it of items){
        if(it.value!=null){ rowsOut.push({...it,last:null,market_value:it.value}); sum+=it.value }
        else { /* se vier qty, aqui poderias buscar preço live e calcular */ }
      }
      const cur=sum, pnl=cur-Number(initial||0), pct=(pnl/Number(initial||0))*100
      setOut({rows:rowsOut,cur,pnl,pct})
    }catch(e){setErr(String(e.message||e))}
  }
  return (
    <div className="p-6 max-w-5xl mx-auto text-slate-100">
      <h1 className="text-2xl font-semibold mb-4">Importar Portfólio (Manual)</h1>
      <div className="bg-slate-800/50 rounded-xl p-4 space-y-3">
        <label>Capital Inicial</label>
        <input className="w-40 rounded bg-slate-700 px-3 py-2" type="number" value={initial} onChange={e=>setInitial(e.target.value)} />
        <label>Linhas</label>
        <textarea className="w-full h-48 rounded bg-slate-700 p-3" value={rows} onChange={e=>setRows(e.target.value)} />
        <button onClick={calc} className="rounded bg-emerald-600 hover:bg-emerald-500 px-4 py-2">Calcular</button>
        {err && <div className="bg-red-900/40 p-3 rounded">{err}</div>}
      </div>
      {out && (
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <K t="Capital Inicial" v={usd(initial)} />
            <K t="Valor Atual" v={usd(out.cur)} />
            <K t="% Total" v={`${out.pct.toFixed(2)}%`} h={out.pct} />
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4">
            <div className="text-sm opacity-70 mb-2">Detalhe</div>
            <table className="w-full text-sm"><thead className="opacity-70 text-left">
              <tr><th>Symbol</th><th>Qty</th><th>Último</th><th>Market Value</th></tr></thead>
              <tbody>{out.rows.map((p,i)=>(<tr key={i} className="border-t border-slate-700/50">
                <td className="py-2">{p.symbol}</td><td className="py-2">{p.qty ?? '-'}</td><td className="py-2">{p.last?usd(p.last):'-'}</td><td className="py-2">{usd(p.market_value||0)}</td>
              </tr>))}</tbody></table>
          </div>
        </div>
      )}
    </div>
  )
}
function K({t,v,h}){let c=''; if(typeof h==='number') c=h>0?'text-green-400':h<0?'text-red-400':''; return <div className="bg-slate-800/50 rounded-xl p-4"><div className="text-sm opacity-70">{t}</div><div className={`text-xl font-semibold ${c}`}>{v}</div></div>}
function usd(x){try{return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(Number(x||0))}catch{return '$'+Number(x||0).toFixed(2)}}
