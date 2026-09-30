# FitGenix Gym — Website + Admin Panel

A dark, neon-red themed gym landing page (hero, stats, why-choose-us, equipment, training grid,
"train hard / stay strong" marquee ribbons, schedule, trainers, video banner, testimonials,
pricing, offers, gallery, before/after sliders, FAQ, fitness calculators, map, booking, footer)
**plus a built-in admin panel that lets you edit everything on the page** — text, images, prices,
plans, contact details and colours.

## How to run

This is a plain HTML/CSS/JS site — no build step required.

**Option 1 — just open it**
Double-click `index.html` (or right-click → Open with → your browser).
Open `admin.html` the same way to reach the admin panel.

**Option 2 — run a local server (recommended: file:// can block browser storage)**
```
python -m http.server 8000
```
Then open http://localhost:8000 for the site and http://localhost:8000/admin.html for the panel.

With Node installed: `npx serve .`

## Structure
```
├── index.html        # website markup (with data-cms hooks for editable content)
├── admin.html        # admin panel (login + editor)
├── css/
│   ├── style.css     # website theme, layout, responsive rules
│   └── admin.css     # admin panel styles
├── js/
│   ├── content.js    # default content + load/save (localStorage)
│   ├── render.js     # injects saved content into index.html
│   ├── script.js     # nav, counters, FAQ, lightbox, calculators, booking
│   └── admin.js      # schema-driven editor behind admin.html
├── img/              # logo + gallery photos
└── README.md
```

## Admin panel

1. Open `admin.html` (there's also an **Admin** link in the website footer).
2. Default password: **`admin123`** — change it under *Settings* after your first login.
3. Pick a section on the left (Brand & Theme, Menu & Hero, Stats, Why Choose Us, Equipment,
   Training, Ribbons, Schedule, Trainers, Video Banner, Reviews, Pricing, Offers, Gallery,
   Transformations, FAQ, Calculators, Booking, Contact & Footer, Settings).
4. Edit any field — changes **auto-save** as you type. Lists (plans, trainers, gallery photos,
   FAQ, schedule…) can be added, reordered (↑ ↓) and deleted item by item.
5. Use **View site** or the **Preview** button to check the result, then reload the site.

Images can be set with a path/URL (e.g. `img/gallery/gym-1.jpg`) or uploaded from your computer
with the **Upload image** button. Uploads are stored inside your saved content, so keep them
reasonably small (under ~1 MB each) — the browser gives you about 5 MB total.

Toolbar buttons: **Preview**, **View site**, **Reset** (back to the original content) and **Log out**.

### Where do edits live?

The panel writes to the browser's `localStorage`, so your changes show instantly on the site
**in that browser on that device**. They are not sent to a server, so other visitors keep seeing
the original content until the content store is connected to a real backend/CMS — or the new
values are copied into `js/content.js` (its `DEFAULTS` object) and the file redeployed.

Because the edits live in the browser, clearing your browser data will remove them and the site
falls back to the defaults in `js/content.js`.

The password screen is a front-end-only lock — it keeps casual visitors out of the editor, but it
is **not** real security (anyone can read the file). Put the live site behind server auth, or move
the content to a backend, before handing the panel to staff on a public URL.

## Notes
- Theme colours/fonts live at the top of `css/style.css` under `:root`; the admin panel's
  *Brand & Theme* section overrides the colours at runtime.
- Fully responsive (desktop → tablet → mobile), with a working mobile hamburger menu, floating
  WhatsApp/Call buttons and a mobile action bar.
- The booking form opens WhatsApp with the details pre-filled, and the subscribe box is a
  front-end demo — hook them up to your form/email service when ready.
- Files to touch when customising: `js/content.js` holds every default (brand, hero, plans,
  contact…) in one object, and `js/render.js` maps each key onto the markup via
  `data-cms`, `data-cms-heading`, `data-cms-src`, `data-cms-href` and `data-cms-wa` attributes.
