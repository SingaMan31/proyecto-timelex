# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Timelex · Contabilidad** is a web application for accounting and inventory management. The entry point is `index.html`, which loads styles and scripts from separate files. Data is persisted in **Firebase Firestore**.

- **Production URL:** https://proyecto-timelex.vercel.app
- **GitHub:** https://github.com/SingaMan31/proyecto-timelex

## File Structure

```
index.html           — Main entry point (HTML shell + ordered <script> tags)
styles/main.css      — All application CSS, including responsive media queries
js/firebase.js       — Firebase initialization and Firestore connection
js/helpers.js        — Formatters (fUSD, fBs, fDate…), esc, toast, gdriveDirect, ICON
js/data.js           — SEED data, state (db, sync flags), initData, save, seedDb, resetDb, wipeDb
js/modals.js         — closeModal, confirmModal
js/dashboard.js      — viewDashboard + month helper functions
js/inventario.js     — viewInventario, stock controls, photo handling, openAddModel, openProductPage
js/ventas.js         — viewVentas, saleCalc, submitSale, openEditSale
js/gastos.js         — viewGastos, expCalc, submitExp, openEditExp
js/envios.js         — viewEnvios, submitShip, waLink
js/router.js         — render, wire, tab navigation (accesses all view* and submit* functions)
js/csv.js            — exportSection, parseCSVImport, openExportModal, openImportModal, data menu
js/main.js           — Escape keydown listener + initData() call (always loaded last)
```

All JS files share the same global scope — there are no ES modules. `db`, `fsDb`, and all functions are global variables accessible across files. The load order in `index.html` is the dependency order.

## Deploying Changes

There is no build step. Push to GitHub and Vercel deploys automatically:

```powershell
git add .
git commit -m "description of change"
git push
```

`push.bat` at the repo root does all three steps in one double-click.

To run locally before pushing:

```powershell
# Requires 'serve' installed globally (npm install -g serve)
serve .
# Opens at http://localhost:3000
```

JavaScript must be enabled. An active internet connection is required to load the Firebase SDK and reach Firestore.

## Architecture

### Script load order (inside `<head>` / top of `<body>`)

1. `styles/main.css` — all styles via `<link>`
2. `firebase-app-compat.js` (CDN, v9.22.0)
3. `firebase-firestore-compat.js` (CDN, v9.22.0)
4. `js/firebase.js` — calls `firebase.initializeApp()` and exposes `fsDb` globally
5. `js/helpers.js` → `js/data.js` → `js/modals.js` → `js/dashboard.js` → `js/inventario.js` → `js/ventas.js` → `js/gastos.js` → `js/envios.js` → `js/router.js` → `js/csv.js` → `js/main.js`

### Data persistence

- **Provider:** Firebase Firestore (compat SDK v9)
- **Project:** `timelex-4c35e`
- **Collection:** `timelex`
- **Document:** `datos`
- **Global handle:** `fsDb` (initialized in `js/firebase.js`)

All application state lives in a single `db` object. `save()` writes it to Firestore as a fire-and-forget operation. `initData()` reads it on startup and then subscribes an `onSnapshot` listener for real-time cross-device sync.

### Startup flow (`initData`)

`initData()` is `async` and is the sole entry point called at the end of `js/main.js`:

1. Fetches `timelex/datos` from Firestore.
2. If the document exists, loads it into `db` and backfills any missing arrays (`inventory`, `sales`, `expenses`, `shipments`).
3. If the document does not exist, seeds `db` with default data and writes it to Firestore.
4. On any Firestore error, falls back to `localStorage` (key: `timelex_db_v1`) or `seedDb()`.
5. Calls `render()` once data is ready.
6. Registers an `onSnapshot` listener for real-time sync across devices (see below).

### Real-time sync (`onSnapshot`)

After the initial load, `initData()` registers a live listener on `timelex/datos`. When another device writes data, the listener fires and updates `db` + calls `render()`.

**Infinite-loop prevention** — three guards work together:

| Variable | Type | Purpose |
|---|---|---|
| `_remoteUpdate` | `boolean` | Set to `true` while processing a remote snapshot so `render()` skips calling `save()` |
| `_lastSavedAt` | `number` (ms timestamp) | Updated by `save()`; the listener ignores snapshots that arrive within 4 s of our own write (echoed confirmations) |
| `_firstFire` | `boolean` | The listener fires once immediately on registration; this flag skips that first fire |

The listener also checks `snap.metadata.hasPendingWrites` — if true, the snapshot is our own pending write and is skipped.

### State & persistence functions

| Function | Description |
|---|---|
| `initData()` | Async startup — loads from Firestore, falls back to localStorage, starts onSnapshot |
| `save()` | Fire-and-forget write of `db` to Firestore; shows specific toast on `permission-denied` |
| `seedDb()` | Returns a fresh default `db` object |
| `render()` | Re-renders the full UI from current `db`; skips `save()` when `_remoteUpdate` is true |

### Edit modals

Each table row in Ventas and Gastos has an edit button (✏️ `ICON.edit`) to the left of the delete button. Clicking it opens a pre-filled modal:

| Function | Opens modal for | Fields |
|---|---|---|
| `openEditSale(id, tmp?)` | A sale row | `fecha`, `modelo` (dropdown), `tipoPago` (seg), `monto`, `tasa`, `nota` |
| `openEditExp(id, tmp?)` | An expense row | `fecha`, `concepto`, `moneda` (seg), `monto`, `tasa` |

Both functions accept an optional `tmp` snapshot used when the seg button (tipoPago / moneda) is toggled — the modal re-renders itself preserving the current field values. On save, `ingresoUSD`/`gastoUSD` and `ganancia` are recalculated, then `save()` and `render()` are called. `deliveryUSD` on sales is preserved as-is.

The edit button uses CSS class `act-edit-sale` / `act-edit-exp` and is wired in `wire()`.

### Product page modal (`openProductPage`)

Clicking a model name cell in the Inventario table opens a product detail modal. The cell has class `inv-open-product` (wired in `wire()`).

`openProductPage(id, filterMonth?)` renders a two-column modal:

- **Left column** — product photo (from `m.foto` URL), stats grid (stock, cost, USD price, Bs price, total units sold, revenue).
- **Right column** — month pills to filter (all months that have sales for that model, plus "Todos"), then a bar chart grouped by date showing count and revenue per day.

The `filterMonth` parameter is a `"YYYY-MM"` string or `null` (all time). When null, the view defaults to the last 5 dates that had sales. Month pills re-call `openProductPage(id, m)` to re-render with the selected filter.

CSS classes: `.prod-page-modal`, `.prod-left`, `.prod-right`, `.prod-photo-wrap`, `.prod-photo-img`, `.prod-photo-ph`, `.prod-stats`, `.prod-stat-row`, `.month-pills`, `.month-pill`, `.month-pill.on`, `.prod-days-list`, `.sales-day-row`, `.prod-summary`. Responsive: stacks vertically at `max-width: 600px`.

## Firestore Security Rules

**IMPORTANT:** Firestore rules must start with `service cloud.firestore`, NOT `service firebase.storage`. The Storage and Firestore rules are edited in separate sections of the Firebase Console but it is easy to confuse them.

Current working rules (paste in Firebase Console → Firestore → Reglas):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

Test-mode rules expire after **30 days**. If `save()` starts showing a `permission-denied` toast, the rules have expired — republish the block above.

## CSS & Responsive

All styles live in `styles/main.css`. Media query breakpoints:

| Breakpoint | Target |
|---|---|
| `max-width: 960px` | Hide ventas sidebar layout |
| `max-width: 860px` | 2-col KPI grid, compact topbar, single-col forms |
| `max-width: 768px` | Mobile: two-row topbar (logo+menu button on row 1, tabs on row 2), scrollable tabs, 2×2 KPI grid, scrollable chart, tighter padding |
| `max-width: 600px` | Product page modal stacks vertically |

### Mobile topbar (≤ 768px)

`.topbar-in` uses `flex-wrap: wrap; height: auto; padding-bottom: 10px` so the tabs wrap to a second row. `.tabs` has `order: 3; width: 100%; flex-wrap: nowrap; overflow-x: auto` with scrollbar hidden, placing it below the brand and menu button. The `.spacer` (between tabs and menu button) pushes the menu button to the right on row 1.

## Application Domain

Inventory and accounting management with multi-currency support:
- Product model fields: `modelo`, `costo`, `precioUSD`, `precioBs`, `cantidad`, `stockActual`, `foto` (URL string)
- Currencies: USD and Bs (Venezuelan Bolívars)
- UI: KPI dashboard cards, bar chart for financial/time data, tabbed navigation

## Design Tokens

| Token | Value | Usage |
|---|---|---|
| Background | `#121316` | Page/app background |
| Card | `#1c1d22` | KPI cards, chart containers |
| Blue | `#3b86ee` | Primary accent, active nav tab |
| Red/Orange | `#e8806f` | Negative/warning KPI accent |
| Green | `#62c98c` | Positive KPI accent |
| Text | `#eceef2` | Primary text |
| Muted | `#6f7480` | Secondary/label text |
