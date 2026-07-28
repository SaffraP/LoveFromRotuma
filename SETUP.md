# Accounts & Setup Checklist

## 1. GitHub (you already have this)

**Repo configuration:**
- **Name:** `love-from-rotuma` (or `lovefromrotuma-website` — either is fine).
- **Visibility:** Public. (GitHub Pages' free tier requires a public repo unless you're on GitHub Pro/Team, which isn't necessary here.) Public just means the *code* is visible — it doesn't expose any customer data, since orders live in a private Google Sheet, not in the repo.
- **Branch:** `main` is fine as the default.
- No need for a `.gitignore` beyond the default — there are no dependencies or build artifacts in this project.

**To publish with GitHub Pages:**
1. Push this project's files to the repo (root of the repo, not a subfolder — so `index.html` sits at the top level).
2. Go to the repo's **Settings → Pages**.
3. Under "Build and deployment," set **Source: Deploy from a branch**, **Branch: main**, folder **/ (root)**.
4. Save. GitHub will give you a URL like `https://yourusername.github.io/love-from-rotuma/` within a minute or two.

## 2. Google Account (you're setting up Gmail — this covers what it's used for)

The same Google account/Gmail is used for two things:
1. **Sending order confirmation and notification emails** (via Gmail's own sending limits — plenty for a small business; ~500 emails/day free).
2. **Hosting the free order-logging backend** (Google Sheets + Apps Script — see `backend/README.md`).

Recommendation: use one dedicated Gmail specifically for the business (e.g. `lovefromrotuma@gmail.com`) rather than a personal account — makes it easier to hand off or share access later, and keeps business records separate from personal email.

Once that Gmail exists:
- Create the Google Sheet under that account.
- Follow `backend/README.md` exactly — it walks through creating the Sheet, pasting the script, and deploying it.

## 3. Domain (optional, later)

You mentioned liking `lovefromrotuma.com`. This isn't required to launch — GitHub Pages gives you a free working URL immediately. When you're ready:
1. Buy the domain through any registrar (Namecheap, Google Domains successor Squarespace Domains, etc. — happy to compare options when you're ready).
2. In the registrar's DNS settings, point it at GitHub Pages (GitHub's docs walk through the exact A records / CNAME needed).
3. Add the custom domain in the repo's **Settings → Pages**.

## 4. What you do NOT need yet
- No paid hosting.
- No e-commerce platform (Shopify, etc.) — the order-request-form approach avoids that cost entirely.
- No SMS/WhatsApp API — email is the v1 notification channel.

## Summary of what to send me once ready
- The Gmail address you've set up (so I can tell you exactly what to put in `Code.gs` and where).
- Confirmation once the GitHub repo exists and I can tell you the exact push commands, or you can just upload the files directly through GitHub's web interface if you're not using git from the command line yet.
