
export function fmt(n, d=2){ if(n==null||isNaN(n)) return '-'; return Number(n).toFixed(d); }
export function pct(n){ if(n==null||isNaN(n)) return '-'; return (n>=0?'+':'') + Number(n).toFixed(2) + '%'; }
export function ts(t){ try{ return new Date(t).toLocaleString(); }catch{ return t; } }
