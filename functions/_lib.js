// Shared helpers for Cloudflare Pages Functions on ironreefllc.com.
export const SITE = "https://ironreefllc.com";
export const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
export const slug = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");

// Reads a static file from the deployed site (e.g. the recipes list).
export async function asset(context, path){
  const url = new URL(path, context.request.url);
  const res = await context.env.ASSETS.fetch(new Request(url.toString()));
  if (!res.ok) throw new Error(`asset ${path}: ${res.status}`);
  return res;
}

export async function recipes(context){
  const list = await (await asset(context, "/eat-for-your-heart/recipes.json")).json();
  return list.map(r => ({...r, id: slug(r.title)}));
}

// "1 hr 20 min" -> "PT1H20M". Returns "" for anything it can't read cleanly ("5 min + overnight").
export function isoDuration(s){
  if (!s || /\+|overnight|none|includes/i.test(s)) return "";
  const h = /(\d+)\s*hr/.exec(s), m = /(\d+)\s*min/.exec(s);
  if (!h && !m) return "";
  return "PT" + (h ? h[1] + "H" : "") + (m ? m[1] + "M" : "");
}
