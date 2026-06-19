/**
 * build-kea-dataset.mjs — turn KEA's official round-wise engineering cut-off PDFs
 * into the app dataset: public/data/{colleges,cutoffs,taxonomy}.json
 *
 * This is GENUINE KCET-2025 data (UGCET engineering allotment cut-off ranks,
 * "Rest of Karnataka" seat type) extracted from KEA's published PDFs. Run once
 * (or whenever new round PDFs arrive); the JSON output is committed and consumed
 * by the app at build time — the PDFs themselves are not needed to build.
 *
 *   node scraper/build-kea-dataset.mjs
 *
 * Source PDFs default to the round files on the Desktop; override with env
 * KEA_R2_PDF / KEA_R3_PDF if they live elsewhere.
 *
 * Caveats (the source PDFs do not carry these): college ownership "type" is a
 * best-effort heuristic, and per-college fees are unknown (left null, shown as
 * "—"). Cut-off ranks, college names/codes, branches and categories are real.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parsePdf } from "./parse-kea-pdf.mjs";
import { classifyBranch, BRANCH_NAMES, BRANCH_ORDER } from "./canonical-branches.mjs";
import { cleanName, acronym, detectCity, collegeType } from "./clean.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "public", "data");
const rawDir = path.join(__dirname, "raw");
const DESK = path.join(process.env.USERPROFILE || process.env.HOME || "", "OneDrive", "Desktop");

const YEAR = 2025; // cut-off vintage (KCET-2025 allotment)

// Source PDFs: prefer scraper/raw/, then an env override, then the Desktop.
function resolveSrc(envVar, rawName, deskName) {
  if (process.env[envVar]) return process.env[envVar];
  const inRepo = path.join(rawDir, rawName);
  if (fs.existsSync(inRepo)) return inRepo;
  return path.join(DESK, deskName);
}
const SOURCES = [
  { round: "R1", name: "Round 1", file: resolveSrc("KEA_R1_PDF", "round1.pdf", "ms-ramaiah-institute-of-technology-kcet-round-1-provisional-cutoff-2025-pdf.pdf") },
  { round: "R2", name: "Round 2", file: resolveSrc("KEA_R2_PDF", "round2.pdf", "kcet-round-2-provisional-cutoff.pdf") },
  { round: "R3", name: "Round 3", file: resolveSrc("KEA_R3_PDF", "round3.pdf", "KCET_Round_3_Cutoff_f4bf07a0b55522f47bdd70ed12d3ca4a.pdf") },
];

const CATEGORY_NAMES = {
  GM: "General Merit",
  "1G": "Category 1", "1K": "Category 1 (Kannada)", "1R": "Category 1 (Rural)",
  "2AG": "Category 2A", "2AK": "Category 2A (Kannada)", "2AR": "Category 2A (Rural)",
  "2BG": "Category 2B", "2BK": "Category 2B (Kannada)", "2BR": "Category 2B (Rural)",
  "3AG": "Category 3A", "3AK": "Category 3A (Kannada)", "3AR": "Category 3A (Rural)",
  "3BG": "Category 3B", "3BK": "Category 3B (Kannada)", "3BR": "Category 3B (Rural)",
  GMK: "General Merit (Kannada)", GMR: "General Merit (Rural)",
  SCG: "Scheduled Caste", SCK: "Scheduled Caste (Kannada)", SCR: "Scheduled Caste (Rural)",
  STG: "Scheduled Tribe", STK: "Scheduled Tribe (Kannada)", STR: "Scheduled Tribe (Rural)",
};
// Order for the category dropdown (the General pool of each category first).
const CATEGORY_ORDER = [
  "GM", "1G", "2AG", "2BG", "3AG", "3BG", "SCG", "STG",
  "GMR", "1R", "2AR", "2BR", "3AR", "3BR", "SCR", "STR",
  "GMK", "1K", "2AK", "2BK", "3AK", "3BK", "SCK", "STK",
];

// --- build ------------------------------------------------------------------
const collegesMeta = new Map(); // code -> { code, name, short, city, type, fees }
const cutoffMap = new Map(); // key -> row (dedupe, keep min closingRank)

for (const src of SOURCES) {
  if (!fs.existsSync(src.file)) {
    console.error(`! missing source PDF for ${src.round}: ${src.file}`);
    continue;
  }
  const rows = await parsePdf(src.file, src.round);
  for (const r of rows) {
    if (!collegesMeta.has(r.collegeCode)) {
      const name = cleanName(r.collegeName);
      collegesMeta.set(r.collegeCode, {
        code: r.collegeCode,
        name,
        short: acronym(name),
        city: detectCity(r.collegeName),
        type: collegeType(r.collegeName),
      });
    }
    const { code: branch, name: branchName } = classifyBranch(r.branchRaw);
    const key = `${r.collegeCode}|${branch}|${r.category}|${src.round}`;
    const prev = cutoffMap.get(key);
    if (prev && prev.closingRank <= r.closingRank) continue; // keep most competitive
    const meta = collegesMeta.get(r.collegeCode);
    cutoffMap.set(key, {
      collegeCode: r.collegeCode,
      collegeName: meta.name,
      short: meta.short,
      city: meta.city,
      collegeType: meta.type,
      branch,
      branchName,
      category: r.category,
      round: src.round,
      year: YEAR,
      closingRank: r.closingRank,
    });
  }
}

const cutoffs = [...cutoffMap.values()];
const colleges = [...collegesMeta.values()].sort((a, b) => a.code.localeCompare(b.code));

// taxonomy derived from the real rows
const offeredBranches = new Set(cutoffs.map((r) => r.branch));
const offeredCats = new Set(cutoffs.map((r) => r.category));
const offeredRounds = [...new Set(cutoffs.map((r) => r.round))];

const taxonomy = {
  year: YEAR,
  source: "KEA UGCET-2025 round-wise allotment cut-off ranks (Rest of Karnataka)",
  categories: CATEGORY_ORDER.filter((c) => offeredCats.has(c)).map((code) => ({
    code,
    name: CATEGORY_NAMES[code] || code,
  })),
  branches: BRANCH_ORDER.filter((b) => offeredBranches.has(b)).map((code) => ({
    code,
    name: BRANCH_NAMES[code],
  })),
  rounds: SOURCES.filter((s) => offeredRounds.includes(s.round)).map((s) => ({
    code: s.round,
    name: s.name,
  })),
  cities: [...new Set(colleges.map((c) => c.city))].sort(),
  collegeTypes: [...new Set(colleges.map((c) => c.type))].sort(),
};

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "colleges.json"), JSON.stringify(colleges, null, 2));
fs.writeFileSync(path.join(outDir, "cutoffs.json"), JSON.stringify(cutoffs));
fs.writeFileSync(path.join(outDir, "taxonomy.json"), JSON.stringify(taxonomy, null, 2));

console.log(
  `KEA dataset built → ${colleges.length} colleges, ${cutoffs.length} cutoff rows, ` +
    `${taxonomy.branches.length} branches, ${taxonomy.categories.length} categories, ` +
    `${taxonomy.rounds.length} rounds, ${taxonomy.cities.length} cities.`
);
