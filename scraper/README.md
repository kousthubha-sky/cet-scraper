# Scraper / data pipeline

Two scripts produce the dataset the app reads from `public/data/`.

## `build-seed.mjs` — sample data (`npm run seed`)

Expands `colleges-base.json` (a curated list of Karnataka colleges with an
anchor GM-CSE rank each) into full cutoffs across branches, categories and
rounds using branch-difficulty and category-reservation multipliers. Edit
`colleges-base.json` to add colleges or tune anchor ranks, then re-run.

**This is sample data for demo/guidance only.**

## `scrape-kea.mjs` — real data (`npm run scrape`)

KEA publishes category-wise cutoff ranks per round at
`cetonline.karnataka.gov.in` / `kea.kar.nic.in` (per-round PDFs / HTML tables).
Formats change yearly, so this script is built around a pluggable source that
returns rows in the dataset schema. Out of the box it reads a clean CSV:

```bash
# from a local file
SOURCE_FILE="./scraper/raw/round1.csv" npm run scrape

# from a URL
SOURCE_URL="https://example.com/kcet-2025-round1.csv" npm run scrape
```

Expected CSV header (case-insensitive):

```
collegeCode,collegeName,short,city,collegeType,branch,branchName,category,round,year,closingRank,fees
```

### Adapting to PDF/HTML sources

Replace `getSource()` / `parseCSV()` with a parser for your source (e.g.
`pdf-parse` for KEA PDFs or `cheerio` for HTML tables) that returns the same row
objects, then `normalise()` and the writers handle the rest. The college meta
list and taxonomy are derived automatically from the scraped rows.
