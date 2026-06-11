/* ============ VENTAS ============ */
let saleForm={fecha:todayISO(),modelo:'',tipoPago:'DIVISAS',monto:'',tasa:'',nota:'',delivery:false,delMoneda:'BOLIVARES',delMonto:'',delTasa:''};
function saleCalc(){
  const m=db.inventory.find(x=>x.id===saleForm.modelo);
  const monto=parseFloat(saleForm.monto)||0;
  const tasa=parseFloat(saleForm.tasa)||0;
  let ingreso=0;
  if(saleForm.tipoPago==='DIVISAS')ingreso=monto;
  else ingreso=tasa>0?monto/tasa:0;
  const costo=m?+m.costo:0;
  // delivery (opcional)
  let delUSD=0;
  if(saleForm.delivery){
    const dm=parseFloat(saleForm.delMonto)||0;const dt=parseFloat(saleForm.delTasa)||0;
    delUSD=saleForm.delMoneda==='DIVISAS'?dm:(dt>0?dm/dt:0);
  }
  const ganancia=ingreso-costo-delUSD;
  return {m,monto,tasa,ingreso,costo,delUSD,ganancia};
}
function viewVentas(){
  const opts=db.inventory.map(m=>`<option value="${m.id}" ${m.id===saleForm.modelo?'selected':''}>${esc(m.modelo)} · stock ${m.stockActual}</option>`).join('');
  const c=saleCalc();
  const isBs=saleForm.tipoPago==='BOLIVARES';
  const sales=[...db.sales].reverse();
  let rows=sales.map(s=>{
    const del=+s.deliveryUSD||0;
    const net=s.ganancia-del;
    return `<tr data-id="${s.id}">
      <td class="muted">${fDate(s.fecha)}</td>
      <td class="model-name">${esc(s.modelo)}</td>
      <td><span class="badge ${s.tipoPago==='DIVISAS'?'badge-div':'badge-bs'}">${s.tipoPago==='DIVISAS'?'Divisas':'Bolívares'}</span></td>
      <td class="num">${s.tipoPago==='DIVISAS'?fUSD(s.monto):fBs(s.monto)}</td>
      <td class="num muted">${s.tasa?int.format(s.tasa):'—'}</td>
      <td class="num">${fUSD(s.ingresoUSD)}</td>
      <td class="num muted">${fUSD(s.costoLanded)}</td>
      <td class="num">${del>0?'<span class="neg">-'+fUSD(del)+'</span>':'<span class="muted">—</span>'}</td>
      <td class="num ${net>=0?'pos':'neg'}">${fUSD(net)}</td>
      <td class="muted" style="white-space:normal;max-width:120px">${esc(s.nota)}</td>
      <td style="text-align:right"><button class="row-action act-edit-sale" title="Editar venta">${ICON.edit}</button><button class="row-action act-del-sale" title="Eliminar venta">${ICON.trash}</button></td>
    </tr>`;}).join('');
  if(!sales.length)rows=`<tr><td colspan="11"><div class="empty">${ICON.box}<div>Aún no hay ventas registradas.</div></div></td></tr>`;
  const totIngreso=db.sales.reduce((a,s)=>a+s.ingresoUSD,0);
  const totGan=db.sales.reduce((a,s)=>a+s.ganancia-(+s.deliveryUSD||0),0);
  return `<section class="section">
    <div class="sec-head"><div><h1>Ventas</h1><p>Registra una venta y el stock del modelo bajará automáticamente</p></div></div>
    <div class="ventas-layout">
      <form id="saleForm" class="card card-pad" autocomplete="off">
        <div class="form-grid">
          <div class="field"><label class="lbl">Fecha</label><input class="inp" type="date" name="fecha" value="${saleForm.fecha}" /></div>
          <div class="field"><label class="lbl">Modelo</label>
            <select class="inp" name="modelo"><option value="">Seleccionar…</option>${opts}</select>
          </div>
          <div class="field full"><label class="lbl">Tipo de pago</label>
            <div class="seg" data-seg="tipoPago">
              <button type="button" data-v="DIVISAS" class="${!isBs?'on':''}">Divisas ($)</button>
              <button type="button" data-v="BOLIVARES" class="${isBs?'on':''}">Bolívares (Bs)</button>
            </div>
          </div>
          <div class="field ${isBs?'':'full'}"><label class="lbl">Monto recibido ${isBs?'(Bs)':'($)'}</label><input class="inp" type="number" step="any" name="monto" placeholder="0" value="${saleForm.monto}" /></div>
          ${isBs?`<div class="field"><label class="lbl">Tasa de cambio</label><input class="inp" type="number" step="any" name="tasa" placeholder="Bs por $" value="${saleForm.tasa}" /></div>`:''}
          <div class="field full"><label class="lbl">Nota (opcional)</label><input class="inp" type="text" name="nota" placeholder="Ej. cliente, fiado…" value="${esc(saleForm.nota)}" /></div>
        </div>
        <div class="del-box">
          <div class="del-head" id="delToggle">
            <span class="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 18a2 2 0 1 0 4 0 2 2 0 0 0-4 0zM15 18a2 2 0 1 0 4 0 2 2 0 0 0-4 0z"/><path d="M3 6h11v9M14 9h3l3 3v3h-2"/></svg></span>
            <span class="t"><b>Delivery de esta venta</b><span>Opcional · se resta a la ganancia y se guarda en gastos</span></span>
            <span class="switch ${saleForm.delivery?'on':''}"></span>
          </div>
          ${saleForm.delivery?`<div class="del-body"><div class="form-grid">
            <div class="field full"><label class="lbl">Moneda del delivery</label>
              <div class="seg" data-seg="delMoneda">
                <button type="button" data-v="DIVISAS" class="${saleForm.delMoneda==='DIVISAS'?'on':''}">Divisas ($)</button>
                <button type="button" data-v="BOLIVARES" class="${saleForm.delMoneda==='BOLIVARES'?'on':''}">Bolívares (Bs)</button>
              </div>
            </div>
            <div class="field ${saleForm.delMoneda==='BOLIVARES'?'':'full'}"><label class="lbl">Monto delivery ${saleForm.delMoneda==='BOLIVARES'?'(Bs)':'($)'}</label><input class="inp" type="number" step="any" name="delMonto" placeholder="0" value="${saleForm.delMonto}" /></div>
            ${saleForm.delMoneda==='BOLIVARES'?`<div class="field"><label class="lbl">Tasa de cambio</label><input class="inp" type="number" step="any" name="delTasa" placeholder="Bs por $" value="${saleForm.delTasa}" /></div>`:''}
          </div></div>`:''}
        </div>
        <div style="margin-top:18px"><button class="btn btn-gold" type="submit" style="width:100%;justify-content:center">${ICON.plus} Registrar venta</button></div>
      </form>
      <div class="calc">
        <div class="calc-row"><span class="k">Costo landed (auto)</span><span class="v muted">${c.m?fUSD(c.costo):'—'}</span></div>
        <div class="calc-row"><span class="k">Ingreso real USD</span><span class="v">${fUSD(c.ingreso)}</span></div>
        ${isBs?`<div class="calc-row"><span class="k">Cálculo ingreso</span><span class="v muted" style="font-size:12.5px">${c.monto?int.format(c.monto):0} ÷ ${c.tasa||0}</span></div>`:''}
        ${c.delUSD>0?`<div class="calc-row"><span class="k">Delivery</span><span class="v neg">-${fUSD(c.delUSD)}</span></div>`:''}
        <div class="calc-row calc-total"><span class="k">Ganancia neta</span><span class="v ${c.ganancia>=0?'pos':'neg'}">${fUSD(c.ganancia)}</span></div>
        ${c.m&&c.m.stockActual<=0?`<div class="hint" style="color:var(--red);margin-top:10px">⚠ Este modelo está agotado. Igual puedes registrar la venta (stock quedará negativo).</div>`:''}
      </div>
    </div>
    <div class="sec-head" style="margin-top:38px"><div><h1 style="font-size:18px">Historial de ventas</h1></div>
      <div class="pill-summary"><span>Facturación: <b>${fUSD(totIngreso)}</b></span><span>Ganancia: <b class="pos" style="color:var(--green)">${fUSD(totGan)}</b></span></div>
    </div>
    <div class="table-wrap">
      <table><thead><tr>
        <th>Fecha</th><th>Modelo</th><th>Pago</th><th class="num">Monto</th><th class="num">Tasa</th><th class="num">Ingreso USD</th><th class="num">Costo landed</th><th class="num">Delivery</th><th class="num">Ganancia neta</th><th>Nota</th><th></th>
      </tr></thead><tbody>${rows}</tbody></table>
    </div>
  </section>`;
}

function refreshCalc(){
  const c=saleCalc();const calc=document.querySelector('.calc');if(!calc)return;
  const isBs=saleForm.tipoPago==='BOLIVARES';
  calc.innerHTML=`<div class="calc-row"><span class="k">Costo landed (auto)</span><span class="v muted">${c.m?fUSD(c.costo):'—'}</span></div>
    <div class="calc-row"><span class="k">Ingreso real USD</span><span class="v">${fUSD(c.ingreso)}</span></div>
    ${isBs?`<div class="calc-row"><span class="k">Cálculo ingreso</span><span class="v muted" style="font-size:12.5px">${c.monto?int.format(c.monto):0} ÷ ${c.tasa||0}</span></div>`:''}
    ${c.delUSD>0?`<div class="calc-row"><span class="k">Delivery</span><span class="v neg">-${fUSD(c.delUSD)}</span></div>`:''}
    <div class="calc-row calc-total"><span class="k">Ganancia neta</span><span class="v ${c.ganancia>=0?'pos':'neg'}">${fUSD(c.ganancia)}</span></div>
    ${c.m&&c.m.stockActual<=0?`<div class="hint" style="color:var(--red);margin-top:10px">⚠ Este modelo está agotado. Igual puedes registrar la venta.</div>`:''}`;
}

function submitSale(){
  const c=saleCalc();
  if(!saleForm.modelo){toast('Selecciona un modelo');return}
  if(!(c.monto>0)){toast('Ingresa el monto recibido');return}
  if(saleForm.tipoPago==='BOLIVARES'&&!(c.tasa>0)){toast('Ingresa la tasa de cambio');return}
  const m=c.m;
  if(saleForm.delivery&&saleForm.delMoneda==='BOLIVARES'&&!((parseFloat(saleForm.delTasa)||0)>0)){toast('Ingresa la tasa del delivery');return}
  const sid=uid();
  db.sales.push({id:sid,fecha:saleForm.fecha||todayISO(),modelo:m.modelo,tipoPago:saleForm.tipoPago,monto:c.monto,tasa:saleForm.tipoPago==='BOLIVARES'?c.tasa:null,ingresoUSD:c.ingreso,costoLanded:c.costo,ganancia:c.ingreso-c.costo,deliveryUSD:c.delUSD,nota:saleForm.nota||''});
  if(c.delUSD>0){
    db.expenses.push({id:uid(),fecha:saleForm.fecha||todayISO(),concepto:'Delivery · '+m.modelo,moneda:saleForm.delMoneda,monto:parseFloat(saleForm.delMonto)||0,tasa:saleForm.delMoneda==='BOLIVARES'?(parseFloat(saleForm.delTasa)||0):null,gastoUSD:c.delUSD,kind:'delivery',fromSale:sid});
  }
  m.stockActual=(+m.stockActual||0)-1;
  saleForm={fecha:todayISO(),modelo:'',tipoPago:'DIVISAS',monto:'',tasa:'',nota:'',delivery:false,delMoneda:'BOLIVARES',delMonto:'',delTasa:''};
  render();toast('✓ Venta registrada · '+m.modelo+' (stock '+m.stockActual+')');
}

/* ============ EDIT MODALS ============ */
function openEditSale(id,tmp){
  const s=db.sales.find(x=>x.id===id);if(!s)return;
  const cur=tmp||{fecha:s.fecha,modelo:s.modelo,tipoPago:s.tipoPago,monto:s.monto,tasa:s.tasa||'',nota:s.nota||''};
  const isBs=cur.tipoPago==='BOLIVARES';
  const opts=db.inventory.map(m=>`<option value="${m.id}" ${m.modelo===cur.modelo?'selected':''}>${esc(m.modelo)} · stock ${m.stockActual}</option>`).join('');
  document.getElementById('modal-root').innerHTML=`<div class="modal-back" id="mback"><div class="modal" style="max-width:520px">
    <div class="modal-head"><h3>Editar venta</h3><button class="btn-ghost btn" id="mx" style="padding:4px 8px">✕</button></div>
    <div class="modal-body"><div class="form-grid">
      <div class="field"><label class="lbl">Fecha</label><input class="inp" id="esf-fecha" type="date" value="${esc(cur.fecha)}" /></div>
      <div class="field"><label class="lbl">Modelo</label><select class="inp" id="esf-modelo"><option value="">Seleccionar…</option>${opts}</select></div>
      <div class="field full"><label class="lbl">Tipo de pago</label><div class="seg" id="esf-tipo"><button type="button" data-v="DIVISAS" class="${!isBs?'on':''}">Divisas ($)</button><button type="button" data-v="BOLIVARES" class="${isBs?'on':''}">Bolívares (Bs)</button></div></div>
      <div class="field ${isBs?'':'full'}"><label class="lbl">Monto recibido ${isBs?'(Bs)':'($)'}</label><input class="inp" id="esf-monto" type="number" step="any" placeholder="0" value="${esc(cur.monto)}" /></div>
      ${isBs?`<div class="field"><label class="lbl">Tasa de cambio</label><input class="inp" id="esf-tasa" type="number" step="any" placeholder="Bs por $" value="${esc(cur.tasa)}" /></div>`:`<input type="hidden" id="esf-tasa" value="" />`}
      <div class="field full"><label class="lbl">Nota (opcional)</label><input class="inp" id="esf-nota" type="text" placeholder="Ej. cliente, fiado…" value="${esc(cur.nota)}" /></div>
    </div></div>
    <div class="modal-foot"><button class="btn btn-ghost" id="mcancel">Cancelar</button><button class="btn btn-gold" id="esf-save">Guardar cambios</button></div>
  </div></div>`;
  const close=closeModal;
  document.getElementById('mx').onclick=close;document.getElementById('mcancel').onclick=close;
  document.getElementById('mback').onclick=ev=>{if(ev.target.id==='mback')close()};
  document.querySelectorAll('#esf-tipo button').forEach(b=>b.onclick=()=>{
    const selEl=document.getElementById('esf-modelo');
    const inv=db.inventory.find(x=>x.id===selEl.value);
    openEditSale(id,{fecha:document.getElementById('esf-fecha').value,modelo:inv?inv.modelo:cur.modelo,tipoPago:b.dataset.v,monto:document.getElementById('esf-monto').value,tasa:'',nota:document.getElementById('esf-nota').value});
  });
  document.getElementById('esf-save').onclick=()=>{
    const fecha=document.getElementById('esf-fecha').value;
    const invId=document.getElementById('esf-modelo').value;
    const inv=db.inventory.find(x=>x.id===invId);
    const monto=parseFloat(document.getElementById('esf-monto').value)||0;
    const tasa=parseFloat(document.getElementById('esf-tasa').value)||0;
    const nota=document.getElementById('esf-nota').value.trim();
    if(!invId){toast('Selecciona un modelo');return}
    if(!(monto>0)){toast('Ingresa el monto');return}
    if(isBs&&!(tasa>0)){toast('Ingresa la tasa de cambio');return}
    const ingresoUSD=isBs?(tasa>0?monto/tasa:0):monto;
    const costoLanded=inv?+inv.costo:s.costoLanded;
    s.fecha=fecha;s.modelo=inv?inv.modelo:s.modelo;s.tipoPago=cur.tipoPago;s.monto=monto;
    s.tasa=isBs?tasa:null;s.ingresoUSD=ingresoUSD;s.costoLanded=costoLanded;
    s.ganancia=ingresoUSD-costoLanded;s.nota=nota;
    close();save();render();toast('✓ Venta actualizada');
  };
}
