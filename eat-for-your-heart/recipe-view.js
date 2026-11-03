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
        <section><h3>Ingredients</h3><ul class="ing">${(r.ingredients||[]).map(i => /:\s*$/.test(i) ? `<li class="ing-group">${esc(i.replace(/:\s*$/, ""))}</li>` : `<li>${esc(i)}</li>`).join("")}</ul></section>
        <section><h3>Steps</h3><ol class="steps">${(r.steps||[]).map(s => `<li>${esc(s)}</li>`).join("")}</ol></section>
      </div>
      ${r.heartNotes ? `<div class="heart-note"><span class="heart-icon" aria-hidden="true">&#9829;</span><div><strong>Heart-healthy notes</strong><p>${esc(r.heartNotes)}</p></div></div>` : ""}
      ${r.notes ? `<div class="note"><strong>Note:</strong> ${esc(r.notes)}</div>` : ""}
      ${(r.tags||[]).length ? `<div class="tags">${r.tags.map(t => `<span>${esc(t)}</span>`).join("")}</div>` : ""}`;
  }

  return { esc, slug, cardHTML, detailHTML };
})();
