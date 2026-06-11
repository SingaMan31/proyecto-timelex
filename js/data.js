/* ============ SEED DATA (extraído del Excel original) ============ */
const SEED = {"models":[{"modelo":"613 SL WH S","costo":14.5,"precioUSD":25,"precioBs":34,"cantidad":3,"stockActual":0},{"modelo":"613 SL BU S","costo":14.5,"precioUSD":25,"precioBs":34,"cantidad":3,"stockActual":0},{"modelo":"821 SL GN S","costo":14.65,"precioUSD":30,"precioBs":41,"cantidad":2,"stockActual":0},{"modelo":"821 SL BUS","costo":14.65,"precioUSD":30,"precioBs":41,"cantidad":2,"stockActual":0},{"modelo":"769 SL BU S","costo":14.5,"precioUSD":30,"precioBs":41,"cantidad":2,"stockActual":0},{"modelo":"792 SL WH S","costo":14.5,"precioUSD":30,"precioBs":41,"cantidad":2,"stockActual":0},{"modelo":"708 SL PK S","costo":14.5,"precioUSD":30,"precioBs":41,"cantidad":1,"stockActual":0},{"modelo":"910 SL BUS","costo":14.75,"precioUSD":35,"precioBs":46,"cantidad":2,"stockActual":0},{"modelo":"910 SL BKS","costo":14.75,"precioUSD":35,"precioBs":46,"cantidad":2,"stockActual":0},{"modelo":"910 GD GD S","costo":15.5,"precioUSD":35,"precioBs":46,"cantidad":2,"stockActual":1},{"modelo":"910 GD WH S","costo":15.5,"precioUSD":35,"precioBs":46,"cantidad":2,"stockActual":0},{"modelo":"834 SL WH S","costo":16.25,"precioUSD":40,"precioBs":52,"cantidad":2,"stockActual":0},{"modelo":"834 SL MBUS","costo":16.25,"precioUSD":40,"precioBs":52,"cantidad":2,"stockActual":0},{"modelo":"960 SL GN S","costo":17.15,"precioUSD":40,"precioBs":52,"cantidad":2,"stockActual":0},{"modelo":"960 RG GD S","costo":18.15,"precioUSD":40,"precioBs":52,"cantidad":2,"stockActual":1},{"modelo":"675 S G","costo":17,"precioUSD":35,"precioBs":46,"cantidad":1,"stockActual":0},{"modelo":"821 SL BK S","costo":14.65,"precioUSD":30,"precioBs":41,"cantidad":2,"stockActual":0}],"sales":[{"fecha":"2026-04-15","modelo":"821 SL BUS","tipoPago":"DIVISAS","monto":30,"tasa":null,"ingresoUSD":30,"costoLanded":14.65,"ganancia":15.35,"nota":""},{"fecha":"2026-04-15","modelo":"769 SL BU S","tipoPago":"DIVISAS","monto":30,"tasa":null,"ingresoUSD":30,"costoLanded":14.5,"ganancia":15.5,"nota":""},{"fecha":"2026-04-15","modelo":"910 SL BKS","tipoPago":"DIVISAS","monto":30,"tasa":null,"ingresoUSD":30,"costoLanded":14.75,"ganancia":15.25,"nota":""},{"fecha":"2026-04-17","modelo":"613 SL BU S","tipoPago":"BOLIVARES","monto":16300,"tasa":620,"ingresoUSD":26.29032258,"costoLanded":14.5,"ganancia":11.79032258,"nota":""},{"fecha":"2026-04-18","modelo":"821 SL BK S","tipoPago":"BOLIVARES","monto":19600,"tasa":620,"ingresoUSD":31.61290323,"costoLanded":14.65,"ganancia":16.96290323,"nota":""},{"fecha":"2026-04-18","modelo":"821 SL BK S","tipoPago":"DIVISAS","monto":30,"tasa":null,"ingresoUSD":30,"costoLanded":14.65,"ganancia":15.35,"nota":""},{"fecha":"2026-04-18","modelo":"613 SL WH S","tipoPago":"DIVISAS","monto":20,"tasa":null,"ingresoUSD":20,"costoLanded":14.5,"ganancia":5.5,"nota":"Nelson Fiado"},{"fecha":"2026-04-22","modelo":"675 S G","tipoPago":"BOLIVARES","monto":22170,"tasa":620,"ingresoUSD":35.75806452,"costoLanded":17,"ganancia":18.75806452,"nota":""},{"fecha":"2026-04-27","modelo":"910 GD GD S","tipoPago":"BOLIVARES","monto":22200,"tasa":610,"ingresoUSD":36.39344262,"costoLanded":15.5,"ganancia":20.89344262,"nota":""},{"fecha":"2026-04-27","modelo":"910 GD WH S","tipoPago":"BOLIVARES","monto":22200,"tasa":610,"ingresoUSD":36.39344262,"costoLanded":15.5,"ganancia":20.89344262,"nota":""},{"fecha":"2026-04-27","modelo":"910 SL BUS","tipoPago":"DIVISAS","monto":30,"tasa":null,"ingresoUSD":30,"costoLanded":14.75,"ganancia":15.25,"nota":""},{"fecha":"2026-04-27","modelo":"769 SL BU S","tipoPago":"DIVISAS","monto":30,"tasa":null,"ingresoUSD":30,"costoLanded":14.5,"ganancia":15.5,"nota":""},{"fecha":"2026-04-27","modelo":"613 SL WH S","tipoPago":"BOLIVARES","monto":16900,"tasa":610,"ingresoUSD":27.70491803,"costoLanded":14.5,"ganancia":13.20491803,"nota":""},{"fecha":"2026-04-27","modelo":"792 SL WH S","tipoPago":"BOLIVARES","monto":16900,"tasa":610,"ingresoUSD":27.70491803,"costoLanded":14.5,"ganancia":13.20491803,"nota":""},{"fecha":"2026-04-27","modelo":"910 SL BUS","tipoPago":"DIVISAS","monto":40,"tasa":null,"ingresoUSD":40,"costoLanded":14.75,"ganancia":25.25,"nota":""},{"fecha":"2026-04-27","modelo":"613 SL BU S","tipoPago":"BOLIVARES","monto":16400,"tasa":610,"ingresoUSD":26.8852459,"costoLanded":14.5,"ganancia":12.3852459,"nota":""},{"fecha":"2026-04-27","modelo":"910 SL BKS","tipoPago":"BOLIVARES","monto":22200,"tasa":610,"ingresoUSD":36.39344262,"costoLanded":14.75,"ganancia":21.64344262,"nota":""},{"fecha":"2026-04-27","modelo":"613 SL BU S","tipoPago":"DIVISAS","monto":30,"tasa":null,"ingresoUSD":30,"costoLanded":14.5,"ganancia":15.5,"nota":""},{"fecha":"2026-04-27","modelo":"708 SL PK S","tipoPago":"DIVISAS","monto":30,"tasa":null,"ingresoUSD":30,"costoLanded":14.5,"ganancia":15.5,"nota":""},{"fecha":"2026-04-27","modelo":"834 SL WH S","tipoPago":"BOLIVARES","monto":25100,"tasa":610,"ingresoUSD":41.14754098,"costoLanded":16.25,"ganancia":24.89754098,"nota":""},{"fecha":"2026-04-27","modelo":"834 SL WH S","tipoPago":"BOLIVARES","monto":25100,"tasa":610,"ingresoUSD":41.14754098,"costoLanded":16.25,"ganancia":24.89754098,"nota":""},{"fecha":"2026-04-27","modelo":"834 SL MBUS","tipoPago":"BOLIVARES","monto":25100,"tasa":610,"ingresoUSD":41.14754098,"costoLanded":16.25,"ganancia":24.89754098,"nota":""},{"fecha":"2026-04-27","modelo":"960 SL GN S","tipoPago":"BOLIVARES","monto":28800,"tasa":610,"ingresoUSD":47.21311475,"costoLanded":17.15,"ganancia":30.06311475,"nota":""},{"fecha":"2026-04-28","modelo":"834 SL MBUS","tipoPago":"BOLIVARES","monto":26500,"tasa":610,"ingresoUSD":43.44262295,"costoLanded":16.25,"ganancia":27.19262295,"nota":""},{"fecha":"2026-04-28","modelo":"613 SL WH S","tipoPago":"BOLIVARES","monto":17950,"tasa":610,"ingresoUSD":29.42622951,"costoLanded":14.5,"ganancia":14.92622951,"nota":""},{"fecha":"2026-04-29","modelo":"821 SL BUS","tipoPago":"DIVISAS","monto":40,"tasa":null,"ingresoUSD":40,"costoLanded":14.65,"ganancia":25.35,"nota":""},{"fecha":"2026-04-30","modelo":"960 SL GN S","tipoPago":"DIVISAS","monto":40,"tasa":null,"ingresoUSD":40,"costoLanded":17.15,"ganancia":22.85,"nota":""},{"fecha":"2026-05-04","modelo":"910 GD WH S","tipoPago":"BOLIVARES","monto":22900,"tasa":610,"ingresoUSD":37.54098361,"costoLanded":15.5,"ganancia":22.04098361,"nota":""},{"fecha":"2026-05-04","modelo":"960 RG GD S","tipoPago":"BOLIVARES","monto":25800,"tasa":610,"ingresoUSD":42.29508197,"costoLanded":18.15,"ganancia":24.14508197,"nota":""},{"fecha":"2026-05-05","modelo":"821 SL GN S","tipoPago":"BOLIVARES","monto":20000,"tasa":610,"ingresoUSD":32.78688525,"costoLanded":14.65,"ganancia":18.13688525,"nota":""},{"fecha":"2026-05-08","modelo":"792 SL WH S","tipoPago":"DIVISAS","monto":40,"tasa":null,"ingresoUSD":40,"costoLanded":14.5,"ganancia":25.5,"nota":""},{"fecha":"2026-05-11","modelo":"821 SL GN S","tipoPago":"BOLIVARES","monto":20500,"tasa":610,"ingresoUSD":33.60655738,"costoLanded":14.65,"ganancia":18.95655738,"nota":""}],"expenses":[{"fecha":"2026-04-14","concepto":"Capcut 1 mes","moneda":"BOLIVARES","monto":2389,"tasa":630,"gastoUSD":3.792063492},{"fecha":"2026-04-22","concepto":"Reloj sin bateria cliente y envio","moneda":"BOLIVARES","monto":3610,"tasa":620,"gastoUSD":5.822580645},{"fecha":"2026-04-27","concepto":"DELIVERY PAPA LUNES","moneda":"DIVISAS","monto":50,"tasa":null,"gastoUSD":50},{"fecha":"2026-04-28","concepto":"Nueva linea corporativa","moneda":"BOLIVARES","monto":3000,"tasa":610,"gastoUSD":4.918032787},{"fecha":"2026-05-04","concepto":"2 delivery","moneda":"BOLIVARES","monto":3000,"tasa":610,"gastoUSD":4.918032787},{"fecha":"2026-05-05","concepto":"delivery mrw","moneda":"BOLIVARES","monto":1500,"tasa":610,"gastoUSD":2.459016393},{"fecha":"2026-05-08","concepto":"vuelto cliente","moneda":"BOLIVARES","monto":3000,"tasa":610,"gastoUSD":4.918032787},{"fecha":"2026-05-11","concepto":"DELIVERY VIERNES Y LUNES","moneda":"BOLIVARES","monto":2000,"tasa":610,"gastoUSD":3.278688525}]};

/* ============ STATE & PERSISTENCE ============ */
const LS_KEY='timelex_db_v1';
let db={};
let _remoteUpdate=false;
let _lastSavedAt=0;
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7)}
async function initData(){
  try{
    const doc = await fsDb.collection('timelex').doc('datos').get();
    if(doc.exists){
      db = doc.data();
      if(!db.inventory) db.inventory = [];
      if(!db.sales) db.sales = [];
      if(!db.expenses) db.expenses = [];
      if(!db.shipments) db.shipments = [];
    } else {
      db = seedDb();
      await fsDb.collection('timelex').doc('datos').set(db);
    }
  } catch(e){
    console.error('Firebase error, usando localStorage como fallback', e);
    const raw = localStorage.getItem(LS_KEY);
    db = raw ? JSON.parse(raw) : seedDb();
  }
  render();
  // Listener en tiempo real para sincronizar entre dispositivos
  let _firstFire=true;
  fsDb.collection('timelex').doc('datos').onSnapshot(snap=>{
    if(_firstFire){_firstFire=false;return;}
    if(!snap.exists||snap.metadata.hasPendingWrites)return;
    if(Date.now()-_lastSavedAt<4000)return; // ignora eco de nuestros propios saves
    const d=snap.data();if(!d)return;
    _remoteUpdate=true;
    db=d;
    if(!db.inventory)db.inventory=[];
    if(!db.sales)db.sales=[];
    if(!db.expenses)db.expenses=[];
    if(!db.shipments)db.shipments=[];
    render();
    _remoteUpdate=false;
    toast('Datos sincronizados');
  },()=>{});
}
function seedDb(){
  const d={
    inventory:SEED.models.map(m=>({id:uid(),...m})),
    sales:SEED.sales.map(s=>({id:uid(),...s})),
    expenses:SEED.expenses.map(e=>({id:uid(),...e})),
    shipments:[]
  };
  return d;
}
function save(){
  _lastSavedAt=Date.now();
  fsDb.collection('timelex').doc('datos').set(db)
    .catch(e=>{
      console.error('Error guardando',e);
      if(e.code==='permission-denied')toast('⚠ Reglas de Firestore vencidas — actualízalas en Firebase Console');
      else toast('⚠ Error al guardar ('+( e.code||e.message||'sin conexión')+')');
    });
}
function resetDb(){db=seedDb();save();render()}
function wipeDb(){db={inventory:[],sales:[],expenses:[],shipments:[]};save();render()}
