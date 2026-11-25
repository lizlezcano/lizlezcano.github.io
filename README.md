# lizlezcano.github.io

Website for **Liz Lezcano**: coaching 1:1 for people with TEA and TDAH, her Substack letters, and the resources she recommends.

Live at **https://lizlezcano.com/**

## Structure

| Path | What it is |
|---|---|
| `index.html` | Home: about, sessions, latest letters, resources teaser, upcoming courses |
| `recursos.html` | Hand-made Amazon storefront |
| `css/style.css` | All styles, built on Liz's design system tokens (wine/blush, Playfair Display, Outfit, Mrs Saint Delafield) |
| `js/config.js` | Site settings: Calendly link, Substack URL, Amazon tag |
| `js/script.js` | Menu, animations, letters section |
| `js/store.js` | Renders the storefront from `data/products.json` |
| `data/letters.json` | Latest Substack letters shown on the home page |
| `data/products.json` | Products in the storefront |
| `scripts/fetch_letters.py` | Refreshes `data/letters.json` from the Substack feed |

Plain HTML, CSS and JS: no build step, no dependencies.

## Common updates

**Add a product.** In `data/products.json`, add an entry (or replace one marked `"example": true`):

```json
{
  "example": false,
  "category": "sensorial",
  "name": "Product name",
  "note": "Why Liz recommends it, in her words.",
  "asin": "B0D3V61JC8",
  "search": "",
  "image": "images/products/product-name.jpg"
}
```

The `asin` is the 10-character ID in the Amazon URL (`amazon.com/dp/XXXXXXXXXX`). Categories are `sensorial`, `enfoque`, `escritura` and `libros`.

**Amazon affiliate tag.** Set `amazonTag` in `js/config.js`. All product links pick it up, and the affiliate disclosure on the storefront appears automatically.

**Booking link.** Change `bookingUrl` in `js/config.js`. Every "Reserva una sesión" button uses it.

**Refresh the letters** after a new Substack post:

```sh
python3 scripts/fetch_letters.py
git add data/letters.json && git commit -m "chore: update letters" && git push
```

## Run locally

```sh
python3 -m http.server 8000
```

Then open http://localhost:8000. Opening `index.html` directly from disk won't load the letters or products, because browsers block `fetch` on `file://`.

## Deploy

Hosted on **Cloudflare Workers** (static assets, project `lizlezcano-github-io`), connected to this repo. Every push to `main` deploys to https://lizlezcano.com in under a minute. There's no build step.

Cloudflare serves pages without the `.html` extension (`/recursos.html` redirects to `/recursos`).

GitHub Pages is still enabled on purpose: a small script in each page sends visitors of the old `lizlezcano.github.io` address to the same page on `lizlezcano.com`. Don't turn it off, or old links will 404.
