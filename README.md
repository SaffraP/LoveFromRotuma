# Love From Rotuma — Website v1.0 (Boutique Edition)

A responsive website for Love From Rotuma: handmade, made-to-order dresses crafted by Rotuman women in Fiji.

Plain HTML / CSS / JavaScript. No build tools, no frameworks, no monthly hosting cost — designed to run on GitHub Pages.

## Project structure

```
love-from-rotuma/
├── index.html          Homepage
├── dresses.html        Made-to-order dress catalog (reads data/dresses.json)
├── premade.html        Ready-made dresses (reads data/premade.json)
├── plants.html         Coming soon page
├── about.html          Akanisi & Emerald's story
├── order.html          Order request form (submits to Google Apps Script)
├── faq.html            FAQ accordion
├── contact.html        Contact form + placeholder contact details
├── terms.html          Terms & Conditions
├── privacy.html        Privacy Policy
├── css/
│   ├── style.css       Design tokens (colors, type) + all component styles
│   └── responsive.css  Mobile breakpoints
├── js/
│   ├── app.js           Nav, FAQ accordion, renders dress/premade cards from JSON
│   ├── order-form.js     Order form logic + submission + confirmation
│   └── include-footer.js Shared footer (edit once, updates every page)
├── data/
│   ├── dresses.json     Dress collections, styles, sizing chart
│   ├── fabrics.json     Fabric options
│   └── premade.json     Ready-made dress listings
├── images/               Replace placeholder SVGs here with real photos
└── backend/
    ├── Code.gs           Google Apps Script — order logging + email confirmations
    └── README.md         Step-by-step backend setup guide
```

## Updating the site (no coding required for most changes)

### Add or edit a made-to-order dress style
Edit `data/dresses.json`. Add a new object inside the relevant collection's `styles` array, following the same pattern as the existing entries. Save, commit, and push — the dresses page updates automatically.

### Add or remove a premade (ready-made) dress
Edit `data/premade.json`. Add a new object with `name`, `image`, `size`, `price`, and `status` (`"available"` or `"sold"`). Delete an entry once it's sold and you don't want to keep a record of it, or just set `status` to `"sold"` to keep history.

**Marking a premade dress as sold:** When someone requests a premade dress through the order form, the owner notification email flags it clearly and reminds you to update its status. Since deposits are confirmed manually anyway (there's no online payment yet), the workflow is: customer requests it → you confirm the M-PAiSA deposit → you edit that item's `"status"` to `"sold"` in `data/premade.json` and push the change. The site rebuilds and the dress disappears from "available" within a minute or two of pushing. There's currently no automatic locking the moment someone submits a request, so if two people request the same dress before you've updated the status, you'll need to handle that manually (contact whichever one you can't fulfill).

### Add or update a fabric
Edit `data/fabrics.json`. Set `"available": false` for anything currently out of stock — it'll still show in the dropdown but flagged as "check availability," matching your policy of contacting customers about unavailable fabrics.

### Change contact details, social links, phone, or M-PAiSA number
- Contact details: `contact.html`
- Social links: `js/include-footer.js`
- M-PAiSA number/name: `Akanisi Memaofa (+679-934-6552)` — appears in `order.html`, `js/order-form.js`, `backend/Code.gs`. Search each file for `Akanisi Memaofa` if it ever needs to change again.

### Replace placeholder photos
Drop real photos into the matching `images/` subfolder and update the `image` path in the relevant `.html` or `.json` file. Recommended: compress photos before uploading (e.g. via squoosh.app) so the site stays fast.

## How the order form works

1. Customer fills out `order.html`.
2. On submit, the form sends the order to a Google Apps Script Web App (see `backend/README.md` for one-time setup).
3. The script logs the order to a Google Sheet, emails Akanisi a notification, and — if the customer gave an email — emails them a confirmation.
4. Every customer also sees an on-screen confirmation immediately, whether or not they gave an email.

**This must be set up once before the order form will actually send data anywhere.** Until then, the form will still show the on-screen confirmation (so the site doesn't look broken during testing), but no email or Sheet entry will be created. Follow `backend/README.md` to connect it.

## Publishing (GitHub Pages)

See `SETUP.md` for account setup and step-by-step deployment instructions.

## Adding real photos

### Akanisi & Emerald (About page + homepage)
Upload as:
- `images/team/akanisi.jpg`
- `images/team/emerald.jpg`

The pages already point to these exact filenames — once uploaded with those names, they'll appear automatically, no code changes needed. Portrait-orientation photos work best (roughly 4:5, e.g. 1000×1250px).

### Dress styles — silhouette + gallery photos
Each dress style in `data/dresses.json` has two image fields:
- `"image"` — the single photo used on the catalog card. **Set this to your blacked-out silhouette/shape photo** — this is what customers see while browsing and choosing a style.
- `"gallery"` — an array of photo paths shown when someone clicks "View Photos" or the card image. **Put the silhouette first, then your model photos in different patterns**, e.g.:
  ```json
  "image": "images/dresses/a-line-silhouette.jpg",
  "gallery": [
    "images/dresses/a-line-silhouette.jpg",
    "images/dresses/a-line-floral-1.jpg",
    "images/dresses/a-line-stripe-1.jpg"
  ]
  ```
  Upload photos into `images/dresses/` (any filenames you like — just make sure the paths in the JSON match exactly), then edit the `image` and `gallery` fields for that style. The gallery viewer has arrows/swipe between photos automatically — no extra setup needed.

### Fabrics — colors and patterns
Each fabric in `data/fabrics.json` has an `"image"` field. Upload solid-color swatches and pattern swatches into `images/fabrics/`, then point each fabric's `"image"` to its file. The existing `"category"` field ("Standard" for solids vs "By Availability" for prints) already separates these into the two groups you described — add more fabric entries the same way if you have more than the current five.

Recommended: square-ish photos (roughly 800×800px) for fabric swatches, and compress everything before uploading (e.g. via squoosh.app) so the site stays fast to load.
- Customer reviews
- Plant inventory
- Gift vouchers
- Online M-PAiSA payment integration (if it becomes available)
- English/Rotuman language toggle
- Admin dashboard / analytics
