# the-catalogue-frontend

Website for The Catalogue: one tab per brand, product grid with filters, product page,
wishlist, and restock alerts. React + Vite + TypeScript.

The browser calls the API directly (`VITE_API_URL`). Vercel only serves these files.
Product images load from the brands' Shopify CDN; they are never re-hosted.

## Run locally

```bash
npm install
npm run dev            # http://localhost:5173, API defaults to http://localhost:8000
```

To use another API, create `.env.local` with `VITE_API_URL=...`.
The backend must allow the origin in its `CORS_ORIGINS` (e.g. `http://localhost:5173`).

## Build

```bash
npm run build          # type-check + production build into dist/
```

## Deploy on Vercel

1. Import the GitHub repo in Vercel (framework preset: Vite).
2. Project Settings → Environment Variables: `VITE_API_URL=https://the-catalogue.duckdns.org`.
3. Add the Vercel URL to the backend's `CORS_ORIGINS` and restart the backend.

Every push to `main` redeploys. `vercel.json` sends all paths to `index.html` so page links work.

## Pages

| Path | Page |
|---|---|
| `/brands/:id` | Brand tab: grid + filters (filters are kept in the URL) |
| `/products/:id` | Gallery, sizes (in stock / sold out + "Alert me"), sanitized description |
| `/wishlist` | Saved products |
| `/alerts` | Restock alerts: waiting / back in stock |
