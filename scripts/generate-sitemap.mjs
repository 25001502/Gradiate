import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { indexableRoutes } from "../src/lib/routes.js";

const SITE_URL = (process.env.SITE_URL || process.env.VITE_SITE_URL || "https://gradiate.co.za").replace(
  /\/+$/,
  "",
);
const outputPath = fileURLToPath(new URL("../public/sitemap.xml", import.meta.url));

const escapeXml = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

const urls = [...new Set(indexableRoutes)].map((route) => {
  const path = route === "/" ? "/" : `/${route.replace(/^\/+|\/+$/g, "")}`;
  return `  <url>\n    <loc>${escapeXml(`${SITE_URL}${path}`)}</loc>\n  </url>`;
});

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...urls,
  "</urlset>",
  "",
].join("\n");

await writeFile(outputPath, sitemap, "utf8");
console.log(`Generated sitemap with ${urls.length} canonical URLs.`);
