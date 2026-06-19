import { getColleges, getTaxonomy } from "@/lib/data";
import { getPgcetColleges, getPgcetTaxonomy } from "@/lib/pgcet";
import { SITE_URL } from "@/lib/site";

export default function sitemap() {
  const now = new Date();
  const colleges = getColleges();
  const branches = getTaxonomy().branches;
  const pgcetColleges = getPgcetColleges();
  const pgcetBranches = getPgcetTaxonomy().branches;

  const staticPages = [
    { path: "", priority: 1.0, changeFrequency: "daily" },
    { path: "/predict", priority: 0.9, changeFrequency: "weekly" },
    { path: "/colleges", priority: 0.8, changeFrequency: "weekly" },
    { path: "/branches", priority: 0.8, changeFrequency: "weekly" },
    { path: "/compare", priority: 0.6, changeFrequency: "monthly" },
    { path: "/pgcet", priority: 0.9, changeFrequency: "weekly" },
    { path: "/pgcet/predict", priority: 0.9, changeFrequency: "weekly" },
    { path: "/pgcet/colleges", priority: 0.8, changeFrequency: "weekly" },
    { path: "/pgcet/branches", priority: 0.8, changeFrequency: "weekly" },
    { path: "/pgcet/compare", priority: 0.6, changeFrequency: "monthly" },
  ].map((p) => ({
    url: `${SITE_URL}${p.path}`,
    lastModified: now,
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }));

  const dyn = (items, prefix) =>
    items.map((it) => ({
      url: `${SITE_URL}${prefix}${it.code}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    }));

  return [
    ...staticPages,
    ...dyn(colleges, "/colleges/"),
    ...dyn(branches, "/branches/"),
    ...dyn(pgcetColleges, "/pgcet/colleges/"),
    ...dyn(pgcetBranches, "/pgcet/branches/"),
  ];
}
