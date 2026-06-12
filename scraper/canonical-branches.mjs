/**
 * canonical-branches.mjs — map KEA's many raw course-name spellings to a stable
 * set of branch codes + clean display names.
 *
 * KEA prints the same branch dozens of ways ("COMPUTER SCIENCE AND ENGINEERING",
 * "B TECH IN COMPUTER SCIENCE AND ENGINEERING", "COMPUTER SCIENCE"), and pdfjs
 * leaves intra-word spaces at the original line-wraps ("COMMUNICATIO N",
 * "INSTRUMENTATI ON", "(D ATA"). We classify on a despaced, &→AND-normalised key
 * so all of those collapse, using ordered rules (most specific first).
 */

export const BRANCH_NAMES = {
  CS: "Computer Science & Engineering",
  IS: "Information Science & Engineering",
  IT: "Information Technology",
  AI: "Artificial Intelligence & Machine Learning",
  AD: "Artificial Intelligence & Data Science",
  DS: "Computer Science (Data Science)",
  CY: "Computer Science (Cyber Security)",
  IOT: "Computer Science (IoT & Block Chain)",
  CB: "Computer Science & Business Systems",
  CD: "Computer Science & Design",
  EC: "Electronics & Communication Engineering",
  EE: "Electrical & Electronics Engineering",
  EI: "Electronics & Instrumentation Engineering",
  ET: "Electronics & Telecommunication Engineering",
  EV: "Electronics Engineering (VLSI & Embedded)",
  ECM: "Electronics & Computer Engineering",
  ME: "Mechanical Engineering",
  CV: "Civil Engineering",
  CH: "Chemical Engineering",
  AE: "Aeronautical Engineering",
  AS: "Aerospace Engineering",
  BT: "Biotechnology",
  BM: "Biomedical & Medical Electronics",
  RA: "Robotics & Automation",
  IM: "Industrial Engineering & Management",
  AU: "Automobile Engineering",
  MT: "Mechatronics Engineering",
  AG: "Agriculture Engineering",
  EN: "Environmental Engineering",
  MN: "Mining Engineering",
  MR: "Marine Engineering",
  PL: "Polymer Science & Technology",
  CER: "Ceramics & Cement Technology",
  TX: "Textiles & Silk Technology",
  MC: "Mathematics & Computing",
  OTH: "Other Programs",
};

// Stable display order for the taxonomy (popular branches first).
export const BRANCH_ORDER = [
  "CS", "IS", "IT", "AI", "AD", "DS", "CY", "IOT", "CB", "CD",
  "EC", "EE", "EI", "ET", "EV", "ECM",
  "ME", "CV", "CH", "AE", "AS", "BT", "BM", "RA", "IM", "AU", "MT",
  "AG", "EN", "MN", "MR", "PL", "CER", "TX", "MC", "OTH",
];

function keyOf(raw) {
  return raw.toUpperCase().replace(/&/g, "AND").replace(/[^A-Z0-9]+/g, "");
}

// Ordered rules: [predicate(key), code]. First match wins.
const RULES = [
  [(k) => k.includes("BIOMEDICAL") || k.includes("MEDICALELECTRONICS"), "BM"],
  [(k) => k.includes("BIOTECHNOLOG"), "BT"],
  [(k) => k.includes("ROBOTIC"), "RA"],
  [(k) => k.includes("INTELLIGENCEANDMACHINELEARNING") || k.includes("INTELLIGENCEANDFUTURE") ||
          k.includes("AIANDML") || k.includes("(AIML)") || k.includes("ENGINEERINGAIML") ||
          k.includes("ARTIFICIALINTELLIGENCEENGG"), "AI"],
  [(k) => k.includes("INTELLIGENCEANDDATASCIENCE"), "AD"],
  [(k) => k.includes("DATASCIENCE") || k.includes("DATAANALYTICS"), "DS"],
  [(k) => k.includes("BLOCKCHAIN") || k.includes("INTERNETOFTHINGS") || /(^|[^A-Z])IOT([^A-Z]|$)/.test(k), "IOT"],
  [(k) => k.includes("CYBER"), "CY"],
  [(k) => k.includes("BUSINESSSYSTEMS"), "CB"],
  [(k) => k.includes("COMPUTERSCIENCEANDDESIGN"), "CD"],
  [(k) => k.includes("ARTIFICIALINTELLIGENCE") || k.includes("ARTIFICALINTELLIGENCE"), "AI"],
  [(k) => k.includes("INFORMATIONSCIENCE"), "IS"],
  [(k) => k.includes("INFORMATIONTECHNOLOGY"), "IT"],
  [(k) => k.includes("ELECTRONICSANDCOMMUNICATION") || k.includes("COMMUNICATIONENGG") ||
          k.includes("ADVANCEDCOMMUNICATION"), "EC"],
  [(k) => k.includes("INSTRUMENTATION"), "EI"],
  [(k) => k.includes("TELECOMMUNICATION"), "ET"],
  [(k) => k.includes("VLSI") || k.includes("EMBEDDEDSYSTEM"), "EV"],
  [(k) => k.includes("ELECTRONICSANDCOMPUTER") || k.includes("ELECTRONICSCOMPUTER"), "ECM"],
  [(k) => k.includes("ELECTRICAL"), "EE"],
  [(k) => k.includes("ELECTRONICS"), "EC"],
  [(k) => k.includes("AEROSPACE"), "AS"],
  [(k) => k.includes("AERONAUTICAL"), "AE"],
  [(k) => k.includes("AUTOMOBILE") || k.includes("AUTOMOTIVE"), "AU"],
  [(k) => k.includes("MECHATRONIC"), "MT"],
  [(k) => k.includes("MECHANICAL"), "ME"],
  [(k) => k.includes("CIVIL") || k.includes("CONSTRUCTIONTECHNOLOGY"), "CV"],
  [(k) => k.includes("CHEMICAL"), "CH"],
  [(k) => k.includes("INDUSTRIAL") || k.includes("PRODUCTIONENGINEERING"), "IM"],
  [(k) => k.includes("AGRICULTUR"), "AG"],
  [(k) => k.includes("ENVIRONMENTAL"), "EN"],
  [(k) => k.includes("MINING"), "MN"],
  [(k) => k.includes("MARINE"), "MR"],
  [(k) => k.includes("POLYMER"), "PL"],
  [(k) => k.includes("CERAMIC"), "CER"],
  [(k) => k.includes("TEXTILE") || k.includes("SILK"), "TX"],
  [(k) => k.includes("MATHAMATICS") || k.includes("MATHEMATICS"), "MC"],
  [(k) => k.includes("COMPUTERSCIENCE") || k.includes("COMPUTERENGINEERING") ||
          k.includes("COMPUTERAND"), "CS"],
];

export function classifyBranch(raw) {
  const k = keyOf(raw);
  for (const [test, code] of RULES) {
    if (test(k)) return { code, name: BRANCH_NAMES[code] };
  }
  return { code: "OTH", name: BRANCH_NAMES.OTH };
}
