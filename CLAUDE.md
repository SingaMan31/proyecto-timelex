# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Timelex · Contabilidad** is a web application for accounting and inventory management. The entry point is `index.html`, which loads styles and scripts from separate files. Data is persisted in **Firebase Firestore**.

## File Structure

```
index.html        — Main entry point (HTML + vanilla JS application logic)
styles/main.css   — All application CSS
js/firebase.js    — Firebase initialization and Firestore connection
```

## Running the Application

There is no build step. Open `index.html` in a browser or serve it from a local server:

```powershell
# Windows — opens in the default browser
Start-Process "index.html"
```

JavaScript must be enabled. An active internet connection is required to load the Firebase SDK and reach Firestore.

## Architecture

### Script load order (bottom of `<body>`)

1. `firebase-app-compat.js` (CDN, v9.22.0)
2. `firebase-firestore-compat.js` (CDN, v9.22.0)
3. `js/firebase.js` — calls `firebase.initializeApp()` and exposes `fsDb` globally

The main application script is inline in `index.html` and runs before these, but it only calls `initData()` at the bottom, by which point the Firebase scripts are already loaded.

### Data persistence

- **Provider:** Firebase Firestore (compat SDK v9)
- **Collection:** `timelex`
- **Document:** `datos`
- **Global handle:** `fsDb` (initialized in `js/firebase.js`)

All application state lives in a single `db` object. `save()` writes it to Firestore as a fire-and-forget operation. `initData()` reads it on startup.

### Startup flow (`initData`)

`initData()` is `async` and is called at the end of the inline script:

1. Fetches `timelex/datos` from Firestore.
2. If the document exists, loads it into `db` (backfills `shipments: []` if missing).
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
