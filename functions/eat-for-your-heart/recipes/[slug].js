// One crawlable page per recipe: /eat-for-your-heart/recipes/<recipe-slug>
// Built on request from recipes.json, so new recipes from the Recipe Editor get a page automatically.
import { SITE, esc, recipes, isoDuration } from "../../_lib.js";

const STORE = "https://shop.ironreefllc.com/collections/iron-reef";

export async function onRequestGet(context){
  const id = String(context.params.slug || "").replace(/\/$/, "");
  let list;
  try { list = await recipes(context); } catch (e) { return new Response("Recipes unavailable", {status: 503}); }
  const r = list.find(x => x.id === id);
  if (!r) return Response.redirect(new URL("/eat-for-your-heart/", context.request.url).toString(), 302);

  const url = `${SITE}/eat-for-your-heart/recipes/${r.id}`;
  const links = list.filter(x => x.id !== r.id && x.title.length > 6).sort((a,b) => b.title.length - a.title.length);
  const linkify = text => {
    let html = esc(text); const marks = [];
    for (const l of links) {
      const t = esc(l.title), i = html.indexOf(t);
      if (i < 0 || marks.some(m => i < m.end && i + t.length > m.start)) continue;
      marks.push({start: i, end: i + t.length, l, t});
    }
    marks.sort((a,b) => b.start - a.start);
    for (const m of marks) html = html.slice(0, m.start) + `<a class="recipe-link" href="/eat-for-your-heart/recipes/${m.l.id}">${m.t}</a>` + html.slice(m.end);
    return html.replace(/ \(from this site\)/g, "");
  };
  // Same note formatting as the recipe page: one paragraph per line, "- " lines as a bulleted list.
  const notesHTML = text => {
    const lines = String(text || "").split(/\n+/).map(l => l.trim()).filter(Boolean);
    let out = "", list = [];
    const flush = () => { if (list.length) { out += `<ul class="note-list">${list.join("")}</ul>`; list = []; } };
    for (const l of lines) {
      if (/^[-•]\s+/.test(l)) {
        const t = l.replace(/^[-•]\s+/, ""), m = /^([^:]{2,40}):\s+(.*)$/.exec(t);
        list.push(`<li>${m ? `<b>${esc(m[1])}:</b> ${linkify(m[2])}` : linkify(t)}</li>`);
      } else { flush(); out += `<p>${linkify(l)}</p>`; }
    }
    flush();
    return out;
  };
  const related = list.filter(x => x.category === r.category && x.id !== r.id).slice(0, 6);
  const desc = (r.summary ? r.summary + " " : "") + "A heart-healthy recipe: low salt, lower saturated fat.";

  const ld = {
    "@context": "https://schema.org", "@type": "Recipe",
    name: r.title, description: r.summary || desc, url,
    author: {"@type": "Person", name: "Ryan Villanueva", url: `${SITE}/about/`},
    publisher: {"@type": "Organization", name: "Iron Reef", url: SITE},
    recipeCategory: r.category, keywords: ["heart-healthy", "low sodium", ...(r.tags || [])].join(", "),
    recipeYield: r.servings ? `${r.servings} servings` : undefined,
    prepTime: isoDuration(r.prep) || undefined, cookTime: isoDuration(r.cook) || undefined,
    recipeIngredient: (r.ingredients || []).filter(i => !/:\s*$/.test(i)),
    recipeInstructions: (r.steps || []).map(s => ({"@type": "HowToStep", text: s})),
    image: r.image ? (/^https?:/.test(r.image) ? r.image : `${SITE}/eat-for-your-heart/photos/recipes/${r.image}`) : undefined
  };
  const crumbs = {"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[
    {"@type":"ListItem",position:1,name:"Iron Reef",item:SITE + "/"},
    {"@type":"ListItem",position:2,name:"Eat for your Heart",item:SITE + "/eat-for-your-heart/"},
    {"@type":"ListItem",position:3,name:r.title,item:url}]};
  const json = o => JSON.stringify(o).replace(/</g, "\\u003c");

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(r.title)} | Heart-Healthy Recipe | Eat for your Heart</title>
<meta name="description" content="${esc(desc.slice(0, 158))}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="article">
<meta property="og:title" content="${esc(r.title)} | Eat for your Heart">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${ld.image || SITE + "/eat-for-your-heart/photos/market-haul.jpg"}">
<link rel="icon" type="image/png" href="/eat-for-your-heart/favicon.png">
<link rel="apple-touch-icon" href="/eat-for-your-heart/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Holtwood+One+SC&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&family=Work+Sans:wght@500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/eat-for-your-heart/recipes.css">
<script type="application/ld+json">${json(ld)}</script>
<script type="application/ld+json">${json(crumbs)}</script>
<style>.detail h1.recipe-title{font-family:var(--display);font-size:clamp(1.7rem,4vw,2.5rem);line-height:1.15;color:var(--navy);letter-spacing:.02em;margin:18px 0 8px}.detail .cols h2{font-family:var(--display);font-size:1.2rem;color:var(--navy);letter-spacing:.03em;margin:0 0 12px}.related{margin:48px 0 8px}.detail .related h2{font-family:var(--display);font-size:1.3rem;margin:0 0 12px}.related ul{list-style:none;display:grid;gap:8px}.related a{font-weight:600}</style>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header>
  <div class="wrap nav">
    <a class="brand" href="/" aria-label="Iron Reef home"><img src="/emblem.webp" alt="" width="52" height="45"><span>Iron Reef</span></a>
    <nav aria-label="Main"><ul>
      <li><a href="/about/"><span class="full">About</span><span class="short">About</span></a></li>
      <li><a href="/rodeo/"><span class="full">Rodeo</span><span class="short">Rodeo</span></a></li>
      <li><a href="/diving/"><span class="full">Diving</span><span class="short">Diving</span></a></li>
      <li><a href="${STORE}" target="_blank" rel="noopener"><span class="full">Store</span><span class="short">Store</span></a></li>
      <li class="efyh-link"><a href="/eat-for-your-heart/" aria-current="page"><img src="/eat-for-your-heart/brand/mark.svg" alt="" width="17" height="20"><span class="full">Eat for your Heart</span><span class="short">Recipes</span></a></li>
    </ul></nav>
  </div>
</header>
<main class="wrap" id="main">
  <article class="detail" id="detail">
    <div class="actions">
      <a class="back" href="/eat-for-your-heart/">&larr; All recipes</a>
      <button class="print" type="button" onclick="window.print()">Print recipe</button>
    </div>
    <div class="detail-head">
      <div>
        <div class="eyebrow" style="margin-top:22px">${esc(r.category)}</div>
        <h1 class="recipe-title">${esc(r.title)}</h1>
        ${r.summary ? `<p class="summary">${esc(r.summary)}</p>` : ""}
        ${r.replaces ? `<p class="replaces"><span class="swap-badge">Swap</span> Homemade swap for: <b>${esc(r.replaces)}</b></p>` : ""}
        <div class="facts">
          ${r.prep ? `<div><b>${esc(r.prep)}</b>Prep</div>` : ""}
          ${r.cook ? `<div><b>${esc(r.cook)}</b>Cook</div>` : ""}
          ${r.servings ? `<div><b>${esc(r.servings)}</b>Servings</div>` : ""}
        </div>
      </div>
    </div>
    <div class="cols">
      <section><h2>Ingredients</h2><ul class="ing">${(r.ingredients||[]).map(i => /:\s*$/.test(i) ? `<li class="ing-group">${esc(i.replace(/:\s*$/, ""))}</li>` : `<li>${linkify(i)}</li>`).join("")}</ul></section>
      <section><h2>Steps</h2><ol class="steps">${(r.steps||[]).map(s => `<li>${linkify(s)}</li>`).join("")}</ol></section>
    </div>
    ${r.heartNotes ? `<div class="heart-note"><span class="heart-icon" aria-hidden="true">&#9829;</span><div><strong>Heart-healthy notes</strong><p>${linkify(r.heartNotes)}</p></div></div>` : ""}
    ${r.notes ? `<div class="note"><strong>Notes</strong>${notesHTML(r.notes)}</div>` : ""}
    ${(r.tags||[]).length ? `<div class="tags">${r.tags.map(t => `<span>${esc(t)}</span>`).join("")}</div>` : ""}
    ${related.length ? `<nav class="related" aria-label="More recipes"><h2>More ${esc(r.category.toLowerCase())} recipes</h2><ul>${related.map(x => `<li><a href="/eat-for-your-heart/recipes/${x.id}">${esc(x.title)}</a></li>`).join("")}</ul></nav>` : ""}
  </article>
</main>
<footer>
  <div class="wrap">
    <span>&copy; ${new Date().getFullYear()} Iron Reef<span class="star">&#10022;</span>Kansas City, Missouri</span>
    <span>Heart-healthy recipes</span>
  </div>
</footer>
</body>
</html>`;
  return new Response(html, {headers: {"content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=300"}});
}
