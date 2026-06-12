# Scraper / data pipeline

Turns KEA's official KCET (UGCET) **engineering** round-wise allotment cut-off
PDFs into the dataset the app reads from `public/data/`. This is genuine
KCET-2025 data (Rest of Karnataka seat type).

## Run

Put KEA's round PDFs in `scraper/raw/` as `round1.pdf`, `round2.pdf` and
`round3.pdf`, then:

```bash
npm run data
```

Override paths with `KEA_R2_PDF` / `KEA_R3_PDF` if the files live elsewhere (the
Desktop is also checked as a fallback). Source PDFs are gitignored — the
generated JSON in `public/data/` is what's committed.

## How it works

KEA's cut-off PDFs are A4 pages **rotated 90°**, holding a wide
college × branch × category grid. Cells wrap across text lines, so plain text
extraction is unreliable — we read the geometry instead.

- **`parse-kea-pdf.mjs`** — loads each PDF with `pdfjs-dist`, de-rotates via the
  page viewport transform, groups text into rows by y, fixes the 28 category
  columns from the header row, and assigns each numeric cell to its category by
  nearest column centre. A branch row is a full grid line (~28 cells, `--` =
  no allotment); wrapped branch names on the lines below are appended.
- **`canonical-branches.mjs`** — folds KEA's ~140 raw course-name spellings (and
  pdfjs' intra-word-space artifacts like `COMMUNICATIO N`) into stable branch
  codes + clean display names, matching a despaced key with ordered rules.
- **`build-kea-dataset.mjs`** — runs the parser over each round, classifies
  branches, cleans college names / detects city / derives a short code, dedupes
  to one row per (college, branch, category, round), and writes
  `colleges.json`, `cutoffs.json`, `taxonomy.json`.

## Caveats

- Includes **Rounds 1–3** (engineering), "Rest of Karnataka" seat type.
- The PDFs carry **no fees or ownership type**: fees are omitted; college `type`
  (Government/Private) is a best-effort heuristic from the name.
- Always verify against official KEA results at `cetonline.karnataka.gov.in`.
