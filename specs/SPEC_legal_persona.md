Source: https://www.glaze.app/ (routes /terms, /privacy, /aup, and /$persona: /designers, /product-managers, /engineers, /creators, /teams, /design, /development, /creativity, /personal, /fun, /productivity)

# SPEC: legal pages and persona pages

Measured live on 2026-10-22 in headless Chromium (Playwright 1.63) at **1440x900** and **390x844**, using `getComputedStyle` and `getBoundingClientRect`. I cross-checked the results against the route code in `_reference/original_files/index-BNXJhYAk.js` and the lazy chunks `_persona-Dl0frr1m.js`, `routes-BYHz6gcM.js`, `landing-page-BoLE0uv2.js`, `legal-page-D7g8mbPO.js`, `terms-BIEPwhnV.js`, `privacy-Vs7x-aEc.js` and `aup-r67OpiE3.js`, all fetched from `https://www.glaze.app/assets/`. Tokens, fonts, nav, footer and landing sections are in `/Users/riyaghosh/V3/glaze/CLONE_SPEC.md`. This file only describes differences from that spec.

Color shorthand used below (all already defined in CLONE_SPEC §1.2): `#fff` = text-primary, `#a0a0a0` = text-secondary (computed `color(srgb .628 .628 .628)`), `#717171` = text-tertiary (computed `color(srgb .442 .442 .442)`).

Screenshots are in `/Users/riyaghosh/V3/glaze/_reference/screens/`: `persona-designers-{1440,390}-full.png`, `persona-teams-{1440,390}-full.png`, `persona-design-{1440,390}-full.png` (the 404 case), and `legal-{terms,privacy,aup}-{1440,390}-full.png`.

**New assets: none.** Persona pages load exactly the landing assets, which are already in `public/assets/` and `public/assets/apps/` per ASSET_MANIFEST.md. Legal pages load only `logo-full-DAu7MkQ8.svg`, the two woff2 fonts, and the 17 idle-preloaded `app-icon1..17` PNGs (CLONE_SPEC §6), which are already local. No images, video or icons are used inside the legal prose. `public/assets/legal/` and `public/assets/persona/` were not created because there is nothing to put in them.

---

## A. Persona routes (`/$persona`)

### A.1 How the original works (from code)

- Router: `c('/$persona')`. The loader calls `wC(params.persona)`, which returns the config **only if the slug is in `vC = ['designers','engineers','product-managers','creators','teams']`**. Any other slug throws `notFound()`.
- The component (`_persona-Dl0frr1m.js`) renders the **same `LandingPage` component as `/`** with four props swapped:
  ```
  <LandingPage pricing personaApps
     initialPersona={M[persona.slug]}        // M = yC map below
     heroHeadline={persona.heroHeadline}      // contains "\n"
     heroSubheadline={persona.heroSubheadline} // no "\n"
     partnerPromotion={promoFromSearchParam(?promo=)} />
  ```
  `/` (`routes-BYHz6gcM.js`) passes `initialPersona:'personal'`, `heroHeadline:xC.headline`, `heroSubheadline:xC.subheadline`, and `partnerPromotion` from a server function.
- `yC` maps the persona slug to the preselected tab: `designers→design`, `engineers→development`, `product-managers→personal`, `creators→creativity`, `teams→teams`.
- The persona showcase (S2) reads its h2/p from the **same `SC` map keyed by the tab id** (`SC[tab].headline` / `.subheadline`). This is why `SC` also has entries for `design`, `development`, `creativity`, `personal`, `fun` and `productivity`. Those six are **tab content, not routes**. (`productivity` is not even in the tab list `bC = [personal, design, development, creativity, fun, teams]`, so it is unused config.)
- The `SC[slug].headline/subheadline/appPublicIds` of the five audience slugs are **not rendered**. Apps come from the shared `personaApps` loader, keyed by tab. For example, `/product-managers` shows the Daily Life apps.
- Head (`head()` of the route):
  - `title` = `heroHeadline.replace('\n',' ') + ". Glaze by Raycast."`
  - `description`, `og:description` and `twitter:description` = `heroSubheadline`
  - `og:title` and `twitter:title` = title
  - `og:url` and `<link rel=canonical>` = `https://www.glaze.app/{slug}`
  - `og:site_name` = Glaze
  - These replace the root defaults. The root's `og:image`/`twitter:image` (`og-glaze@2x.jpg` 2400x1260), `twitter:card=summary_large_image`, `og:type=website`, `robots=max-image-preview:large` and `theme-color=#121212` stay.
- JSON-LD: same four scripts as `/` (Organization, WebSite, SoftwareApplication, FAQPage). The only change is **SoftwareApplication.description = heroSubheadline**, because the landing component builds it from the `heroSubheadline` prop with `\n` replaced by a space.
- The hash-scroll-on-route-resolve subscription in LandingPage returns early unless `pathname === '/'`, so it is inert on persona pages. This is a minor detail and has no visible effect on direct loads.

### A.2 Persona diff table (all 11 requested slugs, measured)

Everything not listed here is **identical to `/`**: section order (hero `#overview`, then `.animate-fade-in` wrapping showcase, `#features`, `#faq`, `#download` and footer), all section boxes, all motion (AnimateIn delays 0/100/200/300/400ms, fade-in 500ms delay, panel fade), all styles, and the document height at 1440 (**6141** on every 200 persona). No sections are hidden or reordered.

| Route | HTTP | Hero h1 (`\n` = line break) | Hero sub (single span, no `<br>`) | Tab preselected | `<title>` |
|---|---|---|---|---|---|
| `/` (baseline) | 200 | Desktop apps,\nreimagined by you. | Create any app in minutes by chatting with AI.\nBeautiful, powerful, and truly personal. | Daily Life (`personal`) | Glaze — Build and Share Mac Apps with AI |
| `/designers` | 200 | Ship the Mac app you\nalways wanted to make | Your design sense and an idea are all it takes. Glaze builds, packages, and publishes the app for you. | **Design** | Ship the Mac app you always wanted to make. Glaze by Raycast. |
| `/product-managers` | 200 | Turn product ideas into\nworking desktop apps | Describe the idea. Glaze turns it into a working Mac app, no engineering time required. | Daily Life (same as `/`) | Turn product ideas into working desktop apps. Glaze by Raycast. |
| `/engineers` | 200 | Solve any problem\nwith a desktop app | The tools you keep meaning to build, finally built. Glaze does the heavy lifting. | **Development** | Solve any problem with a desktop app. Glaze by Raycast. |
| `/creators` | 200 | Your creative workflow,\nnow a desktop app | Describe how you write, edit, or publish. Glaze shapes a Mac app around your process. | **Creativity** | Your creative workflow, now a desktop app. Glaze by Raycast. |
| `/teams` | 200 | Desktop apps built\naround your team | Create tools that fit your team's unique workflow, shared as Mac apps for everyone. | **Your Team** (logo grid + "See how teams use Glaze" → `/blog/how-we-use-glaze-at-raycast`) | Desktop apps built around your team. Glaze by Raycast. |
| `/design` | **404** | n/a: renders the 404 page | | | Page Not Found — Glaze (+ `robots=noindex`) |
| `/development` | **404** | n/a: 404 | | | Page Not Found — Glaze |
| `/creativity` | **404** | n/a: 404 | | | Page Not Found — Glaze |
| `/personal` | **404** | n/a: 404 | | | Page Not Found — Glaze |
| `/fun` | **404** | n/a: 404 | | | Page Not Found — Glaze |
| `/productivity` | **404** | n/a: 404 | | | Page Not Found — Glaze |

`meta description` / `og:description` / `twitter:description` = the hero sub column. `og:url` / canonical = `https://www.glaze.app/{slug}`.

The showcase panel content for the preselected tab is exactly the per-tab content in CLONE_SPEC §S2 (Design: My Stash, Icon Keeper, Radius Match, Font Finder; Development: Yolo, Awesome Script Commands, AI Skills Browser, Pro⁺ Usage; Creativity: Elsewhere, CS Glaze Synth, Image Sequencer, Paper Shaders; Daily Life: Mia Calendar, Flor, Reading Corner, Alto; Your Team: Raycast/Linear/Vercel/Cursor logos). Tabs are still fully switchable. Only `useState(initialPersona)` changes, and a `useEffect` resets the tab and closes any open app dialog if `initialPersona` changes during client navigation.

### A.3 The 6 category slugs are 404s (exact)

`/design`, `/development`, `/creativity`, `/personal`, `/fun` and `/productivity` return HTTP 404. Their `<main>` outerHTML is **byte-identical** to `/m` at both widths (checked). It is the same "Page not found" page as CLONE_SPEC §3, with the same boxes (h1 572,392,296x48 at 1440; 94,354,202x33 at 390), docH = viewport height, no nav active link, and the dot hidden. Head: the root defaults (title `Page Not Found — Glaze`, root description and og tags) plus `robots=noindex`, with **no canonical and no og:url**. **Clone action:** route these slugs to the existing `NotFound` component, i.e. only the 5 audience slugs are valid personas.

### A.4 Measured layout differences caused by the new copy

**Hero h1.** Same classes and typography as `/`: Instrument Sans 500, 48px/52.8px, ls -1.2px, mb 16 at ≥480; 34px/37.4px, ls -0.85px, mb 12 at <480. It always renders 2 lines (span, `<br>`, span), with height 106 at 1440 and 75 at 390.

| Route | h1 box 1440 (x,y,w,h) | h1 box 390 |
|---|---|---|
| `/` | 521,188,398x106 | 54,168,282x75 |
| designers | 477,188,486x106 | 23,168,344x75 |
| product-managers | 477,188,487x106 | 23,168,345x75 |
| engineers | 521,188,397x106 | 54,168,281x75 |
| creators | 476,188,487x106 | 22,168,345x75 |
| teams | 523,188,395x106 | 55,168,280x75 |

**Hero sub.** Same p styles (18px/29.25px `#717171` mb 24 ≥480; 16px/26px mb 16 <480; `max-w-content` 640, text-balance, centered). The persona subs have no `\n`, so the p renders a single `<span>` with **no `<br class="hidden xs:block">`**. Effect:
- 1440: the box fills the 640 max width, **400,310,640x59** (2 lines, balanced). On `/` it is 525,310,390x59.
- 390: 16,255,358x52 (2 lines) for all except **/designers, which wraps to 3 lines (358x78)**. That pushes everything below down 26px: hero 831 tall (vs 805), docH **5709** (vs 5683).

**Showcase at 390** (panel height depends on the selected tab's content, same behavior as switching tabs on `/`):

| Route | showcase wrapper (y,h) 390 | panel h | docH 390 |
|---|---|---|---|
| `/`, product-managers, engineers | 965, 573 | 453 | 5683 |
| designers | 991, 573 | 453 | 5709 (sub +26) |
| creators | 965, 603 | 483 (h2 "New instruments for your ideas" wraps to 2 lines at 24px/30px) | 5713 |
| teams | 965, 569 | 449 (logo grid) | 5679 |

At 1440 every persona panel is **272,1587,896x384** (matches `/`).

**Nav.** On `/` the "Home" link is `#fff` with the active dot visible (opacity 1). On every persona route **no link is active**: Home is `#a0a0a0`, and the dot has `opacity:0; translateY(4px)` (the "no active route" state from CLONE_SPEC §2.1). The mobile menu likewise has no white link. This is because the nav matches `pathname === '/'` exactly.

**Promo.** `partnerPromotion` on persona pages comes only from `?promo=` in the URL. With no param there is no promo, which is the same visible result as `/` today.

### A.5 Clone implementation checklist (persona)

1. Add a route `/:persona`. If the slug is not in `[designers, engineers, product-managers, creators, teams]`, render `NotFound` (and set `document.title='Page Not Found — Glaze'` + `meta robots=noindex`, matching `/m`).
2. Render the existing landing page with props `heroHeadline`, `heroSubheadline` and `initialPersona` (values in the table above). The sub must render as one span with no `<br>` when the string has no `\n`.
3. Set head tags per A.1 (title, description, og:title/description/url, twitter:title/description, canonical) and update the SoftwareApplication JSON-LD description.
4. Nav: no active link or dot on persona routes.
5. Keep the motion identical to `/` (CLONE_SPEC §6). The hero AnimateIn runs on the persona h1/sub the same way.

---

## B. Legal routes (`/terms`, `/privacy`, `/aup`)

### B.1 Shared component (`legal-page-D7g8mbPO.js`)

All three pages render one component from a `blocks` array (`{type:'paragraph'|'heading'|'subheading'|'listItem'|'scheduleHeading', text, level?}`). Text is plain strings; links and bold labels are generated at render time:

- `heading` → `<h2>`, `subheading` → `<h3>`, `paragraph` → `<p>`.
- Consecutive `listItem`s are grouped into one `<ul>`; `level` nests a further `<ul>` inside the previous `<li>`.
- A list item whose text matches `/^\(?[a-z]\)?[).]\s/i` (e.g. "(a) ", "b) ") gets `class="list-none"`, which removes the bullet but keeps the 24px indent.
- **Bold label rule** (paragraphs and list items): if the text matches `/^([^:]{1,70}):\s+(.+)$/`, the label has no "http", and it starts with an uppercase letter, it renders as `<strong>Label:</strong> rest`.
- **Auto-linking:** `/(https?:\/\/[^\s]+|www\.[^\s]+|[\w.+-]+@[\w.-]+\.[A-Za-z]{2,})/g`. Trailing `),.;:` is excluded from the link. Emails get `mailto:`, and `www.` gets `https://`. **Every link** (internal, external and mailto) gets `target="_blank" rel="noopener noreferrer"`.
- `scheduleHeading` → `div.!mt-16 border-t border-border-separator pt-12 text-center` containing `p.text-sm font-medium text-text-secondary` (label) and `h2.!pt-1`. **None of the three pages use it** (0 divs measured). Do not build it.
- Default `lastUpdated` = `"30 June, 2026"`. None of the three pages override it.

DOM:
```
<main class="min-h-dvh flex flex-col">
  <section class="pt-[172px] pb-24 px-4">
    <div class="max-w-content mx-auto">                 // 640 max
      <h1 class="text-balance text-4xl xs:text-5xl font-medium leading-[1.1] tracking-tight text-center text-white mb-3">{title}</h1>
      <p class="text-sm text-text-secondary text-center mb-8">Last Updated: 30 June, 2026</p>
      <div class="text-base leading-[1.6] text-white space-y-4 [&_h2]:text-balance [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:leading-[1.5] [&_h2]:pt-6 [&_h3]:text-balance [&_h3]:text-base [&_h3]:font-semibold [&_h3]:leading-[1.5] [&_h3]:pt-2 [&_a]:underline [&_a]:hover:text-text-secondary [&_a]:transition-colors [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_strong]:font-semibold">
        …blocks…
      </div>
    </div>
  </section>
  <Footer/>     // same footer as CLONE_SPEC §2.3
</main>
```
The nav is the shared fixed nav (CLONE_SPEC §2.1/2.2) with **no active link and the dot hidden**. Footer links all stay `#717171`: the current page's footer link (Terms, Privacy Policy, Acceptable Use) is **not** highlighted.

### B.2 Computed typography and spacing (measured; identical on all three pages)

| Role | Font | Size / line-height | Weight | Letter-spacing | Color | Spacing |
|---|---|---|---|---|---|---|
| h1 title (≥480) | **Inter** (not Instrument Sans; the class has no `font-display`) | 48px / 52.8px | 500 | -1.2px | `#fff` | mb 12px; center; text-wrap balance |
| h1 title (<480) | Inter | 36px / 39.6px | 500 | -0.9px | `#fff` | mb 12px |
| "Last Updated: 30 June, 2026" | Inter | 14px / 20px | 400 | normal | `#a0a0a0` | mb 32px; center |
| prose container | Inter | 16px / 25.6px | 400 | normal | `#fff` | `space-y-4`: every child except the last has **margin-bottom 16px** (margin-top 0) |
| p | Inter | 16px / 25.6px | 400 | normal | `#fff` | mb 16 |
| h2 | Inter | **24px / 36px** | **600** | normal | `#fff` | **padding-top 24px**, mb 16, text-wrap balance |
| h3 | Inter | **16px / 24px** | **600** | normal | `#fff` | **padding-top 8px**, mb 16, text-wrap balance |
| ul | Inter | 16px / 25.6px | 400 | | `#fff` | `list-style: disc outside`; **padding-left 24px**; mb 16; `space-y-2` gives li mb **8px** (last li 0) |
| li marker | | 16px | | | `#fff` (inherits) | default disc |
| li.list-none | | | | | | `list-style-type:none`, still indented 24px |
| nested ul (inside li) | | | | | | disc, padding-left 24px, mt 0, mb 0; its li mb 8 |
| strong (bold label) | Inter | inherits | **600** | | `#fff` | followed by a regular space |
| a | Inter | inherits | 400 (inherits) | | `#fff` | `text-decoration: underline` (thickness auto, offset auto, color currentColor); **hover color `#a0a0a0`**; `transition: color, background-color, border-color, outline-color, text-decoration-color, fill, stroke 150ms cubic-bezier(.4,0,.2,1)` |

Measured gap between every consecutive pair of prose blocks is **16px** (P>P, P>H2, H2>P, H2>H3, H3>P, P>UL, UL>P, UL>H3 all 16). The h2/h3 padding-top sits inside the heading box, so the visible space above h2 text is 16 + 24 = 40px and above h3 text is 16 + 8 = 24px.

### B.3 Layout boxes

| | 1440 | 390 |
|---|---|---|
| section | 0,0,1440 wide; padding 172 16 96 | 0,0,390; padding 172 16 96 |
| inner `max-w-content` | x=400, w=640, y=172 | x=16, w=358 |
| h1 | y=172 | y=172 |
| Last Updated | y = h1 bottom + 12 | same |
| prose | y = updated bottom + 32 | same |
| footer | follows the section (section pb 96) | same |

Per page:

| Page | h1 lines / h 1440 | h1 lines / h 390 | prose y / h 1440 | prose y / h 390 | docH 1440 | docH 390 |
|---|---|---|---|---|---|---|
| /terms | 1 / 53 | 2 / 79 | 289 / 26868 | 315 / 44896 | 27375 | 45431 |
| /privacy | 1 / 53 | 1 / 40 | 289 / 9535 | 276 / 15566 | 10042 | 16061 |
| /aup | 3 / 158 | 5 / 198 | 394 / 12204 | 434 / 18930 | 12817 | 19584 |

**Breakpoint changes:** only one, at **xs = 480px**, where h1 goes from 36px/39.6/-0.9 to 48px/52.8/-1.2. Everything else is fluid (inner = `min(640, vw-32)`). The nav and footer switch at their own breakpoints (624 / 700 / 380) per CLONE_SPEC §2.

### B.4 Table of contents, sticky, motion

- **No table of contents**, no anchor ids on headings (0 elements with `id` in the prose), and no in-page links.
- **No sticky elements.** The only fixed elements are the shared nav and the mobile-menu backdrop button.
- **No motion.** `document.getAnimations()` is empty both immediately after load and 2s later. There is no AnimateIn, no fade-in and no scroll listeners. The only transitions are the link hover color (150ms, above) and the shared nav/footer hovers.
- No tables on any page (`table` count 0).

### B.5 Head tags (from route `head()`, measured)

| Page | `<title>` = og:title = twitter:title (= h1 text) | description = og:description = twitter:description | canonical = og:url |
|---|---|---|---|
| /terms | Glaze Terms of Service | Terms of Service for Glaze by Raycast. | https://www.glaze.app/terms |
| /privacy | Glaze Privacy Policy | Privacy Policy for Glaze by Raycast. | https://www.glaze.app/privacy |
| /aup | Glaze Platform Acceptable Use Policy (including Platform Terms of Use) | Acceptable Use Policy for the Glaze platform. | https://www.glaze.app/aup |

All three also set `og:type=website` and **`twitter:card=summary`**, overriding the root's `summary_large_image`. The root's `og:image`/`twitter:image`, `robots=max-image-preview:large` and `theme-color=#121212` stay.

### B.6 Page structure (no legal text transcribed)

Legend: `p xN` is a run of N consecutive paragraphs with each paragraph's word count. `*` marks a paragraph that starts with a bold `Label:`. Link kinds: INT = glaze.app (internal), EXT = external (not cloned), MAILTO. All links open in a new tab. The clone should keep the original href strings, since they are auto-linked from the text. Totals:

| Page | p | h2 | h3 | ul | li (incl. nested) | links | words |
|---|---|---|---|---|---|---|---|
| /terms | 106 | 15 | 26 | 4 | 23 | 9 | 10,640 |
| /privacy | 38 | 13 | 4 | 4 | 30 | 4 | 3,375 |
| /aup | 38 | 2 | 31 | 11 | 90 | 4 | 3,936 |

Heading outline per page = the h2/h3 rows in the tables below, in order. /aup starts with an h3 (no h2 until block 48), so its outline is mostly flat h3s.

For building: the clone needs the block text. Since this spec deliberately omits it, the Build agent should take the `blocks` arrays verbatim from the three chunk files (`https://www.glaze.app/assets/terms-BIEPwhnV.js`, `privacy-Vs7x-aEc.js`, `aup-r67OpiE3.js`; the variable `a=[...]` in each) and render them with the B.1 rules. That reproduces every count below exactly.

#### /terms block sequence (prose children in DOM order)

| # | Block | Detail |
|---|---|---|
| 0 | p | 247 words; link INT `https://www.glaze.app` |
| 1 | p | 71 words; link INT `http://glaze.app/privacy/` |
| 2 | p x1 | words: 66 |
| 3 | **h2** | "Definitions" |
| 4-19 | p x16 | words: 13, 10, 36, 23, 19, 37, 12, 69, 9, 22, 17, 10, 45, 26, 15, 8 |
| 20 | **h2** | "I. Service and Modification." |
| 21 | **h3** | "Services Description." |
| 22-23 | p x2 | words: 68, 90 |
| 24 | **h3** | "Modifications." |
| 25-26 | p x2 | words: 268*, 94* |
| 27 | **h2** | "II. Registration." |
| 28 | **h3** | "Your Registration Obligations." |
| 29 | p x1 | words: 200 |
| 30 | **h3** | "Member Account, Password and Security." |
| 31 | p x1 | words: 90 |
| 32 | **h2** | "III. General Practices and Professional Services." |
| 33 | **h3** | "General Practices Regarding Use and Storage." |
| 34 | p x1 | words: 121 |
| 35 | **h3** | "Professional Services and Support." |
| 36 | p x1 | words: 88 |
| 37 | **h2** | "IV. User Content." |
| 38 | **h3** | "User Content." |
| 39 | p x1 | words: 48 |
| 40 | ul (11 items, 451 words) | 11 of 11 items are `li.list-none` (start with "(a) " style enumerator, no bullet) |
| 41-51 | p x11 | words: 56, 49, 124, 37, 223, 138, 59, 64, 36, 40, 34 |
| 52 | **h3** | "License to User Content." |
| 53-54 | p x2 | words: 132, 119 |
| 55 | **h2** | "V. Fees." |
| 56 | p | 16 words; link INT `https://www.glaze.app/pricing` |
| 57 | **h3** | "Payment Processing." |
| 58 | p | 164 words; link EXT `https://stripe.com/legal`; link EXT `https://stripe.com/privacy` |
| 59 | **h2** | "VI. Intellectual Property Rights." |
| 60 | **h3** | "Service Content, Software and Trademarks." |
| 61-69 | p x9 | words: 366, 271, 29, 119, 203, 38, 139, 97, 36 |
| 70 | **h3** | "Raycast's Use of Open Source Software and Third Party Material." |
| 71 | p x1 | words: 257 |
| 72 | **h3** | "Copyright Complaints." |
| 73 | p x1 | words: 58 |
| 74 | p | 66 words; link MAILTO `mailto:copyright@raycast.com` |
| 75 | p x1 | words: 14 |
| 76 | ul (7 items, 175 words) | 7 of 7 items are `li.list-none` (start with "(a) " style enumerator, no bullet) |
| 77 | **h3** | "Repeat Infringer Policy." |
| 78 | p x1 | words: 58 |
| 79 | **h3** | "Feedback." |
| 80 | p x1 | words: 51 |
| 81 | **h2** | "VII. Data Protection." |
| 82 | **h3** | "General." |
| 83-84 | p x2 | words: 255, 107 |
| 85 | **h3** | "Security." |
| 86 | p x1 | words: 109 |
| 87 | **h3** | "Sub-processing." |
| 88 | p x1 | words: 65 |
| 89 | **h3** | "International Data Transfers." |
| 90 | p | 385 words; link EXT `https://eur-lex.europa.eu/eli/dec_impl/2021/914/oj` |
| 91 | **h3** | "Assistance." |
| 92 | p x1 | words: 55 |
| 93 | **h3** | "Audit." |
| 94 | p x1 | words: 47 |
| 95 | **h3** | "Term and Duration of Processing." |
| 96 | p x1 | words: 62 |
| 97 | **h2** | "VIII. Generative AI." |
| 98 | **h3** | "Usage analytics." |
| 99-116 | p x18 | words: 121, 6, 114, 207, 3, 112, 1, 41, 4, 253, 3, 225, 59, 86, 28, 36, 97, 60 |
| 117 | **h2** | "IX. Indemnity and Liability; Disclaimers." |
| 118 | **h3** | "Indemnity and Release." |
| 119 | p x1 | words: 207 |
| 120 | **h3** | "Disclaimer of Warranties." |
| 121-122 | p x2 | words: 153, 97 |
| 123 | p | 84 words; link EXT `https://www.citizensadvice.org.uk` |
| 124 | ul (3 items, 93 words) | disc bullets |
| 125 | **h3** | "Limitation of Liability." |
| 126-129 | p x4 | words: 179, 130, 79, 55 |
| 130 | **h2** | "X. Termination and Cancellation." |
| 131-138 | p x8 | words: 1, 140, 90, 54, 159, 38, 4, 176 |
| 139 | **h2** | "XI. Third Party Websites." |
| 140 | p x1 | words: 144 |
| 141 | **h2** | "XII. Special Notice for International Use; Export Controls." |
| 142 | p x1 | words: 83 |
| 143 | **h2** | "XIII. General." |
| 144 | p x1 | words: 438 |
| 145 | **h2** | "XIV. Governing Law and Jurisdiction." |
| 146 | ul (2 items, 131 words) | 2 of 2 items are `li.list-none` (start with "(a) " style enumerator, no bullet) |
| 147 | **h3** | "Questions? Concerns? Suggestions?" |
| 148 | p x1 | words: 26 |
| 149 | p | 2 words (bold `Label:` lead); link MAILTO `mailto:hello@glaze.app` |
| 150 | p x1 | words: 12* |

#### /privacy block sequence (prose children in DOM order)

| # | Block | Detail |
|---|---|---|
| 0 | p | 82 words; link INT `https://www.glaze.app` |
| 1-2 | p x2 | words: 37, 44 |
| 3 | **h2** | "1. Personal Data we collect" |
| 4 | **h3** | "Personal Data you provide to us" |
| 5-6 | p x2 | words: 26, 28* |
| 7 | p | 94 words (bold `Label:` lead); link EXT `https://stripe.com/gb/privacy` |
| 8-10 | p x3 | words: 70*, 24*, 15* |
| 11 | **h3** | "Personal Data we receive from third parties" |
| 12-13 | p x2 | words: 74*, 43* |
| 14 | **h3** | "Personal Data we automatically collect" |
| 15-16 | p x2 | words: 12, 9 |
| 17 | **h2** | "2. How we use Personal Data" |
| 18 | p x1 | words: 8 |
| 19 | ul (8 items, 469 words) | nested sub-lists with [4] items |
| 20 | **h3** | "Analytics and Product Improvement" |
| 21 | ul (8 items, 297 words) | disc bullets |
| 22 | **h2** | "3. Sharing and disclosure of personal data" |
| 23 | p x1 | words: 16 |
| 24 | ul (5 items, 382 words) | 5 items start with a bold `Label:` |
| 25 | p x1 | words: 19 |
| 26 | **h2** | "4. Special Category and Sensitive Data" |
| 27 | p x1 | words: 125 |
| 28 | **h2** | "5. International Data Transfers" |
| 29-30 | p x2 | words: 61, 88 |
| 31 | **h2** | "6. How long your personal data will be kept" |
| 32-33 | p x2 | words: 55, 17 |
| 34 | **h2** | "7. Your rights and choices" |
| 35-36 | p x2 | words: 63, 39 |
| 37 | ul (5 items, 138 words) | disc bullets |
| 38-40 | p x3 | words: 81, 77, 41 |
| 41 | **h2** | "8. Cookies and similar technologies" |
| 42-45 | p x4 | words: 59, 60, 79, 56 |
| 46 | p | 97 words; link EXT `https://www.allaboutcookies.org` |
| 47 | **h2** | "9. Children" |
| 48 | p x1 | words: 44 |
| 49 | **h2** | "10. Links to other websites" |
| 50 | p x1 | words: 84 |
| 51 | **h2** | "11. Security" |
| 52-53 | p x2 | words: 100, 82 |
| 54 | **h2** | "12. Changes to privacy policy" |
| 55 | p x1 | words: 88 |
| 56 | **h2** | "13. Contact us" |
| 57 | p x1 | words: 25 |
| 58 | p | 39 words; link MAILTO `mailto:privacy@glaze.app` |

#### /aup block sequence (prose children in DOM order)

| # | Block | Detail |
|---|---|---|
| 0 | **h3** | "PLEASE READ THESE PLATFORM TERMS OF USE CAREFULLY" |
| 1-2 | p x2 | words: 40, 38 |
| 3 | p | 41 words; link INT `https://www.glaze.app/aup` |
| 4 | p x1 | words: 54 |
| 5 | **h3** | "PLEASE READ THESE TERMS CAREFULLY BEFORE USING THE PLATFORM" |
| 6 | **h3** | "ARTIFICIAL INTELLIGENCE (AI) NOTICE:" |
| 7 | p x1 | words: 95 |
| 8 | **h3** | "What's in these terms?" |
| 9 | p x1 | words: 64 |
| 10 | **h3** | "Who we are and how to contact us" |
| 11 | p | 17 words; link MAILTO `mailto:support@glaze.app` |
| 12 | **h3** | "By using our Platform you accept these terms" |
| 13 | p x1 | words: 35 |
| 14 | **h3** | "We may make changes to these terms" |
| 15 | p x1 | words: 25 |
| 16 | **h3** | "We may make changes to our Platform" |
| 17 | p x1 | words: 24 |
| 18 | **h3** | "We may suspend or withdraw our Platform" |
| 19 | p x1 | words: 88 |
| 20 | **h3** | "You must keep your account details safe" |
| 21 | p | 116 words; link MAILTO `mailto:security@glaze.app` |
| 22 | **h3** | "How you may use material on our Platform" |
| 23 | p x1 | words: 32 |
| 24 | **h3** | "No text or data mining, or web scraping" |
| 25 | p x1 | words: 46 |
| 26 | ul (2 items, 75 words) | disc bullets |
| 27 | p x1 | words: 142 |
| 28 | **h3** | "Uploading content to our Platform" |
| 29 | p x1 | words: 278 |
| 30 | **h3** | "Rights you are giving us to use material you upload" |
| 31 | p x1 | words: 47 |
| 32 | ul (3 items, 132 words) | disc bullets |
| 33 | **h3** | "User-Generated Content is not approved by us" |
| 34 | p x1 | words: 158 |
| 35 | **h3** | "Do not rely on information on the Platform" |
| 36 | p x1 | words: 121 |
| 37 | **h3** | "We are not responsible for websites and third party services we link to" |
| 38 | p x1 | words: 55 |
| 39 | **h3** | "We are not responsible for viruses" |
| 40 | p x1 | words: 40 |
| 41 | **h3** | "You must not introduce viruses" |
| 42 | p x1 | words: 185 |
| 43 | **h3** | "Our responsibility for loss or damage suffered by you" |
| 44 | p x1 | words: 109 |
| 45 | ul (8 items, 127 words) | disc bullets |
| 46 | **h3** | "Which country's laws apply to any disputes?" |
| 47 | p x1 | words: 30 |
| 48 | **h2** | "Acceptable Use" |
| 49 | p x1 | words: 55 |
| 50 | ul (8 items, 148 words) | disc bullets |
| 51 | p x1 | words: 5 |
| 52 | ul (3 items, 20 words) | disc bullets |
| 53 | p x1 | words: 7 |
| 54 | ul (17 items, 234 words) | disc bullets |
| 55 | **h3** | "Illegal content" |
| 56 | p x1 | words: 13 |
| 57 | ul (15 items, 66 words) | disc bullets |
| 58 | **h3** | "Content very harmful to children" |
| 59 | p x1 | words: 13 |
| 60 | ul (4 items, 39 words) | disc bullets |
| 61 | **h3** | "Other content harmful to children" |
| 62 | p x1 | words: 15 |
| 63 | ul (10 items, 238 words) | 1 items start with a bold `Label:`; nested sub-lists with [2, 2, 2] items |
| 64 | **h3** | "Offences" |
| 65 | p x1 | words: 23 |
| 66 | ul (7 items, 155 words) | disc bullets |
| 67 | **h3** | "Advertising" |
| 68 | p x1 | words: 55 |
| 69 | **h2** | "How we protect you from illegal content" |
| 70 | p x1 | words: 234 |
| 71 | **h3** | "What content and behaviours you should report" |
| 72 | p x1 | words: 11 |
| 73 | ul (7 items, 144 words) | disc bullets |
| 74 | **h3** | "How to complain or report content" |
| 75 | p | 4 words; link MAILTO `mailto:safety@glaze.app` |
| 76 | **h3** | "How we will deal with your complaint or reported content" |
| 77 | p x1 | words: 18 |
| 78 | **h3** | "Your rights to claim against us if we restrict access to your content" |
| 79 | p x1 | words: 40 |
| 80 | **h3** | "Your rights to claim against us if we suspend or ban your use of our service" |
| 81 | p x1 | words: 36 |

### B.7 Link inventory (legal)

| Page | Link text / href | Kind |
|---|---|---|
| terms | `https://www.glaze.app` | INT (point to `/` in the clone) |
| terms | `http://glaze.app/privacy/` | INT (`/privacy`) |
| terms | `https://www.glaze.app/pricing` | INT (`/pricing`, owned by another agent) |
| terms | `https://stripe.com/legal`, `https://stripe.com/privacy` | EXT |
| terms | `copyright@raycast.com`, `hello@glaze.app` | MAILTO |
| terms | `https://eur-lex.europa.eu/eli/dec_impl/2021/914/oj` | EXT |
| terms | `www.citizensadvice.org.uk` → `https://www.citizensadvice.org.uk` | EXT |
| privacy | `https://www.glaze.app` | INT |
| privacy | `https://stripe.com/gb/privacy`, `www.allaboutcookies.org` → `https://www.allaboutcookies.org` | EXT |
| privacy | `privacy@glaze.app` | MAILTO |
| aup | `https://www.glaze.app/aup` | INT (self) |
| aup | `support@glaze.app`, `security@glaze.app`, `safety@glaze.app` | MAILTO |

---

## C. Not measured / ambiguities

1. **The 6 category slugs are not persona pages.** `/design`, `/development`, `/creativity`, `/personal`, `/fun` and `/productivity` are 404s on the live site. Their copy exists only as showcase tab content (and `productivity` is completely unused). The clone should 404 them to match the original.
2. **App lists in `SC.appPublicIds`** for the five audience slugs (12-13 IDs each) are not rendered anywhere on these routes. The showcase shows the shared per-tab `personaApps` (4 per tab), which the clone already hardcodes. Their likely purpose is a server-side `wr()` feed; this cannot be verified from the client.
3. **Mobile/touch UA variant of the hero CTA** (Sign Up instead of Download) and **`?promo=` partner banners** were not exercised. They behave the same as on `/` (CLONE_SPEC §S1).
4. The legal `scheduleHeading` block style exists in the component but is unused on these three pages, so it was not measured live.
5. Internal auto-links in the legal text use absolute `https://www.glaze.app/...` and `http://glaze.app/privacy/` hrefs with `target=_blank`. Whether the clone rewrites them to relative routes is a product choice. The original opens them in a new tab on the production domain.
6. The persona showcase on mobile (<800) uses the dropdown trigger, whose label shows the preselected tab (e.g. "Design"). This was confirmed by reading the trigger text, but the open menu state was not re-screenshotted for persona routes.
