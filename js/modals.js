/* ============ MODALS ============ */
function closeModal(){document.getElementById('modal-root').innerHTML=''}
function confirmModal(title,msg,onYes){
  document.getElementById('modal-root').innerHTML=`<div class="modal-back" id="mback"><div class="modal" style="max-width:420px">
    <div class="modal-head"><h3>${esc(title)}</h3></div>
    <div class="modal-body"><p style="margin:0;color:var(--txt-2)">${esc(msg)}</p></div>
    <div class="modal-foot"><button class="btn btn-ghost" id="mcancel">Cancelar</button><button class="btn" style="background:var(--red-soft);border-color:var(--red);color:var(--red)" id="mok">Eliminar</button></div>
  </div></div>`;
  document.getElementById('mback').onclick=e=>{if(e.target.id==='mback')closeModal()};
  document.getElementById('mcancel').onclick=closeModal;
  document.getElementById('mok').onclick=()=>{closeModal();onYes()};
}
