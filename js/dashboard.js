/* ============ DASHBOARD ============ */
let dashMonth='total';
const MES=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
function ymKey(iso){return (iso||'').slice(0,7)}
function ymLabel(ym){const[y,m]=ym.split('-');const l=MES[+m-1]+' '+y;return l.charAt(0).toUpperCase()+l.slice(1)}
function availableMonths(){
  const set=new Set();
  db.sales.forEach(s=>set.add(ymKey(s.fecha)));
  db.expenses.forEach(e=>set.add(ymKey(e.fecha)));
  set.add(ymKey(todayISO()));
  return [...set].filter(Boolean).sort();
}
function viewDashboard(){
  const months=availableMonths();
  if(dashMonth!=='total'&&!months.includes(dashMonth))dashMonth='total';
  const inSel=iso=>dashMonth==='total'||ymKey(iso)===dashMonth;
  const sales=db.sales.filter(s=>inSel(s.fecha));
  const expenses=db.expenses.filter(e=>inSel(e.fecha));
  const periodo=dashMonth==='total'?'Histórico completo':ymLabel(dashMonth);
  const unidades=sales.length;
  const facturacion=sales.reduce((a,s)=>a+s.ingresoUSD,0);
  const costos=sales.reduce((a,s)=>a+s.costoLanded,0);
  const gasto=expenses.reduce((a,e)=>a+e.gastoUSD,0);
  const ganancia=facturacion-costos-gasto;
  // chips
  const chips=`<span class="mlabel">Periodo</span><button class="mchip ${dashMonth==='total'?'on':''}" data-m="total">Total histórico</button>`+
    [...months].reverse().map(m=>`<button class="mchip ${dashMonth===m?'on':''}" data-m="${m}">${ymLabel(m)}</button>`).join('');
  // group by date (filtered)
  const map={};
  sales.forEach(s=>{const k=s.fecha;(map[k]=map[k]||{u:0,f:0,g:0}),map[k].u++,map[k].f+=s.ingresoUSD,map[k].g+=s.ganancia-(+s.deliveryUSD||0)});
  const days=Object.keys(map).sort();
  const maxF=Math.max(1,...days.map(d=>map[d].f));
  const recent=days.slice(-14);
  const bars=recent.map(d=>{
    const h=Math.round(map[d].f/maxF*140);
    return `<div class="bar-col"><div class="val">$${Math.round(map[d].f)}</div><div class="bar-stack"><div class="bar" style="height:${h}px"></div></div><div class="lbl">${fDate(d).slice(0,5)}</div></div>`;
  }).join('');
  const rowsDaily=[...days].reverse().map(d=>`<tr>
      <td>${fDateLong(d)}</td>
      <td class="num">${map[d].u}</td>
      <td class="num">${fUSD(map[d].f)}</td>
      <td class="num pos">${fUSD(map[d].g)}</td>
    </tr>`).join('')||`<tr><td colspan="4"><div class="empty">${ICON.box}<div>Sin ventas en ${esc(periodo.toLowerCase())}</div></div></td></tr>`;
  const facLbl=dashMonth==='total'?'Facturación histórica':'Facturación del mes';
  const ganLbl=dashMonth==='total'?'Ganancia neta total':'Ganancia neta del mes';
  return `<section class="section">
    <div class="sec-head"><div><h1>Dashboard</h1><p>${periodo} · ${unidades} ${unidades===1?'venta':'ventas'} en ${days.length} ${days.length===1?'día':'días'}</p></div></div>
    <div class="month-bar">${chips}</div>
    <div class="kpi-grid">
      <div class="kpi accent"><div class="k">Unidades vendidas</div><div class="v">${unidades}</div><div class="meta">relojes${dashMonth==='total'?' en total':''}</div></div>
      <div class="kpi"><div class="k">${facLbl}</div><div class="v">${fUSD(facturacion)}</div><div class="meta">ingreso real USD</div></div>
      <div class="kpi bad"><div class="k">Gasto operativo</div><div class="v">${fUSD(gasto)}</div><div class="meta">${expenses.length} ${expenses.length===1?'gasto':'gastos'}</div></div>
      <div class="kpi good"><div class="k">${ganLbl}</div><div class="v">${fUSD(ganancia)}</div><div class="meta">facturación − costos − gastos</div></div>
    </div>
    <div class="card card-pad" style="margin-bottom:26px">
      <div style="display:flex;justify-content:space-between;align-items:center"><strong style="font-size:14px">Facturación diaria</strong><div class="legend"><span><i style="background:var(--gold)"></i>USD facturado por día</span></div></div>
      <div class="chart">${bars||'<div class="empty" style="width:100%">'+ICON.box+'<div>Sin ventas en '+esc(periodo.toLowerCase())+'</div></div>'}</div>
    </div>
    <div class="sec-head" style="margin-bottom:14px"><div><h1 style="font-size:18px">Resumen diario</h1><p>Agrupado automáticamente por fecha</p></div></div>
    <div class="table-wrap">
      <table><thead><tr><th>Fecha</th><th class="num">Unidades vendidas</th><th class="num">Facturación del día</th><th class="num">Ganancia del día</th></tr></thead>
      <tbody>${rowsDaily}</tbody></table>
    </div>
  </section>`;
}
