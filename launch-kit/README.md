# Cosmic Ice Cream · Launch checklist

Status of every item on your list. "Done in design" = already built into the Cosmic canvas.

| Item | Status | Where |
|---|---|---|
| Privacy policy | Done in design | Privacy page (fill `[date]`, get reviewed) |
| Terms & conditions | Done in design | Terms page, incl. refund + delivery sections (fill `[X]` days) |
| Remove frontend secrets | Clean | Site has no API keys. Keep form endpoint keys on the server; `.htaccess` blocks `.env`, `.git`, logs |
| Enforce HTTPS | File ready | `.htaccess` (301 to https + HSTS) |
| Cookie consent banner | Done in design | Bottom-left banner, Accept / Only essential, remembers choice |
| Meta titles / descriptions | File ready | `head-tags.html` (all 5 pages listed) |
| Social preview image | File ready | `og-image.jpg` 1200×630 |
| Favicon | File ready | `favicon.ico`, `favicon.png`, `apple-touch-icon.png` (swap for real logo later) |
| Sitemap + robots.txt | File ready | `sitemap.xml`, `robots.txt` |
| Image alt text | Done in design | Every content image has alt text; decorative ones are empty |
| Image compression | Done | All photos converted to WebP (≈150 to 300 KB each) |
| Page load speed check | After launch | Run pagespeed.web.dev on the live URL; target 85+ mobile |
| Color contrast fixes | Done in design | Body text, captions, hints and footer raised to readable levels |
| Mobile responsiveness | Done in design | Layouts collapse at 1000px and 760px, sticky Order Now bar on mobile |
| Custom 404 page | Done in design | 404 page + `ErrorDocument` in `.htaccess` |
| Broken link fixes | Done in design | Legal links, Instagram, WhatsApp, call, directions all point to real destinations |
| Form validation | Done in design | Name, 10-digit Indian mobile, no past dates, inline errors |
| Spam protection | Done in design | Hidden honeypot field + 3-second minimum fill time. Add Cloudflare Turnstile when the form goes live on a server |
| Analytics setup | File ready | GA4 snippet in `head-tags.html`, loads only after cookie Accept. Add your `G-` ID |
| Single clear CTA | Done in design | Hero has one button (Order Now); "View menu" is a text link |

## Before going live
1. Replace `cosmicicecream.in` in all files if your domain is different.
2. Upload `robots.txt`, `sitemap.xml`, `og-image.jpg`, favicons and `.htaccess` to the site root.
3. Submit `sitemap.xml` in Google Search Console and create a Google Business Profile for Marine Drive.
4. Connect the booking form to a backend (Formspree, Google Sheet, or email) so enquiries actually arrive.
