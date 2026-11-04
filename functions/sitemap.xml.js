// /sitemap.xml — static pages, journal posts and one URL per recipe (kept current from recipes.json).
import { SITE, recipes, asset } from "./_lib.js";

const PAGES = ["/", "/about/", "/rodeo/", "/diving/", "/journal/", "/eat-for-your-heart/"];

export async function onRequestGet(context){
  let posts = [];
  try { posts = await (await asset(context, "/journal/posts.json")).json(); } catch (e) {}
  let recs = [];
  try { recs = await recipes(context); } catch (e) {}
  const urls = [
    ...PAGES.map(p => ({loc: SITE + p})),
    ...posts.map(p => ({loc: `${SITE}/journal/${p.slug}/`, lastmod: p.updated || p.date})),
    ...recs.map(r => ({loc: `${SITE}/eat-for-your-heart/recipes/${r.id}`}))
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ""}</url>`).join("\n")}
</urlset>`;
  return new Response(xml, {headers: {"content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=3600"}});
}
