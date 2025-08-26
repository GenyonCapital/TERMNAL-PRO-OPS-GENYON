
import CryptoGuardrails from './components/CryptoGuardrails';
import EquityMiniTable from './components/EquityMiniTable';
import { UNIVERSE } from './config/defaults';

export default function Page(){
  return (
    <div>
      <h1>Radar</h1>
      <div className="panel">
        <h3>Crypto Guardrails</h3>
        <CryptoGuardrails/>
        <small className="mono">ETH≥4300, TAO≥320, AKT≥1.00, RNDR≥5 • fonte: Coingecko</small>
      </div>
      <div className="panel">
        <h3>Equities (universo GENYON)</h3>
        <EquityMiniTable list={UNIVERSE}/>
        <small className="mono">Quotes via Polygon → fallback Finnhub</small>
      </div>
    </div>
  )
}
