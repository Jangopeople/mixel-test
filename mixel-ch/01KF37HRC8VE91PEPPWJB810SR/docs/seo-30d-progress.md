# Mixel.ch SEO 30-Day Progress (Code + Technical)

Date: 2026-03-02

## Completed in this implementation sprint

### Week 1 - Technical foundation
- Added dynamic SEO management for all pages:
  - canonical URLs
  - hreflang (`de`, `en`, `fr`, `x-default`)
  - Open Graph and Twitter cards
  - robots meta (`index/follow` and `noindex/nofollow`)
- Added structured data:
  - `Organization` + `LocalBusiness` on homepage
  - `Service` schema on all service pages
- Added `robots.txt` and `sitemap.xml`
- Added noindex protection for restricted accounting/auth/404 pages
- Added local crawl run (linkinator) and documented status

### Week 2 - On-page optimization
- Unique SEO titles/descriptions wired page-by-page through `SeoHead`
- Added breadcrumbs on all service pages
- Added related-services internal linking blocks on all service pages
- Fixed broken footer anchor by adding a real `#about` section
- Added on-site search (`Ctrl/Cmd+K`) for pages, services and client portals
- Added lazy loading + async decoding to non-critical images
- Optimized oversized image assets:
  - `mixel-logo.png` reduced from ~3.9MB to ~112KB
  - `favicon.png` reduced from ~3.9MB to ~28KB
- Added testimonials section and team expertise section on homepage
- Added optimized contact form block with required business lead fields

### Week 3 - Trust signals
- Expanded trust content with testimonials and team bios
- Partner/client proof area retained and optimized with lazy-loaded media
- Added FAQ section and FAQ structured data for richer search context
- Added interactive managed-IT cost estimator for conversion support
- Added sticky quick-contact actions (call, email, WhatsApp)

### Week 4 - Analytics & multilingual
- GA4-ready route tracking:
  - automatic page_view events
  - click events via `data-analytics-event`
- Added `language` meta handling by current locale
- Hreflang set for multilingual routing

## Technical audit snapshot

### Crawl
- Tool: `linkinator`
- Result: local crawl completed successfully on previewed routes; no broken links in discovered set.

### Lighthouse baseline (`/de` local preview)
- Performance: **77**
- Accessibility: **92**
- Best Practices: **100**
- SEO: **100**

Top opportunity:
- Reduce unused JavaScript (route-level code splitting was implemented to improve this).

## Items still requiring platform/account actions (outside repo code)
- Google Search Console account verification and sitemap submission
- Google Business Profile claim/verification and profile optimization
- External citation submissions (local.ch/search.ch/Yelp/etc.)
- GA4 property setup, conversion goals/dashboard, GSC linkage
- Ongoing review/reputation operations

## External checks executed on 2026-03-02
- `robots.txt` and `sitemap.xml` are publicly accessible at:
  - `https://www.mixel.ch/robots.txt`
  - `https://www.mixel.ch/sitemap.xml`
- Google sitemap ping endpoint is deprecated and no longer a valid submission path.
- Directory discoverability confirmed:
  - search.ch listing found for MIXEL IT and Corporate Services GmbH in Höri
  - local.ch listing found for MIXEL IT and Corporate Services GmbH in Höri

## Environment variables to set
- `VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX`
- `VITE_GSC_VERIFICATION=<google-site-verification-token>`
