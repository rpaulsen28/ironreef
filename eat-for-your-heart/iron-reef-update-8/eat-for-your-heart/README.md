# Eat for your Heart

A searchable collection of heart-healthy recipes: low or no salt, lower in saturated fat, cholesterol-conscious, plus homemade swaps for salty store-bought staples. It lives at `ironreefllc.com/eat-for-your-heart/`, but everything it needs is inside this folder, so it can be moved to its own website later.

## Files

| File | What it is |
|---|---|
| `index.html` | The recipe page. You rarely need to touch it. |
| `recipes.json` | **All the recipes.** Edit this file to add, change or remove recipes. |
| `recipes.css` | The look of the recipe pages (colors, fonts, layout). |
| `recipe-view.js` | How a recipe card and a full recipe are laid out. Also used by the Recipe Editor's preview. |
| `favicon.png`, `apple-touch-icon.png` | Browser tab and phone home-screen icons. |

## Easiest way: the Recipe Editor

`Recipe Editor.html` lives on your computer, not on the website, so visitors can't use it. Double-click it to open it in your browser, fill in the form, and click **Publish to site**. The live site updates in about a minute. The first time, it walks you through connecting it to GitHub with a private key that only works for this repository.

## Add a recipe by hand on GitHub

1. On GitHub, open `eat-for-your-heart/recipes.json` and click the pencil icon.
2. Copy an existing recipe, from its opening `{` to its closing `},`, and paste it right after it.
3. Change the text inside the quotes. Click **Commit changes**. The live site updates in about a minute.

Each recipe looks like this:

```json
{
  "title": "Recipe Name",
  "category": "Dinner",
  "summary": "One sentence shown on the recipe card.",
  "prep": "10 min",
  "cook": "20 min",
  "servings": 4,
  "tags": ["quick", "chicken"],
  "ingredients": [
    "1 cup something",
    "2 tbsp something else"
  ],
  "steps": [
    "First step.",
    "Second step."
  ],
  "notes": "Optional tip. Leave as \"\" if none.",
  "replaces": "Optional: the store-bought item this recipe replaces (adds a Swap badge). Leave as \"\" if none.",
  "heartNotes": "Why it's heart-healthy, or tips to cut salt and fat. Leave as \"\" if none."
},
```

Rules that keep the file working:

- Every recipe except the last one ends with `},` (with a comma). The last recipe ends with `}` (no comma).
- Every line inside a list (`ingredients`, `steps`, `tags`) ends with a comma except the last line.
- Text goes inside straight double quotes `"like this"`. To use a quote mark inside text, write `\"`.
- Categories that already exist: Breakfast, Lunch, Dinner, Sides, Snacks, Desserts, Drinks. A new category name creates a new filter button automatically.

If the page says the recipe list couldn't be read, there's a missing or extra comma, quote or bracket. GitHub's editor shows a red marker on the problem line.

## Make it a separate website

1. Copy this whole `eat-for-your-heart` folder into a new GitHub repository, so `index.html` sits at the top level.
2. In `index.html`, find **SITE SETTINGS** near the bottom. Select everything from `parent: {` down to the `}` just above `};` and replace it with `parent: null`.
3. Connect the new repository to a new Cloudflare Pages project and give it its own domain.

With `parent: null`, the Iron Reef logo, menu and footer disappear and the page shows "Eat for your Heart" as its own brand. The colors are set at the top of `index.html` under `:root` if you want a new look.
