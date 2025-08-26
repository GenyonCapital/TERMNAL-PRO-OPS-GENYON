
export default function Page(){
  return (
    <div>
      <h1>Definições</h1>
      <div className="panel">
        <p>Cria <code>.env</code> a partir de <code>.env.example</code> e preenche <strong>apenas</strong> as 3 chaves (Binance, Alpaca, Polygon ou Finnhub). Depois faz redeploy.</p>
<pre>
BINANCE_KEY=...
BINANCE_SECRET=...
BINANCE_BASE=https://api.binance.com
ALPACA_KEY=...
ALPACA_SECRET=...
ALPACA_ENV=paper
POLYGON_API_KEY=...
FINNHUB_API_KEY=...
ALLOW_TRADING=false
NEXT_PUBLIC_DEFAULT_NOTIONAL=5000
</pre>
      </div>
    </div>
  )
}
