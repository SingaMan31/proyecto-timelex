/* ============ CSV EXPORT / IMPORT ============ */
function exportSection(section){
  let headers,rows,filename;
  const q=v=>'"'+String(v==null?'':v).replace(/"/g,'""')+'"';
  if(section==='ventas'){
    headers=['fecha','modelo','tipoPago','monto','tasa','ingresoUSD','ganancia','nota'];
    rows=(db.sales||[]).map(s=>[s.fecha,s.modelo,s.tipoPago,s.monto,s.tasa??'',+(s.ingresoUSD||0).toFixed(4),+(s.ganancia||0).toFixed(4),s.nota||'']);
    filename='timelex_ventas.csv';
  }else if(section==='gastos'){
    headers=['fecha','concepto','moneda','monto','tasa','gastoUSD'];
    rows=(db.expenses||[]).map(e=>[e.fecha,e.concepto,e.moneda,e.monto,e.tasa??'',+(e.gastoUSD||0).toFixed(4)]);
    filename='timelex_gastos.csv';
  }else if(section==='inventario'){
    headers=['modelo','costo','precioUSD','precioBs','stockActual'];
    rows=(db.inventory||[]).map(i=>[i.modelo,i.costo,i.precioUSD,i.precioBs,i.stockActual]);
    filename='timelex_inventario.csv';
  }else{
    headers=['fecha','cliente','modelo','monto','estado','nota'];
    rows=(db.shipments||[]).map(s=>[s.fecha||'',s.cliente||'',s.modelo||'',s.monto||'',s.estado||'',s.nota||'']);
    filename='timelex_envios.csv';
  }
  const csv=[headers.map(q).join(','),...rows.map(r=>r.map(q).join(','))].join('\r\n');
  const blob=new Blob(['﻿'+csv],{type:'text/csv;charset=utf-8'});
  const a=Object.assign(document.createElement('a'),{href:URL.createObjectURL(blob),download:filename});
  document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(a.href);
  toast('✓ Descargando '+filename);
}

function csvRow(line,d){
  const res=[];let cur='',inQ=false;
  for(let i=0;i<line.length;i++){
    const c=line[i];
    if(c==='"'){if(inQ&&line[i+1]==='"'){cur+='"';i++}else inQ=!inQ}
    else if(c===d&&!inQ){res.push(cur.trim());cur=''}
    else cur+=c;
  }
  res.push(cur.trim());
  return res;
}

function parseCSVImport(text,section){
  const lines=text.trim().split(/\r?\n/);
  if(lines.length<2)throw new Error('El archivo no tiene datos');
  const d=lines[0].includes(';')?';':',';
  const hdr=csvRow(lines[0],d).map(h=>h.replace(/^"|"$/g,'').trim().toLowerCase());
  const objs=lines.slice(1).filter(l=>l.trim()).map(l=>{
    const v=csvRow(l,d);
    return Object.fromEntries(hdr.map((h,i)=>[h,(v[i]||'').replace(/^"|"$/g,'').trim()]));
  });
  if(section==='ventas'){
    return objs.map(r=>{
      const tipoPago=(r.tipopago||r['tipo pago']||'DIVISAS').toUpperCase();
      const monto=parseFloat(r.monto)||0;
      const tasa=r.tasa?parseFloat(r.tasa):null;
      const isBs=tipoPago==='BOLIVARES';
      const ingresoUSD=isBs?(tasa?monto/tasa:0):monto;
      const modelo=r.modelo||'';
      const inv=(db.inventory||[]).find(x=>x.modelo===modelo);
      const costoLanded=inv?inv.costo:0;
      return {id:uid(),fecha:r.fecha||'',modelo,tipoPago,monto,tasa:isBs?tasa:null,ingresoUSD,costoLanded,ganancia:ingresoUSD-costoLanded,nota:r.nota||'',deliveryUSD:0};
    });
  }else if(section==='gastos'){
    return objs.map(r=>{
      const moneda=(r.moneda||'DIVISAS').toUpperCase();
      const monto=parseFloat(r.monto)||0;
      const tasa=r.tasa?parseFloat(r.tasa):null;
      const isBs=moneda==='BOLIVARES';
      return {id:uid(),fecha:r.fecha||'',concepto:r.concepto||'',moneda,monto,tasa:isBs?tasa:null,gastoUSD:isBs?(tasa?monto/tasa:0):monto};
    });
  }else if(section==='inventario'){
    return objs.map(r=>({
      id:uid(),modelo:r.modelo||'',costo:parseFloat(r.costo)||0,
      precioUSD:parseFloat(r.precioUSD||r.precioUsd||r['precio usd']||r.preciousd)||0,
      precioBs:parseFloat(r.precioBs||r.precioBS||r['precio bs']||r.preciobs)||0,
      cantidad:parseInt(r.stockActual||r.stockactual||r['stock actual'])||0,
      stockActual:parseInt(r.stockActual||r.stockactual||r['stock actual'])||0,
      foto:r.foto||''
    }));
  }
  return [];
}

function openExportModal(){
  document.getElementById('modal-root').innerHTML=`<div class="modal-back" id="mback"><div class="modal" style="max-width:400px">
    <div class="modal-head"><h3>Exportar CSV</h3><button class="btn-ghost btn" id="mx" style="padding:4px 8px">✕</button></div>
    <div class="modal-body" style="display:flex;flex-direction:column;gap:10px">
      <p style="margin:0 0 4px;color:var(--txt-2);font-size:13px">Descarga los datos de cada sección como archivo CSV compatible con Excel.</p>
      <button class="btn" id="expInv" style="justify-content:center">Inventario</button>
      <button class="btn" id="expVen" style="justify-content:center">Ventas</button>
      <button class="btn" id="expGas" style="justify-content:center">Gastos Operativos</button>
      <button class="btn" id="expEnv" style="justify-content:center">Envíos</button>
    </div>
  </div></div>`;
  document.getElementById('mx').onclick=closeModal;
  document.getElementById('mback').onclick=e=>{if(e.target.id==='mback')closeModal()};
  document.getElementById('expInv').onclick=()=>exportSection('inventario');
  document.getElementById('expVen').onclick=()=>exportSection('ventas');
  document.getElementById('expGas').onclick=()=>exportSection('gastos');
  document.getElementById('expEnv').onclick=()=>exportSection('envios');
}

function openImportModal(){
  const HINTS={
    ventas:'Columnas: fecha, modelo, tipoPago (DIVISAS/BOLIVARES), monto, tasa, nota',
    gastos:'Columnas: fecha, concepto, moneda (DIVISAS/BOLIVARES), monto, tasa',
    inventario:'Columnas: modelo, costo, precioUSD, precioBs, stockActual'
  };
  document.getElementById('modal-root').innerHTML=`<div class="modal-back" id="mback"><div class="modal" style="max-width:480px">
    <div class="modal-head"><h3>Importar CSV</h3><button class="btn-ghost btn" id="mx" style="padding:4px 8px">✕</button></div>
    <div class="modal-body" style="display:flex;flex-direction:column;gap:14px">
      <p style="margin:0;color:var(--txt-2);font-size:13px">El archivo CSV debe tener los encabezados en la primera fila. Puedes exportar primero para ver el formato exacto.</p>
      <div class="field">
        <label class="lbl">Sección a importar</label>
        <div class="seg" id="impSeg"><button class="on" data-s="ventas">Ventas</button><button data-s="gastos">Gastos</button><button data-s="inventario">Inventario</button></div>
      </div>
      <div class="hint" id="impHint">${HINTS.ventas}</div>
      <div class="field"><label class="lbl">Archivo CSV</label><input class="inp" type="file" id="impFile" accept=".csv,.txt" /></div>
      <div id="impPreview" style="display:none;background:var(--bg-2);border-radius:10px;padding:11px 14px;font-size:13px;color:var(--txt-2)" id="impPreviewTxt"></div>
      <div id="impModeWrap" style="display:none" class="field">
        <label class="lbl">¿Cómo importar?</label>
        <div class="seg" id="impModeSeg"><button class="on" data-m="append">Agregar al final</button><button data-m="replace">Reemplazar todo</button></div>
      </div>
    </div>
    <div class="modal-foot"><button class="btn btn-ghost" id="mcancel">Cancelar</button><button class="btn btn-gold" id="impSave" disabled>Importar</button></div>
  </div></div>`;
  document.getElementById('mx').onclick=closeModal;
  document.getElementById('mcancel').onclick=closeModal;
  document.getElementById('mback').onclick=e=>{if(e.target.id==='mback')closeModal()};
  let sec='ventas',mode='append',parsed=null;
  document.getElementById('impSeg').querySelectorAll('button').forEach(b=>b.onclick=()=>{
    document.getElementById('impSeg').querySelectorAll('button').forEach(x=>x.classList.remove('on'));
    b.classList.add('on');sec=b.dataset.s;
    document.getElementById('impHint').textContent=HINTS[sec];
    parsed=null;document.getElementById('impPreview').style.display='none';
    document.getElementById('impModeWrap').style.display='none';
    document.getElementById('impSave').disabled=true;document.getElementById('impFile').value='';
  });
  document.getElementById('impModeSeg').querySelectorAll('button').forEach(b=>b.onclick=()=>{
    document.getElementById('impModeSeg').querySelectorAll('button').forEach(x=>x.classList.remove('on'));
    b.classList.add('on');mode=b.dataset.m;
  });
  document.getElementById('impFile').onchange=function(){
    const file=this.files[0];if(!file)return;
    const reader=new FileReader();
    reader.onload=e=>{
      try{
        parsed=parseCSVImport(e.target.result,sec);
        const prev=document.getElementById('impPreview');
        prev.textContent=parsed.length+' filas leídas · listas para importar';
        prev.style.display='';
        document.getElementById('impModeWrap').style.display='';
        document.getElementById('impSave').disabled=parsed.length===0;
      }catch(err){toast('Error al leer el archivo: '+err.message)}
    };
    reader.readAsText(file,'UTF-8');
  };
  document.getElementById('impSave').onclick=()=>{
    if(!parsed||!parsed.length)return;
    if(mode==='replace'){
      if(sec==='ventas')db.sales=parsed;
      else if(sec==='gastos')db.expenses=parsed;
      else db.inventory=parsed;
    }else{
      if(sec==='ventas')db.sales=[...(db.sales||[]),...parsed];
      else if(sec==='gastos')db.expenses=[...(db.expenses||[]),...parsed];
      else db.inventory=[...(db.inventory||[]),...parsed];
    }
    save();closeModal();render();toast('✓ '+parsed.length+' registros importados');
  };
}

/* ============ DATA MENU ============ */
document.getElementById('menuBtn').onclick=()=>{
  document.getElementById('modal-root').innerHTML=`<div class="modal-back" id="mback"><div class="modal" style="max-width:420px">
    <div class="modal-head"><h3>Datos</h3><button class="btn-ghost btn" id="mx" style="padding:4px 8px">✕</button></div>
    <div class="modal-body" style="display:flex;flex-direction:column;gap:12px">
      <p style="margin:0 0 4px;color:var(--txt-2);font-size:13px">Todos tus datos se guardan automáticamente en este navegador (localStorage) y persisten aunque cierres el archivo.</p>
      <button class="btn" id="bExport" style="justify-content:center">Exportar CSV</button>
      <button class="btn" id="bImport" style="justify-content:center">Importar CSV</button>
      <button class="btn" id="bReset" style="justify-content:center">Restablecer a datos originales del Excel</button>
      <button class="btn" id="bWipe" style="justify-content:center;color:var(--red);border-color:var(--red-soft)">Borrar todo y empezar de cero</button>
    </div></div></div>`;
  document.getElementById('mx').onclick=closeModal;
  document.getElementById('mback').onclick=e=>{if(e.target.id==='mback')closeModal()};
  document.getElementById('bExport').onclick=()=>{closeModal();openExportModal()};
  document.getElementById('bImport').onclick=()=>{closeModal();openImportModal()};
  document.getElementById('bReset').onclick=()=>confirmModal('Restablecer','Esto reemplazará tus datos actuales con los datos originales del Excel. ¿Continuar?',()=>{resetDb();toast('Datos restablecidos')});
  document.getElementById('bWipe').onclick=()=>confirmModal('Borrar todo','Se eliminará TODO: inventario, ventas y gastos. ¿Seguro?',()=>{wipeDb();toast('Todo borrado')});
};
