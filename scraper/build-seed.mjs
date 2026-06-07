/**
 * build-seed.js — expands scraper/colleges-base.json into the full dataset the
 * app consumes: public/data/{colleges,cutoffs,taxonomy}.json
 *
 * This produces realistic SAMPLE cutoffs from each college's GM-CSE anchor rank
 * using branch-difficulty and category-reservation multipliers. Replace the
 * generated cutoffs.json with real KEA data via scrape-kea.js when available.
 *
 * Run:  npm run seed
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "public", "data");

// ---- Taxonomy ---------------------------------------------------------------
// KCET reservation categories (the common "General within category" set).
const CATEGORIES = [
  { code: "GM", name: "General Merit", factor: 1.0 },
  { code: "1G", name: "Category 1", factor: 2.9 },
  { code: "2AG", name: "Category 2A", factor: 1.7 },
  { code: "2BG", name: "Category 2B", factor: 2.1 },
  { code: "3AG", name: "Category 3A", factor: 1.45 },
  { code: "3BG", name: "Category 3B", factor: 1.35 },
  { code: "SCG", name: "Scheduled Caste", factor: 4.2 },
  { code: "STG", name: "Scheduled Tribe", factor: 5.0 },
];

// Engineering branches with a difficulty multiplier relative to CSE (1.0).
const BRANCHES = [
  { code: "CS", name: "Computer Science & Engineering", mult: 1.0, core: true },
  { code: "IS", name: "Information Science & Engineering", mult: 1.55, core: true },
  { code: "AI", name: "Artificial Intelligence & ML", mult: 1.2, tier: 2 },
  { code: "DS", name: "Computer Science (Data Science)", mult: 1.4, tier: 2 },
  { code: "CY", name: "Computer Science (Cyber Security)", mult: 1.85, tier: 3 },
  { code: "EC", name: "Electronics & Communication", mult: 2.6, core: true },
  { code: "EE", name: "Electrical & Electronics", mult: 5.0, core: true },
  { code: "EI", name: "Electronics & Instrumentation", mult: 6.0, tier: 3 },
  { code: "ME", name: "Mechanical Engineering", mult: 9.0, core: true },
  { code: "CV", name: "Civil Engineering", mult: 11.0, core: true },
  { code: "BT", name: "Biotechnology", mult: 10.0, tier: 3 },
  { code: "CH", name: "Chemical Engineering", mult: 9.5, tier: 4 },
  { code: "AE", name: "Aeronautical Engineering", mult: 7.5, tier: 4 },
];

const ROUNDS = [
  { code: "R1", name: "Round 1", factor: 1.0 },
  { code: "R2", name: "Round 2", factor: 1.18 },
  { code: "EXT", name: "Extended Round", factor: 1.34 },
];

const FEES_BY_TYPE = {
  Government: 45000,
  Aided: 85000,
  Private: 215000,
};

function tierOf(rank) {
  if (rank < 2000) return 1;
  if (rank < 8000) return 2;
  if (rank < 16000) return 3;
  return 4;
}

function branchesFor(college) {
  const t = tierOf(college.cseRankGM);
  // Core branches everywhere; niche branches concentrate in stronger colleges.
  return BRANCHES.filter((b) => b.core || t <= (b.tier ?? 4));
}

function round100(n) {
  return Math.max(1, Math.round(n));
}

const base = JSON.parse(
  fs.readFileSync(path.join(__dirname, "colleges-base.json"), "utf8")
);
const YEAR = base.year;

const colleges = base.colleges.map((c) => ({
  code: c.code,
  name: c.name,
  short: c.short,
  city: c.city,
  type: c.type,
  fees: FEES_BY_TYPE[c.type],
}));

const cutoffs = [];
for (const c of base.colleges) {
  const offered = branchesFor(c);
  for (const b of offered) {
    for (const cat of CATEGORIES) {
      for (const r of ROUNDS) {
        const closingRank = round100(
          c.cseRankGM * b.mult * cat.factor * r.factor
        );
        cutoffs.push({
          collegeCode: c.code,
          collegeName: c.name,
          short: c.short,
          city: c.city,
          collegeType: c.type,
          branch: b.code,
          branchName: b.name,
          category: cat.code,
          round: r.code,
          year: YEAR,
          closingRank,
          fees: FEES_BY_TYPE[c.type],
        });
      }
    }
  }
}

const taxonomy = {
  year: YEAR,
  categories: CATEGORIES.map(({ code, name }) => ({ code, name })),
  branches: BRANCHES.map(({ code, name }) => ({ code, name })),
  rounds: ROUNDS.map(({ code, name }) => ({ code, name })),
  cities: [...new Set(colleges.map((c) => c.city))].sort(),
  collegeTypes: ["Government", "Aided", "Private"],
};

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "colleges.json"), JSON.stringify(colleges, null, 2));
fs.writeFileSync(path.join(outDir, "cutoffs.json"), JSON.stringify(cutoffs));
fs.writeFileSync(path.join(outDir, "taxonomy.json"), JSON.stringify(taxonomy, null, 2));

console.log(
  `Seed built → ${colleges.length} colleges, ${cutoffs.length} cutoff rows, ` +
    `${taxonomy.branches.length} branches, ${taxonomy.categories.length} categories.`
);
