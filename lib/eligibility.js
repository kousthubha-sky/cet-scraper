/**
 * Pure admission-chance logic. No I/O — operates on plain cutoff rows so it can
 * run on the server (route handlers) or be unit-tested in isolation.
 *
 * Convention: lower rank number = better. A student is "in" if their rank is
 * within (or close to) last year's closing rank for that branch+category.
 */

export const CHANCE = {
  safe: {
    key: "safe",
    label: "Safe",
    blurb: "Comfortably within last year's closing rank.",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    order: 0,
  },
  target: {
    key: "target",
    label: "Target",
    blurb: "Around last year's closing rank — a realistic shot.",
    className: "bg-sky-50 text-sky-700 border-sky-200",
    order: 1,
  },
  reach: {
    key: "reach",
    label: "Reach",
    blurb: "Just beyond last year's cutoff — possible if it loosens.",
    className: "bg-amber-50 text-amber-700 border-amber-200",
    order: 2,
  },
};

/** Classify a rank against a closing rank. Returns a CHANCE entry or null. */
export function classify(rank, closingRank) {
  if (!closingRank || !rank) return null;
  const ratio = rank / closingRank;
  if (ratio <= 0.7) return CHANCE.safe;
  if (ratio <= 1.0) return CHANCE.target;
  if (ratio <= 1.2) return CHANCE.reach;
  return null; // unlikely — excluded from predictions
}

/**
 * Predict eligible college+branch seats for a student.
 * @param {Array} cutoffs  full cutoff rows
 * @param {Object} opts    { rank, category, round, branches?, cities?, types?, includeReach? }
 * @returns {Array} matches sorted by chance then closing rank
 */
export function predict(cutoffs, opts) {
  const {
    rank,
    category = "GM",
    round = "R1",
    branches,
    cities,
    types,
    includeReach = true,
  } = opts;

  const branchSet = branches?.length ? new Set(branches) : null;
  const citySet = cities?.length ? new Set(cities) : null;
  const typeSet = types?.length ? new Set(types) : null;

  const out = [];
  for (const r of cutoffs) {
    if (r.category !== category) continue;
    if (r.round !== round) continue;
    if (branchSet && !branchSet.has(r.branch)) continue;
    if (citySet && !citySet.has(r.city)) continue;
    if (typeSet && !typeSet.has(r.collegeType)) continue;

    const chance = classify(rank, r.closingRank);
    if (!chance) continue;
    if (!includeReach && chance.key === "reach") continue;

    out.push({ ...r, chance: chance.key });
  }

  out.sort((a, b) => {
    const ca = CHANCE[a.chance].order - CHANCE[b.chance].order;
    if (ca !== 0) return ca;
    return a.closingRank - b.closingRank;
  });
  return out;
}

/** Summary counts by chance bucket. */
export function summarize(matches) {
  const s = { safe: 0, target: 0, reach: 0, colleges: new Set() };
  for (const m of matches) {
    s[m.chance]++;
    s.colleges.add(m.collegeCode);
  }
  return { safe: s.safe, target: s.target, reach: s.reach, colleges: s.colleges.size };
}
