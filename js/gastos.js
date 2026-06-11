/* ============ GASTOS ============ */
let expForm={fecha:todayISO(),concepto:'',moneda:'DIVISAS',monto:'',tasa:''};
function expCalc(){
  const monto=parseFloat(expForm.monto)||0;const tasa=parseFloat(expForm.tasa)||0;
  return expForm.moneda==='DIVISAS'?monto:(tasa>0?monto/tasa:0);
}
function viewGastos(){
  const isBs=expForm.moneda==='BOLIVARES';
  const g=expCalc();
  const list=[...db.expenses].reverse();
  let rows=list.map(e=>`<tr data-id="${e.id}">
      <td class="muted">${fDate(e.fecha)}</td>
      <td style="white-space:normal;max-width:280px">${e.kind==='delivery'?'<span class="badge badge-del">Delivery</span> ':''}${esc(e.concepto)}</td>
      <td><span class="badge ${e.moneda==='DIVISAS'?'badge-div':'badge-bs'}">${e.moneda==='DIVISAS'?'Divisas':'Bolívares'}</span></td>
      <td class="num">${e.moneda==='DIVISAS'?fUSD(e.monto):fBs(e.monto)}</td>
      <td class="num muted">${e.tasa?int.format(e.tasa):'—'}</td>
      <td class="num neg">${fUSD(e.gastoUSD)}</td>
      <td style="text-align:right"><button class="row-action act-edit-exp" title="Editar gasto">${ICON.edit}</button><button class="row-action act-del-exp" title="Eliminar gasto">${ICON.trash}</button></td>
    </tr>`).join('');
  if(!list.length)rows=`<tr><td colspan="7"><div class="empty">${ICON.box}<div>Aún no hay gastos registrados.</div></div></td></tr>`;
  const tot=db.expenses.reduce((a,e)=>a+e.gastoUSD,0);
  return `<section class="section">
    <div class="sec-head"><div><h1>Gastos Operativos</h1><p>Delivery, suscripciones y otros gastos del negocio</p></div></div>
    <div class="ventas-layout">
      <form id="expForm" class="card card-pad" autocomplete="off">
        <div class="form-grid">
          <div class="field"><label class="lbl">Fecha</label><input class="inp" type="date" name="fecha" value="${expForm.fecha}" /></div>
          <div class="field"><label class="lbl">Moneda</label>
            <div class="seg" data-seg="moneda">
              <button type="button" data-v="DIVISAS" class="${!isBs?'on':''}">Divisas ($)</button>
              <button type="button" data-v="BOLIVARES" class="${isBs?'on':''}">Bolívares (Bs)</button>
            </div>
          </div>
          <div class="field full"><label class="lbl">Concepto</label><input class="inp" type="text" name="concepto" placeholder="Ej. Delivery MRW" value="${esc(expForm.concepto)}" /></div>
          <div class="field ${isBs?'':'full'}"><label class="lbl">Monto ${isBs?'(Bs)':'($)'}</label><input class="inp" type="number" step="any" name="monto" placeholder="0" value="${expForm.monto}" /></div>
          ${isBs?`<div class="field"><label class="lbl">Tasa de cambio</label><input class="inp" type="number" step="any" name="tasa" placeholder="Bs por $" value="${expForm.tasa}" /></div>`:''}
        </div>
        <div class="calc-row calc-total" style="margin-top:6px"><span class="k">Gasto real USD</span><span class="v neg">${fUSD(g)}</span></div>
        <div style="margin-top:18px"><button class="btn btn-gold" type="submit" style="width:100%;justify-content:center">${ICON.plus} Registrar gasto</button></div>
      </form>
      <div class="calc">
        <div class="calc-row"><span class="k">Gastos registrados</span><span class="v">${db.expenses.length}</span></div>
        <div class="calc-row calc-total"><span class="k">Gasto operativo total</span><span class="v neg">${fUSD(tot)}</span></div>
      </div>
    </div>
    <div class="sec-head" style="margin-top:38px"><div><h1 style="font-size:18px">Historial de gastos</h1></div></div>
    <div class="table-wrap">
      <table><thead><tr><th>Fecha</th><th>Concepto</th><th>Moneda</th><th class="num">Monto</th><th class="num">Tasa</th><th class="num">Gasto USD</th><th></th></tr></thead>
      <tbody>${rows}</tbody></table>
    </div>
  </section>`;
}

function refreshExpCalc(){const g=expCalc();const el=document.querySelector('#expForm .calc-total .v');if(el)el.textContent=fUSD(g);const side=document.querySelector('.calc .calc-total .v');if(side&&side!==el)side.textContent=fUSD(expCalc());}

function submitExp(){
  const g=expCalc();
  if(!expForm.concepto.trim()){toast('Escribe el concepto');return}
  if(!(parseFloat(expForm.monto)>0)){toast('Ingresa el monto');return}
  if(expForm.moneda==='BOLIVARES'&&!(parseFloat(expForm.tasa)>0)){toast('Ingresa la tasa de cambio');return}
  db.expenses.push({id:uid(),fecha:expForm.fecha||todayISO(),concepto:expForm.concepto.trim(),moneda:expForm.moneda,monto:parseFloat(expForm.monto),tasa:expForm.moneda==='BOLIVARES'?parseFloat(expForm.tasa):null,gastoUSD:g});
  expForm={fecha:todayISO(),concepto:'',moneda:'DIVISAS',monto:'',tasa:''};
  render();toast('✓ Gasto registrado');
}

/* ============ EDIT GASTO ============ */
function openEditExp(id,tmp){
  const ex=db.expenses.find(x=>x.id===id);if(!ex)return;
  const cur=tmp||{fecha:ex.fecha,concepto:ex.concepto,moneda:ex.moneda,monto:ex.monto,tasa:ex.tasa||''};
  const isBs=cur.moneda==='BOLIVARES';
  document.getElementById('modal-root').innerHTML=`<div class="modal-back" id="mback"><div class="modal" style="max-width:480px">
    <div class="modal-head"><h3>Editar gasto</h3><button class="btn-ghost btn" id="mx" style="padding:4px 8px">✕</button></div>
    <div class="modal-body"><div class="form-grid">
      <div class="field"><label class="lbl">Fecha</label><input class="inp" id="eef-fecha" type="date" value="${esc(cur.fecha)}" /></div>
      <div class="field"><label class="lbl">Moneda</label><div class="seg" id="eef-moneda"><button type="button" data-v="DIVISAS" class="${!isBs?'on':''}">Divisas ($)</button><button type="button" data-v="BOLIVARES" class="${isBs?'on':''}">Bolívares (Bs)</button></div></div>
      <div class="field full"><label class="lbl">Concepto</label><input class="inp" id="eef-concepto" type="text" placeholder="Ej. Delivery MRW" value="${esc(cur.concepto)}" /></div>
      <div class="field ${isBs?'':'full'}"><label class="lbl">Monto ${isBs?'(Bs)':'($)'}</label><input class="inp" id="eef-monto" type="number" step="any" placeholder="0" value="${esc(cur.monto)}" /></div>
      ${isBs?`<div class="field"><label class="lbl">Tasa de cambio</label><input class="inp" id="eef-tasa" type="number" step="any" placeholder="Bs por $" value="${esc(cur.tasa)}" /></div>`:`<input type="hidden" id="eef-tasa" value="" />`}
    </div></div>
    <div class="modal-foot"><button class="btn btn-ghost" id="mcancel">Cancelar</button><button class="btn btn-gold" id="eef-save">Guardar cambios</button></div>
  </div></div>`;
  const close=closeModal;
  document.getElementById('mx').onclick=close;document.getElementById('mcancel').onclick=close;
  document.getElementById('mback').onclick=ev=>{if(ev.target.id==='mback')close()};
  document.querySelectorAll('#eef-moneda button').forEach(b=>b.onclick=()=>{
    openEditExp(id,{fecha:document.getElementById('eef-fecha').value,concepto:document.getElementById('eef-concepto').value,moneda:b.dataset.v,monto:document.getElementById('eef-monto').value,tasa:''});
  });
  document.getElementById('eef-save').onclick=()=>{
    const fecha=document.getElementById('eef-fecha').value;
    const concepto=document.getElementById('eef-concepto').value.trim();
    const monto=parseFloat(document.getElementById('eef-monto').value)||0;
    const tasa=parseFloat(document.getElementById('eef-tasa').value)||0;
    if(!concepto){toast('Escribe el concepto');return}
    if(!(monto>0)){toast('Ingresa el monto');return}
    if(isBs&&!(tasa>0)){toast('Ingresa la tasa de cambio');return}
    const gastoUSD=isBs?(tasa>0?monto/tasa:0):monto;
    ex.fecha=fecha;ex.concepto=concepto;ex.moneda=cur.moneda;ex.monto=monto;
    ex.tasa=isBs?tasa:null;ex.gastoUSD=gastoUSD;
    close();save();render();toast('✓ Gasto actualizado');
  };
}
