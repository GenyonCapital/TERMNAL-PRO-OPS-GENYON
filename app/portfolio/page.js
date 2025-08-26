'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function Portfolio() {
  const [data,setData]=useState(null),[err,setErr]=useState(null)
  useEffect(()=>{(async()=>{try{const r=await fetch('/api/portfolio',{cache:'no-store'});setData(await r.json())}catch(e){setErr(String(e))}})()},[])
  return (
    <div className="p-6 max-w-5xl mx-auto text-slate-100">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold mb-4">Desempenho da Carteira</h1>
        <Link href="/portfolio/import" className="rounded bg-slate-700 px-3 py-2 hover:bg-slate-600">Importar Manual</Link>
      </div>
      {err && <div className="bg-red-900/40 p-3 rounded">Erro: {err}</div>}
      {!data && <div className="opacity-70">A carregar…</div>}
      {data && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <K t="Capital Inicial" v={usd(data.initial_capital)} />
            <K t="Valor Atual" v={data.current_value!=null?usd(data.current_value):'N/D'} />
            <K t="PnL (USD)" v={data.pnl_abs!=null?usd(data.pnl_abs):'N/D'} h={data.pnl_abs} />
            <K t="% Total" v={data.pnl_pct!=null?`${data.pnl_pct.toFixed(2)}%`:'N/D'} h={data.pnl_pct} />
          </div>
          {data.note && <div className="bg-yellow-900/30 rounded p-3 text-sm">{data.note}</div>}
          <div className="bg-slate-800/50 rounded-xl p-4">
            <div className="text-sm opacity-70 mb-2">Posições</div>
            <table className="w-full text-sm">
              <thead className="opacity-70 text-left">
                <tr><th className="py-2">Symbol</th><th className="py-2">Qty</th><th className="py-2">Último</th><th className="py-2">Market Value</th></tr>
              </thead>
              <tbody>
                {data.positions?.map((p,i)=>(
                  <tr key={i} className="border-t border-slate-700/50">
                    <td className="py-2">{p.symbol}</td><td className="py-2">{p.qty}</td>
                    <td className="py-2">{p.last?usd(p.last):'N/D'}</td><td className="py-2">{usd(p.market_value||0)}</td>
                  </tr>
                ))}
                <tr className="border-t border-slate-700/50"><td className="py-2 font-medium">Cash</td><td>—</td><td>—</td><td>{usd(data.cash||0)}</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
function K({t,v,h}){let c='text-xl font-semibold'; if(typeof h==='number'){if(h>0)c+=' text-green-400'; if(h<0)c+=' text-red-400'} return <div className="bg-slate-800/50 rounded-xl p-4"><div className="text-sm opacity-70">{t}</div><div className={c}>{v}</div></div>}
function usd(x){try{return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(x||0)}catch{return '$'+Number(x||0).toFixed(2)}}
