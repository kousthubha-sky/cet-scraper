/**
 * parse-kea-pdf.mjs — extract genuine KCET (UGCET) engineering cut-off ranks from
 * KEA's official round-wise allotment cut-off PDFs.
 *
 * The PDFs are rotated 90° (page.rotate=90). We de-rotate with pdfjs' viewport
 * transform, which turns the table into a clean grid:
 *   • a header row  "Course Name 1G 1K 1R … STR"  fixes the 28 category columns,
 *   • each branch occupies ONE horizontal line of numeric cells (wrapped branch
 *     names spill onto following lines that carry no numbers),
 *   • "College: <CODE> <name…>" lines delimit colleges.
 *
 * Each numeric cell is assigned to its category by nearest column-centre (cells
 * jitter <±4 from the header centres; columns are ~24 apart). "--" means no
 * allotment for that category and is skipped.
 *
 * Export: parsePdf(path, round) -> [{ round, collegeCode, collegeName, branchRaw,
 *                                     category, closingRank }]
 * CLI:    node parse-kea-pdf.mjs <pdf> <ROUND> [--profile]
 */
import fs from "node:fs";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

export const CATEGORY_COLUMNS = [
  "1G", "1K", "1R",
  "2AG", "2AK", "2AR",
  "2BG", "2BK", "2BR",
  "3AG", "3AK", "3AR",
  "3BG", "3BK", "3BR",
  "GM", "GMK", "GMP", "GMR",
  "NRI", "OPN", "OTH",
  "SCG", "SCK", "SCR",
  "STG", "STK", "STR",
];
const CAT_SET = new Set(CATEGORY_COLUMNS);

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

function headerCols(line) {
  const cols = line.cells.filter((c) => CAT_SET.has(c.s)).map((c) => ({ cat: c.s, x: c.x }));
  return cols.length >= 20 ? cols : null;
}

function nearestCat(x, cols) {
  let best = null;
  let bd = Infinity;
  for (const c of cols) {
    const d = Math.abs(c.x - x);
    if (d < bd) {
      bd = d;
      best = c;
    }
  }
  return bd <= 13 ? best.cat : null;
}

export async function parsePdf(path, round) {
  const doc = await getDocument({
    data: new Uint8Array(fs.readFileSync(path)),
    useSystemFonts: true,
  }).promise;

  const rows = [];

  // Flush one college's table body. A branch row is laid out as a full grid
  // line of ~28 value cells ("--" printed for empty categories); the value-line
  // is the FIRST line of the branch and any name-only lines below it continue
  // the name. We anchor branches on lines with many value cells (real rows have
  // 28; jittered stray cells appear 1–2 at a time on continuation lines and are
  // unioned into the branch above). Name-only lines before the first branch
  // (e.g. a "B TECH IN" prefix) are buffered and prepended.
  const START_MIN_CELLS = 14;
  function flush(body, college, cols) {
    if (!body.length || !cols) return;
    const nameMaxX = cols[0].x - 10;
    let cur = null;
    let prefix = [];
    const branches = [];
    for (const line of body) {
      const nameStr = line.cells
        .filter((c) => c.x < nameMaxX)
        .map((c) => c.s)
        .join(" ")
        .trim();
      const valueCells = line.cells.filter((c) => c.x >= nameMaxX);

      if (valueCells.length >= START_MIN_CELLS) {
        cur = { parts: [...prefix, nameStr].filter(Boolean), cells: [...valueCells] };
        prefix = [];
        branches.push(cur);
      } else if (cur) {
        if (nameStr) cur.parts.push(nameStr);
        if (valueCells.length) cur.cells.push(...valueCells); // jittered strays
      } else if (nameStr) {
        prefix.push(nameStr);
      }
    }

    for (const b of branches) {
      const byCat = {};
      for (const c of b.cells) {
        const rank = toRank(c.s);
        if (rank == null) continue; // skip "--"
        const cat = nearestCat(c.x, cols);
        if (!cat || byCat[cat] != null) continue; // first real value wins
        byCat[cat] = rank;
      }
      const branchRaw = b.parts.join(" ").replace(/\s+/g, " ").trim();
      for (const [category, closingRank] of Object.entries(byCat)) {
        rows.push({
          round,
          collegeCode: college.code,
          collegeName: college.name,
          branchRaw,
          category,
          closingRank,
        });
      }
    }
  }

  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const lines = await pageLines(page);

    let cols = null;
    let college = null;
    let body = [];

    for (const line of lines) {
      const joined = line.cells.map((c) => c.s).join(" ");

      // R2/R3 print "College: E001 Name", R1 prints "College: (E001)Name".
      const cm = joined.match(/College:\s*\(?(E\d+[A-Z]?)\)?\s*(.+)$/);
      if (cm) {
        flush(body, college, cols);
        body = [];
        college = { code: cm[1], name: cm[2].trim() };
        cols = null;
        continue;
      }

      const hc = headerCols(line);
      if (hc) {
        flush(body, college, cols);
        body = [];
        cols = hc;
        continue;
      }

      if (cols && college) body.push(line);
    }
    flush(body, college, cols);
  }

  return rows;
}

// ---- CLI -------------------------------------------------------------------
const isMain = import.meta.url === `file://${process.argv[1]}` ||
  process.argv[1]?.endsWith("parse-kea-pdf.mjs");
if (isMain) {
  const [, , path, round, flag] = process.argv;
  if (!path || !round) {
    console.error("usage: node parse-kea-pdf.mjs <pdf> <ROUND> [--profile]");
    process.exit(1);
  }
  const rows = await parsePdf(path, round);
  if (flag === "--profile") {
    const colleges = new Map();
    const branches = new Map();
    const cats = new Map();
    for (const r of rows) {
      colleges.set(r.collegeCode, r.collegeName);
      branches.set(r.branchRaw, (branches.get(r.branchRaw) || 0) + 1);
      cats.set(r.category, (cats.get(r.category) || 0) + 1);
    }
    console.log(`ROUND ${round}: ${rows.length} cutoff rows`);
    console.log(`Colleges: ${colleges.size}`);
    console.log(`Categories present: ${[...cats.keys()].join(", ")}`);
    console.log(`\nDistinct branch names (${branches.size}):`);
    for (const [b, n] of [...branches.entries()].sort((a, b2) => b2[1] - a[1])) {
      console.log(`  ${String(n).padStart(4)}  ${b}`);
    }
    console.log(`\nSample rows:`);
    for (const r of rows.slice(0, 8)) console.log("  ", JSON.stringify(r));
  } else {
    process.stdout.write(JSON.stringify(rows));
  }
}
