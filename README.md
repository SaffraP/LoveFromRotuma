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

### Add or update a fabric
Edit `data/fabrics.json`. Set `"available": false` for anything currently out of stock — it'll still show in the dropdown but flagged as "check availability," matching your policy of contacting customers about unavailable fabrics.

### Change contact details, social links, phone, or M-PAiSA number
- Contact details: `contact.html`
- Social links: `js/include-footer.js`
- M-PAiSA number/name: appears in `order.html`, `js/order-form.js`, `backend/Code.gs`, and `terms.html` — search each file for `9999999` and `Akanisi Memaofa` to update everywhere at once.

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

## Future features (not built yet, but the structure supports adding them without a rebuild)
- Customer reviews
- Plant inventory
- Gift vouchers
- Online M-PAiSA payment integration (if it becomes available)
- English/Rotuman language toggle
- Admin dashboard / analytics
