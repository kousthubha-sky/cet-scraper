/**
 * Server-side data access. Reads the generated dataset from public/data.
 * Safe to call from Server Components, route handlers and generateStaticParams.
 * Results are memoised per process.
 */
import fs from "node:fs";
import path from "node:path";

const dataDir = path.join(process.cwd(), "public", "data");

function load(file) {
  const raw = fs.readFileSync(path.join(dataDir, file), "utf8");
  return JSON.parse(raw);
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

export function getTaxonomy() {
  return db().taxonomy;
}

export function getColleges() {
  return db().colleges;
}

export function getCutoffs() {
  return db().cutoffs;
}

export function getCollege(code) {
  const meta = db().colleges.find((c) => c.code === code);
  if (!meta) return null;
  const rows = db().cutoffs.filter((r) => r.collegeCode === code);
  return { ...meta, cutoffs: rows };
}

export function getBranch(code) {
  const meta = db().taxonomy.branches.find((b) => b.code === code);
  if (!meta) return null;
  const rows = db().cutoffs.filter((r) => r.branch === code);
  return { ...meta, cutoffs: rows };
}

export function dataYear() {
  return db().taxonomy.year;
}
