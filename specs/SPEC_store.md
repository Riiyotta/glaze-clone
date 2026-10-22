Source: https://www.glaze.app/store

# SPEC_store: /store, /store/:category (x8), /app/:slug, app-details dialog

Measured 2026-10-22 in headless Chromium (own Playwright instance, DPR 1) at 1440x900 and 390x844. Values are computed styles, bounding boxes, or read from the shipped JS/CSS bundles (`/assets/store-*.js`, `index-BNXJhYAk.js`, `styles-CpdsjlmX.css`). The site is TanStack Start + React + Tailwind v4. Shared tokens, fonts, nav and footer are in `/Users/riyaghosh/V3/glaze/CLONE_SPEC.md` and are not repeated; only deltas appear here. Tailwind v3 clone: add `screens.xs = 480px`, plus `2xs` font-size 10px (see 1.4).

Files produced:
- Snapshot: `/Users/riyaghosh/V3/glaze/src/data/store-snapshot.json` (shape in section 2)
- Images: `/Users/riyaghosh/V3/glaze/public/assets/store/` (150 files, 116 MB; section 3)
- Not-downloaded image list (hotlink): `/Users/riyaghosh/V3/glaze/specs/store-assets-hotlink.tsv` (194 rows: `url<TAB>suggested-name`)
- Screens in `/Users/riyaghosh/V3/glaze/_reference/screens/`: `store-1440-full.png`, `store-390-full.png`, `store-design-1440-full.png`, `store-design-390-full.png`, `store-remixable-1440-full.png`, `store-dialog-1440.png`, `store-dialog-390.png`, `store-1440-card-click.png` (a card click navigates, see 4.6); `app-my-stash-{1440,390}-{full,top}.png`, `app-elsewhere-{1440,390}-full.png`, `app-the-last-blockbuster-{1440,390}-full.png`, `app-kalcy-{1440,390}-{full,top}.png`, `app-image-sequencer-{1440,390}-{full,top}.png`, `app-image-sequencer-quick-slideshow-{1440,390}-{full,top}.png`, `app-lightbox-1440.png`.

Link convention: **[I]** internal (glaze.app, clone locally or leave as route), **[E]** external (not cloned, keep href or `#`).

---

## 0. Routes, data loading, and what is NOT an API

- Routes: `/store` (query `?q=` search, `?page=` for search), `/store/remixable`, `/store/:category` (`developer-tools, productivity, utilities, media, design, lifestyle, games-and-fun`; `?page=N`), `/app/:slug`, and `/@:username` (author page, [I], out of scope).
- There is **no public REST/JSON endpoint to snapshot.** Data comes from TanStack Start server functions: `GET https://www.glaze.app/_serverFn/<hash>` (one fired on `/store` load, `[200]`). A direct `curl` returns **403 Forbidden** (needs the app's request headers), so it was not fetched directly. The same data is **SSR-embedded**: the HTML contains a seroval-serialised `$_TSR` script whose `matches[].l` holds the loader data. The snapshot was built by evaluating that payload from `curl`ed HTML (`/store`, 8 category URLs, `/store?q=calendar`, `/store/design?page=2`, 6 `/app/...` URLs). Images are served from Supabase storage `https://api.glazeapp.com/storage/v1/object/public/glaze-public-assets/{icons|avatars|screenshots|featured}/...`. The rendered `<img>` src is wrapped by an imgproxy at `https://img.glaze.app/<sig>/rs:fit:W:H/<base64 of storage URL>` (card icons `rs:fit:128:128`, avatars `rs:fit:40:40` / `56:56`, app-page icon `rs:fit:384:384`, hero `rs:fit:1600:0/q:85`, screenshots `rs:fit:0:0` + `.webp`). Clone uses the original storage files; the signature cannot be forged.
- Client queries (react-query keys): `public-store-data`, `public-awards-state`, `made-to-remix`, `store-search-page [q,page]`, `store-category-page [category,page]`. Search is **server-side** (debounced 250 ms). Category/search pagination is **numbered pages (24 per page), not infinite scroll**.
- Slug rule (validated against every live href, 0 mismatches): `slug = slugify(display_name) + "-" + public_id`, where slugify = lowercase, strip chars outside `[\w\s-]`, collapse whitespace/underscore to `-`. Example `ray.fm` -> `rayfm-Af8oi9`, `Pro⁺ Usage` -> `pro-usage-2iVSvr`. `public_id` is a 6-char base62 id.
- `<head>` per route: `/store` title `Glaze Store. Explore desktop apps built with Glaze.`; app page title `{name} for Mac — {tagline} | Glaze` (rule in `src/data/store-title.js`: ` for Mac` dropped when name/tagline matches `/\bmac/i`; if the string before ` | Glaze` is longer than 62 chars it is cut to 60 at a word boundary, trailing `,.;:!?-` stripped, `…` appended; verified against 59 live titles; unknown slug: `App Not Found — Glaze`, noindex, no canonical), meta description = start of full description, og:image `https://www.glaze.app/api/og/featured_app?id=<uuid>&v=...` (1200x630), JSON-LD `SoftwareApplication` (name, applicationCategory e.g. `DesignApplication`, operatingSystem `macOS`, softwareRequirements `Glaze for macOS`, offers price 0 USD, softwareVersion, fileSize, datePublished) and `BreadcrumbList` (Store > Category > App). Category titles/descriptions are in 6.2.

---

## 1. Shared store chrome and tokens (new vs CLONE_SPEC)

### 1.1 Page frame
- `main.flex.min-h-dvh.flex-col` > `section.px-4.pb-20.pt-[76px].xs:pt-[80px]` > `div.mx-auto.flex.w-full.max-w-page.flex-col.gap-3` (`max-w` becomes 1440px at >=1920). Footer as in CLONE_SPEC. App page uses `section.pb-14.px-4.pt-[76px].xs:pt-[80px]` (pb 56) with `div.mx-auto.flex.max-w-page.flex-col.gap-6`.
- Breakpoints used: `xs` 480, `sm` 640, `md` 768, 1280 (carousel edge fade), 1920 (4 cols, bigger hero). Nav breakpoint 624 unchanged.
- 1440 store: docH 1718; container x=240 w=960; hero section y=80 h=380 (360 card + 16 gap + 4 dots); header row y=496; category chips y=544; first section y=620.
- 390 store: docH 3241; container x=16 w=358; hero y=76 h=220 (+16 gap +3 dots, section 239); header row y=351 h=40; chips y=403; first section y=479.

### 1.2 New tokens
| Token | Value |
|---|---|
| `text-2xs` | 10px (stat labels <480) |
| `--color-surface` | `rgba(255,255,255,.10)` (hover bg for rows, active page) |
| `--color-surface-panel` | `#28282894` (hover of glass buttons) |
| `--color-surface-popover` | `#222222f2` (tooltips) |
| `--color-surface-well` | `#080808` (hero card bg) |
| text-white/72 | `rgba(255,255,255,.72)` (hero subtitle) |
| award badge bg/border | `rgba(0,0,0,.35)` / `1px rgba(255,255,255,.10)`, hover border `.15`, bg `rgba(255,255,255,.10)` |
| Featured badge | bg `rgba(0,0,0,.45)`, border `rgba(255,255,255,.15)`, shadow `0 8px 24px rgba(0,0,0,.28)`, backdrop blur 12px |
| `.hide-scrollbar` | scrollbar hidden (screenshots strip, category chips) |

### 1.3 App icon (`.glaze-app-icon-glass`) reused from landing
Squircle mask and glass border as in CLONE_SPEC S2. Store sizes: card `h-14 w-14` (56), hero card `h-14 w-14` (<480) / `h-16 w-16` (64, >=480) with `rounded-[22%]`, app page `h-20 w-20` (80, <480) / `h-28 w-28` (112, >=480). Image inside: `absolute inset-0 w-full h-full scale-[1.19] object-cover`, fades in with `transition-opacity 200ms` over a `bg-white/[0.06]` placeholder. Fallback icon when `icon_url` is null: `/assets/app-icon-PC60coqE.png` (already in clone).

### 1.4 Award badges (images already in clone `public/assets/award-{gold,silver,bronze}@2x-*.png`)
- Inline (card title, after name): `<img class="ml-0.5 size-4 object-contain">` 16x16, alt "Gold winner"/"Silver winner"/"Bronze winner".
- Pill (hero card, app header): link [I] `/awards`, `aria-label="View Glaze Awards: Silver"`; inner `span` 26px tall: `inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/35 px-2 py-1 pl-1.5 pr-2 text-xs/16 font-medium text-white backdrop-blur-md`, img `size-3.5` (14), label "Gold|Silver|Bronze". Measured 68.2x26. Hover: border `white/.15`, bg `white/.10`, 150 ms color transition. Hero-card variant has `pointer-events-auto relative z-20` so it is clickable inside the card.
- **Finalist** (awards, no medal): plain text `span.ml-1.shrink-0.text-sm.font-normal.leading-[18px].text-text-tertiary` "Finalist" (`#717171`, 14px/18px) after the name.
- Award data: `award_entry.result` is `gold|silver|bronze|finalist|null`. Only 10 apps carry an award in the snapshot (Last Blockbuster gold, My Stash silver, Elsewhere bronze, 7 finalists).

---

## 2. Data shape (snapshot `src/data/store-snapshot.json`)

Top-level keys: `_about, categories, store, categoryPages, searchSample, appPages, apps, localAssets`. 227 unique apps in `apps` (keyed by slug), everything else references slugs.

```
categories: [{value, label, href}]               // order = chips order; value 'all' = Featured (/store)
store.sections: [{slug:'featured'|'our_picks'|'trending'|'latest', title, style:'hero_carousel'|'app_grid',
                  items:[{app:slug, coverImage?:url}]}]    // featured 10 (coverImage = wide hero art), our_picks 38 (UI shows first 24), trending 12, latest 18
store.latest: [slug x24]            // `latestApps` list actually rendered under "Latest" (24)
store.madeToRemix: [slug x8]
store.awardWinners: [{result:'gold'|'silver'|'bronze'|'finalist', rank, app:slug}]   // 3 medals + 7 finalists
store.awardsSchedule: {opensAt, closesAt, winnersAt, datesLabel:'July 23–27', opensDateLabel, winnersDateLabel}
categoryPages[slug]: {page:1, pageCount, total, pageSize:24, apps:[slug x24]}
   remixable additionally: madeToRemix:[slug x8]  (apps = allRemixable, total 529, 23 pages)
   design additionally: page2Sample:[slug x24]
   totals: developer-tools 380/16 pages, productivity 603/26, utilities 496/21, media 165/7, design 108/5, lifestyle 69/3, games-and-fun 103/5, remixable 529/23
searchSample: {q:'calendar', total:9, pageCount:1, apps:[slug]}
appPages[fileKey]: {slug, mode:'public', isAwardsEntry, related:[slug x5], remixes:[slug]}   // 6 sampled apps
apps[slug]: {
  slug, publicId, name, tagline,            // tagline = API `description` (short)
  category: 'design'|'developer-tools'|'productivity'|'utilities'|'media'|'lifestyle'|'games-and-fun',
  icon: url (512px png), 
  author:{name, username, avatar:url|null, website, x, github},
  award: 'gold'|'silver'|'bronze'|'finalist'|null,
  screenshots:[url], featuredKind:'featured'|'our_picks'|null, featuredImage:url|null,
  stats:{installs, sizeBytes, version, createdAt, updatedAt, publishedAt},
  remixable:boolean, remixLineage:{parent_public_id,parent_display_name,parent_version,parent_author_name,parent_author_username}|null,
  ai:{mode:'optional', grades:['fast'|'smart'], purpose}|null,
  fullDescription:{length, paragraphs}      // text deliberately not stored
}
localAssets: { remoteUrl: '/assets/store/<file>' }   // only 150 entries; fall back to the remote URL when absent
```
Raw API field names (for reference): `id (uuid), public_id, display_name, description, full_description, icon_url, screenshot_urls[], visibility, category, latest_version, build_size_bytes, created_at, updated_at, last_version_published_at, installs_count, ai_capability, remixable, remix_lineage, profiles{username,display_name,avatar_url,website_url,x_url,github_url}, featured_app_id, featured_app_kind, featured_app_image_url, award_entry{result}`; the app page adds `is_awards_entry`.

Ordering facts: the 10 featured apps are the same on every page but **shuffled per request** (hero order differs between /store, /store/design, /store/games-and-fun and between loads), so start index 0 is random. Hardcode one order (suggest `/store` order: Elsewhere, The Last Blockbuster, Mia Calendar, Font Finder, CS Glaze Synth, Icon Keeper, My Stash, Liquid Commander, Funky Mirror, Sampler).
Stats display: installs shown exactly when >=100 else `<100`; size formatted MB/KB (11.8 MB, 73 KB, 34.5 MB), updated as `25 Aug 2026` (en-GB day month year of `last_version_published_at`/`updated_at`; My Stash updated_at is 21 Oct but UI shows 25 Aug = `last_version_published_at`, 24 Aug 20:09 UTC, local TZ +offset, so use publishedAt).

---

## 3. Assets
- 150 files in `public/assets/store/`, all fetched with curl, 0 failures. Naming: `<slug>-icon.png`, `<slug>-cover.<ext>` (featured art), `<slug>-hero.<ext>` (store carousel cover), `<slug>-shot-N.<ext>`, `avatar-<username>.<ext>`. Formats: PNG and JPEG, 1 GIF; total 116 MB (screenshots and hero art are multi-MB PNGs; recommend downscaling or lazy loading in the clone).
- Priority used for the 150 cap: (1) full set (icon, avatar, cover, all screenshots) for the 6 sampled apps = all screenshots of My Stash 6, Elsewhere 5, Last Blockbuster 3, Kalcy 5, Image Sequencer 5, Quick Slideshow 1; (2) the 10 store hero covers and the icons+avatars of the 10 featured apps; (3) icons/avatars of the first 12 apps in each store section; (4) related/remix apps of the sampled pages; (5) category page 1 apps; (6) rest. **65 of 227 apps have a local icon**; the remaining 162 apps' icons/avatars (and all screenshots of unsampled apps) are not downloaded: **hotlink the `api.glazeapp.com` URLs** (listed in `localAssets` gaps and `specs/store-assets-hotlink.tsv`, 194 files).
- Other loaded assets on these routes: `/assets/award-*@2x-*.png` (in clone), logo svg, `/assets/app-icon-PC60coqE.png` fallback (in clone), fonts as in CLONE_SPEC. Third-party: PostHog (`us.i.posthog.com`), `_proxy/dub/script`. Not cloned.

---

## 4. Route `/store`

DOM order: hero carousel > header row (h1 + search) > category chips > sections. Total docH 1718 at 1440, 3241 at 390.

### 4.1 Featured hero carousel (`section.group/carousel`)
- Section: `relative left-1/2 flex w-screen -translate-x-1/2 flex-col gap-4 overflow-hidden`, CSS vars `--featured-card-width: min(960px, 100vw - 32px)` (min(1440px,100vw-48px) >=1920), `--featured-card-gap: 16px`. Full-bleed (1440x380 at x=0, y=80).
- Track `div.relative.select-none.overflow-hidden` (`touch-action: pan-y pinch-zoom`) containing `div.flex.gap-[16px]` of 5 slides (prev-prev, prev, **active**, next, next-next) each `w-[var(--featured-card-width)] shrink-0`. Transform `translateX(calc((100vw - W)/2 - W - gap - W - gap + dragPx))`, which centers the active slide (active card x=240 w=960 at 1440; neighbours peek in at x=-736 and 1216 and are covered by fades).
- Slide card `div[role=button][tabindex=0][aria-label="Open {name}"]`: `group relative overflow-hidden rounded-2xl (18) xs:rounded-3xl (26)`, height `clamp(220px, 38vw, 360px)` (1440: 360, 390: 220; >=1920: clamp(360px,38vw,480px)); focus ring `ring-2 white/55`. Click (not drag) navigates to `/app/{slug}` [I] (SPA route; with the clone use a link). Keyboard Enter/Space too.
  - Cover `img.absolute.inset-0.h-full.w-full.object-cover` = `extras.image_url` (else first screenshot, icon, fallback). Natural size e.g. 2480x1052. `draggable=false`, no context menu.
  - Scrim `absolute inset-0 bg-gradient-to-t from-black/65 via-black/12 to-transparent`.
  - Caption `absolute inset-x-0 bottom-0 z-30 flex items-end gap-5 p-4 xs:p-5`; inner `pointer-events-none flex items-center gap-3`: icon (56 <480, 64 >=480, squircle glass, 14px radius n/a, uses mask) + text column `flex min-h-14 xs:min-h-16 flex-col justify-center gap-0.5`: **h1** Inter 18px/22px/600 `#fff` truncate; award pill inline right of h1 (`flex min-w-0 items-center gap-2`) when award; **p** `line-clamp-1` Inter 500 14px, line-height 17px (>=480) / 16px, `rgba(255,255,255,.72)`, text = tagline. (At 390 the p measured 16px font with 16px lh in the dump because Tailwind v4 `text-sm` = 14px; treat as 14px/16px.)
- Edge buttons (>=480 only, `hidden xs:flex`): `button.carousel-edge-button.absolute.inset-y-0.left-0|right-0.z-40` width `max(80px, (100vw - cardW)/2)` (240px at 1440), aria-label "Previous featured app"/"Next featured app". Inner `span.liquid-glass.size-9 (36) rounded-full opacity-0 shadow 0 8px 30px rgba(0,0,0,.18)` with lucide chevron-left/right `size-5` (20px, stroke 2, `drop-shadow(0 2px 8px rgba(0,0,0,.55))`, nudged -1/+1px). **Hover** (group-hover on the whole edge zone): opacity 1, bg `#28282894`; `transition: background .15s, opacity .15s cubic-bezier(.4,0,.2,1)`. Glass circle measured 36x36 centered in the zone (x=102 for left at 1440).
- Side fades (>=1280 only): `absolute inset-y-0 left|right-0 z-30 w-[min(18vw,220px)] bg-gradient-to-r|l from-background to-transparent pointer-events-none`.
- Dots row `div.flex.justify-center.gap-1.xs:gap-1.5` (gap 4/6), 10 buttons `h-[3px] xs:h-1 w-7 xs:w-9 rounded-full transition-all (150ms)`: 28x3 <480, 36x4 >=480, `tabindex=-1`, aria-label "Show {name}". Active `bg-text-primary` (#fff), inactive `bg-white/20`, hover `bg-white/35`. Row at y=456 (1440), y=312 (390).
- **Autoplay**: `setInterval` **4000 ms** advances +1; paused while pointer hovers the section, while dragging/animating/wheel; resumes on leave. Measured active index advanced every ~4.0 s.
- **Slide animation**: track gets `transition-transform duration-[260ms] ease-out` (Tailwind ease-out keyword is `ease-out`; class is `duration-[260ms] ease-out`, i.e. `cubic-bezier(0,0,.2,1)` in v4). Queue: clicks during animation are queued then replayed after 2 rAFs. Wrap-around infinite (5-slide window recomputed with modulo).
- **Drag/swipe** (pointer events, `setPointerCapture`): horizontal intent resolved after 6 px; drag offset clamped to +/- one card width + gap; release threshold = `min(max(width*.16, 72), 140)` px, else snaps back with 180 ms transition (220 ms when advancing). Horizontal trackpad wheel (`wheel` with |dx|>|dy|, passive:false) navigates with debounce (180 ms gesture gap, 6 px threshold). Vertical scroll is not hijacked.
- Mobile (<480): no edge buttons, no side fades; swipe + dots only.

### 4.2 Header row (`div.mt-6 > div.flex.flex-col.gap-3 > div.flex.justify-between.gap-3.items-center`)
- 1440: row y=496 h=36 (x=240 w=960); at 390: y=351 h=40.
- **h1** "Browse Store" (`text-lg font-medium leading-[22px]`: Inter 18px/22px/500 `#fff`, truncate). Becomes "Search Results" while a query is present, category label on category pages (`Remixable`, `Design`, ...). The hero cards also contain h1s (page has 6 h1 total).
- **Search** (right, `ml-auto`): `div.liquid-glass.flex.items-center.overflow-hidden.rounded-full` height **36 (>=480) / 40 (<480)**, width **240 (>=480) / 210 (<480)**, padding `0 10px` (>=480) / `0 12px`, bg `rgba(35,35,35,.30)`, border `1px rgba(255,255,255,.08)`, `backdrop-filter blur(12px) saturate(1.8)`, shadow `0 8px 30px rgba(0,0,0,.18)`, `transition-all 200ms cubic-bezier(.4,0,.2,1)`. Lucide `search` icon 16px (18px <480) `#a0a0a0`. `input.store-search-input` aria-label "Search store", placeholder "Search" (`#717171`), `bg-transparent px-2`, font Inter 14px/20px/500 white (16px <480), focus ring removed (`box-shadow:none; outline:none`), always visible (searchAlwaysOpen). 202x20 inside at 1440.
  - Behavior: typing updates the URL `?q=...` (`replace`, no scroll reset) after **250 ms debounce**; query `.trim().toLowerCase()`. With a query the page shows only the results grid for **server search** (fields matched client-side fallback: name, description, full description, ids, author name/username), `Search Results` title, numbered pagination if >1 page (`?q=calendar` -> 9 results, 1 page; hero carousel stays above). No results: `div.store-grid-reserved-height.flex.items-center.justify-center.text-center.text-sm.font-medium.text-text-secondary` text **"No apps found"** (148px tall at 1440). No clear (x) button exists. Search is on `/store` and category pages (searching on a category page searches within? the input uses the same `q` param; it searched globally in code path `store-search-page` with query only).

### 4.3 Category chips (`nav[aria-label="Store categories"]`)
- Wrapper `div.hide-scrollbar.-mx-4.overflow-x-auto` (x=224 w=992) > `ul[role=list].flex.w-max.items-center.gap-[3px].px-4` (total 963.8 wide at 1440, fits; at 390 it scrolls horizontally: scrollWidth 964, no snap, no arrows).
- `li.shrink-0.font-medium` > `a.flex.h-8 (32).items-center.gap-1.5 (6).whitespace-nowrap.rounded-full.border.px-[9px].text-[13px].leading-none` + 13x13 lucide icon (`shrink-0`, stroke 2). Inter 13px/13px/500.
- Order, icon, href (all [I]) and measured width at 1440 / x:
  | Label | Icon | Href | w |
  |---|---|---|---|
  | Featured | star | /store | 94 (x=240) |
  | Remixable | shuffle | /store/remixable | 103.3 |
  | Developer Tools | hammer | /store/developer-tools | 139.4 |
  | Productivity | chart-line | /store/productivity | 114 |
  | Utilities | wrench | /store/utilities | 85.2 |
  | Media | headphones | /store/media | 77.2 |
  | Design | paintbrush | /store/design | 82.2 |
  | Lifestyle | heart | /store/lifestyle | 92 |
  | Games & Fun | gamepad-2 | /store/games-and-fun | 120.6 |
  (`categories.js` marks Developer Tools `separated:true` but no visual separator renders; gap is uniform 3px.)
- States: **active** (`aria-current=page`) `border rgba(255,255,255,.12)`, bg `rgba(255,255,255,.10)`, text `#fff`. **Inactive** border `rgba(255,255,255,.08)`, bg `rgba(255,255,255,.03)`, text `#a0a0a0`; **hover** bg `rgba(255,255,255,.07)`, text `#fff` (computed hover border stays `.08`); focus-visible border `white/.35`, no outline. `transition-colors` default (150 ms).
- Navigation uses router links with `resetScroll:false`, `includeSearch`/exact active match; the chips row is identical (same y=544) on all category pages. Clone: plain links.

### 4.4 Sections
Section order (default, no query): **Our Picks**, **Trending**, **Made to Remix** (View All -> `/store/remixable` [I]), **Award Winners** (View All -> `/awards` [I]), **Latest**. Wrapper `div.mt-8.flex.flex-col.gap-8` (margin-top 32, section gap 32), first section top y=620.
- Section `section.flex.flex-col.gap-1.5.xs:gap-2` (gap 8). Header `div.flex.min-h-7.items-center.justify-between.gap-4` (28px tall): left `div.flex.min-h-7.items-center.gap-3` with **h2** Inter 16px/22px/500 `#fff` and optional "View All" accessory; right pager.
  - "View All": `a.flex.min-h-7.items-center.gap-0.5.rounded-sm.text-sm.font-medium.text-text-secondary` (14px/500/#a0a0a0 + chevron-right `size-3.5`), focus ring `ring-1 white/30`. 69.8x28 at x=365 after "Made to Remix".
  - Pager (shown only when items exceed page size): `div.flex.shrink-0.items-center.gap-1.5` of two `button.liquid-glass.grid.size-7 (28).place-items-center.rounded-full` (aria "Previous/Next {Section title}"), chevron `size-4` nudged -1/+1px, text `#a0a0a0`, hover bg `#28282894` + white (enabled only), **disabled opacity .35** (Previous disabled on page 0; cursor stays pointer). Positions at 1440: prev x=1138, next x=1172, y of header.
- Slider: `div.-mx-2.overflow-hidden > div.flex.w-full.will-change-transform.transition-transform.duration-500.ease-[cubic-bezier(0.22,1,0.36,1)]` with inline `transform: translate3d(-N*100%,0,0)`; pages `div.w-full.shrink-0.px-2` (off-screen pages `aria-hidden` + `inert`). Page change **500 ms `cubic-bezier(0.22,1,0.36,1)`** (verified: mid-transition translate -975.995 -> -976). `motion-reduce:transition-none`. Horizontal trackpad wheel also pages (same wheel hook). Max 24 items per section.
- Page size by column count (JS `matchMedia`): 1 col (<480) 6, 2 cols (480-767) 8, 3 cols (>=768) 6, 4 cols (>=1920) 12. Made to Remix uses `{2:4, 3:3, 4:4}` (3 per page at 1440, 1 row; <480 default 6) and caps at 12 total. Page counts at 1440: Our Picks 4 pages (24/6), Trending 2, Latest 4, Made to Remix 3 (8 items/3), Award Winners 10 items. Short last pages are padded with invisible `h-[72px]` placeholders to keep height.
- Grid `div.store-app-grid.grid.grid-cols-1.gap-x-5.gap-y-1.xs:grid-cols-2.md:grid-cols-3` (gap 4px 20px); `>=1920: repeat(4,minmax(0,1fr))`. 1440: three cols of 306.66px; section grid h=148 (2 rows x 72 + 4) -> section 184 tall for 6-per-page, 108 for 3. 390: 1 col 358px, grid h=452 (6 x 72 + 5 x 4).

### 4.5 App row card (used everywhere: sections, category grids, search, suggested/remixes, awards)
`a[aria-label="Open {name}"][href=/app/{slug}]` [I]: `-mx-2 flex h-[72px] items-center gap-3 rounded-2xl (18) px-2 transition-colors hover:bg-surface`. Hover bg `rgba(255,255,255,.10)` over 150 ms; nothing else moves. Box 322.7x72 at x=232 (bleeds 8px past the 240 grid edge, text stays aligned at 240). Inside:
- Icon `.glaze-app-icon-glass h-14 w-14` (56) at x=240.
- Text `div.min-w-0.flex-1` (starts x=308 = icon + 12 gap), three lines:
  1. `div.flex.min-w-0.items-center.gap-1`: **h3** `min-w-0 truncate text-sm font-medium leading-[18px]` (Inter 14/18/500 `#fff`) + optional award icon (16px) or "Finalist" text, or remix icon: lucide `shuffle ml-0.5 size-3.5 text-text-tertiary` with `title/aria-label="Remix of {parent} by {author}"` (on remixes lists).
  2. `p.store-app-card-description.truncate.text-sm.leading-[18px].text-text-secondary` tagline (14/18/400 `#a0a0a0`). A CSS util (`[&_.store-app-card-description]:hidden` / `:block`, with `min-[624px]` variant) can hide descriptions in some contexts; **on /store they are visible at all widths**.
  3. `div.mt-0.5.flex.items-center.gap-1.5.text-sm.leading-[18px].text-text-secondary`: author avatar `img.h-3.5.w-3.5 (14).rounded-full.object-cover` (only when `avatar_url` exists) + author name `span.truncate`.
- Total content stack = 18+18+2+18 = 56 (equals icon height).

### 4.6 Click behavior
- Clicking a card on `/store` (and category pages) navigates to the full `/app/:slug` page (verified: URL became `/app/miccheck-TRFqOJ`, no dialog). The app-details **dialog is only used from the landing page persona cards** (section 7).

### 4.7 Award Winners section
Uses the same slider, `titleAccessory` "View All" -> `/awards` [I]. Items = 3 medal winners (gold, silver, bronze, in that order) then up to 7 finalists sorted by rank; medal rows show the 16px medal icon after the name; finalists show text "Finalist" (`#717171`, 14/18). 10 total at 3 per page -> 4 pages.

### 4.8 Loading skeleton (client-side category/search fetch)
`div.animate-pulse` (pulse 2s cubic-bezier(.4,0,.6,1) infinite) containing 24 placeholder rows, then a pagination skeleton `div.mt-8.flex.h-8.items-center.justify-center > div.h-8.w-[220px].animate-pulse.rounded-full.bg-white/[0.06]`. SSR renders real data, so skeletons only appear on client navigation.

---

## 5. Routes `/store/:category` (remixable, developer-tools, productivity, utilities, media, design, lifestyle, games-and-fun)

All eight share one template (`StoreView` with `category` prop), identical frame/hero/header/chips to `/store`. Differences:
- **Hero carousel**: same component and same 10 featured apps, randomly ordered per request (not filtered by category).
- **h1** = chip label (e.g. "Design", "Games & Fun"); a visually hidden `<p class="sr-only">` carries the category description (same text as meta description, section 6.2). Chip with matching href gets the active style and `aria-current=page`.
- **Body** (default view) replaces the sections with a single paginated grid:
  - Grid: `div.mt-8.flex.flex-col.gap-8 > div > section > div.-mx-2.overflow-hidden > div.flex.w-full... > div.w-full.shrink-0.px-2 > div.store-app-grid...` (same slider wrapper with a single page; no h2, no pager buttons). **24 apps per page**: 1440 -> 3 cols x 8 rows, grid 960x604 (8 x 72 + 7 x 4), starts y=620; 390 -> 1 col, grid 358x1820 (24 x 72 + 23 x 4), starts y=479. Page docH: design 1440 = 1490, 390 = 2567.
  - **Remixable** is different: first h2 **"Made to Remix"** (8 apps, 3 per page at 1440 so 3 pages with pager, no "View All" link here), then h2 **"All Remixable Apps"** with the 24-app grid and pagination (total 529, 23 pages). docH 1818 at 1440. Pager buttons for the first block follow section 4.4.
- **Pagination** (`nav[aria-label=Pagination].mt-8.grid.grid-cols-[1fr_auto_1fr].items-center`, 32px tall, 32px below grid; 960x32 at 1440, y=1256 for design): numbered links, NOT infinite scroll. URL `?page=N` (page 1 has no param); changing page keeps scroll (`resetScroll:false`) and is a full data refetch (react-query key `store-category-page`). If `?page` exceeds pageCount it redirects (replace) to the last page.
  - Left "Previous" and right "Next": `inline-flex h-8 items-center gap-1 rounded-full text-sm font-medium text-text-secondary hover:bg-surface hover:text-text-primary`, padding `0 12px 0 4px` (left, label shown >=480) / `0 4px 0 12px` (right). Chevron `size-4`. Label spans `hidden xs:inline`, so at 390 only the chevron shows (Next 28x32, Previous hidden at 0 when disabled? On page 1 the disabled Previous renders `span` with `opacity-35 aria-disabled=true`, same box).
  - Center `div.flex.items-center.justify-center.gap-1`: page buttons `a.grid.size-8 (32).place-items-center.rounded-full.text-sm.font-medium` (14/20/500) `aria-label="Page N"`; current = `bg-surface` (rgba(255,255,255,.10)) + `#fff` + `aria-current=page`; others `#a0a0a0`, hover bg `rgba(255,255,255,.10)` + `#fff`. Ellipsis `span.grid.size-8...text-text-tertiary` "…" (14/400 #717171).
  - Window algorithm `pages(p,t)`: if p<=3 -> {1,2,3,4,t}; else if p>=t-2 -> {1,t-3,t-2,t-1,t}; else {1,t,p-1,p,p+1}; sorted; a gap of exactly one number is filled with that number, a larger gap becomes "…". E.g. design (5 pages): 1 2 3 4 5; remixable page 1 (23): 1 2 3 4 … 23.
  - Measured: design 1440 buttons at x=632,668,704,740,776 (36px pitch); Next x=1132.7 w=67.3.
- Hover/click: clicking "Next" on /store/design navigates to `?page=2` (second page of 24, data in `categoryPages.design.page2Sample`).
- Search on a category page behaves like 4.2 (switches the body to search results).
- 390 differences: grid 1 col; chips row scrolls horizontally (964 content in 390 viewport); pagination centered numbers with chevrons only; header row 40px tall.
- "Remixable" empty state / error: `ok:false` or empty -> "No apps found" box.

### 5.2 Category meta (titles = `<title>`, desc = meta description = sr-only text)
| Route | Title | Description |
|---|---|---|
| /store/remixable | Remixable Apps. Start from an app someone already built. | Browse Glaze apps you can remix: open one in Glaze, make it yours, and publish your own version to the Store. |
| /store/developer-tools | Developer Tools for Mac — Coding & API Apps \| Glaze | Discover developer tools for Mac, including API clients, database utilities, coding helpers, usage monitors, and automation apps built with Glaze. |
| /store/productivity | Productivity Apps for Mac — Focus & Workflow Tools \| Glaze | Explore productivity apps for Mac that help you focus, plan projects, manage tasks, track time, and streamline everyday workflows with Glaze. |
| /store/utilities | Mac Utilities — Menu Bar & System Tools \| Glaze | Find Mac utilities for menu bar workflows, system monitoring, file management, shortcuts, and everyday desktop tasks, all built with Glaze. |
| /store/media | Media Apps for Mac — Audio, Video & Music Tools \| Glaze | Browse media apps for Mac for audio, video, music, recording, playback, and creative workflows, built by the Glaze community. |
| /store/design | Design Apps for Mac — Color, Image & UI Tools \| Glaze | Discover design apps for Mac for colors, images, interface work, creative assets, and visual workflows, built by the Glaze community. |
| /store/lifestyle | Lifestyle Apps for Mac — Personal & Everyday Tools \| Glaze | Explore lifestyle apps for Mac for personal routines, wellness, hobbies, home life, and everyday organization, built with Glaze. |
| /store/games-and-fun | Games & Fun Apps for Mac — Playful Desktop Apps \| Glaze | Discover games and fun apps for Mac, from quick diversions and playful utilities to creative desktop experiences built with Glaze. |

---

## 6. Route `/app/:slug` (template)

Sampled: `my-stash-CDBw9Z` (silver, remixable, featured, 6 screenshots), `elsewhere-khfW1h` (bronze, Glaze AI, not remixable, 5 shots), `the-last-blockbuster-oRLCOs` (gold, not remixable, 3 shots, author `@zenithquinn` has no avatar), `kalcy-gSzJCA` (not featured, Glaze AI, not remixable, installs "<100", `award_entry {result:null}`), `image-sequencer-IxkyCn` (has "Remixes" list, remixable, 5 shots), `image-sequencer-quick-slideshow-Z0idNt` (remix of another app, "Remixed from" bar, 1 shot).

Page layout, `div.mx-auto.flex.max-w-page.flex-col.gap-6` (24px gaps). Block order:
1. Header (two variants: cover hero if `featured_app_image_url` else plain header)
2. (remix only) lineage bar
3. Stats strip
4. Screenshot gallery strip
5. About (sr-only h2 "About {name}" + description paragraph)
6. (if any) **Remixes** list
7. **Suggested Apps** list (payload has 5 related; live renders the first 4, re-measured 2026-10-22)

docH: My Stash 1449 / 390: 1473; Elsewhere 1431 / 1509; Last Blockbuster 1395 / 1491; Kalcy 1205 / 1411; Image Sequencer 1333 / 1467; Quick Slideshow 1213 / 1347.

### 6.1 Header A: cover hero (apps with `featured_app_image_url`: My Stash, Elsewhere, Last Blockbuster)
- `div.relative.isolate.overflow-hidden.rounded-2xl.xs:rounded-3xl.bg-surface-well` (#080808) height `clamp(220px,38vw,360px)` (>=1920 clamp(360,38vw,480)). 960x360 at (240,80); 358x220 at (16,76) on mobile.
- Cover `img.absolute.inset-0.w-full.h-full.object-cover` (`featured_app_image_url`, rendered as `rs:fit:1600:0/q:85`). Scrim `absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent` (darker than the store carousel).
- **Featured badge** (top-right): `span.pointer-events-none.absolute.right-3.top-3.xs:right-4.xs:top-4.z-10.inline-flex.items-center.gap-1.5.rounded-full.border.border-white/15.bg-black/45.py-1.5.pl-2.pr-3.text-xs.leading-none.font-medium.text-white.backdrop-blur-md` + shadow `0 8px 24px rgba(0,0,0,.28)`, lucide `star` 12px `fill-current`, label "Featured". 90.8x26 at (1093.2, 96) on desktop.
- Overlay `div.absolute.inset-x-0.bottom-0.z-10.p-4.xs:p-5` > `div.flex.items-center.gap-4.xs:gap-6`: icon 112 (>=480) / 80 (<480); text column `flex min-w-0 flex-col gap-1`:
  - Title row `flex min-w-0 flex-wrap items-center gap-2`: **h1** `text-balance text-lg font-medium leading-tight xs:text-xl xs:leading-[26px] text-white`: Inter **20px/26px/500** (>=480), 18px/22.5px (<480). Then `div.flex.shrink-0.items-center.gap-1` with badges: award pill (6.4), **Glaze AI** badge (6.5).
  - Tagline `p.flex.min-w-0.items-center.gap-1.5.overflow-hidden.whitespace-nowrap` `text-xs leading-4 xs:text-sm xs:leading-[18px]` `rgba(255,255,255,.72)` (14/18, 12/16 <480), inner span truncates.
  - CTA row (see 6.3) `mt-2 hidden items-center gap-2 xs:flex`.
- Desktop measured: icon (260,308,112,112); h1 at x=396 y=318; tagline y=348; CTAs y=378 (h=32); block bottom padding 20 (card bottom 440).
- 390: icon 80x80; title column starts x=128; h1 at y~219-247; tagline y=247; **CTA row is `hidden` below 480px (no download/remix/open buttons on mobile at all).**

### 6.2 Header B: plain header (no cover: Kalcy, Image Sequencer, Quick Slideshow)
`div.pt-6.xs:pt-10` (24 / 40) containing the same icon + text block (no scrim, no Featured badge). Title text color `text-text-primary` (#fff), tagline color **`#a0a0a0` (text-secondary)** instead of white/.72. Height 152 at 1440 (y=80..232; icon at y=120); 104 at 390. No background card.

### 6.3 CTA row (desktop >=480 only), `div.mt-2.hidden.items-center.gap-2.xs:flex`
- **"Open in Glaze"** `a[href="/go?path=store%2F{app-uuid}"][target=_blank][rel=noreferrer]` [I]: `inline-flex items-center justify-center gap-2 rounded-full font-medium text-white bg-accent hover:opacity-90 disabled:opacity-50 h-8 (32) px-3.5 (14) text-sm`. Inter 14/20/500, bg `#245aca`, 121.2x32. Transition colors 150 ms; hover `opacity .9`.
- Second button depends on `remixable`:
  - **Remixable** -> **"Remix"** `a[href="/go?path=store%2F{uuid}&action=remix"][target=_blank]` [I], 94.9x32, with lucide `shuffle size-4`: `border border-border-separator bg-surface hover:bg-white/[0.12] hover:opacity-100` (bg `rgba(255,255,255,.10)`, border `rgba(255,255,255,.10)`, hover bg `.12`). Wrapper `div.group/remix.relative` with tooltip `div[role=tooltip]` "Creates a copy of this app you can edit in Glaze": `absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 whitespace-nowrap rounded-md border border-border-separator bg-surface-popover px-2 py-1 text-xs leading-none text-white shadow-lg opacity-0`, `opacity-100` on `group-hover` / `group-focus-within`, `transition-opacity 150ms`. Measured 288.6x22 centered above the button.
  - **Not remixable** -> **"Download Glaze"** `a[href="/download"]` [I], same secondary style without icon, 138.6x32.
- No separate **share** button exists on the page (no share/copy-link control anywhere in DOM; only `Next screenshot` button was found). `/go?...` is a redirect that opens the Glaze desktop app (deep link) and is not clonable; point to `#` or `/download` in the clone.
- Author link goes to `/@{username}` [I].

### 6.4 Badges
- **Award pill** (My Stash silver, Elsewhere bronze, Blockbuster gold): section 1.4. Only shown when `award_entry.result` is a medal; "Finalist" is not shown on the app page.
- **Glaze AI badge** (`ai_capability != null`: Elsewhere, Kalcy): `span.group/ai.relative > span.inline-flex.items-center.justify-center.gap-1.5.rounded-full.px-2.py-1.pl-1.5.pr-2.text-xs.font-medium.text-accent.bg-white/[0.08].hover:bg-white/[0.12]` with lucide `sparkles size-3.5 text-accent` and label "Glaze AI". Text color `#245aca` (accent). Tooltip `span[role=tooltip]` (`max-w-[240px] text-balance text-left leading-snug text-xs`, same popover style as remix tooltip, opacity 0 -> 1 on hover/focus-within): `"{ai.purpose} AI usage is billed to your Glaze credits, with a daily cap."`. 76x76 box at x=357-597 shows tooltip above (240 wide, 76 tall for Kalcy).

### 6.5 Remix lineage bar (only when `remix_lineage != null`)
`div.flex.items-center.gap-2.rounded-xl.bg-white/[0.04].px-4.py-2.5.text-sm.leading-[18px].text-text-secondary`: radius 18px, padding 10px 16px, bg `rgba(255,255,255,.04)`, 960x38 at y=256 (1440) / 358x38 at y=204 (390). Lucide `shuffle size-4 shrink-0` + `p.min-w-0.truncate`: "Remixed from {Parent name} by {Author}" where parent name links to `/app/{parentslug}` [I] and author to `/@{username}` [I], both `text-text-primary` (#fff), hover `text-text-secondary`, focus ring `ring-1`. Parent slug is `slugify(parent_display_name)-parent_public_id`.

### 6.6 Stats strip
`div.flex.overflow-hidden.border-y.border-border-separator` (borders `rgba(255,255,255,.10)` top/bottom, no radius), 960x64 at y=464 (1440); 358x52 at y=320 (390). 4 equal-ish cells (`flex-1` except Author cell `min-w-[20%] max-w-2/5` <480 and `min-w-[25%] max-w-[50%]` >=480): `flex flex-col items-center gap-0.5 xs:gap-1 px-1 xs:px-3 py-2.5 xs:py-3`.
- Label: `text-2xs (10) xs:text-xs (12) font-medium uppercase leading-3 xs:leading-[14px] text-text-tertiary` (#717171): AUTHOR / SIZE / UPDATED / INSTALLS.
- Value: `text-xs xs:text-sm (14/18) text-text-primary (#fff)` truncate. Author cell is a link [I] `/@{username}` (`aria-label="View {name}"`, hover `#a0a0a0`) with avatar `img` 20px (16px <480) rounded-full (omitted when no avatar, e.g. `@zenithquinn`) + name. Cell x positions at 1440: Author 240 w240, Size 480, Updated 720, Installs 960 (each 240).
- Values: size `11.8 MB`/`73 KB`, updated `25 Aug 2026`, installs `777` or `<100`.

### 6.7 Screenshot gallery strip
`div.relative.h-[220px].xs:h-[260px].-mx-4` (992x260 at x=224,y=552 at 1440; 390x220, x=0, y=396 at 390). Strip `div.hide-scrollbar.flex.h-full.gap-3.overflow-x-auto.px-4` with inline `scroll-snap-type: x mandatory; overscroll-behavior-x: contain; scroll-padding: 0 16px`. Each `img.h-full.w-auto.shrink-0.cursor-pointer.rounded-lg.object-cover` (radius 8px) with `scroll-snap-align:start`, alt "Screenshot N", natural aspect (e.g. 344.9x260 for My Stash = 1.33:1; widths vary by image, gap 12). First image starts at x=240 (16 inset). 
- Fades: left `pointer-events-none absolute inset-y-0 left-0 z-30 w-16 bg-gradient-to-r from-background to-transparent transition-opacity duration-300` (opacity 0 at scrollLeft 0, 1 once scrolled), same on right (`bg-gradient-to-l`, visible while more content to the right).
- **Next arrow**: `div.group/next.absolute.inset-y-0.right-0.z-40.flex.w-20.items-center.justify-center` (80 wide) containing `button[aria-label="Next screenshot"]`: 36x36 `rounded-full border border-white/[0.12] bg-white/[0.1] text-white/90 shadow-[0_10px_28px_rgba(0,0,0,.28)] backdrop-blur-[12px]` with `transition-[background-color,border-color,...]`; sits at (1158,664) at 1440 (x=332,y=488 at 390). It scrolls the strip to the next image, and is hidden when nothing remains (and apps with 1 screenshot have no button: Quick Slideshow). A left button appears symmetrically when scrolled (inferred from `group/prev` fades; not captured, treat as symmetric).
- Hover on screenshot: no style change (opacity 1, no transform). Cursor pointer.
- **Lightbox** (click any screenshot; Base UI Dialog in a portal `data-base-ui-portal`, wrapper `fixed inset-0 z-[200]`):
  - Backdrop `div.fixed.inset-0.bg-black.animate-lightbox-in` (**solid #000**, fade-in **.2s ease-out both**).
  - Dialog `div[role=dialog][aria-label="Screenshot gallery"].dialog-focus-surface.fixed.inset-0.outline-none`.
  - Current image: `img.absolute.top-1/2.left-1/2.w-[70vw].max-h-[80vh].-translate-x-1/2.-translate-y-1/2.rounded-xl (12px in v3, computed 18px).object-contain` -> 1008x720 at (216,90) at 1440. (Exact CSS `rounded-xl` computed 18px in the original theme; clone should use 18px.)
  - Next image peek: `img.absolute.top-1/2.right-[-50%].w-[60vw].max-h-[80vh].-translate-y-1/2.cursor-pointer.opacity-60.rounded-xl.object-contain` (864x651 at x=1296, mostly off-screen, clickable to advance). Previous peek is the mirrored `left-[-50%]` image (when index>0).
  - Close `button[aria-label="Close gallery"]`: `absolute top-4 right-4 xs:top-6 xs:right-6 z-10 h-10 w-10 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors`, lucide `x` 20px stroke 2.25; 40x40 at (1376,24).
  - Counter pill `div.absolute.bottom-5.left-1/2.-translate-x-1/2.rounded-full.bg-white/10.px-3.py-1.text-sm.tabular-nums.text-white/70` "1 / 6" (14px/20px, `rgba(255,255,255,.7)`).
  - Keys: `ArrowRight`/`ArrowLeft` change image (observed: right advances and the previous peek appears), `Esc` closes (verified, no fixed layers remain). Focus is trapped (focus guards). Clicking a peeking image navigates. Swipe not measured.
  - Slide transition between images was not captured (images swap/translate; only the 0.2 s fade-in of the backdrop was confirmed). Treat as instant swap or 150-200 ms fade.

### 6.8 About
`section` with sr-only `h2` "About {name}" and `p.whitespace-pre-line.text-balance.text-sm.leading-[18px].text-text-secondary` (Inter 14/18/400 `#a0a0a0`), full-width 960 (358 mobile), y=836 at 1440. Text = `full_description` (not stored in snapshot; stored only `fullDescription.length` and `paragraphs`: e.g. My Stash 561 chars; Elsewhere 558; Blockbuster 583; Kalcy 777; Image Sequencer 526; Quick Slideshow 435; 3-6 paragraphs incl. "Key Features:" bullet lines using `-` or unicode bullets). Heights: My Stash 216 (1440) / 288 (390); Blockbuster 162 / 306. Line breaks preserved (`whitespace-pre-line`). Clone must supply its own placeholder copy of similar length; do not reuse source text.

### 6.9 Remixes and Suggested Apps lists
Block `div.mt-4.flex.flex-col.gap-3` (extra 16px above, 12px inside gap) > **h2** Inter 16px/22px/500 `#fff` ("Remixes" or "Suggested Apps") + `div.grid.grid-cols-1.gap-px.xs:-ml-2.sm:grid-cols-2` of app rows. Row is the 4.5 card but `px-0 xs:px-2` (no horizontal inset <480) and **2 columns at >=640** (483.5px each at 1440; rows h=72, gap 1px), so 4 suggested apps = 2 rows = 145px block (live now renders 4 of the 5 in the payload). 390: 1 col, 325 tall. "Remixes" appears only on parents that have remixes (Image Sequencer: 1 remix; the remix row carries the shuffle "Remix of ..." icon). Suggested = `relatedApps` (5 apps). Each row links [I] `/app/{slug}`.

### 6.10 Motion on /app
No scroll-triggered animation. Only: 150 ms colour/opacity transitions on buttons, rows, tooltips; 200 ms icon fade-in; 300 ms opacity transition on screenshot strip fades; lightbox backdrop 0.2 s ease-out fade-in. No entrance animation on page load (content rendered by SSR).

---

## 7. App-details dialog (landing page persona card, clone can open it or link to `/app/:slug`)
Triggered by clicking a persona card `a[href=/app/{slug}][aria-label="Preview {name}"]` on `/` (URL stays `/`; the router intercepts). Observed on Mia Calendar.
- Portal `div[data-base-ui-portal]`:
  - Backdrop `div.animate-lightbox-in.fixed.inset-0.z-[80].bg-background/75.backdrop-blur-[5px]` (`rgba(18,18,18,.75)`, blur 5px, fade-in .2s ease-out).
  - Dialog `div[role=dialog][aria-label="{name} details"].dialog-focus-surface.animate-lightbox-in.fixed.left-1/2.top-1/2.z-[90].flex.flex-col.-translate-x-1/2.-translate-y-1/2.outline-none`: size `h-[calc(100dvh-28px)] xs:h-[calc(100dvh-72px)] max-h-[800px] w-[calc(100%-32px)] max-w-page (960)`; fade .2s ease-out.
  - Close button `button[aria-label="Close app details"].absolute.right-4.top-4.xs:right-6.xs:top-6.z-20.flex.h-11.w-11.xs:h-10.xs:w-10.rounded-full.border.border-white/[0.08].bg-[rgba(35,35,35,.34)].text-white.shadow-[0_10px_28px_rgba(0,0,0,.28)].backdrop-blur-[12px].backdrop-saturate-[180%].hover:border-white/[0.14].hover:bg-[rgba(42,42,42,.52)]` with lucide `x` 20px stroke 2.25, ring-2 white/45 on focus-visible.
  - Inner surface `div.relative.min-h-0.flex-1.overflow-hidden.rounded-[32px].xs:rounded-[44px].border.border-border-separator.bg-[#121212].shadow-2xl` > `div.dialog-scroll-area.h-full.overflow-y-auto` > `section.pb-14.px-6.pt-6` > `div.mx-auto.flex.max-w-page.flex-col.gap-6`.
  - Content = the same blocks as `/app/:slug` (6.1-6.9): header uses **Header B** (no cover hero; first block is `div.pr-12.xs:pr-14` wrapping icon + title so text never runs under the close button), then stats strip, screenshots, about, suggested apps. Mia Calendar had Open in Glaze + "Download Glaze" (not remixable) buttons and the author link to `/@muntyan.dana`. Links inside the dialog are real routes (`/@user`, `/app/...`).
  - Keyboard: `ArrowRight` switched to the next persona app (Mia Calendar -> Flor, header h1 updated, URL unchanged), `Esc` closes (verified). Prev/next buttons exist per CLONE_SPEC section "Overlays" (not separately measured here).
- Recommendation: link cards to local `/app/:slug` unless the dialog is cloned; if cloned, re-use the app-page components with `compact` header B.

---

## 8. Interaction/state summary (verified)
| Element | Rest | Hover | Focus-visible | Transition |
|---|---|---|---|---|
| Hero edge buttons | glass circle opacity 0 | opacity 1, bg #28282894 | no outline (`box-shadow:none`) | bg, opacity .15s cubic-bezier(.4,0,.2,1) |
| Hero card | cursor pointer | none | `ring-2 white/55` | n/a |
| Dots | w/20% white | white/35 | n/a (tabindex -1) | transition-all 150ms |
| Search | glass pill | none | none (outline removed) | all .2s cubic-bezier(.4,0,.2,1) |
| Category chip | border .08 bg .03 #a0a0a0 | bg .07, text #fff | border white/.35 | colors 150ms |
| App row | transparent | bg rgba(255,255,255,.10) | (default) | colors 150ms |
| Section pager | glass 28px | bg #28282894 + white (enabled only) | n/a | colors 150ms; disabled .35 |
| Page number | #a0a0a0 | bg .10 + #fff | n/a | colors 150ms |
| Open in Glaze | #245aca | opacity .9 | n/a | colors 150ms |
| Remix/Download | bg .10 border .10 | bg .12 | n/a | colors 150ms |
| Screenshot | cursor pointer | none | n/a | none |
| Award pill | border .10 bg black/35 | border .15, bg white/.10 | `ring-2 white/45` | colors 150ms |

Durations and easings (measured or from bundles): autoplay 4000 ms; hero slide 260 ms ease-out; drag snap-back 180 ms / advance 220 ms; section page 500 ms `cubic-bezier(.22,1,.36,1)`; search debounce 250 ms; icon fade 200 ms; lightbox/dialog fade `.2s ease-out both`; strip fade 300 ms; default 150 ms `cubic-bezier(.4,0,.2,1)`.

---

## 9. Link inventory
Internal [I]: `/` (logo, nav Home), `/pricing`, `/store`, `/blog`, `/changelog`, `/signup`, `/api/download?cta=nav_download`, `/terms`, `/privacy`, `/aup`, `/awards`, `/download`, `/store/remixable`, `/store/{category}` (x7), `/store/*?page=N`, `/store?q=`, `/app/{slug}` (all cards), `/@{username}` (author), `/go?path=store%2F{uuid}[&action=remix]` (deep link, opens desktop app, not cloneable).
External [E] (not cloned): `https://manual.glaze.app`, `https://x.com/glazeapp`, `https://glaze.app/community`, `https://www.youtube.com/channel/UCZltNInxFzkNzBqg_G4EdXg`, `https://reddit.com/r/glazeapp`, `https://raycast.com`, author social links in data (`website, x, github`; not rendered on /app, only on `/@user`), `us.i.posthog.com`.

---

## 10. Not measurable / ambiguities
1. `_serverFn/<hash>` returns 403 to curl, so the real request/response contract and any additional parameters (page size, sort) were inferred from the SSR payload and bundles. No user-facing sort or filter controls exist besides category chips and search.
2. Hero carousel order is random per request; snapshot hardcodes one order. Autoplay start state is index 0.
3. The 5 featured slides on `/store/:category` pages are the same global featured apps (shuffled), not category-filtered. Confirmed from payload (same 10 ids on all categories).
4. App-page Previous-screenshot button and lightbox swipe/slide transition were not captured; assumed symmetric to Next and a quick fade respectively.
5. Mobile (<480) has **no** Open/Remix/Download buttons on the app page; no alternative CTA was found (possible deliberate "desktop app" gating). Matches what was measured; if the clone wants buttons on mobile that is a deviation.
6. 390 category page: measured grid/pagination positions; chips row horizontal scroll is native overflow with hidden scrollbar (scrollWidth 964).
7. Only 150 of 345 candidate images were downloaded (65 of 227 app icons). Rest must hotlink `api.glazeapp.com/storage/...` (public, no auth) or use the placeholder.
8. Author profile page `/@username`, `/awards`, `/download` are covered by other recon agents / out of scope.
9. `rounded-xl` / `text-sm leading` values come from Tailwind v4 theme (e.g. `rounded-xl` renders 18px here, the site's `--radius` scale differs from v3: sm .25rem, md .375rem, lg .5rem, xl/2xl 18px, 3xl 26px). Prefer the px values listed.
10. Dialog prev/next buttons on the landing dialog were not separately measured.
