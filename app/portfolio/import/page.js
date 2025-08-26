'use client'
import { useState } from 'react'

const PREFILL=`NVDA,139
MSFT,40
ASML,20
PLTR,127
SYM,328
TSLA,29
CRWD,12
CELC,406
SRRK,300
ETH,value=10000
TAO,value=30000
AKT,value=15000
RNDR,value=5000`

export default function ImportManual(){
  const [rowsText,setRowsText]=useState(PREFILL)
  const [initial,setInitial]=useState(200000)
  const [out,setOut]=useState(null)
  const [err,setErr]=useState('')

  function parse(text){
    const lines=text.split(/\r?\n/).map(s=>s.trim()).filter(Boolean)
    const items=[]
    for(const L of lines){
      const mQty=L.match(/^([A-Za-z0-9.\-:_]+)\s*,\s*([0-9]+(?:\.[0-9]+)?)$/)
      const mVal=L.match(/^([A-Za-z0-9.\-:_]+).*value\s*=\s*([0-9]+(?:\.[0-9]+)?)$/i)
      if(mQty) items.push({symbol:mQty[1].toUpperCase(), qty:Number(mQty[2])})
      else if(mVal) items.push({symbol:mVal[1].toUpperCase(), value:Number(mVal[2])})
      else throw new Error(`Linha inválida: ${L}`)
    }
    return items
  }

  async function getEquityQuote(symbol){
    try{
      const r=await fetch(`/api/equities/quote?symbol=${encodeURIComponent(symbol)}`,{cache:'no-store'})
      const j=await r.json()
      const last=Number(j.c ?? j.price ?? j.last ?? 0)
      return (isFinite(last)&&last>0)?last:null
    }catch{ return null }
  }

  async function calc(){
    try{
      setErr('')
      const items=parse(rowsText)
      const rows=[]; let sum=0

      for (const it of items){
        if(it.value!=null){
          rows.push({symbol:it.symbol, qty:null, last:null, market_value:it.value})
          sum+=it.value
        }else{
          const last=await getEquityQuote(it.symbol)
          const mv=last? last*it.qty : 0
          rows.push({symbol:it.symbol, qty:it.qty, last, market_value:mv})
          sum+=mv
        }
      }

      const cur=sum
      const pnl=cur-Number(initial||0)
      const pct=Number(initial||0)? (pnl/Number(initial))*100 : 0
      setOut({rows,cur,pnl,pct})
    }catch(e){ setErr(String(e.message||e)) }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto text-slate-100">
      <h1 className="text-2xl font-semibold mb-4">Importar Portfólio (Manual)</h1>

      <div className="bg-slate-800/50 rounded-xl p-4 space-y-3">
        <label>Capital Inicial</label>
        <input className="w-40 rounded bg-slate-700 px-3 py-2" type="number"
               value={initial} onChange={e=>setInitial(e.target.value)} />
        <label>Linhas</label>
        <textarea className="w-full h-56 rounded bg-slate-700 p-3"
                  value={rowsText} onChange={e=>setRowsText(e.target.value)} />
        <button onClick={calc} className="rounded bg-emerald-600 hover:bg-emerald-500 px-4 py-2">
          Calcular
        </button>
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
            <table className="w-full text-sm">
              <thead className="opacity-70 text-left">
                <tr><th>Symbol</th><th>Qty</th><th>Último</th><th>Market Value</th></tr>
              </thead>
              <tbody>
                {out.rows.map((p,i)=>(
                  <tr key={i} className="border-t border-slate-700/50">
                    <td className="py-2">{p.symbol}</td>
                    <td className="py-2">{p.qty ?? '-'}</td>
                    <td className="py-2">{p.last?usd(p.last):'-'}</td>
                    <td className="py-2">{usd(p.market_value||0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function K({t,v,h}){ let c=''; if(typeof h==='number') c=h>0?'text-green-400':h<0?'text-red-400':''; 
  return <div className="bg-slate-800/50 rounded-xl p-4"><div className="text-sm opacity-70">{t}</div><div className={`text-xl font-semibold ${c}`}>{v}</div></div>
}
function usd(x){ try{ return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(Number(x||0)) }catch{ return '$'+Number(x||0).toFixed(2) } }
