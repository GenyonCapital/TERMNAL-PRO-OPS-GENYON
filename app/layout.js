
export const metadata = { title:'GENYON — LOBO Terminal', description:'Gestor IA semi-automático (tipo Bloomberg)' };
import './globals.css';
export default function RootLayout({ children }){
  return (
    <html lang="pt">
      <body>
        <div className="shell">
          <aside className="sidebar">
            <h2>GENYON</h2>
            <div className="nav">
              <a href="/">Radar</a>
              <a href="/spikes">Volume Spikes</a>
              <a href="/gainers">Gainers/Losers</a>
              <a href="/catalysts">Catalisadores</a>
              <a href="/orders">Ordens</a>
              <a href="/logs">Logs</a>
              <a href="/settings">Definições</a>
            </div>
            <footer><small className="mono">v4.0 • semi-auto</small></footer>
          
            <a href="/portfolio" className="block px-3 py-2 rounded hover:bg-slate-800">Portfólio</a>
</aside>
          <main className="content">{children}</main>
        </div>
      </body>
    </html>
  )
}
