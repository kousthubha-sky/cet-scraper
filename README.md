# KCET College Finder

A fast, SEO-friendly tool that helps Karnataka CET (KCET) students figure out
**which engineering colleges and branches they can get** the moment results are
out — enter your rank and category, and see colleges sorted **Safe → Target →
Reach**, with branch explorer, college search and side-by-side comparison.

> Inspired by the PGCET scraper frontend, rebuilt for KCET UG engineering on
> Next.js with server-rendered, indexable college/branch pages.

## Features

- **Predictor** (`/predict`) — enter your rank **or just your KCET application
  number** (we look up rank + category for you) → eligible colleges, classified
  Safe / Target / Reach, filterable by branch, city and college type.
- **Branch explorer** (`/branches`, `/branches/[code]`) — every branch, the
  colleges that offer it, and category/round-wise closing ranks.
- **College search** (`/colleges`, `/colleges/[code]`) — search any college; see
  all branches, category-wise cutoffs and fees.
- **Compare** (`/compare?a=E005&b=E007`) — two colleges side by side, branch by
  branch.
- **JSON API** — `/api/predict`, `/api/colleges`, `/api/branches`.

## Tech

Next.js 15 (App Router) · React 19 · Tailwind CSS v4 · shadcn/ui primitives ·
lucide-react. Static-generated college & branch pages for SEO; data read on the
server from `public/data`.

## Data & the scraper

The app reads three files from `public/data/`:

| file            | shape                                                            |
| --------------- | ---------------------------------------------------------------- |
| `colleges.json` | college meta: `code, name, short, city, type, fees`             |
| `cutoffs.json`  | `collegeCode, branch, category, round, year, closingRank, fees` |
| `taxonomy.json` | categories, branches, rounds, cities, college types             |
| `students.json` | KCET-number lookup: `cetNumber, name, rank, category, year`     |

Two ways to produce them:

```bash
npm run seed     # generate a realistic SAMPLE dataset from scraper/colleges-base.json
npm run scrape   # convert real KEA cutoff exports → dataset (see scraper/README.md)
```

`npm run build` runs `seed` automatically so the app always builds with data.

> ⚠️ The seed dataset is **indicative sample data** for guidance/demo only.
> Replace it with real KEA cutoffs via `npm run scrape` before relying on it.
> Always verify against official KEA results at cetonline.karnataka.gov.in.

## Develop

```bash
npm install
npm run dev      # http://localhost:3000
```

## Build & deploy

```bash
npm run build && npm run start
```

Deploys to Vercel as-is (zero config). The `build` step regenerates the dataset,
prerenders every college and branch page, and exposes the API routes.

## Eligibility logic

Lower rank = better. For each branch+category+round, a student's rank `R` vs the
last-year closing rank `C` is classified by ratio `R/C`:

- `≤ 0.70` → **Safe** · `≤ 1.00` → **Target** · `≤ 1.20` → **Reach** · else excluded.

See `lib/eligibility.js` (pure, reused by the page renderer and the API).
