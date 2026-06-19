/**
 * clean.mjs — shared college name / city / acronym / ownership-type cleanup,
 * used by both the UGCET (build-kea-dataset) and PGCET (build-pgcet-dataset)
 * builders. KEA prints names ALL-CAPS with the address appended and assorted
 * typos; these helpers produce a readable name, a short acronym, a best-effort
 * city, and a best-effort Government/Private guess.
 */

const CITY_RULES = [
  [/bengaluru|bangalore|bengalooru/i, "Bangalore"],
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

export function detectCity(raw) {
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

export function cleanName(raw) {
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
export function acronym(name) {
  const words = name.replace(/[.,'`"]/g, " ").split(/\s+/).filter(Boolean);
  const letters = words.filter((w) => !STOP.has(w.toUpperCase())).map((w) => w[0].toUpperCase());
  let a = letters.join("");
  if (a.length < 2) a = name.replace(/[^A-Za-z]/g, "").slice(0, 4).toUpperCase();
  return a.slice(0, 6);
}

export function collegeType(raw) {
  if (/\bgovt\.?\b|government|visvesvaraya college of engineering|u\.?\s*b\.?\s*d\.?\s*t|university b\.?d\.?t|\(h\.gov\)/i.test(raw))
    return "Government";
  return "Private";
}
