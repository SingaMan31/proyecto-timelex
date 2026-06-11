# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Timelex · Contabilidad** is a web application for accounting and inventory management. The entry point is `index.html`, which loads styles and scripts from separate files. Data is persisted in **Firebase Firestore**.

- **Production URL:** https://proyecto-timelex.vercel.app
- **GitHub:** https://github.com/SingaMan31/proyecto-timelex

## File Structure

```
index.html        — Main entry point (HTML + vanilla JS application logic)
styles/main.css   — All application CSS, including responsive media queries
js/firebase.js    — Firebase initialization and Firestore connection
```

## Deploying Changes

There is no build step. Push to GitHub and Vercel deploys automatically:

```powershell
git add .
git commit -m "description of change"
git push
```

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
5. Main inline `<script>` — application logic, ends with `initData()`

### Data persistence

- **Provider:** Firebase Firestore (compat SDK v9)
- **Project:** `timelex-4c35e`
- **Collection:** `timelex`
- **Document:** `datos`
- **Global handle:** `fsDb` (initialized in `js/firebase.js`)

All application state lives in a single `db` object. `save()` writes it to Firestore as a fire-and-forget operation. `initData()` reads it on startup.

### Startup flow (`initData`)

`initData()` is `async` and is the sole entry point called at the end of the inline script:

1. Fetches `timelex/datos` from Firestore.
2. If the document exists, loads it into `db` and backfills any missing arrays (`inventory`, `sales`, `expenses`, `shipments`).
3. If the document does not exist, seeds `db` with default data and writes it to Firestore.
4. On any Firestore error, falls back to `localStorage` (key: `timelex_db_v1`) or `seedDb()`.
5. Calls `render()` once data is ready.

### State & persistence functions

| Function | Description |
|---|---|
| `initData()` | Async startup — loads from Firestore, falls back to localStorage |
| `save()` | Fire-and-forget write of `db` to Firestore |
| `seedDb()` | Returns a fresh default `db` object |
| `render()` | Re-renders the full UI from current `db` |

### Edit modals

Each table row in Ventas and Gastos has an edit button (✏️ `ICON.edit`) to the left of the delete button. Clicking it opens a pre-filled modal:

| Function | Opens modal for | Fields |
|---|---|---|
| `openEditSale(id, tmp?)` | A sale row | `fecha`, `modelo` (dropdown), `tipoPago` (seg), `monto`, `tasa`, `nota` |
| `openEditExp(id, tmp?)` | An expense row | `fecha`, `concepto`, `moneda` (seg), `monto`, `tasa` |

Both functions accept an optional `tmp` snapshot used when the seg button (tipoPago / moneda) is toggled — the modal re-renders itself preserving the current field values. On save, `ingresoUSD`/`gastoUSD` and `ganancia` are recalculated, then `save()` and `render()` are called. `deliveryUSD` on sales is preserved as-is.

The edit button uses CSS class `act-edit-sale` / `act-edit-exp` and is wired in `wire()`.

## CSS & Responsive

All styles live in `styles/main.css`. Media query breakpoints:

| Breakpoint | Target |
|---|---|
| `max-width: 960px` | Hide ventas sidebar layout |
| `max-width: 860px` | 2-col KPI grid, compact topbar, single-col forms |
| `max-width: 768px` | Mobile: two-row topbar (logo+menu button on row 1, tabs on row 2), scrollable tabs, 2×2 KPI grid, scrollable chart, tighter padding |

### Mobile topbar (≤ 768px)

`.topbar-in` uses `flex-wrap: wrap; height: auto; padding-bottom: 10px` so the tabs wrap to a second row. `.tabs` has `order: 3; width: 100%; flex-wrap: nowrap; overflow-x: auto` with scrollbar hidden, placing it below the brand and menu button. The `.spacer` (between tabs and menu button) pushes the menu button to the right on row 1.

## Application Domain

Inventory and accounting management with multi-currency support:
- Product model fields: `modelo`, `costo`, `precioUSD`, `precioBs`, `cantidad`, `stockActual`
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
