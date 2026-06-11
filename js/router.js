/* ============ ROUTER ============ */
let view='dashboard';
const tabsEl=document.getElementById('tabs');
tabsEl.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;view=b.dataset.view;[...tabsEl.children].forEach(x=>x.classList.toggle('active',x===b));render()});

function render(){
  if(!_remoteUpdate)save();
  const app=document.getElementById('app');
  if(view==='dashboard')app.innerHTML=viewDashboard();
  else if(view==='inventario')app.innerHTML=viewInventario();
  else if(view==='ventas')app.innerHTML=viewVentas();
  else if(view==='gastos')app.innerHTML=viewGastos();
  else if(view==='envios')app.innerHTML=viewEnvios();
  wire();
}

/* ============ WIRING ============ */
function wire(){
  // Dashboard month chips
  document.querySelectorAll('.mchip').forEach(b=>b.onclick=()=>{dashMonth=b.dataset.m;const app=document.getElementById('app');app.innerHTML=viewDashboard();wire();});
  // Inventario
  const addBtn=document.getElementById('addModelBtn');
  if(addBtn)addBtn.onclick=openAddModel;
  const invS=document.getElementById('invSearch');
  if(invS)invS.oninput=e=>{invSearch=e.target.value;const pos=e.target.selectionStart;renderInvKeepFocus(pos)};
  document.querySelectorAll('.stock-cell').forEach(cell=>{
    const tr=cell.closest('tr');const id=tr.dataset.id;
    const input=cell.querySelector('.stock-input');
    cell.querySelectorAll('button').forEach(b=>b.onclick=()=>{
      const it=db.inventory.find(x=>x.id===id);
      it.stockActual=Math.max(0,(+it.stockActual||0)+(+b.dataset.step));
      save();input.value=it.stockActual;updateStockBadge(tr,it.stockActual);toast('Stock actualizado: '+it.modelo)});
    input.onchange=()=>{const it=db.inventory.find(x=>x.id===id);it.stockActual=Math.max(0,parseInt(input.value)||0);input.value=it.stockActual;save();updateStockBadge(tr,it.stockActual);toast('Stock actualizado')};
  });
  document.querySelectorAll('.edit-field').forEach(inp=>{
    const id=inp.closest('tr').dataset.id;const field=inp.dataset.field;
    inp.onchange=()=>{const it=db.inventory.find(x=>x.id===id);it[field]=Math.max(0,parseFloat(inp.value)||0);inp.value=it[field];save();
      const valor=db.inventory.reduce((a,m)=>a+(+m.stockActual||0)*(+m.costo||0),0);
      const pill=document.querySelector('.pill-summary span:last-child b');if(pill)pill.textContent=fUSD(valor);
      toast('Actualizado: '+it.modelo)};
    inp.onkeydown=e=>{if(e.key==='Enter')inp.blur()};
  });
  document.querySelectorAll('.act-del-model').forEach(b=>b.onclick=()=>{
    const id=b.closest('tr').dataset.id;const it=db.inventory.find(x=>x.id===id);
    confirmModal('Eliminar modelo','¿Eliminar "'+it.modelo+'" del inventario? Las ventas registradas no se borran.',()=>{db.inventory=db.inventory.filter(x=>x.id!==id);render();toast('Modelo eliminado')});
  });
  document.querySelectorAll('.photo-thumb').forEach(img=>{
    img.onclick=()=>openPhotoModal(img.dataset.photo,img.dataset.name);
  });
  document.querySelectorAll('.photo-edit-btn,.btn-add-photo').forEach(btn=>{
    btn.onclick=e=>{e.stopPropagation();openPhotoEdit(btn.dataset.id)};
  });
  document.querySelectorAll('.inv-open-product').forEach(td=>{
    td.onclick=()=>openProductPage(td.closest('tr').dataset.id);
  });

  // Ventas form
  const sf=document.getElementById('saleForm');
  if(sf){
    sf.querySelectorAll('[name]').forEach(el=>el.addEventListener('input',()=>{saleForm[el.name]=el.value;
      if(['monto','tasa','modelo','delMonto','delTasa'].includes(el.name))refreshCalc();}));
    sf.querySelectorAll('[data-seg="tipoPago"] button').forEach(b=>b.onclick=()=>{saleForm.tipoPago=b.dataset.v;if(b.dataset.v==='DIVISAS')saleForm.tasa='';renderKeep('ventas')});
    sf.querySelectorAll('[data-seg="delMoneda"] button').forEach(b=>b.onclick=()=>{saleForm.delMoneda=b.dataset.v;if(b.dataset.v==='DIVISAS')saleForm.delTasa='';renderKeep('ventas')});
    const dt=document.getElementById('delToggle');
    if(dt)dt.onclick=()=>{saleForm.delivery=!saleForm.delivery;if(!saleForm.delivery){saleForm.delMonto='';saleForm.delTasa=''}renderKeep('ventas')};
    sf.onsubmit=e=>{e.preventDefault();submitSale()};
  }
  // Gastos form
  const ef=document.getElementById('expForm');
  if(ef){
    ef.querySelectorAll('[name]').forEach(el=>el.addEventListener('input',()=>{expForm[el.name]=el.value;
      if(el.name==='monto'||el.name==='tasa')refreshExpCalc()}));
    ef.querySelectorAll('[data-seg="moneda"] button').forEach(b=>b.onclick=()=>{expForm.moneda=b.dataset.v;if(b.dataset.v==='DIVISAS')expForm.tasa='';renderKeep('gastos')});
    ef.onsubmit=e=>{e.preventDefault();submitExp()};
  }
  // Envíos form
  const shf=document.getElementById('shipForm');
  if(shf){
    shf.querySelectorAll('[name]').forEach(el=>el.addEventListener('input',()=>{shipForm[el.name]=el.value;}));
    shf.querySelectorAll('[data-seg="estatus"] button').forEach(b=>b.onclick=()=>{shipForm.estatus=b.dataset.v;renderKeep('envios')});
    shf.querySelectorAll('[data-seg="moneda"] button').forEach(b=>b.onclick=()=>{shipForm.moneda=b.dataset.v;renderKeep('envios')});
    const add=document.getElementById('shipModelAdd');
    if(add)add.onchange=()=>{const v=add.value;if(v&&!shipForm.modelos.includes(v))shipForm.modelos.push(v);renderKeep('envios')};
    shf.querySelectorAll('.pchip [data-rm]').forEach(b=>b.onclick=()=>{shipForm.modelos.splice(+b.dataset.rm,1);renderKeep('envios')});
    shf.onsubmit=e=>{e.preventDefault();submitShip()};
  }
  document.querySelectorAll('.status-filter .mchip').forEach(b=>b.onclick=()=>{shipFilter=b.dataset.f;renderKeep('envios')});
  document.querySelectorAll('.st-set').forEach(b=>b.onclick=()=>{
    const id=b.closest('.ship-card').dataset.id;const s=db.shipments.find(x=>x.id===id);
    if(s){s.estatus=b.dataset.set;save();renderKeep('envios');toast('Estatus: '+ST_LABEL[s.estatus])}});
  document.querySelectorAll('.act-del-ship').forEach(b=>b.onclick=()=>{
    const id=b.closest('.ship-card').dataset.id;
    confirmModal('Eliminar envío','¿Eliminar este envío de la lista?',()=>{db.shipments=db.shipments.filter(x=>x.id!==id);renderKeep('envios');save();toast('Envío eliminado')})});
  document.querySelectorAll('.act-edit-sale').forEach(b=>b.onclick=()=>{const id=b.closest('tr').dataset.id;openEditSale(id)});
  document.querySelectorAll('.act-del-sale').forEach(b=>b.onclick=()=>{
    const id=b.closest('tr').dataset.id;const s=db.sales.find(x=>x.id===id);
    confirmModal('Eliminar venta','¿Eliminar esta venta de '+s.modelo+'? Se devolverá 1 unidad al stock'+(db.expenses.some(e=>e.fromSale===id)?' y se borrará su delivery asociado':'')+'.',()=>{
      const it=db.inventory.find(x=>x.modelo===s.modelo);if(it)it.stockActual=(+it.stockActual||0)+1;
      db.sales=db.sales.filter(x=>x.id!==id);
      db.expenses=db.expenses.filter(e=>e.fromSale!==id);
      render();toast('Venta eliminada · stock devuelto')});
  });
  document.querySelectorAll('.act-edit-exp').forEach(b=>b.onclick=()=>{const id=b.closest('tr').dataset.id;openEditExp(id)});
  document.querySelectorAll('.act-del-exp').forEach(b=>b.onclick=()=>{
    const id=b.closest('tr').dataset.id;const ex=db.expenses.find(x=>x.id===id);
    const linked=ex&&ex.fromSale;
    confirmModal('Eliminar gasto',linked?'Este gasto es el delivery de una venta. Al borrarlo, la ganancia de esa venta subirá. ¿Continuar?':'¿Eliminar este gasto?',()=>{
      if(linked){const s=db.sales.find(x=>x.id===ex.fromSale);if(s){s.deliveryUSD=0}}
      db.expenses=db.expenses.filter(x=>x.id!==id);render();toast('Gasto eliminado')});
  });
}

function renderKeep(v){const app=document.getElementById('app');app.innerHTML=(v==='ventas'?viewVentas():v==='gastos'?viewGastos():viewEnvios());wire()}
