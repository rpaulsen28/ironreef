/* Eat for your Heart — how a recipe is drawn on the page.
   Shared by the recipe page (index.html) and the recipe editor (editor.html),
   so the editor's preview always matches the live site. */
window.RecipeView = (() => {
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const slug = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");

  // Recipe photo: "image" holds a file name in photos/recipes/ (e.g. "southwest-chicken-salad.jpg"),
  // or a full path/URL. Recipes without one simply show no photo.
  const PHOTO_DIR = "photos/recipes/";
  const BASE = (document.currentScript && document.currentScript.src) ? new URL(".", document.currentScript.src).href : "";
  function imgSrc(r){
    if (!r.image) return "";
    if (/^(https?:)?\/\//.test(r.image) || r.image.startsWith("/")) return r.image;
    return BASE + (r.image.includes("/") ? r.image : PHOTO_DIR + r.image);
  }
  const hideOnError = `onerror="this.closest('[data-photo]').remove()"`;

  // Links: any mention of another recipe's exact title becomes a link to that recipe.
  // The recipe page calls RecipeView.setRecipes(list) once the list loads.
  let LINKS = [];
  function setRecipes(list){
    LINKS = (list || []).map(x => ({ title: x.title, esc: esc(x.title), id: slug(x.title) }))
      .filter(x => x.title.length > 6)
      .sort((a, b) => b.title.length - a.title.length);
  }
  function linkify(text, selfId){
    let html = esc(text);
    if (!LINKS.length) return html;
    const marks = [];
    for (const l of LINKS) {
      if (l.id === selfId) continue;
      const i = html.indexOf(l.esc);
      if (i < 0 || marks.some(m => i < m.end && i + l.esc.length > m.start)) continue;
      marks.push({ start: i, end: i + l.esc.length, l });
    }
    marks.sort((a, b) => b.start - a.start);
    for (const m of marks) html = html.slice(0, m.start) + `<a class="recipe-link" href="#${m.l.id}">${m.l.esc}</a>` + html.slice(m.end);
    return html.replace(/ \(from this site\)/g, "");
  }


  // Notes: each line is its own paragraph; lines starting with "- " become a bulleted list,
  // and a "Name:" at the start of a bullet is shown in bold.
  function notesHTML(text, selfId){
    const lines = String(text || "").split(/\n+/).map(l => l.trim()).filter(Boolean);
    let html = "", list = [];
    const flush = () => { if (list.length) { html += `<ul class="note-list">${list.join("")}</ul>`; list = []; } };
    for (const l of lines) {
      if (/^[-•]\s+/.test(l)) {
        const t = l.replace(/^[-•]\s+/, ""), m = /^([^:]{2,40}):\s+(.*)$/.exec(t);
        list.push(`<li>${m ? `<b>${esc(m[1])}:</b> ${linkify(m[2], selfId)}` : linkify(t, selfId)}</li>`);
      } else { flush(); html += `<p>${linkify(l, selfId)}</p>`; }
    }
    flush();
    return html;
  }

  // Filters: total time, main protein and main carb, worked out from the recipe itself.
  // A recipe can set "protein" or "carb" (text or list) in recipes.json to override.
  const minutes = s => { s = String(s || ""); if (/none/i.test(s)) return 0;
    const h = /(\d+(?:\.\d+)?)\s*h/i.exec(s), m = /(\d+)\s*min/i.exec(s);
    return (h ? parseFloat(h[1]) * 60 : 0) + (m ? +m[1] : 0); };
  function totalMinutes(r){ return minutes(r.prep) + minutes(r.cook); }
  function timeBucket(r){ const t = totalMinutes(r); return t <= 30 ? "30 min or less" : t <= 60 ? "31 to 60 min" : "Over an hour"; }
  const PROTEINS = [
    ["Chicken & turkey", /\b(chicken|turkey)\b(?!\s*(broth|stock))/],
    ["Beef & pork", /\b(beef|pork|steak|sirloin|flank)\b(?!\s*(broth|stock))/],
    ["Fish & seafood", /\b(shrimp|salmon|cod|halibut|mahi|fish|tuna|clams?|mussels|scallops|crab|tilapia|snapper)\b(?!\s*sauce)/],
    ["Beans, tofu & eggs", /\b(tofu|(?<!green |string )beans?|lentils?|chickpeas?|eggs?|edamame)\b/]
  ];
  const CARBS = [
    ["Rice", /\brice\b(?!\s*(vinegar|wine))/],
    ["Pasta & noodles", /\b(pasta|noodles?|spaghetti|linguine|penne|orzo|udon|soba|fettuccine|rigatoni|macaroni)\b/],
    ["Potatoes", /\bpotato(es)?\b/],
    ["Breads & tortillas", /\b(bread|tortillas?|pita|flatbreads?|buns?|wraps?|rolls)\b(?!crumbs)/],
    ["Grains & oats", /\b(quinoa|oats|oatmeal|bulgur|farro|barley|couscous|grits)\b/]
  ];
  const asList = v => Array.isArray(v) ? v : v ? [v] : null;
  function facets(r){
    const ing = (r.ingredients || []).filter(i => !/:\s*$/.test(i)).join(" | ").toLowerCase();
    const component = /sauce|seasoning|dessert/i.test(r.category || "");
    let protein = asList(r.protein);
    if (!protein) {
      protein = component ? [] : PROTEINS.filter(([, re]) => re.test(ing)).map(([n]) => n);
      // Eggs or beans alongside meat or fish are a side player, not the main protein
      if (protein.length > 1) protein = protein.filter(p => p !== "Beans, tofu & eggs");
      if (!protein.length) protein = ["No meat or eggs"];
    }
    let carb = asList(r.carb);
    if (!carb) {
      carb = component ? [] : CARBS.filter(([, re]) => re.test(ing)).map(([n]) => n);
      if (!carb.length) carb = ["Low-carb / veggie"];
    }
    return { time: timeBucket(r), protein, carb };
  }

  function timeLabel(r){
    const parts = [];
    if (r.prep) parts.push(`<span>Prep ${esc(r.prep)}</span>`);
    if (r.cook && r.cook !== "None") parts.push(`<span>Cook ${esc(r.cook)}</span>`);
    return parts.join("");
  }

  // The recipe card shown in the grid
  function cardHTML(r, href){
    return `
      <a class="card${r.image ? " has-photo" : ""}" href="${esc(href || "#")}">
        ${r.image ? `<span class="card-photo" data-photo><img src="${esc(imgSrc(r))}" alt="" loading="lazy" ${hideOnError}></span>` : ""}
        <span class="cat">${esc(r.category)}${r.replaces ? ` <span class="swap-badge">Swap</span>` : ""}</span>
        <h3>${esc(r.title)}</h3>
        <p>${esc(r.summary)}</p>
        <div class="meta">${timeLabel(r)}${r.servings ? `<span>Serves ${esc(r.servings)}</span>` : ""}</div>
      </a>`;
  }

  // The full recipe view (everything below the Back / Print buttons)
  function detailHTML(r){
    return `
      <div class="detail-head${r.image ? " has-photo" : ""}">
        <div>
          <div class="eyebrow" style="margin-top:22px">${esc(r.category)}</div>
          <h2>${esc(r.title)}</h2>
          ${r.summary ? `<p class="summary">${esc(r.summary)}</p>` : ""}
          ${r.replaces ? `<p class="replaces"><span class="swap-badge">Swap</span> Homemade swap for: <b>${esc(r.replaces)}</b></p>` : ""}
          <div class="facts">
            ${r.prep ? `<div><b>${esc(r.prep)}</b>Prep</div>` : ""}
            ${r.cook ? `<div><b>${esc(r.cook)}</b>Cook</div>` : ""}
            ${r.servings ? `<div><b>${esc(r.servings)}</b>Servings</div>` : ""}
          </div>
        </div>
        ${r.image ? `<figure class="recipe-photo" data-photo><img src="${esc(imgSrc(r))}" alt="${esc(r.imageAlt || r.title)}" ${hideOnError}></figure>` : ""}
      </div>
      <div class="cols">
        <section><h3>Ingredients</h3><ul class="ing">${(r.ingredients||[]).map(i => /:\s*$/.test(i) ? `<li class="ing-group">${esc(i.replace(/:\s*$/, ""))}</li>` : `<li>${linkify(i, slug(r.title))}</li>`).join("")}</ul></section>
        <section><h3>Steps</h3><ol class="steps">${(r.steps||[]).map(s => `<li>${linkify(s, slug(r.title))}</li>`).join("")}</ol></section>
      </div>
      ${r.heartNotes ? `<div class="heart-note"><span class="heart-icon" aria-hidden="true">&#9829;</span><div><strong>Heart-healthy notes</strong><p>${linkify(r.heartNotes, slug(r.title))}</p></div></div>` : ""}
      ${r.notes ? `<div class="note"><strong>Notes</strong>${notesHTML(r.notes, slug(r.title))}</div>` : ""}
      ${(r.tags||[]).length ? `<div class="tags">${r.tags.map(t => `<span>${esc(t)}</span>`).join("")}</div>` : ""}`;
  }

  return { esc, slug, cardHTML, detailHTML, setRecipes, facets, totalMinutes, notesHTML };
})();
