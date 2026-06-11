/* ============ ENVIOS ============ */
let shipForm={fecha:todayISO(),estatus:'proceso',telefono:'',modelos:[],moneda:'DIVISAS',total:'',horaMin:'',horaMax:'',ubicacion:'',link:''};
let shipFilter='todos';
const ST_LABEL={proceso:'En proceso',entregado:'Entregado',no_entregado:'No entregado'};
const ST_ORDER=['proceso','entregado','no_entregado'];
function waLink(num){const d=(num||'').replace(/[^0-9]/g,'');return d?'https://wa.me/'+d:''}
function viewEnvios(){
  const opts=db.inventory.map(m=>`<option value="${esc(m.modelo)}">${esc(m.modelo)} · stock ${m.stockActual}</option>`).join('');
  const sel=shipForm.modelos.map((m,i)=>`<span class="pchip">${esc(m)}<button type="button" data-rm="${i}" title="Quitar">✕</button></span>`).join('');
  const isBs=shipForm.moneda==='BOLIVARES';
  const cnt={todos:db.shipments.length,proceso:0,entregado:0,no_entregado:0};
  db.shipments.forEach(s=>cnt[s.estatus]=(cnt[s.estatus]||0)+1);
  const filterChips=[['todos','Todos'],['proceso','En proceso'],['entregado','Entregado'],['no_entregado','No entregado']]
    .map(([k,l])=>`<button class="mchip ${shipFilter===k?'on':''}" data-f="${k}">${l} · ${cnt[k]||0}</button>`).join('');
  const list=[...db.shipments].reverse().filter(s=>shipFilter==='todos'||s.estatus===shipFilter);
  let cards=list.map(s=>{
    const wa=waLink(s.telefono);
    const totalTxt=s.total!==''&&s.total!=null?(s.moneda==='DIVISAS'?fUSD(s.total):fBs(s.total)):'';
    const horas=(s.horaMin||s.horaMax)?`${s.horaMin||'—'} a ${s.horaMax||'—'}`:'';
    return `<div class="ship-card ${s.estatus}" data-id="${s.id}">
      <div class="ship-top">
        <span class="st-badge st-${s.estatus}"><i></i>${ST_LABEL[s.estatus]}</span>
        <span class="ship-date">${fDate(s.fecha)}</span>
      </div>
      <div class="ship-phone">
        ${wa?`<a class="wa-btn" href="${wa}" target="_blank" rel="noopener">${ICON.wa}${esc(s.telefono)}</a>`:`<span class="muted">${s.telefono?esc(s.telefono):'Sin número'}</span>`}
      </div>
      ${s.modelos&&s.modelos.length?`<div class="ship-models">${s.modelos.map(m=>`<span class="mtag">${esc(m)}</span>`).join('')}</div>`:''}
      ${totalTxt?`<div><span class="muted" style="font-size:12px">Pago total: </span><span class="ship-total">${totalTxt}</span></div>`:''}
      ${(horas||s.ubicacion||s.link)?`<div class="ship-meta">
        ${horas?`<div class="mrow">${ICON.clock}<span>${esc(horas)}</span></div>`:''}
        ${s.ubicacion?`<div class="mrow">${ICON.pin}<span>${esc(s.ubicacion)}</span></div>`:''}
        ${s.link?`<div class="mrow">${ICON.link}<a href="${esc(s.link)}" target="_blank" rel="noopener">Ver en Google Maps</a></div>`:''}
      </div>`:''}
      <div class="ship-meta" style="flex-direction:row;justify-content:space-between;align-items:center">
        <div class="ship-actions">
          ${ST_ORDER.map(k=>`<button class="st-cycle st-set" data-set="${k}" style="${s.estatus===k?'border-color:var(--gold);color:var(--gold)':''}">${ST_LABEL[k]}</button>`).join('')}
        </div>
        <button class="row-action act-del-ship" title="Eliminar envío">${ICON.trash}</button>
      </div>
    </div>`;
  }).join('');
  if(!list.length)cards=`<div class="empty" style="grid-column:1/-1">${ICON.truck}<div>No hay envíos${shipFilter!=='todos'?' en este estado':''}. Agrega uno con el formulario de arriba.</div></div>`;
  return `<section class="section">
    <div class="sec-head"><div><h1>Gestión de Envíos</h1><p>Organiza tus entregas del día: estatus, contacto y ubicación</p></div></div>
    <form id="shipForm" class="card card-pad" autocomplete="off" style="margin-bottom:28px">
      <div class="form-grid">
        <div class="field"><label class="lbl">Fecha</label><input class="inp" type="date" name="fecha" value="${shipForm.fecha}" /></div>
        <div class="field"><label class="lbl">Estatus</label>
          <div class="seg" data-seg="estatus">
            <button type="button" data-v="proceso" class="${shipForm.estatus==='proceso'?'on':''}">En proceso</button>
            <button type="button" data-v="entregado" class="${shipForm.estatus==='entregado'?'on':''}">Entregado</button>
            <button type="button" data-v="no_entregado" class="${shipForm.estatus==='no_entregado'?'on':''}">No entregado</button>
          </div>
        </div>
        <div class="field full"><label class="lbl">Número (WhatsApp)</label><input class="inp" type="tel" name="telefono" placeholder="Ej. 584121234567" value="${esc(shipForm.telefono)}" /><div class="hint">Solo el número — podrás abrir el chat de WhatsApp con un clic</div></div>
        <div class="field full"><label class="lbl">Modelos del envío</label>
          <select class="inp" id="shipModelAdd"><option value="">+ Agregar modelo…</option>${opts}</select>
          ${sel?`<div class="picker-chips">${sel}</div>`:''}
        </div>
        <div class="field full"><label class="lbl">Moneda del pago</label>
          <div class="seg" data-seg="moneda">
            <button type="button" data-v="DIVISAS" class="${!isBs?'on':''}">Divisas ($)</button>
            <button type="button" data-v="BOLIVARES" class="${isBs?'on':''}">Bolívares (Bs)</button>
          </div>
        </div>
        <div class="field full"><label class="lbl">Pago total ${isBs?'(Bs)':'($)'}</label><input class="inp" type="number" step="any" name="total" placeholder="Total (relojes + delivery)" value="${shipForm.total}" /></div>
        <div class="field"><label class="lbl">Hora mínima <span class="muted" style="text-transform:none;letter-spacing:0">(opcional)</span></label><input class="inp" type="time" name="horaMin" value="${shipForm.horaMin}" /></div>
        <div class="field"><label class="lbl">Hora máxima <span class="muted" style="text-transform:none;letter-spacing:0">(opcional)</span></label><input class="inp" type="time" name="horaMax" value="${shipForm.horaMax}" /></div>
        <div class="field full"><label class="lbl">Ubicación <span class="muted" style="text-transform:none;letter-spacing:0">(opcional)</span></label><input class="inp" type="text" name="ubicacion" placeholder="Dirección escrita del cliente" value="${esc(shipForm.ubicacion)}" /></div>
        <div class="field full"><label class="lbl">Link de Google Maps <span class="muted" style="text-transform:none;letter-spacing:0">(opcional)</span></label><input class="inp" type="url" name="link" placeholder="https://maps.google.com/…" value="${esc(shipForm.link)}" /></div>
      </div>
      <div style="margin-top:20px"><button class="btn btn-gold" type="submit" style="width:100%;justify-content:center">${ICON.plus} Agregar envío</button></div>
    </form>
    <div class="status-filter">${filterChips}</div>
    <div class="ship-grid">${cards}</div>
  </section>`;
}

function submitShip(){
  if(!shipForm.telefono.trim()&&!shipForm.modelos.length){toast('Agrega al menos el número o un modelo');return}
  db.shipments.push({id:uid(),fecha:shipForm.fecha||todayISO(),estatus:shipForm.estatus,telefono:shipForm.telefono.trim(),modelos:[...shipForm.modelos],moneda:shipForm.moneda,total:shipForm.total!==''?parseFloat(shipForm.total):'',horaMin:shipForm.horaMin,horaMax:shipForm.horaMax,ubicacion:shipForm.ubicacion.trim(),link:shipForm.link.trim()});
  shipForm={fecha:todayISO(),estatus:'proceso',telefono:'',modelos:[],moneda:'DIVISAS',total:'',horaMin:'',horaMax:'',ubicacion:'',link:''};
  render();toast('✓ Envío agregado');
}
