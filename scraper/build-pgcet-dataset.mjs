/**
 * build-pgcet-dataset.mjs — turn KEA's official PGCET round-wise cut-off PDFs
 * (MBA / MCA, "Rest of Karnataka") into the app dataset:
 *   public/data/pgcet/{colleges,cutoffs,taxonomy}.json
 *
 * The output mirrors the UGCET dataset schema EXACTLY (same field names) so the
 * whole app's components can drive a PGCET mode unchanged — the programme
 * (MBA / MCA) plays the role of "branch". GENUINE PGCET-2025 allotment cut-off
 * ranks; coverage is exactly what KEA released as *cut-off* PDFs:
 *   • MCA — Round 1   (first round mca.pdf)
 *   • MBA — Round 2   (second round mba.pdf)
 * The other PGCET PDFs are SEAT MATRICES (not ranks) and are not ingested. No
 * rounds are fabricated.
 *
 *   node scraper/build-pgcet-dataset.mjs   (npm run data:pgcet)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parsePgcetCutoff } from "./parse-pgcet-cutoff.mjs";
import { cleanName, acronym, detectCity, collegeType } from "./clean.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "public", "data", "pgcet");
const srcDir = path.join(__dirname, "..", "mca n mba");

const YEAR = 2025;

// Programme = "branch". Each source PDF is one programme + the round KEA
// published cut-offs for it.
const SOURCES = [
  { branch: "MBA", round: "R2", roundName: "Round 2", file: process.env.PGCET_MBA_R2 || path.join(srcDir, "second round mba.pdf") },
  { branch: "MCA", round: "R1", roundName: "Round 1", file: process.env.PGCET_MCA_R1 || path.join(srcDir, "first round mca.pdf") },
];

const BRANCH_NAMES = {
  MBA: "Master of Business Administration",
  MCA: "Master of Computer Applications",
};
const BRANCH_ORDER = ["MBA", "MCA"];

// PGCET cut-offs carry no Kannada/Rural split (unlike UGCET). NKN is KEA's own
// code, kept verbatim — we don't assert an expansion we can't verify.
const CATEGORY_NAMES = {
  GM: "General Merit",
  "1G": "Category 1",
  "2AG": "Category 2A", "2BG": "Category 2B",
  "3AG": "Category 3A", "3BG": "Category 3B",
  SCG: "Scheduled Caste", STG: "Scheduled Tribe",
  NKN: "NKN",
};
const CATEGORY_ORDER = ["GM", "1G", "2AG", "2BG", "3AG", "3BG", "SCG", "STG", "NKN"];

const collegesMeta = new Map(); // code -> meta
const cutoffMap = new Map(); // key -> row (dedupe, keep most competitive)

for (const src of SOURCES) {
  if (!fs.existsSync(src.file)) {
    console.error(`! missing source PDF for ${src.branch} ${src.round}: ${src.file}`);
    continue;
  }
  const rows = await parsePgcetCutoff(src.file, src.round);
  for (const r of rows) {
    if (!collegesMeta.has(r.collegeCode)) {
      const name = cleanName(r.collegeName);
      collegesMeta.set(r.collegeCode, {
        code: r.collegeCode,
        name,
        short: acronym(name),
        city: detectCity(r.collegeName),
        type: collegeType(r.collegeName),
        branch: src.branch,
      });
    }
    // Collapse specializations (e.g. MBA Business Analytics) into the programme,
    // keeping the most competitive (lowest) closing rank per category.
    const key = `${r.collegeCode}|${src.branch}|${r.category}|${src.round}`;
    const prev = cutoffMap.get(key);
    if (prev && prev.closingRank <= r.closingRank) continue;
    const meta = collegesMeta.get(r.collegeCode);
    cutoffMap.set(key, {
      collegeCode: r.collegeCode,
      collegeName: meta.name,
      short: meta.short,
      city: meta.city,
      collegeType: meta.type,
      branch: src.branch,
      branchName: BRANCH_NAMES[src.branch],
      category: r.category,
      round: src.round,
      year: YEAR,
      closingRank: r.closingRank,
    });
  }
}

const cutoffs = [...cutoffMap.values()];
const colleges = [...collegesMeta.values()].sort(
  (a, b) => a.branch.localeCompare(b.branch) || a.code.localeCompare(b.code)
);

const offeredCats = new Set(cutoffs.map((r) => r.category));
const offeredBranches = new Set(cutoffs.map((r) => r.branch));
const offeredRounds = [...new Set(cutoffs.map((r) => r.round))];

const taxonomy = {
  year: YEAR,
  source: "KEA PGCET-2025 round-wise allotment cut-off ranks (Rest of Karnataka)",
  // per-programme round coverage — only what KEA published as cut-off PDFs
  coverage: SOURCES.filter((s) => offeredBranches.has(s.branch)).map((s) => ({
    branch: s.branch,
    round: s.round,
    roundName: s.roundName,
  })),
  branches: BRANCH_ORDER.filter((b) => offeredBranches.has(b)).map((code) => ({
    code,
    name: BRANCH_NAMES[code],
  })),
  categories: CATEGORY_ORDER.filter((c) => offeredCats.has(c)).map((code) => ({
    code,
    name: CATEGORY_NAMES[code] || code,
  })),
  rounds: SOURCES.filter((s) => offeredRounds.includes(s.round)).map((s) => ({
    code: s.round,
    name: s.roundName,
  })),
  cities: [...new Set(colleges.map((c) => c.city))].sort(),
  collegeTypes: [...new Set(colleges.map((c) => c.type))].sort(),
};

// Sanity guard — refuse to write a broken dataset (catches a silent parse
// regression from a KEA layout change rather than shipping empty/garbage JSON).
const EXPECT_CATS = new Set(["1G", "2AG", "2BG", "3AG", "3BG", "GM", "NKN", "SCG", "STG"]);
if (cutoffs.length < 1500) throw new Error(`too few cutoff rows (${cutoffs.length}) — parse likely broke`);
for (const b of ["MBA", "MCA"]) {
  if (!offeredBranches.has(b)) throw new Error(`no ${b} rows parsed`);
}
for (const c of offeredCats) {
  if (!EXPECT_CATS.has(c)) throw new Error(`unexpected category "${c}" — check column alignment`);
}

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "colleges.json"), JSON.stringify(colleges, null, 2));
fs.writeFileSync(path.join(outDir, "cutoffs.json"), JSON.stringify(cutoffs));
fs.writeFileSync(path.join(outDir, "taxonomy.json"), JSON.stringify(taxonomy, null, 2));

const byBranch = [...offeredBranches]
  .map((b) => `${b}=${cutoffs.filter((r) => r.branch === b).length}`)
  .join(", ");
console.log(
  `PGCET dataset built → ${colleges.length} colleges, ${cutoffs.length} cutoff rows (${byBranch}), ` +
    `${taxonomy.branches.length} programmes, ${taxonomy.categories.length} categories, ${taxonomy.cities.length} cities.`
);
