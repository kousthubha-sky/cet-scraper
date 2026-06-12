import { getColleges, getTaxonomy } from "@/lib/data";
import { SITE_URL } from "@/lib/site";

export default function sitemap() {
  const now = new Date();
  const colleges = getColleges();
  const branches = getTaxonomy().branches;

  const staticPages = [
    { path: "", priority: 1.0, changeFrequency: "daily" },
    { path: "/predict", priority: 0.9, changeFrequency: "weekly" },
    { path: "/colleges", priority: 0.8, changeFrequency: "weekly" },
    { path: "/branches", priority: 0.8, changeFrequency: "weekly" },
    { path: "/compare", priority: 0.6, changeFrequency: "monthly" },
  ].map((p) => ({
    url: `${SITE_URL}${p.path}`,
    lastModified: now,
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }));

  const collegePages = colleges.map((c) => ({
    url: `${SITE_URL}/colleges/${c.code}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const branchPages = branches.map((b) => ({
    url: `${SITE_URL}/branches/${b.code}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticPages, ...collegePages, ...branchPages];
}
