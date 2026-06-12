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

// --- college name / city / short / type cleanup ----------------------------
const CITY_RULES = [
  [/bengaluru|bangalore|bengalooru|bengaluru/i, "Bangalore"],
  [/mysuru|mysore/i, "Mysore"],
  [/mangaluru|mangalore/i, "Mangalore"],
  [/tumakuru|tumkur/i, "Tumkur"],
  [/belagavi|belgaum/i, "Belgaum"],
  [/hubballi|hubli/i, "Hubli"],
  [/kalaburagi|gulbarga/i, "Gulbarga"],
  [/ballari|bellary/i, "Bellary"],
  [/vijayapura|bijapur/i, "Bijapur"],
  [/shivamogga|shimoga/i, "Shimoga"],
  [/davanagere|davangere|davengere/i, "Davanagere"],
  [/bagalkote|bagalkot/i, "Bagalkote"],
  [/chikkamagaluru|chikmagalur|chickmagalur|chikamagalur/i, "Chikmagalur"],
  [/chikkaballapur|chickballapur|chickaballapur/i, "Chickballapur"],
  [/doddaballapur/i, "Doddaballapur"],
  [/ramanagar/i, "Ramanagara"],
  [/chitradurga/i, "Chitradurga"],
  [/raichur/i, "Raichur"],
  [/\bbidar\b|bhalki|basavakalyan/i, "Bidar"],
  [/hassan|shravanabelagola/i, "Hassan"],
  [/mandya/i, "Mandya"],
  [/\bkolar\b|\bkgf\b|kolar gold/i, "Kolar"],
  [/gadag|hulkoti|laxmeshwar/i, "Gadag"],
  [/haveri|ranebennur/i, "Haveri"],
  [/\budupi\b|kundapura|moodabidri|moodbidri|karkala/i, "Udupi"],
  [/puttur|bantwal|sullia|dakshina kannada|ujire/i, "Dakshina Kannada"],
  [/hospet|hosapete/i, "Hospet"],
  [/dharwad|dharward/i, "Dharwad"],
  [/bhatkal|karwar|uttara kannada|haliyal|dandeli/i, "Uttara Kannada"],
  [/koppal|gangavathi/i, "Koppal"],
  [/yadgiri|yadgir/i, "Yadgiri"],
  [/\bcoorg\b|kodagu|ponnampet|madikeri/i, "Kodagu"],
  [/chamarajanagar/i, "Chamarajanagar"],
  [/tiptur|sira|gubbi/i, "Tumkur"],
];

function detectCity(raw) {
  for (const [re, disp] of CITY_RULES) if (re.test(raw)) return disp;
  return "Karnataka";
}

const TYPO = [
  [/\bUnivesity\b/gi, "University"], [/\bUniveristy\b/gi, "University"],
  [/\bUniverisity\b/gi, "University"], [/\bInstitutute\b/gi, "Institute"],
  [/\bSoceity('?s)?\b/gi, "Society$1"], [/\bEngineeering\b/gi, "Engineering"],
  [/\bTechnolgy\b/gi, "Technology"], [/\bCollge\b/gi, "College"],
];
const NAME_STOP = new Set(["of", "and", "the", "for", "in", "&"]);

function titleCapsWord(w, i) {
  const lw = w.toLowerCase();
  if (i > 0 && NAME_STOP.has(lw)) return lw;
  if (w.length <= 3) return w.toUpperCase(); // keep acronyms (SRI, NPS, BMS)
  if (!/[a-z]/i.test(w)) return w;
  return w[0].toUpperCase() + w.slice(1).toLowerCase();
}

function cleanName(raw) {
  let s = raw.replace(/\s+/g, " ").trim();
  // The institute name precedes the address. The address usually starts at the
  // first parenthetical qualifier or the first comma, whichever is earlier.
  const cut = Math.min(
    ...[s.indexOf("("), s.indexOf(",")].filter((i) => i > 4).concat([s.length])
  );
  let head = s.slice(0, cut).replace(/\([^)]*\)/g, " ").replace(/\s+/g, " ").trim();
  head = head.replace(/\s+#?\d[\w\s./-]*$/, "").replace(/[,\s]+$/, "").trim();
  // strip a trailing locality rendered in ALL-CAPS on mixed-case names
  if (/[a-z]/.test(head)) head = head.replace(/(?:\s+[A-Z][A-Z.&'-]{3,})+$/, "").trim();
  if (head.length > 64) head = head.slice(0, 64).replace(/\s+\S*$/, "").trim();
  if (!head) head = s.slice(0, 40);
  for (const [re, to] of TYPO) head = head.replace(re, to);
  // Title-case fully-uppercase names for readability.
  if (!/[a-z]/.test(head)) {
    head = head.split(/\s+/).map((w, i) => titleCapsWord(w, i)).join(" ");
  }
  return head;
}

const STOP = new Set(["OF", "AND", "THE", "FOR", "IN", "DR", "DR.", "&", "A", "S", "'S"]);
function acronym(name) {
  const words = name.replace(/[.,'`"]/g, " ").split(/\s+/).filter(Boolean);
  const letters = words.filter((w) => !STOP.has(w.toUpperCase())).map((w) => w[0].toUpperCase());
  let a = letters.join("");
  if (a.length < 2) a = name.replace(/[^A-Za-z]/g, "").slice(0, 4).toUpperCase();
  return a.slice(0, 6);
}

function collegeType(raw) {
  if (/\bgovt\.?\b|government|visvesvaraya college of engineering|u\.?\s*b\.?\s*d\.?\s*t|university b\.?d\.?t|\(h\.gov\)/i.test(raw))
    return "Government";
  return "Private";
}

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
