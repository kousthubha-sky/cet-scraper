/**
 * parse-pgcet-cutoff.mjs — extract genuine PGCET allotment cut-off ranks from
 * KEA's official round-wise PGCET cut-off PDFs (MBA / MCA, "Rest of Karnataka").
 *
 * These PDFs are rotated 90° (page.rotate=90) like the UGCET ones, but the table
 * is far simpler — one block per college:
 *
 *   College: C401 ACHARYA INSTITUTE OF MANAGEMENT AND SCIENCES
 *   Course Name  1G  2AG  2BG  3AG  3BG  GM  NKN  SCG  STG     <- header (9 cats)
 *   MASTERS IN COMPUTER APPLICATIONS  3726 4665 5565 ... 14105 <- one value row
 *
 * Every category column is printed even when empty ("--"), so the value row has
 * exactly as many numeric/"--" cells as the header has category tokens. We align
 * positionally (zip header→values) and assert the counts match — no fragile
 * column-centre geometry needed. "--" means no allotment and is skipped.
 *
 * Export: parsePgcetCutoff(path, round) -> [{ round, collegeCode, collegeName,
 *                                             course, category, closingRank }]
 * CLI:    node parse-pgcet-cutoff.mjs <pdf> <ROUND> [--profile]
 */
import fs from "node:fs";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

// Category columns that appear in PGCET cut-off PDFs (no Kannada/Rural split,
// unlike UGCET). Order is fixed by each page's header row, not by this list.
export const PGCET_CATEGORIES = ["1G", "2AG", "2BG", "3AG", "3BG", "GM", "NKN", "SCG", "STG"];
const CAT_SET = new Set(PGCET_CATEGORIES);

const isValue = (s) => s === "--" || /^\d[\d,]*$/.test(s);
function toRank(s) {
  if (!s || s === "--") return null;
  const v = Number(s.replace(/,/g, ""));
  return Number.isFinite(v) && v > 0 ? v : null;
}

async function pageLines(page) {
  const vp = page.getViewport({ scale: 1 });
  const tc = await page.getTextContent();
  const items = tc.items
    .filter((it) => it.str.trim() !== "")
    .map((it) => {
      const [x, y] = vp.convertToViewportPoint(it.transform[4], it.transform[5]);
      return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10, s: it.str.trim() };
    });
  items.sort((a, b) => a.y - b.y || a.x - b.x);
  const lines = [];
  for (const it of items) {
    let line = lines.find((l) => Math.abs(l.y - it.y) <= 3.5);
    if (!line) {
      line = { y: it.y, cells: [] };
      lines.push(line);
    }
    line.cells.push(it);
  }
  lines.sort((a, b) => a.y - b.y);
  for (const l of lines) l.cells.sort((a, b) => a.x - b.x);
  return lines;
}

export async function parsePgcetCutoff(path, round) {
  const doc = await getDocument({
    data: new Uint8Array(fs.readFileSync(path)),
    useSystemFonts: true,
  }).promise;

  const rows = [];
  let mismatches = 0;

  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const lines = await pageLines(page);

    let college = null; // { code, name }
    let cats = null; // current header order, e.g. ["1G","2AG",...]

    for (const line of lines) {
      const tokens = line.cells.map((c) => c.s);
      const joined = tokens.join(" ");

      if (/^generated on/i.test(joined)) continue; // page footer

      const cm = joined.match(/College:\s*([A-Z]\d+[A-Z]?)\s+(.+)$/i);
      if (cm) {
        college = { code: cm[1].toUpperCase(), name: cm[2].trim() };
        cats = null;
        continue;
      }

      // header row: the category tokens in print order
      const headerCats = tokens.filter((t) => CAT_SET.has(t));
      if (headerCats.length >= 6 && /course\s*name/i.test(joined)) {
        cats = headerCats;
        continue;
      }

      // data row: course-name cells, then exactly cats.length value cells
      if (college && cats) {
        const values = line.cells.filter((c) => isValue(c.s)).map((c) => c.s);
        if (values.length === 0) continue; // wrapped course-name tail, footers
        const course = line.cells
          .filter((c) => !isValue(c.s))
          .map((c) => c.s)
          .join(" ")
          .replace(/\s+/g, " ")
          .trim();
        if (!course) continue; // "Generated on … Page 1 of 15" — no course text
        if (values.length !== cats.length) {
          mismatches++;
          continue; // refuse to guess a misaligned row rather than fabricate
        }
        for (let i = 0; i < cats.length; i++) {
          const rank = toRank(values[i]);
          if (rank == null) continue;
          rows.push({
            round,
            collegeCode: college.code,
            collegeName: college.name,
            course,
            category: cats[i],
            closingRank: rank,
          });
        }
      }
    }
  }

  if (mismatches) console.error(`! ${round}: ${mismatches} row(s) skipped (cell count != header)`);
  return rows;
}

// ---- CLI -------------------------------------------------------------------
const isMain = import.meta.url === `file://${process.argv[1]}` ||
  process.argv[1]?.endsWith("parse-pgcet-cutoff.mjs");
if (isMain) {
  const [, , path, round, flag] = process.argv;
  if (!path || !round) {
    console.error("usage: node parse-pgcet-cutoff.mjs <pdf> <ROUND> [--profile]");
    process.exit(1);
  }
  const rows = await parsePgcetCutoff(path, round);
  if (flag === "--profile") {
    const colleges = new Set(rows.map((r) => r.collegeCode));
    const cats = new Set(rows.map((r) => r.category));
    const courses = new Set(rows.map((r) => r.course));
    console.log(`ROUND ${round}: ${rows.length} cutoff rows`);
    console.log(`Colleges: ${colleges.size}`);
    console.log(`Categories: ${[...cats].join(", ")}`);
    console.log(`Courses: ${[...courses].join(" | ")}`);
    console.log(`Sample:`);
    for (const r of rows.slice(0, 6)) console.log("  ", JSON.stringify(r));
  } else {
    process.stdout.write(JSON.stringify(rows));
  }
}
