/**
 * scrape-kea.mjs — fetch real KCET cutoff data and emit the app dataset.
 *
 * KEA publishes category-wise cutoff ranks per round (Mock, Round 1, Round 2,
 * Extended) at https://cetonline.karnataka.gov.in / https://kea.kar.nic.in,
 * usually as per-round PDFs or HTML tables. Formats change every year, so this
 * script is built around a pluggable SOURCE that returns normalised rows; the
 * default SOURCE reads a CSV you point it at.
 *
 * Usage:
 *   SOURCE_URL="https://…/cutoffs.csv" npm run scrape
 *   SOURCE_FILE="./scraper/raw/round1.csv" npm run scrape
 *
 * Expected CSV columns (header row, case-insensitive):
 *   collegeCode, collegeName, short, city, collegeType, branch, branchName,
 *   category, round, year, closingRank, fees
 *
 * If no source is configured it prints guidance and exits without touching data
 * (run `npm run seed` for the sample dataset instead).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "public", "data");

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  const headers = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    // simple split — assumes no commas inside fields (KEA exports are clean)
    const cells = line.split(",");
    const row = {};
    headers.forEach((h, i) => (row[h] = (cells[i] ?? "").trim()));
    return row;
  });
}

function normalise(rows) {
  return rows
    .map((r) => ({
      collegeCode: r.collegeCode || r.code,
      collegeName: r.collegeName || r.name,
      short: r.short || r.collegeCode || r.code,
      city: r.city || "",
      collegeType: r.collegeType || r.type || "Private",
      branch: (r.branch || "").toUpperCase(),
      branchName: r.branchName || r.branch,
      category: (r.category || "GM").toUpperCase(),
      round: (r.round || "R1").toUpperCase(),
      year: Number(r.year) || new Date().getFullYear(),
      closingRank: Number(r.closingRank || r.cutoff || r.rank),
      fees: Number(r.fees) || null,
    }))
    .filter((r) => r.collegeCode && r.branch && r.closingRank);
}

async function getSource() {
  if (process.env.SOURCE_FILE) {
    return fs.readFileSync(path.resolve(process.env.SOURCE_FILE), "utf8");
  }
  if (process.env.SOURCE_URL) {
    const res = await fetch(process.env.SOURCE_URL);
    if (!res.ok) throw new Error(`fetch failed: ${res.status}`);
    return await res.text();
  }
  return null;
}

async function main() {
  const raw = await getSource();
  if (!raw) {
    console.log(
      [
        "No SOURCE configured. This script turns real KEA cutoff exports into the",
        "app dataset. Provide one of:",
        "",
        '  SOURCE_FILE="./scraper/raw/round1.csv" npm run scrape',
        '  SOURCE_URL="https://…/cutoffs.csv"      npm run scrape',
        "",
        "For a working sample dataset right now, run:  npm run seed",
      ].join("\n")
    );
    process.exit(0);
  }

  const cutoffs = normalise(parseCSV(raw));
  if (cutoffs.length === 0) throw new Error("no valid rows parsed from source");

  // Derive the college meta list from the cutoff rows.
  const collegeMap = new Map();
  for (const r of cutoffs) {
    if (!collegeMap.has(r.collegeCode)) {
      collegeMap.set(r.collegeCode, {
        code: r.collegeCode,
        name: r.collegeName,
        short: r.short,
        city: r.city,
        type: r.collegeType,
        fees: r.fees,
      });
    }
  }
  const colleges = [...collegeMap.values()];

  const year = cutoffs[0].year;
  const taxonomy = {
    year,
    categories: uniq(cutoffs.map((r) => r.category)).map((code) => ({ code, name: code })),
    branches: dedupeBy(cutoffs.map((r) => ({ code: r.branch, name: r.branchName })), "code"),
    rounds: uniq(cutoffs.map((r) => r.round)).map((code) => ({ code, name: code })),
    cities: uniq(colleges.map((c) => c.city)).sort(),
    collegeTypes: uniq(colleges.map((c) => c.type)),
  };

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "colleges.json"), JSON.stringify(colleges, null, 2));
  fs.writeFileSync(path.join(outDir, "cutoffs.json"), JSON.stringify(cutoffs));
  fs.writeFileSync(path.join(outDir, "taxonomy.json"), JSON.stringify(taxonomy, null, 2));
  console.log(`Scraped → ${colleges.length} colleges, ${cutoffs.length} cutoff rows.`);
}

const uniq = (a) => [...new Set(a.filter(Boolean))];
const dedupeBy = (a, key) => {
  const m = new Map();
  for (const x of a) if (!m.has(x[key])) m.set(x[key], x);
  return [...m.values()];
};

main().catch((e) => {
  console.error("scrape failed:", e.message);
  process.exit(1);
});
