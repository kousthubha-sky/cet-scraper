/**
 * Approximate PGCET marks → rank estimator, PER STREAM.
 *
 * IMPORTANT: KEA does NOT publish a marks→rank formula. The ANCHORS below are
 * APPROXIMATE, candidate-reported (students' remembered marks vs their rank
 * card, a previous year). They are used only to *estimate* a rank when a
 * student knows their marks but not their rank — every result is labelled an
 * estimate in the UI. Replace/extend ANCHORS (per stream, per year) the moment
 * KEA's official marks-vs-rank data is available.
 *
 * Shape of the curve:
 *   • below the lowest anchor  → extrapolate the first segment to a worse rank
 *   • between anchors          → linear interpolation (real, candidate-reported)
 *   • above the highest anchor → CONVEX exponential decay toward (75, rank 1).
 *
 * The convex top matters: PGCET tops out near ~75 marks (not 100) and the field
 * is dense just below the top, so a couple of marks there swing the rank by a
 * lot (e.g. 59 vs 61 is a big gap, not a flat one). A straight line to the
 * topper flattened that out; exponential decay keeps it steep right above the
 * data and only eases as it approaches rank 1. Calibrated so ~60 lands ≈125–150
 * and it reaches the topper by ~75. NOTE: above the last real anchor the shape
 * is an assumption, not measured — pin it with real 60+ data when available.
 *
 * A conservative factor nudges every estimate to a slightly higher (worse) rank
 * so we never over-promise. ponytail: anchor tables + interp + one exp segment.
 */

// [marks, rank] ascending by marks. Candidate-reported, PGCET. Real points only.
const ANCHORS = {
  MCA: [
    [43, 7000],
    [48, 3300],
    [54, 600],
    [57, 269],
    [59, 169],
  ],
  MBA: [
    [52, 1800],
    [54, 600],
  ],
};

const TOP_MARK = 75; // realistic PGCET ceiling — a near-max score is the topper
const TOP_RANK = 1;
const MAX_RANK = 30000; // don't claim false precision far below the data
const CONSERVATIVE_FACTOR = 1.1; // show ~10% worse than the reported curve

/** Estimate a rank from PGCET marks for a stream. Returns a rounded rank or null. */
export function estimateRankFromMarks(marks, stream) {
  const A = ANCHORS[stream];
  if (!A) return null;
  const m = Number(marks);
  if (!Number.isFinite(m) || m <= 0) return null;

  const n = A.length;
  const [mLast, rLast] = A[n - 1]; // highest real anchor
  let r;
  if (m >= TOP_MARK) {
    r = TOP_RANK;
  } else if (m >= mLast) {
    // convex top: exponential decay from the last real point to (TOP_MARK, 1)
    const k = Math.log(rLast / TOP_RANK) / (TOP_MARK - mLast);
    r = rLast * Math.exp(-k * (m - mLast));
  } else if (m <= A[0][0]) {
    r = line(A[0], A[1], m); // below bottom anchor → extrapolate worse
  } else {
    for (let i = 0; i < n - 1; i++) {
      if (m >= A[i][0] && m <= A[i + 1][0]) {
        r = line(A[i], A[i + 1], m);
        break;
      }
    }
  }
  const v = Math.max(1, Math.min(MAX_RANK, r * CONSERVATIVE_FACTOR));
  return roundUp(v);
}

// the straight line through two anchors, evaluated at m (used in- and out-of-range)
function line([m1, r1], [m2, r2], m) {
  return r1 + ((r2 - r1) * (m - m1)) / (m2 - m1);
}

// Round up to a "nice" number — fine near the top (toppers), coarse for big ranks.
function roundUp(v) {
  if (v <= 200) return Math.ceil(v / 10) * 10;
  if (v <= 500) return Math.ceil(v / 25) * 25;
  if (v <= 2000) return Math.ceil(v / 50) * 50;
  return Math.ceil(v / 100) * 100;
}

// ---- self-check ------------------------------------------------------------
const isMain = import.meta.url === `file://${process.argv[1]}` ||
  process.argv[1]?.endsWith("pgcet-marks.js");
if (isMain) {
  for (const stream of ["MCA", "MBA"]) {
    const A = ANCHORS[stream];
    let prev = -1;
    for (let m = 80; m >= 30; m--) {
      const e = estimateRankFromMarks(m, stream);
      console.assert(e >= prev, `${stream} not monotonic at ${m}: ${e} < ${prev}`); // ↓marks ⇒ ↑rank
      prev = e;
    }
    const mLast = A[A.length - 1][0];
    console.assert(estimateRankFromMarks(mLast + 5, stream) < estimateRankFromMarks(mLast, stream), `${stream} convex top should keep dropping`);
    console.assert(estimateRankFromMarks(95, stream) <= 20, `${stream} near-max → top rank`);
    console.assert(estimateRankFromMarks(5, stream) <= MAX_RANK, `${stream} floor clamp`);
  }
  console.assert(estimateRankFromMarks(50, "XYZ") === null, "unknown stream → null");
  console.assert(estimateRankFromMarks(0, "MCA") === null, "invalid marks → null");
  for (const s of ["MCA", "MBA"]) {
    console.log(
      `${s}:`,
      [48, 54, 57, 59, 60, 61, 62, 65, 70].map((m) => `${m}→${estimateRankFromMarks(m, s)}`).join("  ")
    );
  }
}
