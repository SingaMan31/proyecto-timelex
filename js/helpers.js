/* ============ HELPERS ============ */
const usd=new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',minimumFractionDigits:2,maximumFractionDigits:2});
const bs=new Intl.NumberFormat('es-VE',{minimumFractionDigits:2,maximumFractionDigits:2});
const int=new Intl.NumberFormat('es-VE');
function fUSD(n){return usd.format(n||0)}
function fBs(n){return 'Bs '+bs.format(n||0)}
function fDate(iso){if(!iso)return '—';const[y,m,d]=iso.split('-');return d+'/'+m+'/'+y}
function fDateLong(iso){const[y,m,d]=iso.split('-');const ms=['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];return d+' '+ms[+m-1]+' '+y}
function todayISO(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
function toast(msg){const t=document.getElementById('toast');document.getElementById('toast-msg').textContent=msg;t.classList.add('show');clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('show'),2400)}
function gdriveDirect(url){
  if(!url)return'';
  const m1=url.match(/drive\.google\.com\/file\/d\/([^\/\?&]+)/);
  if(m1)return'https://lh3.googleusercontent.com/d/'+m1[1];
  const m2=url.match(/drive\.google\.com\/(?:open|uc)\?.*[?&]id=([^&]+)/);
  if(m2)return'https://lh3.googleusercontent.com/d/'+m2[1];
  return url;
}

const ICON={
  trash:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>',
  plus:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  search:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>',
  box:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M21 8 12 3 3 8v8l9 5 9-5V8z"/><path d="M3 8l9 5 9-5M12 13v8"/></svg>',
  edit:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>',
  wa:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.15-1.7-.84-2-.94-.27-.1-.46-.15-.65.15-.2.3-.74.93-.9 1.12-.17.2-.34.22-.63.08-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.04-.17-.3-.02-.46.13-.6.13-.14.3-.34.44-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.65-1.57-.9-2.15-.23-.56-.47-.48-.65-.49l-.55-.01c-.2 0-.5.07-.76.37-.27.3-1 1-1 2.43 0 1.43 1.04 2.81 1.18 3 .15.2 2.05 3.13 4.96 4.39.7.3 1.24.48 1.66.62.7.22 1.33.19 1.83.12.56-.08 1.7-.7 1.95-1.36.24-.67.24-1.24.17-1.36-.07-.12-.27-.2-.56-.34zM12 2a10 10 0 0 0-8.5 15.3L2 22l4.8-1.26A10 10 0 1 0 12 2z"/></svg>',
  clock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  pin:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>',
  link:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1.5 1.5"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1.5-1.5"/></svg>',
  truck:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h11v9M14 9h3l3 3v3h-2"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>',
  camera:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>'
};
