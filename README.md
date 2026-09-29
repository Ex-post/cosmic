# Cosmic Ice Cream website

Static site. No build step, no dependencies.

## Run locally
```
npx serve .
```
Open http://localhost:3000

## Deploy on Vercel
1. Push this folder to a GitHub repo.
2. vercel.com > Add New Project > import the repo.
3. Framework preset: **Other**. Build command: none. Output directory: `.` (root).
4. Deploy. Then add your domain under Project > Settings > Domains (HTTPS is automatic).

## Before going live
- Replace `cosmicicecream.in` in all `.html` files, `sitemap.xml` and `robots.txt` if your domain differs.
- Add your Google Analytics ID: search `G-XXXXXXXXXX` in the `.html` files.
- Fill the `[bracketed]` parts in `privacy.html` and `terms.html`.
- Connect the booking form to a backend (Formspree, Google Sheet, email).

## Structure
- `index.html` home, `how-we-make-it.html`, `privacy.html`, `terms.html`, `404.html`
- `js/dc.js` tiny renderer that powers the interactive parts
- `assets/` images
