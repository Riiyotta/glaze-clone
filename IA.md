# https://www.glaze.app (sitemap + Playwright recon); clone at this project root

Source: https://www.glaze.app (sitemap + Playwright recon); clone at this project root
Status: **built: all 13 templates exist in src/; the route table is the clone's own (src/route-modules/*.js): 16 static routes, /blog/:slug (4 posts), /store/:category (8), /app/:slug (265-app snapshot) and the catch-all. Long-form pages are decomposed into header, body and footer-type sections (legal, article, release entries). The live sitemap lists 1924 app pages (1953 routes); the clone serves its 265-app snapshot.**
294 routes · 13 templates · 40 unique sections

> Generated from `ia.json` by `build.mjs`. Edit the JSON, not this file.

## Shape of the site

The largest 3 templates (App detail, Store category, Persona landing) account for 278 of 294 routes (95%). The remaining 16 routes span 10 templates.

| template | routes | share |
|---|---:|---:|
| App detail | 265 | 90% |
| Store category | 8 | 3% |
| Persona landing | 5 | 2% |
| Legal document | 4 | 1% |
| Blog post | 4 | 1% |
| Landing page | 1 | 0% |
| Not found | 1 | 0% |
| Pricing | 1 | 0% |
| Download | 1 | 0% |
| Awards | 1 | 0% |
| Blog index | 1 | 0% |
| Changelog | 1 | 0% |
| Store index | 1 | 0% |

## Page chrome

**293 routes carry chrome = `full`** — Landing page, Persona landing, Not found, Pricing, Awards, Legal document, Blog index, Blog post, Changelog, Store index, Store category, App detail.

**1 routes carry chrome = `nav-only`** — Download.

## Sections by reuse

How widely a section is shared determines whether it belongs in a shared
component library or stays local to its page.

| section | category | templates | routes | implementation | scope |
|---|---|---:|---:|---|---|
| `shell.navbar` | SHELL | 13 | 294 | `src/components/Navbar.jsx` | Every route (294 routes in total). |
| `shell.footer` | SHELL | 12 | 293 | `src/components/Footer.jsx` | Every route except /download (293 routes in total). |
| `store.app-about` | STORE | 1 | 265 | `src/components/store/AppDetail.jsx` | App detail pages (265 routes in total). |
| `store.app-header` | STORE | 1 | 265 | `src/components/store/AppDetail.jsx` | App detail pages (/app/<slug>) (265 routes in total). |
| `store.app-list` | STORE | 1 | 265 | `src/components/store/AppDetail.jsx` | App detail pages (265 routes in total). |
| `store.app-stats` | STORE | 1 | 265 | `src/components/store/AppDetail.jsx` | App detail pages (265 routes in total). |
| `store.remix-lineage` | STORE | 1 | 265 | `src/components/store/AppDetail.jsx` | App detail pages of remixed apps (265 routes in total). |
| `store.screenshot-strip` | STORE | 1 | 265 | `src/components/store/ScreenshotStrip.jsx` | App detail pages with screenshots (265 routes in total). |
| `store.category-nav` | STORE | 2 | 9 | `src/pages/Store.jsx` | Store index and store category pages (9 routes in total). |
| `store.featured-carousel` | STORE | 2 | 9 | `src/components/store/HeroCarousel.jsx` | Store index and store category pages (9 routes in total). |
| `cta.download-icon` | CTA | 4 | 8 | `src/components/DownloadCTA.jsx` | Landing, persona, pricing and awards routes (8 routes in total). |
| `store.app-grid` | STORE | 1 | 8 | `src/pages/Store.jsx` | Store category pages (and store search results) (8 routes in total). |
| `shell.app-dialog` | SHELL | 3 | 7 | `src/components/store/AppDialog.jsx` | Landing, persona routes and awards, opened on demand (7 routes in total). |
| `support.faq` | SUPPORT | 3 | 7 | `src/components/FAQ.jsx` | Landing, persona and pricing routes (the pricing page has a longer list) (7 routes in total). |
| `features.feature-grid` | FEATURES | 2 | 6 | `src/components/Features.jsx` | Landing and persona routes (6 routes in total). |
| `hero.landing-hero` | HERO | 2 | 6 | `src/components/Hero.jsx` | Landing and persona routes (6 routes in total). |
| `shell.youtube-overlay` | SHELL | 2 | 6 | `src/components/YouTubeOverlay.jsx` | Landing and persona routes (6 routes in total). |
| `showcase.persona-tabs` | SHOWCASE | 2 | 6 | `src/components/PersonaShowcase.jsx` | Landing and persona routes (6 routes in total). |
| `content.article-body` | CONTENT | 1 | 4 | `src/pages/BlogPost.jsx` | Blog posts (4 routes in total). |
| `content.article-cover` | CONTENT | 1 | 4 | `src/pages/BlogPost.jsx` | Blog posts (4 routes in total). |
| `content.article-footer` | CONTENT | 1 | 4 | `src/pages/BlogPost.jsx` | Blog posts (4 routes in total). |
| `content.article-header` | CONTENT | 1 | 4 | `src/pages/BlogPost.jsx` | Blog posts (4 routes in total). |
| `content.legal-body` | CONTENT | 1 | 4 | `src/pages/LegalPage.jsx` | Terms, privacy, acceptable use and the awards terms (typography policy or terms) (4 routes in total). |
| `content.legal-header` | CONTENT | 1 | 4 | `src/pages/LegalPage.jsx` | Terms, privacy, acceptable use and the awards terms (4 routes in total). |
| `cta.download-compact` | CTA | 1 | 4 | `src/components/DownloadCTA.jsx` | Blog posts (4 routes in total). |
| `shell.image-lightbox` | SHELL | 1 | 4 | `src/components/blog/Lightbox.jsx` | Blog posts, opened on demand (4 routes in total). |
| `hero.page-header` | HERO | 2 | 2 | `src/pages/BlogIndex.jsx` | Blog index and changelog (2 routes in total). |
| `commerce.pricing-plans` | COMMERCE | 1 | 1 | `src/pages/Pricing.jsx` | Pricing (1 route in total). |
| `content.award-criteria` | CONTENT | 1 | 1 | `src/components/awards/Sections.jsx` | Awards (1 route in total). |
| `content.award-jury` | CONTENT | 1 | 1 | `src/components/awards/Sections.jsx` | Awards (1 route in total). |
| `content.award-prizes` | CONTENT | 1 | 1 | `src/components/awards/Sections.jsx` | Awards (1 route in total). |
| `content.not-found-block` | CONTENT | 1 | 1 | `src/pages/NotFoundPage.jsx` | The catch-all not-found route (also /m and the showcase tab ids, which are not routes) (1 route in total). |
| `content.post-card` | CONTENT | 1 | 1 | `src/pages/BlogIndex.jsx` | Blog index (1 route in total). |
| `content.release-entry` | CONTENT | 1 | 1 | `src/pages/Changelog.jsx` | Changelog (1 route in total). |
| `cta.download-page` | CTA | 1 | 1 | `src/pages/Download.jsx` | Download (1 route in total). |
| `hero.awards-hero` | HERO | 1 | 1 | `src/pages/Awards.jsx` | Awards (1 route in total). |
| `hero.page-title` | HERO | 1 | 1 | `src/pages/Pricing.jsx` | Pricing. Pages with a subtitle use hero.page-header (1 route in total). |
| `showcase.award-entries` | SHOWCASE | 1 | 1 | `src/components/awards/Entries.jsx` | Awards (1 route in total). |
| `showcase.award-winners` | SHOWCASE | 1 | 1 | `src/components/awards/Winners.jsx` | Awards (1 route in total). |
| `store.app-shelves` | STORE | 1 | 1 | `src/components/store/Slider.jsx` | Store index (1 route in total). |

**12 shared sections** appear in more than one template and belong in a component library.

**28 single-use sections** appear in exactly one template. Building these
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
| 5 | SUPPORT | `support.faq` | shared ×3 |
| 6 | CTA | `cta.download-icon` | shared ×4 |
| 7 | SHELL | `shell.footer` | shared ×12 |
| 8 | SHELL | `shell.youtube-overlay` | shared ×2 |
| 9 | SHELL | `shell.app-dialog` | shared ×3 |

### Persona landing — `template.persona`

5 routes · `/designers`, `/product-managers`, `/engineers`, `/creators`, `/teams` · chrome: **full**

| # | category | section | |
|---:|---|---|---|
| 1 | SHELL | `shell.navbar` | shared ×13 |
| 2 | HERO | `hero.landing-hero` | shared ×2 |
| 3 | SHOWCASE | `showcase.persona-tabs` | shared ×2 |
| 4 | FEATURES | `features.feature-grid` | shared ×2 |
| 5 | SUPPORT | `support.faq` | shared ×3 |
| 6 | CTA | `cta.download-icon` | shared ×4 |
| 7 | SHELL | `shell.footer` | shared ×12 |
| 8 | SHELL | `shell.youtube-overlay` | shared ×2 |
| 9 | SHELL | `shell.app-dialog` | shared ×3 |

### Not found — `template.not-found`

1 route · `/*` · chrome: **full**

| # | category | section | |
|---:|---|---|---|
| 1 | SHELL | `shell.navbar` | shared ×13 |
| 2 | CONTENT | `content.not-found-block` | page-local |
| 3 | SHELL | `shell.footer` | shared ×12 |

### Pricing — `template.pricing`

1 route · `/pricing` · chrome: **full**

| # | category | section | |
|---:|---|---|---|
| 1 | SHELL | `shell.navbar` | shared ×13 |
| 2 | HERO | `hero.page-title` | page-local |
| 3 | COMMERCE | `commerce.pricing-plans` | page-local |
| 4 | SUPPORT | `support.faq` | shared ×3 |
| 5 | CTA | `cta.download-icon` | shared ×4 |
| 6 | SHELL | `shell.footer` | shared ×12 |

### Download — `template.download`

1 route · `/download` · chrome: **nav-only**

| # | category | section | |
|---:|---|---|---|
| 1 | SHELL | `shell.navbar` | shared ×13 |
| 2 | CTA | `cta.download-page` | page-local |

### Awards — `template.awards`

1 route · `/awards` · chrome: **full**

| # | category | section | |
|---:|---|---|---|
| 1 | SHELL | `shell.navbar` | shared ×13 |
| 2 | HERO | `hero.awards-hero` | page-local |
| 3 | SHOWCASE | `showcase.award-winners` | page-local |
| 4 | SHOWCASE | `showcase.award-entries` | page-local |
| 5 | CONTENT | `content.award-prizes` | page-local |
| 6 | CONTENT | `content.award-jury` | page-local |
| 7 | CONTENT | `content.award-criteria` | page-local |
| 8 | CTA | `cta.download-icon` | shared ×4 |
| 9 | SHELL | `shell.footer` | shared ×12 |
| 10 | SHELL | `shell.app-dialog` | shared ×3 |

### Legal document — `template.legal`

4 routes · `/terms`, `/privacy`, `/aup`, `/awards/terms` · chrome: **full**

| # | category | section | |
|---:|---|---|---|
| 1 | SHELL | `shell.navbar` | shared ×13 |
| 2 | CONTENT | `content.legal-header` | page-local |
| 3 | CONTENT | `content.legal-body` | page-local |
| 4 | SHELL | `shell.footer` | shared ×12 |

### Blog index — `template.blog-index`

1 route · `/blog` · chrome: **full**

| # | category | section | |
|---:|---|---|---|
| 1 | SHELL | `shell.navbar` | shared ×13 |
| 2 | HERO | `hero.page-header` | shared ×2 |
| 3 | CONTENT | `content.post-card` | page-local |
| 4 | SHELL | `shell.footer` | shared ×12 |

### Blog post — `template.blog-post`

4 routes · `/blog/:slug` (1–4) · chrome: **full**

| # | category | section | |
|---:|---|---|---|
| 1 | SHELL | `shell.navbar` | shared ×13 |
| 2 | CONTENT | `content.article-cover` | page-local |
| 3 | CONTENT | `content.article-header` | page-local |
| 4 | CONTENT | `content.article-body` | page-local |
| 5 | CONTENT | `content.article-footer` | page-local |
| 6 | CTA | `cta.download-compact` | page-local |
| 7 | SHELL | `shell.footer` | shared ×12 |
| 8 | SHELL | `shell.image-lightbox` | page-local |

### Changelog — `template.changelog`

1 route · `/changelog` · chrome: **full**

| # | category | section | |
|---:|---|---|---|
| 1 | SHELL | `shell.navbar` | shared ×13 |
| 2 | HERO | `hero.page-header` | shared ×2 |
| 3 | CONTENT | `content.release-entry` | page-local |
| 4 | SHELL | `shell.footer` | shared ×12 |

### Store index — `template.store-index`

1 route · `/store` · chrome: **full**

| # | category | section | |
|---:|---|---|---|
| 1 | SHELL | `shell.navbar` | shared ×13 |
| 2 | STORE | `store.featured-carousel` | shared ×2 |
| 3 | STORE | `store.category-nav` | shared ×2 |
| 4 | STORE | `store.app-shelves` | page-local |
| 5 | SHELL | `shell.footer` | shared ×12 |

### Store category — `template.store-category`

8 routes · `/store/remixable`, `/store/developer-tools`, `/store/productivity`, `/store/utilities`, `/store/media`, `/store/design`, `/store/lifestyle`, `/store/games-and-fun` · chrome: **full**

| # | category | section | |
|---:|---|---|---|
| 1 | SHELL | `shell.navbar` | shared ×13 |
| 2 | STORE | `store.featured-carousel` | shared ×2 |
| 3 | STORE | `store.category-nav` | shared ×2 |
| 4 | STORE | `store.app-grid` | page-local |
| 5 | SHELL | `shell.footer` | shared ×12 |

### App detail — `template.app-detail`

265 routes · `/app/:slug` (1–265) · chrome: **full**

| # | category | section | |
|---:|---|---|---|
| 1 | SHELL | `shell.navbar` | shared ×13 |
| 2 | STORE | `store.app-header` | page-local |
| 3 | STORE | `store.remix-lineage` | page-local |
| 4 | STORE | `store.app-stats` | page-local |
| 5 | STORE | `store.screenshot-strip` | page-local |
| 6 | STORE | `store.app-about` | page-local |
| 7 | STORE | `store.app-list` | page-local |
| 8 | SHELL | `shell.footer` | shared ×12 |

## Section reference

### SHELL

_Chrome shared across pages: navigation, footer, overlays._

**`shell.app-dialog`** — Centred dialog opened from an app card (landing persona tabs) or a winner card (awards): app detail body (or a winner summary) with a close button and previous/next app buttons; scroll lock, Escape closes, Arrow keys step through the opener's apps.

· Landing, persona routes and awards, opened on demand (7 routes in total). · appears on 7 routes · implemented by `src/components/store/AppDialog.jsx`

**`shell.footer`** — Bottom footer with legal links, socials and the Raycast credit.

· Every route except /download (293 routes in total). · appears on 293 routes · implemented by `src/components/Footer.jsx`

**`shell.image-lightbox`** — Full-screen gallery of the post's images: black backdrop, current image at 70vw with neighbours at 60% opacity, arrows and Escape, backdrop click closes.

· Blog posts, opened on demand (4 routes in total). · appears on 4 routes · implemented by `src/components/blog/Lightbox.jsx`

**`shell.navbar`** — Fixed top navigation: glass pill on desktop (brand, Home, Pricing, Store, Blog, Changelog, Sign in) and a slide-down panel on mobile, with an active-link dot.

· Every route (294 routes in total). · appears on 294 routes · implemented by `src/components/Navbar.jsx`

**`shell.youtube-overlay`** — Full-screen YouTube embed dialog opened from hero and feature demo buttons; locks scroll, closes on Esc or backdrop.

· Landing and persona routes (6 routes in total). · appears on 6 routes · implemented by `src/components/YouTubeOverlay.jsx`

### HERO

_Page-opening header block (landing hero, page title, awards hero)._

**`hero.awards-hero`** — Awards opening block on a black page: a looping video (full-bleed, 16:9, side fades), then a sponsor row, a display title and a subtitle that overlap the video bottom edge.

· Awards (1 route in total). · appears on 1 routes · implemented by `src/pages/Awards.jsx`

**`hero.landing-hero`** — Eyebrow, two-line headline, subtext, Download and Reinvent-your-wheel buttons, requirements note, autoplay loop video and three pillars; headline and subtext are swapped per persona route.

· Landing and persona routes (6 routes in total). · appears on 6 routes · implemented by `src/components/Hero.jsx`

**`hero.page-header`** — Centred page title with a one-line subtitle in a 680px column (blog index and changelog).

· Blog index and changelog (2 routes in total). · appears on 2 routes · implemented by `src/pages/BlogIndex.jsx`

**`hero.page-title`** — Centred display page title with no subtitle (the pricing page).

· Pricing. Pages with a subtitle use hero.page-header (1 route in total). · appears on 1 routes · implemented by `src/pages/Pricing.jsx`

### SHOWCASE

_Product-in-use displays: app tabs, award winners and entries._

**`showcase.award-entries`** — 'Browse N Entries' heading with a search pill, a 2/3/4-column grid of app rows (24 per page) and numbered pagination; search replaces the heading with a result count and hides the pager.

· Awards (1 route in total). · appears on 1 routes · implemented by `src/components/awards/Entries.jsx`

**`showcase.award-winners`** — Gold winner card full width, silver and bronze side by side (stacked below 624), then a 'Finalists' title and a grid of app rows. Winner cards open the app dialog.

· Awards (1 route in total). · appears on 1 routes · implemented by `src/components/awards/Winners.jsx`

**`showcase.persona-tabs`** — Six audience tabs (dropdown below 800px) each showing a four-app grid, with company logos on the team tab; the starting tab depends on the route.

· Landing and persona routes (6 routes in total). · appears on 6 routes · implemented by `src/components/PersonaShowcase.jsx`

### FEATURES

_Capability explanation modules._

**`features.feature-grid`** — Six feature cards laid out 1 / 2 / 2 / 1, switching to mobile images below 800px.

· Landing and persona routes (6 routes in total). · appears on 6 routes · implemented by `src/components/Features.jsx`

### SUPPORT

_Answers to common questions._

**`support.faq`** — Ten-question single-open accordion that dims to 15% opacity once scrolled past.

· Landing, persona and pricing routes (the pricing page has a longer list) (7 routes in total). · appears on 7 routes · implemented by `src/components/FAQ.jsx`

### CTA

_Calls to download or act (conversion blocks, closing the page above the footer)._

**`cta.download-compact`** — Compact closing call to action under a blog post: smaller icon, 'What will you build?'-style headline, Download button (>=480) or a one-line availability note (<480).

· Blog posts (4 routes in total). · appears on 4 routes · implemented by `src/components/DownloadCTA.jsx`

**`cta.download-icon`** — Large app icon that launches a burst of flying app icons on click, with the 'What will you build?' headline and download buttons.

· Landing, persona, pricing and awards routes (8 routes in total). · appears on 8 routes · implemented by `src/components/DownloadCTA.jsx`

**`cta.download-page`** — Dedicated download page with the installer call to action and system requirements.

· Download (1 route in total). · appears on 1 routes · implemented by `src/pages/Download.jsx`

### CONTENT

_Body content of a page: legal text, articles, release entries, awards blocks, error states._

**`content.article-body`** — Blog post header (title, date, author, hero image) and prose body.

· Blog posts (4 routes in total). · appears on 4 routes · implemented by `src/pages/BlogPost.jsx`

**`content.article-cover`** — Blog post cover image in a rounded, bordered frame (aspect 1.9:1).

· Blog posts (4 routes in total). · appears on 4 routes · implemented by `src/pages/BlogPost.jsx`

**`content.article-footer`** — Closing row of a post: author, dot, date, and a Share button that uses the share sheet or copies the link ('Copied' for 1600ms).

· Blog posts (4 routes in total). · appears on 4 routes · implemented by `src/pages/BlogPost.jsx`

**`content.article-header`** — Post date, title and author row.

· Blog posts (4 routes in total). · appears on 4 routes · implemented by `src/pages/BlogPost.jsx`

**`content.award-criteria`** — 'Selection criteria' heading and up to six criteria, each an icon, a title and a short paragraph; 1, 2 and 3 per row at 0, 700 and 1000.

· Awards (1 route in total). · appears on 1 routes · implemented by `src/components/awards/Sections.jsx`

**`content.award-jury`** — 'The jury' heading and up to five greyscale juror portraits with name, 'Role, Organisation' and link icons; 3 per row below 760, 5 across from 760.

· Awards (1 route in total). · appears on 1 routes · implemented by `src/components/awards/Sections.jsx`

**`content.award-prizes`** — Bordered fieldset with a centred legend ('Cash prizes for winners') and four prize cards (medal, tier, amount), plus an 'Eligible Countries' tooltip trigger under it.

· Awards (1 route in total). · appears on 1 routes · implemented by `src/components/awards/Sections.jsx`

**`content.legal-body`** — Long-form legal text in a 640px column: h2 and h3 headings, paragraphs (optional bold label lead and trailing links), bullet lists with one nested level, and for the awards terms a Schedule divider.

· Terms, privacy, acceptable use and the awards terms (typography policy or terms) (4 routes in total). · appears on 4 routes · implemented by `src/pages/LegalPage.jsx`

**`content.legal-header`** — Legal page title (one or two balanced lines) and a 'Last Updated' line.

· Terms, privacy, acceptable use and the awards terms (4 routes in total). · appears on 4 routes · implemented by `src/pages/LegalPage.jsx`

**`content.not-found-block`** — Centered error state with the clickable app icon, 'Page not found' heading, one sentence and a Go Home button.

· The catch-all not-found route (also /m and the showcase tab ids, which are not routes) (1 route in total). · appears on 1 routes · implemented by `src/pages/NotFoundPage.jsx`

**`content.post-card`** — One blog post in the index: cover image, date, title (a link to the post), author row and excerpt. Repeated once per post, separated by a hairline.

· Blog index (1 route in total). · appears on 1 routes · implemented by `src/pages/BlogIndex.jsx`

**`content.release-entry`** — One changelog release: version pill and date (sticky beside the entry from 1280), a linked release title, then prose blocks (h2 groups, paragraphs, bullet lists, images). Repeated newest first, separated by a hairline.

· Changelog (1 route in total). · appears on 1 routes · implemented by `src/pages/Changelog.jsx`

### COMMERCE

_Plans and pricing._

**`commerce.pricing-plans`** — Plan comparison cards with prices and feature lists.

· Pricing (1 route in total). · appears on 1 routes · implemented by `src/pages/Pricing.jsx`

### STORE

_App store browsing and app detail blocks._

**`store.app-about`** — Balanced description paragraph under a screen-reader-only 'About <app>' heading.

· App detail pages (265 routes in total). · appears on 265 routes · implemented by `src/components/store/AppDetail.jsx`

**`store.app-grid`** — Grid of app cards (icon, name, tagline, author) for the store index or one category.

· Store category pages (and store search results) (8 routes in total). · appears on 8 routes · implemented by `src/pages/Store.jsx`

**`store.app-header`** — App detail header: squircle icon (112 from 480), name, award pill, optional Glaze-AI badge, tagline and two actions. With a featured image the block is a rounded cover with a bottom gradient and a 'Featured' pill; without one it is plain.

· App detail pages (/app/<slug>) (265 routes in total). · appears on 265 routes · implemented by `src/components/store/AppDetail.jsx`

**`store.app-list`** — Titled two-column list of app rows ('Remixes', 'Suggested Apps'); the remix list marks each row with a shuffle glyph.

· App detail pages (265 routes in total). · appears on 265 routes · implemented by `src/components/store/AppDetail.jsx`

**`store.app-shelves`** — Store home shelves (Our Picks, Trending, Made to Remix, Award Winners, Latest): a title with an optional 'View All' link and paged slider arrows, then pages of app rows (1/2/3/4 columns).

· Store index (1 route in total). · appears on 1 routes · implemented by `src/components/store/Slider.jsx`

**`store.app-stats`** — Four-cell bordered strip: Author (avatar and name), Size, Updated, Installs.

· App detail pages (265 routes in total). · appears on 265 routes · implemented by `src/components/store/AppDetail.jsx`

**`store.category-nav`** — Row of store category links (remixable, developer tools, productivity, utilities, media, design, lifestyle, games and fun).

· Store index and store category pages (9 routes in total). · appears on 9 routes · implemented by `src/pages/Store.jsx`

**`store.featured-carousel`** — Full-width carousel of featured apps: five-card window of 960-wide cover cards (rounded, bottom gradient, icon, name, award pill, tagline), autoplay every 4000ms, drag, wheel, arrows on hover and dot indicators.

· Store index and store category pages (9 routes in total). · appears on 9 routes · implemented by `src/components/store/HeroCarousel.jsx`

**`store.remix-lineage`** — Banner under the header for a remixed app: 'Remixed from <app> by <author>' with a shuffle glyph.

· App detail pages of remixed apps (265 routes in total). · appears on 265 routes · implemented by `src/components/store/AppDetail.jsx`

**`store.screenshot-strip`** — Horizontal scroll-snap strip of screenshots (220 tall, 260 from 480) with edge fades and arrow buttons; a click opens the lightbox.

· App detail pages with screenshots (265 routes in total). · appears on 265 routes · implemented by `src/components/store/ScreenshotStrip.jsx`
