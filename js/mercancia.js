/* ============ MERCANCIA (lotes importados de China) ============ */
const PST_LABEL={pendiente:'No recibido',proceso:'En tránsito',entregado:'Recibido'};
const PST_ORDER=['pendiente','proceso','entregado'];
const r2=v=>Math.round((+v||0)*100)/100;
let pformEditId=null;
let pform=emptyPurchaseForm();

function emptyPurchaseForm(){
  return {
    fecha:todayISO(),proveedor:'',ordenCompra:'',factura:'',facturaLink:'',
    items:[],costoRelojes:'',costoExtras:'',comision:'',
    tramo1:{tracking:'',trackingUrl:'',costo:'',estatus:'pendiente'},
    tramo2:{tracking:'',trackingUrl:'',costo:'',estatus:'pendiente'},
    nota:'',_pdf:null
  };
}
function purchaseTotal(p){
  return r2((+p.costoRelojes||0)+(+p.costoExtras||0)+(+p.comision||0)+(+p.tramo1.costo||0)+(+p.tramo2.costo||0));
}
function loteUnits(p){return (p.items||[]).reduce((a,i)=>a+(+i.cantidad||0),0)}
// Prorrateo: todo lo que NO es el reloj (cajas, comisión, envíos) repartido entre las unidades
function landedExtraPerUnit(p){
  const units=loteUnits(p);
  if(!units)return 0;
  return ((+p.costoExtras||0)+(+p.comision||0)+(+p.tramo1.costo||0)+(+p.tramo2.costo||0))/units;
}

/* ============ VISTA ============ */
function viewMercancia(){
  const list=[...(db.purchases||[])].reverse();
  let cards=list.map(p=>{
    const units=loteUnits(p);
    const tot=purchaseTotal(p);
    const sub=[p.proveedor,p.factura?('Factura '+p.factura):'',p.ordenCompra?('Orden '+p.ordenCompra):''].filter(Boolean).join(' · ');
    const stCls=e=>e==='entregado'?'entregado':e==='proceso'?'proceso':'no_entregado';
    const tramoRow=(t,n,lbl)=>`<div class="lote-tramo-row">
        <span class="lote-tramo-lbl">${lbl}</span>
        <span class="st-badge st-${stCls(t.estatus)}"><i></i>${PST_LABEL[t.estatus]||'No recibido'}</span>
        <span class="lote-tramo-btns">${PST_ORDER.map(k=>`<button class="st-cycle pst-set" data-tramo="${n}" data-set="${k}" style="${t.estatus===k?'border-color:var(--gold);color:var(--gold)':''}">${PST_LABEL[k]}</button>`).join('')}</span>
      </div>`;
    return `<div class="ship-card lote-card ${stCls(p.tramo2.estatus)}" data-id="${p.id}">
      <div class="ship-top">
        <span class="ship-date" style="font-weight:700">${fDate(p.fecha)}</span>
        ${p.pasadoInventario?`<span class="badge stock-ok">✓ En inventario</span>`:''}
      </div>
      ${sub?`<div class="muted" style="font-size:12px">${esc(sub)}</div>`:''}
      <div class="lote-kpis">
        <span>${(p.items||[]).length} modelos · ${units} uds</span>
        <span class="lote-cost">${fUSD(tot)}</span>
      </div>
      ${tramoRow(p.tramo1,1,'China → EEUU')}
      ${tramoRow(p.tramo2,2,'EEUU → Venezuela')}
      <div class="ship-meta" style="flex-direction:row;justify-content:space-between;align-items:center">
        <span class="muted" style="font-size:11px">Toca la tarjeta para ver el detalle</span>
        <button class="row-action act-del-lote" title="Eliminar lote">${ICON.trash}</button>
      </div>
    </div>`;
  }).join('');
  if(!list.length)cards=`<div class="empty" style="grid-column:1/-1">${ICON.box}<div>Aún no hay mercancía registrada. Agrega tu primer lote con el botón de arriba.</div></div>`;
  return `<section class="section">
    <div class="sec-head">
      <div><h1>Mercancía</h1><p>Lotes importados de China: modelos, costos, envíos y tracking</p></div>
      <button class="btn btn-gold" id="addPurchaseBtn">${ICON.plus} Agregar nueva mercancía</button>
    </div>
    <div class="ship-grid">${cards}</div>
  </section>`;
}

/* ============ WIRING DE LA VISTA (llamado desde wire()) ============ */
function wireMercancia(){
  const add=document.getElementById('addPurchaseBtn');
  if(add)add.onclick=()=>{pformEditId=null;pform=emptyPurchaseForm();openPurchaseForm()};
  document.querySelectorAll('.lote-card').forEach(card=>{
    card.onclick=e=>{if(e.target.closest('button'))return;openPurchasePage(card.dataset.id)};
  });
  document.querySelectorAll('.lote-card .pst-set').forEach(b=>b.onclick=()=>{
    const id=b.closest('.lote-card').dataset.id;const p=(db.purchases||[]).find(x=>x.id===id);if(!p)return;
    p['tramo'+b.dataset.tramo].estatus=b.dataset.set;
    save();renderKeep('mercancia');toast('Estatus: '+PST_LABEL[b.dataset.set]);
  });
  document.querySelectorAll('.lote-card .act-del-lote').forEach(b=>b.onclick=()=>{
    const id=b.closest('.lote-card').dataset.id;
    confirmModal('Eliminar lote','¿Eliminar este lote de mercancía? El inventario no se modifica.',()=>{
      db.purchases=db.purchases.filter(x=>x.id!==id);save();renderKeep('mercancia');toast('Lote eliminado');
    });
  });
}

/* ============ FORMULARIO (modal) ============ */
function openPurchaseForm(){
  const p=pform;
  const dl=`<datalist id="pfDL">${db.inventory.map(m=>`<option value="${esc(m.modelo)}"></option>`).join('')}</datalist>`;
  const tramoBlock=(t,n,lbl)=>`<div class="lote-tramo-box">
    <div class="lote-tramo-head">Tramo ${n} · ${lbl}</div>
    <div class="form-grid">
      <div class="field"><label class="lbl">N° de tracking</label><input class="inp pf-t${n}" data-field="tracking" type="text" placeholder="Ej. YT2512345678" value="${esc(t.tracking)}" /></div>
      <div class="field"><label class="lbl">Costo envío ($)</label><input class="inp pf-t${n}" data-field="costo" type="number" step="any" placeholder="0.00" value="${esc(t.costo)}" /></div>
      <div class="field full"><label class="lbl">Web del tracking</label><input class="inp pf-t${n}" data-field="trackingUrl" type="url" placeholder="https://www.17track.net/…" value="${esc(t.trackingUrl)}" /></div>
      <div class="field full"><label class="lbl">Estatus</label>
        <div class="seg" id="pfSeg${n}">
          ${PST_ORDER.map(k=>`<button type="button" data-v="${k}" class="${(t.estatus||'pendiente')===k?'on':''}">${PST_LABEL[k]}</button>`).join('')}
        </div>
      </div>
    </div>
  </div>`;
  const pdfInfo=p._pdf?`<div class="hint" style="color:var(--green,#62c98c)">✓ Detectado: ${p._pdf.n} modelos · ${p._pdf.units} uds · suma ${fUSD(p._pdf.tot)}${p._pdf.totFactura?` · total en factura ${fUSD(p._pdf.totFactura)}`:''}. Revisa y corrige la tabla.</div>`:'';
  document.getElementById('modal-root').innerHTML=`<div class="modal-back" id="mback"><div class="modal" style="max-width:680px">
    <div class="modal-head"><h3>${pformEditId?'Editar lote':'Agregar nueva mercancía'}</h3><button class="btn-ghost btn" id="mx" style="padding:4px 8px">✕</button></div>
    <div class="modal-body">
      ${dl}
      <div class="form-grid">
        <div class="field"><label class="lbl">Fecha de compra</label><input class="inp pf" name="fecha" type="date" value="${esc(p.fecha)}" /></div>
        <div class="field"><label class="lbl">Proveedor <span class="muted" style="text-transform:none;letter-spacing:0">(opcional)</span></label><input class="inp pf" name="proveedor" type="text" placeholder="Ej. Shenzhen Watch Co." value="${esc(p.proveedor)}" /></div>
        <div class="field"><label class="lbl">N° orden de compra</label><input class="inp pf" name="ordenCompra" type="text" placeholder="Ej. PO-2026-001" value="${esc(p.ordenCompra)}" /></div>
        <div class="field"><label class="lbl">N° factura</label><input class="inp pf" name="factura" type="text" placeholder="Ej. QTN-4.30" value="${esc(p.factura)}" /></div>
        <div class="field full"><label class="lbl">Link de la factura <span class="muted" style="text-transform:none;letter-spacing:0">(opcional)</span></label><input class="inp pf" name="facturaLink" type="url" placeholder="Link de Google Drive al PDF" value="${esc(p.facturaLink)}" /></div>
      </div>
      <div class="pdf-drop">
        <input type="file" id="pfPdf" accept="application/pdf" style="display:none" />
        <button type="button" class="btn btn-ghost" id="pfPdfBtn" style="width:100%;justify-content:center">${ICON.search} Detectar modelos de la factura (PDF)</button>
        <div class="hint" id="pfPdfStatus">Sube el PDF de la cotización y se llenará la tabla automáticamente</div>
        ${pdfInfo}
      </div>
      <div class="field full" style="margin-top:14px"><label class="lbl">Modelos del lote</label>
        <div class="lote-items" id="pfItems"></div>
        <button type="button" class="btn btn-ghost" id="pfAddRow" style="margin-top:8px">${ICON.plus} Agregar fila</button>
      </div>
      <div class="form-grid" style="margin-top:14px">
        <div class="field"><label class="lbl">Costo relojes ($)</label><input class="inp pf" name="costoRelojes" type="number" step="any" placeholder="0.00" value="${esc(p.costoRelojes)}" /></div>
        <div class="field"><label class="lbl">Cajas y herramientas ($)</label><input class="inp pf" name="costoExtras" type="number" step="any" placeholder="0.00" value="${esc(p.costoExtras)}" /></div>
        <div class="field full"><label class="lbl">Comisión AliExpress / Alibaba ($) <span class="muted" style="text-transform:none;letter-spacing:0">(opcional)</span></label><input class="inp pf" name="comision" type="number" step="any" placeholder="0.00" value="${esc(p.comision)}" /></div>
      </div>
      ${tramoBlock(p.tramo1,1,'China → EEUU')}
      ${tramoBlock(p.tramo2,2,'EEUU → Venezuela')}
      <div class="field full" style="margin-top:14px"><label class="lbl">Nota <span class="muted" style="text-transform:none;letter-spacing:0">(opcional)</span></label><input class="inp pf" name="nota" type="text" placeholder="Cualquier detalle del lote" value="${esc(p.nota)}" /></div>
      <div class="calc-row" style="margin-top:14px"><span class="k">Prorrateo por reloj (extras + comisión + envíos ÷ unidades)</span><span class="v" id="pfPerUnit">+${fUSD(landedExtraPerUnit(p))}/ud</span></div>
      <div class="calc-row calc-total"><span class="k">Costo total real del lote</span><span class="v" id="pfTotal">${fUSD(purchaseTotal(p))}</span></div>
    </div>
    <div class="modal-foot"><button class="btn btn-ghost" id="mcancel">Cancelar</button><button class="btn btn-gold" id="pfSave">${pformEditId?'Guardar cambios':'Guardar lote'}</button></div>
  </div></div>`;
  const close=closeModal;
  document.getElementById('mx').onclick=close;document.getElementById('mcancel').onclick=close;
  document.getElementById('mback').onclick=e=>{if(e.target.id==='mback')close()};
  // Campos simples
  document.querySelectorAll('.modal .pf').forEach(el=>el.addEventListener('input',()=>{pform[el.name]=el.value;refreshPurchaseTotal()}));
  // Tramos
  [1,2].forEach(n=>{
    document.querySelectorAll('.modal .pf-t'+n).forEach(el=>el.addEventListener('input',()=>{pform['tramo'+n][el.dataset.field]=el.value;refreshPurchaseTotal()}));
    document.querySelectorAll('#pfSeg'+n+' button').forEach(b=>b.onclick=()=>{
      pform['tramo'+n].estatus=b.dataset.v;
      document.querySelectorAll('#pfSeg'+n+' button').forEach(x=>x.classList.toggle('on',x===b));
    });
  });
  // Items
  renderPfItems();
  document.getElementById('pfAddRow').onclick=()=>{pform.items.push({modelo:'',cantidad:'',costo:''});renderPfItems()};
  // PDF
  const fi=document.getElementById('pfPdf');
  document.getElementById('pfPdfBtn').onclick=()=>fi.click();
  fi.onchange=()=>{if(fi.files&&fi.files[0])parseInvoicePDF(fi.files[0])};
  // Guardar
  document.getElementById('pfSave').onclick=submitPurchase;
}

function renderPfItems(){
  const wrap=document.getElementById('pfItems');if(!wrap)return;
  const rows=pform.items.map((it,i)=>`<div class="lote-item-row" data-i="${i}">
      <input class="inp" data-f="modelo" list="pfDL" type="text" placeholder="Modelo (ej. 613 SL WH S)" value="${esc(it.modelo)}" />
      <input class="inp" data-f="cantidad" type="number" min="0" step="1" placeholder="Cant." value="${esc(it.cantidad)}" />
      <input class="inp" data-f="costo" type="number" min="0" step="any" placeholder="Costo $" value="${esc(it.costo)}" />
      <button type="button" class="row-action" data-rm="${i}" title="Quitar">✕</button>
    </div>`).join('');
  wrap.innerHTML=`<div class="lote-item-row lote-item-head"><span>Modelo</span><span>Cant.</span><span>Costo unit.</span><span></span></div>${rows||'<div class="hint" style="padding:6px 2px">Sin modelos aún — usa "Agregar fila" o detecta del PDF</div>'}`;
  wrap.querySelectorAll('.lote-item-row input').forEach(inp=>{
    inp.addEventListener('input',()=>{
      const i=+inp.closest('.lote-item-row').dataset.i;
      pform.items[i][inp.dataset.f]=inp.value;
      if(inp.dataset.f!=='modelo')syncCostoRelojes();
    });
  });
  wrap.querySelectorAll('[data-rm]').forEach(b=>b.onclick=()=>{pform.items.splice(+b.dataset.rm,1);renderPfItems();syncCostoRelojes()});
}
function syncCostoRelojes(){
  const sum=r2(pform.items.reduce((a,i)=>a+(+i.cantidad||0)*(+i.costo||0),0));
  pform.costoRelojes=sum||'';
  const el=document.querySelector('.modal .pf[name=costoRelojes]');if(el)el.value=pform.costoRelojes;
  refreshPurchaseTotal();
}
function refreshPurchaseTotal(){
  const el=document.getElementById('pfTotal');if(el)el.textContent=fUSD(purchaseTotal(pform));
  const pu=document.getElementById('pfPerUnit');if(pu)pu.textContent='+'+fUSD(landedExtraPerUnit(pform))+'/ud';
}

function submitPurchase(){
  const items=pform.items
    .filter(i=>String(i.modelo).trim())
    .map(i=>({modelo:String(i.modelo).trim(),cantidad:parseInt(i.cantidad)||0,costo:parseFloat(i.costo)||0}));
  if(!items.length&&!pform.factura.trim()&&!pform.ordenCompra.trim()){toast('Agrega al menos un modelo o el N° de factura');return}
  const cleanTramo=t=>({tracking:String(t.tracking).trim(),trackingUrl:String(t.trackingUrl).trim(),costo:parseFloat(t.costo)||0,estatus:PST_ORDER.includes(t.estatus)?t.estatus:'pendiente'});
  const data={
    fecha:pform.fecha||todayISO(),
    proveedor:pform.proveedor.trim(),ordenCompra:pform.ordenCompra.trim(),
    factura:pform.factura.trim(),facturaLink:pform.facturaLink.trim(),
    items,
    costoRelojes:parseFloat(pform.costoRelojes)||0,
    costoExtras:parseFloat(pform.costoExtras)||0,
    comision:parseFloat(pform.comision)||0,
    tramo1:cleanTramo(pform.tramo1),tramo2:cleanTramo(pform.tramo2),
    nota:pform.nota.trim()
  };
  if(pformEditId){
    const p=db.purchases.find(x=>x.id===pformEditId);if(!p)return;
    Object.assign(p,data);
    closeModal();save();render();toast('✓ Lote actualizado');
  }else{
    db.purchases.push({id:uid(),...data,pasadoInventario:false});
    closeModal();save();render();toast('✓ Mercancía registrada');
  }
  pformEditId=null;pform=emptyPurchaseForm();
}

/* ============ PARSER PDF (calibrado a cotización Shenzhen Watch) ============ */
const MODEL_ABBR=[['rose gold','RG'],['light blue','LB'],['sky blue','SB'],['silver','SL'],['golden','GD'],['gold','GD'],['rose','RG'],['white','WH'],['black','BK'],['blue','BU'],['green','GN'],['pink','PK'],['orange','OR'],['brown','BR'],['red','RD'],['grey','GY'],['gray','GY']];
function abreviarModelo(raw){
  let s=String(raw);
  MODEL_ABBR.forEach(([w,a])=>{s=s.replace(new RegExp('\\b'+w.replace(' ','\\s+')+'\\b','gi'),a)});
  return s.replace(/\s+/g,' ').trim()+' S';
}
let _pdfjsLoading=null;
function loadPdfJs(){
  if(window.pdfjsLib)return Promise.resolve();
  if(_pdfjsLoading)return _pdfjsLoading;
  _pdfjsLoading=new Promise((res,rej)=>{
    const s=document.createElement('script');
    s.src='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    s.onload=()=>{window.pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';res()};
    s.onerror=()=>{_pdfjsLoading=null;rej(new Error('cdn'))};
    document.head.appendChild(s);
  });
  return _pdfjsLoading;
}
async function parseInvoicePDF(file){
  const st=document.getElementById('pfPdfStatus');
  const setSt=m=>{if(st)st.textContent=m};
  try{
    setSt('Cargando lector de PDF…');
    await loadPdfJs();
    setSt('Leyendo '+file.name+'…');
    const buf=await file.arrayBuffer();
    const pdf=await pdfjsLib.getDocument({data:buf}).promise;
    const NUM=/^\$?\d+(?:\.\d+)?$/;
    const val=t=>parseFloat(t.replace(/[$,]/g,''));
    const lineText=l=>[...l.items].sort((a,b)=>a.x-b.x).map(i=>i.s).join(' ').replace(/\s+/g,' ').trim();
    // ¿La línea termina en las 3 columnas numéricas (Qty/Precio/Monto) y empieza con el N° de fila?
    const isAnchor=l=>{
      const tk=lineText(l).split(' ');
      return tk.length>=4&&/^\d+$/.test(tk[0])&&tk.slice(-3).every(t=>NUM.test(t));
    };
    const items=[];let extras=0,ship=0,totFactura=0,sumRelojes=0;
    for(let pg=1;pg<=pdf.numPages;pg++){
      const page=await pdf.getPage(pg);
      const tc=await page.getTextContent();
      const its=tc.items.filter(i=>i.str&&i.str.trim()).map(i=>({x:i.transform[4],y:i.transform[5],s:i.str.trim()}));
      its.sort((a,b)=>b.y-a.y||a.x-b.x);
      // 1) Agrupar texto en líneas por coordenada Y (tolerancia estricta)
      const lines=[];let cur=null;
      its.forEach(i=>{
        if(!cur||Math.abs(i.y-cur.y)>3){cur={y:i.y,items:[i]};lines.push(cur)}
        else cur.items.push(i);
      });
      // 2) Líneas especiales: shipping / in total
      const rest=[];
      lines.forEach(l=>{
        const low=lineText(l).toLowerCase();
        if(low.includes('in total')){const ns=lineText(l).split(' ').filter(t=>NUM.test(t)).map(val);if(ns.length)totFactura=ns[ns.length-1]}
        else if(low.includes('shipping')){const ns=lineText(l).split(' ').filter(t=>NUM.test(t)).map(val);if(ns.length)ship=ns[ns.length-1]}
        else rest.push(l);
      });
      // 3) Anclas = filas reales de la tabla; las líneas huérfanas cercanas (celdas
      //    multilínea como "2597 (quartz watch)" o "POEDAGAR box") se absorben en su ancla
      const anchors=rest.filter(isAnchor);
      rest.filter(l=>!isAnchor(l)).forEach(o=>{
        let best=null,bd=15;
        anchors.forEach(a=>{const d=Math.abs(a.y-o.y);if(d<bd){bd=d;best=a}});
        if(best)best.items.push(...o.items);
      });
      // 4) Reconstruir el texto del ancla en orden de lectura: columna (x) → línea (y)
      anchors.forEach(a=>{
        const L=[...a.items].sort((p,q)=>{
          const bp=Math.round(p.x/30),bq=Math.round(q.x/30);
          return bp-bq||q.y-p.y||p.x-q.x;
        }).map(i=>i.s).join(' ').replace(/\s+/g,' ').trim();
        const tk=L.split(' ');
        const t3=tk.slice(-3);
        if(!t3.every(t=>NUM.test(t)))return;     // últimas 3 columnas: Qty / Precio / Monto
        if(!/^\d+$/.test(tk[0]))return;          // primera columna: N° de fila
        const name=tk.slice(1,-3).join(' ');
        const qty=val(t3[0]),price=val(t3[1]),amount=val(t3[2]);
        if(!name||!(qty>0))return;
        if(/box|boxes|tool|caja|herramienta/i.test(name)){extras+=amount;return}  // empaque: costo, no inventario
        if(!/^\d/.test(name))return;             // relojes: el nombre empieza con el código numérico
        items.push({modelo:abreviarModelo(name),cantidad:qty,costo:price});
        sumRelojes+=amount;
      });
    }
    if(!items.length&&!extras&&!ship){setSt('⚠ No se detectaron filas en este PDF — agrega los modelos a mano');return}
    if(items.length)pform.items=items;
    pform.costoRelojes=r2(sumRelojes)||pform.costoRelojes;
    pform.costoExtras=r2(extras)||pform.costoExtras;
    if(ship)pform.tramo1.costo=ship;
    pform._pdf={n:items.length,units:items.reduce((a,i)=>a+i.cantidad,0),tot:r2(sumRelojes+extras+ship),totFactura};
    openPurchaseForm(); // re-render del modal con lo detectado
    toast('✓ PDF analizado: '+items.length+' modelos detectados');
  }catch(e){
    console.error('Error leyendo PDF',e);
    setSt('⚠ No se pudo leer el PDF ('+(e.message==='cdn'?'sin conexión al CDN':'archivo no compatible')+') — agrega los modelos a mano');
  }
}

/* ============ DETALLE DEL LOTE ============ */
function openPurchasePage(id){
  const p=(db.purchases||[]).find(x=>x.id===id);if(!p)return;
  const units=loteUnits(p);
  const tot=purchaseTotal(p);
  const perUnit=landedExtraPerUnit(p);
  const stCls=e=>e==='entregado'?'entregado':e==='proceso'?'proceso':'no_entregado';
  const itemRows=(p.items||[]).map(i=>`<tr><td>${esc(i.modelo)}</td><td class="num">${i.cantidad}</td><td class="num">${fUSD(i.costo)}</td><td class="num" style="color:var(--gold);font-weight:600">${fUSD((+i.costo||0)+perUnit)}</td><td class="num">${fUSD((+i.cantidad||0)*(+i.costo||0))}</td></tr>`).join('');
  const tramoHtml=(t,lbl)=>`<div class="lote-tramo-box" style="margin-top:10px">
    <div class="lote-tramo-head" style="display:flex;justify-content:space-between;align-items:center">${lbl}
      <span class="st-badge st-${stCls(t.estatus)}"><i></i>${PST_LABEL[t.estatus]||'No recibido'}</span>
    </div>
    <div class="prod-stat-row"><span class="prod-stat-lbl">Tracking</span><span class="prod-stat-val">${t.tracking?(t.trackingUrl?`<a href="${esc(t.trackingUrl)}" target="_blank" rel="noopener" style="color:var(--gold);text-decoration:none">${esc(t.tracking)} ↗</a>`:esc(t.tracking)):'—'}</span></div>
    <div class="prod-stat-row"><span class="prod-stat-lbl">Costo envío</span><span class="prod-stat-val">${fUSD(t.costo)}</span></div>
  </div>`;
  document.getElementById('modal-root').innerHTML=`<div class="modal-back" id="mback"><div class="modal" style="max-width:640px">
    <div class="modal-head"><h3>Lote · ${fDate(p.fecha)}${p.pasadoInventario?' <span class="badge stock-ok" style="margin-left:8px">✓ En inventario</span>':''}</h3><button class="btn-ghost btn" id="mx" style="padding:4px 8px">✕</button></div>
    <div class="modal-body">
      <div class="prod-stats" style="margin-bottom:14px">
        ${p.proveedor?`<div class="prod-stat-row"><span class="prod-stat-lbl">Proveedor</span><span class="prod-stat-val">${esc(p.proveedor)}</span></div>`:''}
        ${p.ordenCompra?`<div class="prod-stat-row"><span class="prod-stat-lbl">Orden de compra</span><span class="prod-stat-val">${esc(p.ordenCompra)}</span></div>`:''}
        ${p.factura?`<div class="prod-stat-row"><span class="prod-stat-lbl">Factura</span><span class="prod-stat-val">${p.facturaLink?`<a href="${esc(p.facturaLink)}" target="_blank" rel="noopener" style="color:var(--gold);text-decoration:none">${esc(p.factura)} ↗</a>`:esc(p.factura)}</span></div>`:(p.facturaLink?`<div class="prod-stat-row"><span class="prod-stat-lbl">Factura</span><span class="prod-stat-val"><a href="${esc(p.facturaLink)}" target="_blank" rel="noopener" style="color:var(--gold);text-decoration:none">Ver PDF ↗</a></span></div>`:'')}
        ${p.nota?`<div class="prod-stat-row"><span class="prod-stat-lbl">Nota</span><span class="prod-stat-val">${esc(p.nota)}</span></div>`:''}
      </div>
      ${itemRows?`<div class="table-wrap" style="margin-bottom:14px"><table>
        <thead><tr><th>Modelo</th><th class="num">Cant.</th><th class="num">Costo unit.</th><th class="num">Costo real/ud</th><th class="num">Subtotal</th></tr></thead>
        <tbody>${itemRows}</tbody>
        <tfoot><tr><td style="font-weight:700">Total</td><td class="num" style="font-weight:700">${units}</td><td></td><td></td><td class="num" style="font-weight:700">${fUSD(p.costoRelojes)}</td></tr></tfoot>
      </table></div>`:`<div class="empty-inline" style="margin-bottom:14px">Sin modelos registrados en este lote.</div>`}
      <div class="calc">
        <div class="calc-row"><span class="k">Relojes</span><span class="v">${fUSD(p.costoRelojes)}</span></div>
        <div class="calc-row"><span class="k">Cajas y herramientas</span><span class="v">${fUSD(p.costoExtras)}</span></div>
        ${(+p.comision||0)>0?`<div class="calc-row"><span class="k">Comisión</span><span class="v">${fUSD(p.comision)}</span></div>`:''}
        <div class="calc-row"><span class="k">Envío China → EEUU</span><span class="v">${fUSD(p.tramo1.costo)}</span></div>
        <div class="calc-row"><span class="k">Envío EEUU → Venezuela</span><span class="v">${fUSD(p.tramo2.costo)}</span></div>
        ${units?`<div class="calc-row"><span class="k">Prorrateo por reloj (÷ ${units} uds)</span><span class="v" style="color:var(--gold)">+${fUSD(perUnit)}/ud</span></div>`:''}
        <div class="calc-row calc-total"><span class="k">Costo total real</span><span class="v">${fUSD(tot)}</span></div>
      </div>
      ${tramoHtml(p.tramo1,'Tramo 1 · China → EEUU')}
      ${tramoHtml(p.tramo2,'Tramo 2 · EEUU → Venezuela')}
    </div>
    <div class="modal-foot" style="justify-content:space-between">
      <button class="btn btn-ghost" id="ppDel" style="color:var(--red)">Eliminar</button>
      <div style="display:flex;gap:10px">
        <button class="btn btn-ghost" id="ppEdit">Editar</button>
        ${p.pasadoInventario?`<button class="btn btn-ghost" disabled style="opacity:.55">✓ Ya en inventario</button>`:`<button class="btn btn-gold" id="ppInv">${ICON.box} Pasar a inventario</button>`}
      </div>
    </div>
  </div></div>`;
  const close=closeModal;
  document.getElementById('mx').onclick=close;
  document.getElementById('mback').onclick=e=>{if(e.target.id==='mback')close()};
  document.getElementById('ppDel').onclick=()=>{
    confirmModal('Eliminar lote','¿Eliminar este lote de mercancía? El inventario no se modifica.',()=>{
      db.purchases=db.purchases.filter(x=>x.id!==id);save();render();toast('Lote eliminado');
    });
  };
  document.getElementById('ppEdit').onclick=()=>{
    pformEditId=id;
    pform={
      fecha:p.fecha,proveedor:p.proveedor||'',ordenCompra:p.ordenCompra||'',factura:p.factura||'',facturaLink:p.facturaLink||'',
      items:(p.items||[]).map(i=>({...i})),
      costoRelojes:p.costoRelojes||'',costoExtras:p.costoExtras||'',comision:p.comision||'',
      tramo1:{...p.tramo1},tramo2:{...p.tramo2},nota:p.nota||'',_pdf:null
    };
    openPurchaseForm();
  };
  const inv=document.getElementById('ppInv');
  if(inv)inv.onclick=()=>pasarAInventario(id);
}

/* ============ PASAR A INVENTARIO ============ */
function pasarAInventario(id){
  const p=(db.purchases||[]).find(x=>x.id===id);if(!p)return;
  const items=(p.items||[]).filter(i=>String(i.modelo).trim()&&(+i.cantidad||0)>0);
  if(!items.length){toast('Este lote no tiene modelos con cantidad');return}
  const perUnit=landedExtraPerUnit(p);
  confirmModal('Pasar a inventario','Se sumarán '+loteUnits(p)+' unidades al inventario ('+items.length+' modelos). El costo unitario de cada modelo será su costo + '+fUSD(perUnit)+' de prorrateo (cajas, comisión y envíos repartidos entre los relojes). ¿Continuar?',()=>{
    let nuevos=0,actualizados=0;
    items.forEach(i=>{
      const nombre=String(i.modelo).trim();
      const ex=db.inventory.find(m=>m.modelo.trim().toLowerCase()===nombre.toLowerCase());
      const cant=+i.cantidad||0;
      const costoReal=r2((+i.costo||0)+perUnit); // costo landed: unitario + prorrateo
      if(ex){ex.stockActual=(+ex.stockActual||0)+cant;ex.cantidad=(+ex.cantidad||0)+cant;ex.costo=costoReal;actualizados++}
      else{db.inventory.push({id:uid(),modelo:nombre,costo:costoReal,precioUSD:0,precioBs:0,cantidad:cant,stockActual:cant,foto:''});nuevos++}
    });
    p.pasadoInventario=true;
    save();render();
    toast('✓ Inventario actualizado: '+nuevos+' nuevos · '+actualizados+' repuestos · costo real aplicado');
  });
}
