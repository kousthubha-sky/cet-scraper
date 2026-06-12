# KCET College Finder

A fast, SEO-friendly tool that helps Karnataka CET (KCET) students figure out
**which engineering colleges and branches they can get** the moment results are
out — enter your rank and category, and see colleges sorted **Safe → Target →
Reach**, with branch explorer, college search and side-by-side comparison.

> Inspired by the PGCET scraper frontend, rebuilt for KCET UG engineering on
> Next.js with server-rendered, indexable college/branch pages.

## Features

- **Predictor** (`/predict`) — enter your rank and category → eligible colleges,
  classified Safe / Target / Reach, filterable by branch, city and college type.
- **Branch explorer** (`/branches`, `/branches/[code]`) — every branch, the
  colleges that offer it, and category/round-wise closing ranks.
- **College search** (`/colleges`, `/colleges/[code]`) — search any college; see
  all branches and category-wise cutoffs.
- **Compare** (`/compare?a=E005&b=E007`) — two colleges side by side, branch by
  branch.
- **JSON API** — `/api/predict`, `/api/colleges`, `/api/branches`.

## Tech

Next.js 15 (App Router) · React 19 · Tailwind CSS v4 · shadcn/ui primitives ·
lucide-react. Static-generated college & branch pages for SEO; data read on the
server from `public/data`.

## Data

The app reads three files from `public/data/` (committed; no build-time fetch):

| file            | shape                                                                  |
| --------------- | ---------------------------------------------------------------------- |
| `colleges.json` | `code, name, short, city, type`                                        |
| `cutoffs.json`  | `collegeCode, branch, branchName, category, round, year, closingRank`  |
| `taxonomy.json` | `year, source, categories, branches, rounds, cities, collegeTypes`     |

The cut-offs are **genuine KCET-2025** figures — KEA's published _UGCET-2025
round-wise allotment cut-off ranks_ (Rest of Karnataka), Rounds 1–3, parsed
straight from the official PDFs.

### Regenerating the dataset

Drop KEA's round PDFs into `scraper/raw/` (`round1.pdf`, `round2.pdf`, `round3.pdf`) and run:

```bash
npm run data     # parse the PDFs → public/data/{colleges,cutoffs,taxonomy}.json
```

The PDFs are rotated, multi-column tables. `scraper/parse-kea-pdf.mjs` de-rotates
them with pdfjs and reads the grid by coordinates; `scraper/canonical-branches.mjs`
folds KEA's ~140 course-name spellings into stable branch codes; and
`scraper/build-kea-dataset.mjs` writes the dataset. The source PDFs are not
committed (and aren't needed to build — only to regenerate).

> Notes: includes **Rounds 1–3** engineering data. The PDFs carry no fees or
> ownership type, so fees are omitted and college **type** (Government/Private)
> is a best-effort heuristic. Always verify against official KEA results at
> cetonline.karnataka.gov.in.

## Develop

```bash
npm install
npm run dev      # http://localhost:3000
```

## Build & deploy

```bash
npm run build && npm run start
```

Deploys to Vercel as-is (zero config). The build prerenders every college and
branch page from the committed dataset and exposes the API routes.

## Eligibility logic

Lower rank = better. For each branch+category+round, a student's rank `R` vs the
last-year closing rank `C` is classified by ratio `R/C`:

- `≤ 0.70` → **Safe** · `≤ 1.00` → **Target** · `≤ 1.20` → **Reach** · else excluded.

See `lib/eligibility.js` (pure, reused by the page renderer and the API).
