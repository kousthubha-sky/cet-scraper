/**
 * Server-side PGCET data access. Mirrors lib/data.js (same function shapes) but
 * reads the parallel PGCET dataset from public/data/pgcet. Memoised per process.
 */
import fs from "node:fs";
import path from "node:path";

const dataDir = path.join(process.cwd(), "public", "data", "pgcet");

function load(file) {
  return JSON.parse(fs.readFileSync(path.join(dataDir, file), "utf8"));
}

let _cache = null;
function db() {
  if (_cache) return _cache;
  _cache = {
    colleges: load("colleges.json"),
    cutoffs: load("cutoffs.json"),
    taxonomy: load("taxonomy.json"),
  };
  return _cache;
}

export function getPgcetTaxonomy() {
  return db().taxonomy;
}

export function getPgcetColleges() {
  return db().colleges;
}

export function getPgcetCutoffs() {
  return db().cutoffs;
}

export function getPgcetCollege(code) {
  const meta = db().colleges.find((c) => c.code === code);
  if (!meta) return null;
  const rows = db().cutoffs.filter((r) => r.collegeCode === code);
  return { ...meta, cutoffs: rows };
}

export function getPgcetBranch(code) {
  const meta = db().taxonomy.branches.find((b) => b.code === code);
  if (!meta) return null;
  const rows = db().cutoffs.filter((r) => r.branch === code);
  return { ...meta, cutoffs: rows };
}

export function pgcetDataYear() {
  return db().taxonomy.year;
}

/** The KEA round whose cut-offs we hold for a programme (MBA→R2, MCA→R1). */
export function roundForBranch(branch) {
  return db().taxonomy.coverage.find((c) => c.branch === branch)?.round || null;
}
