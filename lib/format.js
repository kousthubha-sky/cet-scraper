export const nf = new Intl.NumberFormat("en-IN");

export function formatRank(n) {
  if (n == null || isNaN(n)) return "—";
  return nf.format(Math.round(n));
}

export function formatFees(n) {
  if (n == null || isNaN(n)) return "—";
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
  return `₹${nf.format(n)}`;
}

export function ordinal(n) {
  const num = parseInt(n, 10);
  if (isNaN(num)) return n;
  const s = ["th", "st", "nd", "rd"];
  const v = num % 100;
  return num + (s[(v - 20) % 10] || s[v] || s[0]);
}
