/* ============ INVENTARIO ============ */
let invSearch='';
function viewInventario(){
  const q=invSearch.trim().toLowerCase();
  const items=db.inventory.filter(m=>m.modelo.toLowerCase().includes(q));
  const totalStock=db.inventory.reduce((a,m)=>a+(+m.stockActual||0),0);
  const totalValor=db.inventory.reduce((a,m)=>a+(+m.stockActual||0)*(+m.costo||0),0);
  let rows=items.map(m=>{
    const s=+m.stockActual;
    const cls=s<=0?'stock-out':s<=1?'stock-low':'stock-ok';
    const lbl=s<=0?'Agotado':s<=1?'Bajo':'OK';
    const fotoUrl=m.foto?gdriveDirect(m.foto):'';
    const pencilSvg='<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>';
    const fotoCell=fotoUrl
      ?`<span class="photo-cell-wrap"><img class="photo-thumb" src="${esc(fotoUrl)}" data-photo="${esc(fotoUrl)}" data-name="${esc(m.modelo)}" onerror="this.parentElement.classList.add('err')" /><button class="photo-edit-btn" data-id="${m.id}" title="Cambiar foto">${pencilSvg}</button><button class="btn-add-photo photo-err-btn" data-id="${m.id}">Sin foto · editar</button></span>`
      :`<button class="btn-add-photo" data-id="${m.id}">${ICON.camera} Añadir foto</button>`;
    return `<tr data-id="${m.id}">
      <td class="model-name inv-open-product" data-id="${m.id}">${esc(m.modelo)}</td>
      <td style="padding:8px 16px">${fotoCell}</td>
      <td><span class="badge ${cls}">${lbl}</span></td>
      <td>
        <span class="stock-cell">
          <button data-step="-1" title="Restar">&minus;</button>
          <input type="number" class="stock-input" value="${s}" min="0" />
          <button data-step="1" title="Sumar (reposición)">+</button>
        </span>
      </td>
      <td class="num"><span class="cell-edit"><span class="pre">$</span><input type="number" step="any" min="0" class="edit-field" data-field="costo" value="${m.costo}" /></span></td>
      <td class="num"><span class="cell-edit"><span class="pre">$</span><input type="number" step="any" min="0" class="edit-field" data-field="precioUSD" value="${m.precioUSD}" /></span></td>
      <td class="num"><span class="cell-edit bs"><span class="pre">Bs</span><input type="number" step="any" min="0" class="edit-field" data-field="precioBs" value="${m.precioBs}" /></span></td>
      <td style="text-align:right"><button class="row-action act-del-model" title="Eliminar modelo">${ICON.trash}</button></td>
    </tr>`;
  }).join('');
  if(!items.length)rows=`<tr><td colspan="8"><div class="empty">${ICON.box}<div>No hay modelos${q?' que coincidan con la búsqueda':''}.</div></div></td></tr>`;
  return `<section class="section">
    <div class="sec-head">
      <div><h1>Inventario</h1><p>${db.inventory.length} modelos · Toca el costo o los precios para editarlos</p></div>
      <button class="btn btn-gold" id="addModelBtn">${ICON.plus} Agregar modelo</button>
    </div>
    <div class="toolbar">
      <div class="search">${ICON.search}<input class="inp" id="invSearch" placeholder="Buscar modelo…" value="${esc(invSearch)}" /></div>
      <div class="pill-summary">
        <span>Unidades en stock: <b>${totalStock}</b></span>
        <span>Valor inventario (costo): <b>${fUSD(totalValor)}</b></span>
      </div>
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr>
          <th>Modelo</th><th style="width:68px">Foto</th><th>Estado</th><th>Stock actual</th>
          <th class="num">Costo unit.</th><th class="num">Precio USD</th><th class="num">Precio Bs</th><th></th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  </section>`;
}

function updateStockBadge(tr,s){const b=tr.querySelector('.badge');if(!b)return;b.className='badge '+(s<=0?'stock-out':s<=1?'stock-low':'stock-ok');b.textContent=s<=0?'Agotado':s<=1?'Bajo':'OK'}
function renderInvKeepFocus(pos){const app=document.getElementById('app');app.innerHTML=viewInventario();wire();const i=document.getElementById('invSearch');if(i){i.focus();try{i.setSelectionRange(pos,pos)}catch(e){}}}

/* ============ PHOTO MODAL ============ */
function openPhotoModal(url,nombre){
  const root=document.getElementById('modal-root');
  root.innerHTML=`<div class="modal-back" id="mback"><div class="modal photo-modal">
    <div class="modal-head"><h3>${esc(nombre)}</h3><button class="btn-ghost btn" id="mx" style="padding:4px 8px">✕</button></div>
    <div class="modal-body">
      <img id="photoModalImg" src="${esc(url)}" alt="${esc(nombre)}" style="width:100%;display:block;max-height:72vh;object-fit:contain;background:#0d0e11" />
    </div>
  </div></div>`;
  document.getElementById('mx').onclick=closeModal;
  document.getElementById('mback').onclick=e=>{if(e.target.id==='mback')closeModal()};
  const img=document.getElementById('photoModalImg');
  if(img)img.onerror=()=>{img.parentElement.innerHTML='<div style="padding:44px 24px;text-align:center;color:var(--txt-3)">'+ICON.camera+'<div style="margin-top:12px;font-size:14px">No se pudo cargar la imagen</div><a href="'+url+'" target="_blank" rel="noopener" style="display:inline-block;margin-top:10px;color:var(--gold);font-size:13px;text-decoration:none;font-weight:600">Abrir link directo ↗</a></div>'};
}

function openPhotoEdit(id){
  const it=db.inventory.find(x=>x.id===id);
  if(!it)return;
  const cur=it.foto||'';
  const curDirect=cur?gdriveDirect(cur):'';
  document.getElementById('modal-root').innerHTML=`<div class="modal-back" id="mback"><div class="modal" style="max-width:480px">
    <div class="modal-head"><h3>${cur?'Cambiar foto':'Añadir foto'} · ${esc(it.modelo)}</h3><button class="btn-ghost btn" id="mx" style="padding:4px 8px">✕</button></div>
    <div class="modal-body" style="display:flex;flex-direction:column;gap:16px">
      ${curDirect?`<div style="border-radius:10px;overflow:hidden;background:#0d0e11;text-align:center;max-height:160px;display:flex;align-items:center;justify-content:center"><img id="pePreview" src="${esc(curDirect)}" style="max-height:160px;max-width:100%;object-fit:contain;display:block" /></div>`:''}
      <div class="field">
        <label class="lbl">Link de la imagen</label>
        <input class="inp" id="peInput" type="url" placeholder="Link de Google Drive o URL directa de imagen" value="${esc(cur)}" />
        <div class="hint">Funciona con Google Drive, Dropbox, Imgur u otras URLs directas de imagen</div>
      </div>
    </div>
    <div class="modal-foot" style="justify-content:space-between">
      <div>${cur?`<button class="btn btn-ghost" id="peRemove" style="color:var(--red)">Quitar foto</button>`:''}</div>
      <div style="display:flex;gap:10px">
        <button class="btn btn-ghost" id="mcancel">Cancelar</button>
        <button class="btn btn-gold" id="peSave">Guardar</button>
      </div>
    </div>
  </div></div>`;
  const close=closeModal;
  document.getElementById('mx').onclick=close;
  document.getElementById('mcancel').onclick=close;
  document.getElementById('mback').onclick=e=>{if(e.target.id==='mback')close()};
  const inp=document.getElementById('peInput');
  const prev=document.getElementById('pePreview');
  if(inp&&prev)inp.oninput=()=>{const u=gdriveDirect(inp.value.trim());prev.src=u||'';prev.style.display=u?'block':'none'};
  document.getElementById('peSave').onclick=()=>{const val=(inp?inp.value:'').trim();it.foto=val;save();close();render();toast(val?'✓ Foto guardada':'Foto eliminada')};
  const rem=document.getElementById('peRemove');
  if(rem)rem.onclick=()=>{it.foto='';save();close();render();toast('Foto eliminada')};
  setTimeout(()=>{if(inp){inp.focus();inp.select()}},60);
}

function openAddModel(){
  document.getElementById('modal-root').innerHTML=`<div class="modal-back" id="mback"><div class="modal">
    <div class="modal-head"><h3>Agregar modelo</h3><button class="btn-ghost btn" id="mx" style="padding:4px 8px">✕</button></div>
    <div class="modal-body"><form id="amForm" autocomplete="off"><div class="form-grid">
      <div class="field full"><label class="lbl">Nombre del modelo</label><input class="inp" name="modelo" placeholder="Ej. 613 SL WH S" required /></div>
      <div class="field"><label class="lbl">Stock inicial</label><input class="inp" type="number" step="any" name="stockActual" placeholder="0" /></div>
      <div class="field"><label class="lbl">Costo unitario (USD)</label><input class="inp" type="number" step="any" name="costo" placeholder="0.00" /></div>
      <div class="field"><label class="lbl">Precio USD</label><input class="inp" type="number" step="any" name="precioUSD" placeholder="0.00" /></div>
      <div class="field"><label class="lbl">Precio Bs (ref.)</label><input class="inp" type="number" step="any" name="precioBs" placeholder="0" /></div>
      <div class="field full">
        <label class="lbl">Foto del modelo <span class="muted" style="text-transform:none;letter-spacing:0">(opcional)</span></label>
        <input class="inp" type="url" name="foto" placeholder="Pega aquí el link de Google Drive o URL de imagen" />
        <div class="hint">Funciona con links de Google Drive, Dropbox, Imgur u otras URLs directas de imagen</div>
      </div>
    </div></form></div>
    <div class="modal-foot"><button class="btn btn-ghost" id="mcancel">Cancelar</button><button class="btn btn-gold" id="msave">Guardar modelo</button></div>
  </div></div>`;
  const close=closeModal;
  document.getElementById('mx').onclick=close;
  document.getElementById('mcancel').onclick=close;
  document.getElementById('mback').onclick=e=>{if(e.target.id==='mback')close()};

  document.getElementById('msave').onclick=()=>{
    const f=document.getElementById('amForm');const d=Object.fromEntries(new FormData(f));
    if(!d.modelo.trim()){toast('Escribe el nombre del modelo');return}
    db.inventory.push({id:uid(),modelo:d.modelo.trim(),costo:parseFloat(d.costo)||0,precioUSD:parseFloat(d.precioUSD)||0,precioBs:parseFloat(d.precioBs)||0,cantidad:parseInt(d.stockActual)||0,stockActual:parseInt(d.stockActual)||0,foto:(d.foto||'').trim()});
    close();render();toast('✓ Modelo agregado: '+d.modelo.trim());
  };
  setTimeout(()=>document.querySelector('#amForm [name=modelo]').focus(),50);
}

/* ============ PRODUCT PAGE ============ */
function openProductPage(id,filterMonth){
  const it=db.inventory.find(x=>x.id===id);if(!it)return;
  const fotoUrl=it.foto?gdriveDirect(it.foto):'';
  const s=+it.stockActual;
  const cls=s<=0?'stock-out':s<=1?'stock-low':'stock-ok';
  const lbl=s<=0?'Agotado':s<=1?'Bajo':'OK';
  const MN=['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  const mlabel=ym=>{const[y,m]=ym.split('-');return MN[+m-1]+' '+y.slice(2)};
  const allSales=(db.sales||[]).filter(x=>x.modelo===it.modelo);
  const months=[...new Set(allSales.map(x=>(x.fecha||'').slice(0,7)).filter(Boolean))].sort().reverse();
  const active=filterMonth||null;
  const filtered=active?allSales.filter(x=>x.fecha&&x.fecha.startsWith(active)):allSales;
  const byDate={};
  filtered.forEach(x=>{
    const d=x.fecha||'';
    if(!byDate[d])byDate[d]={count:0,ingreso:0,ganancia:0};
    byDate[d].count++;byDate[d].ingreso+=x.ingresoUSD||0;byDate[d].ganancia+=x.ganancia||0;
  });
  let dates=Object.keys(byDate).filter(Boolean).sort().reverse();
  if(!active&&dates.length>5)dates=dates.slice(0,5);
  const maxCount=dates.length?Math.max(...dates.map(d=>byDate[d].count)):1;
  const totalUnits=filtered.length;
  const totalIngreso=filtered.reduce((a,x)=>a+(x.ingresoUSD||0),0);
  const totalGanancia=filtered.reduce((a,x)=>a+(x.ganancia||0),0);
  const pillsHtml=months.length>0?`<div class="month-pills">
    <button class="month-pill${!active?' on':''}" data-m="">Recientes</button>
    ${months.map(m=>`<button class="month-pill${m===active?' on':''}" data-m="${m}">${mlabel(m)}</button>`).join('')}
  </div>`:'';
  const daysHtml=dates.length>0?`<div class="prod-days-list">${dates.map(d=>`
    <div class="sales-day-row">
      <span class="sales-day-date">${fDate(d)}</span>
      <span class="sales-day-bar-wrap"><span class="sales-day-bar-fill" style="width:${Math.round(byDate[d].count/maxCount*100)}%"></span></span>
      <span class="sales-day-count">${byDate[d].count} ${byDate[d].count===1?'venta':'ventas'}</span>
      <span class="sales-day-usd">${fUSD(byDate[d].ingreso)}</span>
    </div>`).join('')}</div>`:`<div class="empty-inline">${active?'Sin ventas en '+mlabel(active)+'.':'Sin ventas registradas aún.'}</div>`;
  const summaryHtml=totalUnits>0?`<div class="prod-summary">
    <span>${totalUnits} ud${totalUnits!==1?'s':''} vendida${totalUnits!==1?'s':''}</span>
    <span class="pos">${fUSD(totalIngreso)} ingreso</span>
    <span class="${totalGanancia>=0?'pos':'neg'}">${fUSD(totalGanancia)} ganancia</span>
  </div>`:'';
  const periodLabel=active?`en ${mlabel(active)}`:'· últimas 5 fechas';
  document.getElementById('modal-root').innerHTML=`<div class="modal-back" id="mback"><div class="modal prod-page-modal">
    <div class="modal-head"><h3>${esc(it.modelo)}</h3><button class="btn-ghost btn" id="mx" style="padding:4px 8px">✕</button></div>
    <div class="modal-body prod-page-body" style="padding:0">
      <div class="prod-left">
        ${fotoUrl?`<div class="prod-photo-wrap"><img class="prod-photo-img" src="${esc(fotoUrl)}" alt="${esc(it.modelo)}" onerror="this.parentElement.style.display='none'" /></div>`:`<div class="prod-photo-ph">${ICON.camera}</div>`}
        <div class="prod-stats">
          <div class="prod-stat-row"><span class="prod-stat-lbl">Estado</span><span class="badge ${cls}">${lbl}</span></div>
          <div class="prod-stat-row"><span class="prod-stat-lbl">Stock actual</span><span class="prod-stat-val">${s} uds.</span></div>
          <div class="prod-stat-row"><span class="prod-stat-lbl">Costo unit.</span><span class="prod-stat-val">${fUSD(it.costo)}</span></div>
          <div class="prod-stat-row"><span class="prod-stat-lbl">Precio USD</span><span class="prod-stat-val">${fUSD(it.precioUSD)}</span></div>
          <div class="prod-stat-row"><span class="prod-stat-lbl">Precio Bs</span><span class="prod-stat-val">${fBs(it.precioBs)}</span></div>
        </div>
      </div>
      <div class="prod-right">
        <span class="prod-section-title">Ventas ${esc(periodLabel)}</span>
        ${pillsHtml}
        ${daysHtml}
        ${summaryHtml}
      </div>
    </div>
  </div></div>`;
  const close=closeModal;
  document.getElementById('mx').onclick=close;
  document.getElementById('mback').onclick=e=>{if(e.target.id==='mback')close()};
  document.querySelectorAll('.month-pill').forEach(b=>b.onclick=()=>openProductPage(id,b.dataset.m||null));
}
