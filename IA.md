# https://www.glaze.app (sitemap + Playwright recon); clone at this project root

Source: https://www.glaze.app (sitemap + Playwright recon); clone at this project root
Status: **built: all 13 templates exist in src/; app pages use a 265-app snapshot, long text pages use placeholder prose**
1953 routes · 13 templates · 19 unique sections

> Generated from `ia.json` by `build.mjs`. Edit the JSON, not this file.

## Shape of the site

The largest 3 templates (App detail, Store category, Persona landing) account for 1937 of 1953 routes (99%). The remaining 16 routes span 10 templates.

| template | routes | share |
|---|---:|---:|
| App detail | 1924 | 99% |
| Store category | 8 | 0% |
| Persona landing | 5 | 0% |
| Blog post | 4 | 0% |
| Legal document | 3 | 0% |
| Awards | 2 | 0% |
| Landing page | 1 | 0% |
| Not found | 1 | 0% |
| Pricing | 1 | 0% |
| Download | 1 | 0% |
| Blog index | 1 | 0% |
| Changelog | 1 | 0% |
| Store index | 1 | 0% |

## Page chrome

**1953 routes carry chrome = `full`** — Landing page, Persona landing, Not found, Pricing, Download, Awards, Legal document, Blog index, Blog post, Changelog, Store index, Store category, App detail.

## Sections by reuse

How widely a section is shared determines whether it belongs in a shared
component library or stays local to its page.

| section | category | templates | routes | implementation | scope |
|---|---|---:|---:|---|---|
| `shell.navbar` | SHELL | 13 | 1953 | `src/components/Navbar.jsx` | Present on all 1953 routes, including the 404. |
| `shell.footer` | SHELL | 13 | 1953 | `src/components/Footer.jsx` | Present on all 1953 routes, including the 404. |
| `store.app-detail` | STORE | 1 | 1924 | `src/pages/AppPage.jsx` | Every /app/{slug} route, 1924 in total. |
| `store.category-nav` | STORE | 2 | 9 | `src/pages/Store.jsx` | The store index plus the 8 category routes, 9 routes in total. |
| `store.app-grid` | STORE | 2 | 9 | `src/pages/Store.jsx` | The store index plus the 8 category routes, 9 routes in total. |
| `shell.youtube-overlay` | SHELL | 2 | 6 | `src/components/YouTubeOverlay.jsx` | Carried by the landing page and the 5 persona routes, 6 routes in total. |
| `hero.landing-hero` | HERO | 2 | 6 | `src/components/Hero.jsx` | Landing page plus the 5 persona routes, 6 routes in total. |
| `showcase.persona-tabs` | SHOWCASE | 2 | 6 | `src/components/PersonaShowcase.jsx` | Landing page plus the 5 persona routes, 6 routes in total. |
| `features.feature-grid` | FEATURES | 2 | 6 | `src/components/Features.jsx` | Landing page plus the 5 persona routes, 6 routes in total. |
| `support.faq` | SUPPORT | 2 | 6 | `src/components/FAQ.jsx` | Landing page plus the 5 persona routes, 6 routes in total. |
| `cta.download-icon` | CTA | 2 | 6 | `src/components/DownloadCTA.jsx` | Landing page plus the 5 persona routes, 6 routes in total. |
| `content.article-body` | CONTENT | 1 | 4 | `src/pages/BlogPost.jsx` | The 4 blog post routes. |
| `content.legal-document` | CONTENT | 1 | 3 | `src/pages/LegalPage.jsx` | The 3 legal routes: terms, privacy and acceptable use. |
| `content.awards-body` | CONTENT | 1 | 2 | `src/pages/Awards.jsx` | The 2 awards routes. |
| `cta.download-page` | CTA | 1 | 1 | `src/pages/Download.jsx` | Only the single /download route. |
| `content.not-found-block` | CONTENT | 1 | 1 | `src/pages/NotFoundPage.jsx` | The catch-all 404 route, which also serves /m and the 6 persona-style slugs that do not exist upstream. |
| `content.post-list` | CONTENT | 1 | 1 | `src/pages/BlogIndex.jsx` | Only the single /blog route. |
| `content.changelog-entries` | CONTENT | 1 | 1 | `src/pages/Changelog.jsx` | Only the single /changelog route. |
| `commerce.pricing-plans` | COMMERCE | 1 | 1 | `src/pages/Pricing.jsx` | Only the single /pricing route. |

**10 shared sections** appear in more than one template and belong in a component library.

**9 single-use sections** appear in exactly one template. Building these
as "reusable" components up front would be speculative — keep them page-local
until a second caller actually appears.

## Templates

### Landing page — `template.landing`

1 route · `/` · chrome: **full**

| # | category | section | |
|---:|---|---|---|
| 1 | SHELL | `shell.navbar` | shared ×13 |
| 2 | HERO | `hero.landing-hero` | shared ×2 |
| 3 | SHOWCASE | `showcase.persona-tabs` | shared ×2 |
| 4 | FEATURES | `features.feature-grid` | shared ×2 |
| 5 | SUPPORT | `support.faq` | shared ×2 |
| 6 | CTA | `cta.download-icon` | shared ×2 |
| 7 | SHELL | `shell.footer` | shared ×13 |
| 8 | SHELL | `shell.youtube-overlay` | shared ×2 |

### Persona landing — `template.persona`

5 routes · `/designers`, `/product-managers`, `/engineers`, `/creators`, `/teams` · chrome: **full**

| # | category | section | |
|---:|---|---|---|
| 1 | SHELL | `shell.navbar` | shared ×13 |
| 2 | HERO | `hero.landing-hero` | shared ×2 |
| 3 | SHOWCASE | `showcase.persona-tabs` | shared ×2 |
| 4 | FEATURES | `features.feature-grid` | shared ×2 |
| 5 | SUPPORT | `support.faq` | shared ×2 |
| 6 | CTA | `cta.download-icon` | shared ×2 |
| 7 | SHELL | `shell.footer` | shared ×13 |
| 8 | SHELL | `shell.youtube-overlay` | shared ×2 |

### Not found — `template.not-found`

1 route · `/*` · chrome: **full**

| # | category | section | |
|---:|---|---|---|
| 1 | SHELL | `shell.navbar` | shared ×13 |
| 2 | CONTENT | `content.not-found-block` | page-local |
| 3 | SHELL | `shell.footer` | shared ×13 |

### Pricing — `template.pricing`

1 route · `/pricing` · chrome: **full**

| # | category | section | |
|---:|---|---|---|
| 1 | SHELL | `shell.navbar` | shared ×13 |
| 2 | COMMERCE | `commerce.pricing-plans` | page-local |
| 3 | SHELL | `shell.footer` | shared ×13 |

### Download — `template.download`

1 route · `/download` · chrome: **full**

| # | category | section | |
|---:|---|---|---|
| 1 | SHELL | `shell.navbar` | shared ×13 |
| 2 | CTA | `cta.download-page` | page-local |
| 3 | SHELL | `shell.footer` | shared ×13 |

### Awards — `template.awards`

2 routes · `/awards`, `/awards/terms` · chrome: **full**

| # | category | section | |
|---:|---|---|---|
| 1 | SHELL | `shell.navbar` | shared ×13 |
| 2 | CONTENT | `content.awards-body` | page-local |
| 3 | SHELL | `shell.footer` | shared ×13 |

### Legal document — `template.legal`

3 routes · `/terms`, `/privacy`, `/aup` · chrome: **full**

| # | category | section | |
|---:|---|---|---|
| 1 | SHELL | `shell.navbar` | shared ×13 |
| 2 | CONTENT | `content.legal-document` | page-local |
| 3 | SHELL | `shell.footer` | shared ×13 |

### Blog index — `template.blog-index`

1 route · `/blog` · chrome: **full**

| # | category | section | |
|---:|---|---|---|
| 1 | SHELL | `shell.navbar` | shared ×13 |
| 2 | CONTENT | `content.post-list` | page-local |
| 3 | SHELL | `shell.footer` | shared ×13 |

### Blog post — `template.blog-post`

4 routes · `/blog/how-teams-use-glaze`, `/blog/why-glaze-when-claude-code-and-codex-exist`, `/blog/affiliate-program`, `/blog/how-we-use-glaze-at-raycast` · chrome: **full**

| # | category | section | |
|---:|---|---|---|
| 1 | SHELL | `shell.navbar` | shared ×13 |
| 2 | CONTENT | `content.article-body` | page-local |
| 3 | SHELL | `shell.footer` | shared ×13 |

### Changelog — `template.changelog`

1 route · `/changelog` · chrome: **full**

| # | category | section | |
|---:|---|---|---|
| 1 | SHELL | `shell.navbar` | shared ×13 |
| 2 | CONTENT | `content.changelog-entries` | page-local |
| 3 | SHELL | `shell.footer` | shared ×13 |

### Store index — `template.store-index`

1 route · `/store` · chrome: **full**

| # | category | section | |
|---:|---|---|---|
| 1 | SHELL | `shell.navbar` | shared ×13 |
| 2 | STORE | `store.category-nav` | shared ×2 |
| 3 | STORE | `store.app-grid` | shared ×2 |
| 4 | SHELL | `shell.footer` | shared ×13 |

### Store category — `template.store-category`

8 routes · `/store/remixable`, `/store/developer-tools`, `/store/productivity`, `/store/utilities`, `/store/media`, `/store/design`, `/store/lifestyle`, `/store/games-and-fun` · chrome: **full**

| # | category | section | |
|---:|---|---|---|
| 1 | SHELL | `shell.navbar` | shared ×13 |
| 2 | STORE | `store.category-nav` | shared ×2 |
| 3 | STORE | `store.app-grid` | shared ×2 |
| 4 | SHELL | `shell.footer` | shared ×13 |

### App detail — `template.app-detail`

1924 routes · `/app/{slug}` (1–1924) · chrome: **full**

| # | category | section | |
|---:|---|---|---|
| 1 | SHELL | `shell.navbar` | shared ×13 |
| 2 | STORE | `store.app-detail` | page-local |
| 3 | SHELL | `shell.footer` | shared ×13 |

## Section reference

### SHELL

_Chrome shared across pages: navigation, footer, overlays._

**`shell.navbar`** — Fixed top navigation: glass pill on desktop (brand, Home, Pricing, Store, Blog, Changelog, Sign in) and a slide-down panel on mobile, with an active-link dot.

· Present on all 1953 routes, including the 404. · appears on 1953 routes · implemented by `src/components/Navbar.jsx`

**`shell.footer`** — Bottom footer with legal links, socials and the Raycast credit.

· Present on all 1953 routes, including the 404. · appears on 1953 routes · implemented by `src/components/Footer.jsx`

**`shell.youtube-overlay`** — Full-screen YouTube embed dialog opened from hero and feature demo buttons; locks scroll, closes on Esc or backdrop.

· Carried by the landing page and the 5 persona routes, 6 routes in total. · appears on 6 routes · implemented by `src/components/YouTubeOverlay.jsx`

### HERO

_Page-opening header block._

**`hero.landing-hero`** — Eyebrow, two-line headline, subtext, Download and Reinvent-your-wheel buttons, requirements note, autoplay loop video and three pillars; headline and subtext are swapped per persona route.

· Landing page plus the 5 persona routes, 6 routes in total. · appears on 6 routes · implemented by `src/components/Hero.jsx`

### SHOWCASE

_Product-in-use displays: app tabs, grids, listings._

**`showcase.persona-tabs`** — Six audience tabs (dropdown below 800px) each showing a four-app grid, with company logos on the team tab; the starting tab depends on the route.

· Landing page plus the 5 persona routes, 6 routes in total. · appears on 6 routes · implemented by `src/components/PersonaShowcase.jsx`

### FEATURES

_Capability explanation modules._

**`features.feature-grid`** — Six feature cards laid out 1 / 2 / 2 / 1, switching to mobile images below 800px.

· Landing page plus the 5 persona routes, 6 routes in total. · appears on 6 routes · implemented by `src/components/Features.jsx`

### SUPPORT

_Answers to common questions._

**`support.faq`** — Ten-question single-open accordion that dims to 15% opacity once scrolled past.

· Landing page plus the 5 persona routes, 6 routes in total. · appears on 6 routes · implemented by `src/components/FAQ.jsx`

### CTA

_Calls to download or act._

**`cta.download-icon`** — Large app icon that launches a burst of flying app icons on click, with the 'What will you build?' headline and download buttons.

· Landing page plus the 5 persona routes, 6 routes in total. · appears on 6 routes · implemented by `src/components/DownloadCTA.jsx`

**`cta.download-page`** — Dedicated download page with the installer call to action and system requirements.

· Only the single /download route. · appears on 1 routes · implemented by `src/pages/Download.jsx`

### CONTENT

_Body content of a page: documents, articles, changelog, error states._

**`content.not-found-block`** — Centered error state with the clickable app icon, 'Page not found' heading, one sentence and a Go Home button.

· The catch-all 404 route, which also serves /m and the 6 persona-style slugs that do not exist upstream. · appears on 1 routes · implemented by `src/pages/NotFoundPage.jsx`

**`content.legal-document`** — Long-form legal text in a 640px column: Inter 48px title, last-updated line, h2 and h3 headings, paragraphs, nested bullet lists and underlined links.

· The 3 legal routes: terms, privacy and acceptable use. · appears on 3 routes · implemented by `src/pages/LegalPage.jsx`

**`content.awards-body`** — Awards program page and its terms page content.

· The 2 awards routes. · appears on 2 routes · implemented by `src/pages/Awards.jsx`

**`content.post-list`** — Blog index listing of post cards with image, title, excerpt and date.

· Only the single /blog route. · appears on 1 routes · implemented by `src/pages/BlogIndex.jsx`

**`content.article-body`** — Blog post header (title, date, author, hero image) and prose body.

· The 4 blog post routes. · appears on 4 routes · implemented by `src/pages/BlogPost.jsx`

**`content.changelog-entries`** — Chronological list of release entries with version/date headers and media.

· Only the single /changelog route. · appears on 1 routes · implemented by `src/pages/Changelog.jsx`

### COMMERCE

_Plans and pricing._

**`commerce.pricing-plans`** — Plan comparison cards with prices and feature lists.

· Only the single /pricing route. · appears on 1 routes · implemented by `src/pages/Pricing.jsx`

### STORE

_App store browsing and app detail blocks._

**`store.category-nav`** — Row of store category links (remixable, developer tools, productivity, utilities, media, design, lifestyle, games and fun).

· The store index plus the 8 category routes, 9 routes in total. · appears on 9 routes · implemented by `src/pages/Store.jsx`

**`store.app-grid`** — Grid of app cards (icon, name, tagline, author) for the store index or one category.

· The store index plus the 8 category routes, 9 routes in total. · appears on 9 routes · implemented by `src/pages/Store.jsx`

**`store.app-detail`** — Single app page: icon, name, author, download and remix actions, screenshots and description.

· Every /app/{slug} route, 1924 in total. · appears on 1924 routes · implemented by `src/pages/AppPage.jsx`
