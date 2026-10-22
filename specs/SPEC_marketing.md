Source: https://www.glaze.app/pricing, https://www.glaze.app/download, https://www.glaze.app/awards, https://www.glaze.app/awards/terms

# SPEC_marketing: /pricing, /download, /awards, /awards/terms

Measured on 2026-10-22 with headless Chromium (own Playwright script, not the shared browser) at 1440x900 and 390x844, plus layout spot checks at 624, 800 and 1024. Every px/color value is a computed style or bounding box. Tokens, fonts, nav, footer and keyframes are defined in `/Users/riyaghosh/V3/glaze/CLONE_SPEC.md` (sections 1 and 2). This file records only what is new or different. Colors below use the CLONE_SPEC names: secondary `#a0a0a0`, tertiary `#717171`, separator `rgba(255,255,255,.10)`, accent `#245aca`.

Screens (full page): `/Users/riyaghosh/V3/glaze/_reference/screens/{pricing,download,awards,awards-terms}-{1440,390}.png`.

## 0. Cross-page notes

- All four pages use the shared nav and footer unchanged, except the items below.
- **Nav dot position (1440).** The dot is 3x3 `#a0a0a0`. On `/pricing` it sits under "Pricing" at x=605.95, y=52 (inline `left:77.41px; top:28px`, relative to the links container; opacity 1). On `/download`, `/awards` and `/awards/terms` no nav link matches, so the dot is `opacity:0` (these routes are not in the nav). The "Pricing" link is `#fff` on `/pricing` and secondary elsewhere.
- **`/awards` is a black-themed page.** `html` and `body` get `class=bg-black`, `data-page=awards`, `style="--bg:#000000;background:#000000"`. Because `--bg` is `#000`, the derived tokens shift: text-secondary is `color-mix(#000, #fff 60%)` = `#999999` (rgb 153), text-tertiary = `#666666` (rgb 102), versus `#a0a0a0` and `#717171` elsewhere. Use `#999` and `#666` inside `/awards`, including the footer and the "macOS Tahoe..." caption. Nav links on `/awards` are `#999`.
- CSS from `styles-CpdsjlmX.css` for `/awards`:
  - `>=624px`: `.awards-page-background{background:linear-gradient(#000 0 calc(min(56.25vw,720px) - 16px), #121212 calc(min(56.25vw,720px) + 784px))}`. Computed at 1440: `linear-gradient(#000 0, #000 704px, #121212 1504px)`.
  - `<=623px`: `html[data-page=awards], body[data-page=awards]{background:#000}` and `html[data-page=awards] .site-navigation{background:#000; padding-top:8px; top:0}`. So on mobile the nav bar is a solid black strip, and the pill (358x52 at x=16, y=8) sits inside it. At >=624 the nav is transparent as usual.
- `/pricing`, `/download`, `/awards/terms` keep the standard `#121212` background.
- Tooltip and popover primitive (Base UI, used on `/pricing` and `/awards`): panel `rounded-lg` (8px), `border 1px rgba(255,255,255,.10)`, `bg #222222f2` (rgba(34,34,34,.95)), `padding 10px 12px`, Inter 12px/19.5px weight 400 white, `text-left`, shadow `0 10px 15px -3px rgba(0,0,0,.1), 0 4px 6px -4px rgba(0,0,0,.1)` (Tailwind `shadow-lg`). Wrapper `z-index:20010`, positioned absolute via transform. `transition: opacity .15s cubic-bezier(.4,0,.2,1)`. Enter and exit are an opacity 0 to 1 (and 1 to 0) animation of **150ms** `cubic-bezier(.4,0,.2,1)`, with no delay on hover. No transform animation. The trigger sets `aria-expanded=true` while open. It opens on hover or focus, and also on click, which keeps it open until Esc, outside click, or leaving.
- **Static page head, per route.**

  | Route | `<title>` | meta description |
  |---|---|---|
  | `/pricing` | `Glaze Pricing — Plans for building desktop apps with AI` | `Glaze pricing plans. Start free with your Claude subscription and welcome credits, or go Pro from $10/month to build and publish more desktop apps. Private team stores are free during Beta.` |
  | `/download` | `Glaze — Build and Share Mac Apps with AI` | `Create software for you and your team. Lives on your Mac, connects to your files, tools and hardware.` |
  | `/awards` | `Glaze Awards · July 23–27` | `Build the app you've always wanted with Glaze from July 23 to 27 and compete for $24,500 in cash prizes.` |
  | `/awards/terms` | `Glaze Awards: Terms & Conditions` | `Terms & Conditions for the Glaze Awards by Raycast.` |

  `og:image` is `https://www.glaze.app/og-glaze@2x.jpg` (2400x1260) on all four. `og:url` and `og:title` mirror the route and title. `twitter:card` is `summary_large_image`. `/pricing` also has a hidden `<script type="application/ld+json">` FAQPage (optional).

---

## 1. /pricing

### 1.1 Section structure (DOM order)
`main.flex.min-h-dvh.flex-col` > (1) `section.px-4.pt-[140px] xs:pt-40` (pricing hero and cards), (2) `div.mt-[128px] xs:mt-[180px] transition-opacity duration-600` > `section.px-4.text-balance` (FAQ), (3) `section#download` (CTA), (4) the shared footer.
Page height 2566 at 1440, 3188 at 624, 3294 at 800, 2566 at 1024, 2822 at 390.

### 1.2 Hero and plan cards
- `section`: padding-top **160px** at >=480 (140px below), horizontal 16px. Inner `div.mx-auto.max-w-page` (960). At 1440 it sits at x=240.
- **h1 "Pricing"**: Instrument Sans (`font-display`) **48px / 500 / lh 52.8px / ls -1.2px**, `#fff`, centered. At 390: 36px / 39.6px / -0.9px. Box 960x52.8 at (240,160).
- Card grid `div.mt-8.grid.grid-cols-1.gap-3.min-[992px]:grid-cols-3`: margin-top 32px, gap 12px.
  - >=992px (measured at 1024 and 1440): 3 columns of 312px at 1440 (x=240, 564, 888), row height 426px. At 1024 the container is 960 at x=32.
  - <992px: a single column, full width (592 at 624, 768 at 800, 358 at 390), cards stacked with 12px gaps.
- **Card `article`**: `flex flex-col rounded-2xl (18px) border 1px rgba(255,255,255,.10) p-5 (20px)`, `box-shadow: inset 0 1px 0 rgba(255,255,255,.04)`.
  - Free and Team: transparent background.
  - **Pro: `background rgba(255,255,255,.05)`** (the only highlighted card).
  - There are no badges, no "popular" label and no monthly/annual toggle on this page. **The only pricing figure is $10 per month; there is nothing to toggle.**
- Card title `h2` (Inter, not Instrument Sans): **30px / 500 / lh 30px**, `#fff`, no letter spacing. Position at 1440: (261, 265.8), 270x30.
- Feature block `div.mt-8 flex flex-1 flex-col gap-5 text-sm font-medium leading-[18px] text-white min-[760px]:mt-14 min-[760px]:flex-none`: margin-top 32px (below 760), **56px** at >=760 (so 56px at 800, 1024 and 1440). Inside is `ul.flex.flex-col` with `li.flex.items-start.gap-2 (8px)`; every li after the first has `mt-3` (12px). Row text is Inter **14px / 500 / lh 18px** `#fff`, so rows step 30px.
  - Check icon: lucide `check`, 14x14 (`h-3.5 w-3.5`, `mt-0.5` = 2px), `stroke-width 1.8`, `stroke-linecap/linejoin round`, `viewBox 0 0 24 24`, path `M20 6 9 17l-5-5`, color `#fff` (`text-text-primary`).
  - Text wrapper: `div.min-w-0.flex.flex-wrap.items-baseline.gap-x-1.5 (6px) gap-y-0.5 (2px)`.
  - Info icon button (after text, Pro only): `button.ml-1 (4px) inline-flex size-4 (16px) touch-manipulation cursor-default items-center justify-center align-[-2px] text-text-secondary`, containing lucide `info` 12x12 (`size-3`, stroke-width 2, circle r=10 plus `M12 16v-4` and `M12 8h.01`). `aria-label="About <feature text>"`. `focus-visible:outline-none focus-visible:ring-1 ring-ring`. Measured cursor: `pointer`.
  - Badge (Free row 1 only): `span.inline-flex items-center justify-center rounded-full bg rgba(255,255,255,.08) text-secondary px-2 py-0.5 text-xs font-medium shrink-0` = 139.6x20, padding 2px 8px, Inter 12px / 500 / lh 16px, color `#a0a0a0`. It wraps below the label text when the card is narrow: 312px card puts it on a second line at y+20.
- Footer block of the card (price / CTA line): `div.mt-10 flex flex-col items-start gap-2 text-left min-[760px]:mt-auto min-[760px]:pt-16 min-[760px]:min-h-5 min-[760px]:justify-center`.
  - Below 760: margin-top 40px, no top padding.
  - >=760: `mt-auto` plus **padding-top 64px**. Free and Team add `min-h-5` and `justify-center`.
  - Since the feature blocks differ in height, the price rows are bottom-aligned by `mt-auto`: Free "Try Glaze for free" at y=635.8 (1440), Pro price at y=629.8, Team "Free during Beta" at y=635.8.
- Price/caption typography:
  - Free caption: `p` Inter **14px / 400 / lh 14px**, `#a0a0a0`. Shown at >=480 (`hidden xs:block`). Below 480 a second copy renders at Inter 14px / lh 18.9px (1.35) in `#717171` (`xs:hidden`). Same text.
  - Team caption "Free during Beta": same as the Free caption (14/400/14px `#a0a0a0`; mobile variant 14px/18.9px `#717171`).
  - **Pro price block**: `div.flex.flex-wrap.items-center.gap-x-2 (8px).gap-y-1 (4px).tracking-[0.022px]` = 110.1x20. `p` "$10" Inter **20px / 500 / lh 20px / ls .022px** `#fff` (34.2x20). Next to it `p` "per month" Inter **14px / 400 / lh 14px / ls .022px** `#a0a0a0` (67.9x14, at x+42.2, y+3).
- No buttons or links in the cards. The cards are not clickable. The CTA is the Download section below.

#### Plan content (exact)
- **Free**: "Use your Claude subscription" + badge "Unlimited during Beta" (Claude brand-mark SVG instead of a check on this first row, path fill `#D97757`, 14x14 `viewBox 0 0 24 24`, `mt-0.5`); "Use any agent with app sources"; "Use Glaze Fast models"; "50 credits launch welcome pack"; "Credit top-ups"; "Browse and install apps"; "Publish apps to Public Store". Footer: "Try Glaze for free".
  - Note that the first row is 40px tall because the badge wraps (text line plus badge line).
- **Pro**: first li (no icon, `mb-3 list-none`): "Everything in Free, plus:"; then "Use Glaze Smart models"; "100 monthly Glaze credits"; "Credit top-ups without platform fee"; "Creator Hub analytics" (+ info button); "Publish apps as Unlisted"; "Disable remixing of your apps" (+ info button). Footer: "$10" and "per month".
- **Team**: "Create your private Team Store"; "Invite teammates"; "Distribute apps within your team"; "Available for Free and Pro users". Footer: "Free during Beta".

#### Info tooltips (hover and focus popovers)
- Creator Hub analytics: "Track installs, active users, store conversion and user feedback for every app you publish." Panel 280x80.5 (`w-max max-w-[min(280px,calc(100vw-48px))]`, `text-balance`), placed `side=top, align=center`. At 1440 it is at x=624, y=385 (viewport coords, button at x~756).
- Disable remixing of your apps: "Pro users can choose whether apps they publish can be remixed by others." Panel 280x61, `side=top`.
- Exact panel styles: see section 0. Behaviors: hover opens (150ms opacity fade in); leaving fades out over 150ms (state `data-ending-style`); click toggles `aria-expanded` and keeps it open; Esc closes. On touch devices, tap opens it.

### 1.3 FAQ (`section.px-4.text-balance` > `div.max-w-content.mx-auto`)
- Same component as the landing-page FAQ (CLONE_SPEC S4): h2 "FAQ" (Instrument Sans 44px/500/48.4px/-1.1px, 30px/33px/-.75px below 480, `mb-6` 24px), list `divide-y` separators `rgba(255,255,255,.10)` plus `border-b`. Item button `py-4` 60px tall at 1440 (56px at 390). Question Inter 20px/500/28px `#fff` (16px/24px below 480). Chevron 20x20 `M7.5 5L12.5 10L7.5 15`, stroke 1.5, color `#717171`, rotates 90deg when open (300ms `cubic-bezier(.4,0,.2,1)`). Answer is a `grid` that animates `grid-template-rows 0fr to 1fr`, `transition: all 300ms ease-in-out` (computed `cubic-bezier(.4,0,.2,1)`), `p` Inter 16px/26px `#a0a0a0` `pb-4` `whitespace-pre-line` (14px/22.75px below 480). Measured at 1440: item 2 opened (the "What is a credit?" item) grid height 146px, aria-expanded attribute is not used (state is the `rotate-90` class on the svg and the inline `grid-template-rows:1fr`).
- Container: wrapper `div.mt-[128px] xs:mt-[180px] transition-opacity duration-600` (the same FAQ-dim wrapper as the landing page, with `opacity-100`; the scroll-dim behavior M6 in CLONE_SPEC applies if it is present, but this was not scroll-tested here). h2 at y=850.8 (1440), list at 923 to 1655 (732px tall, 12 items at 61px).
- **12 questions and answers (exact):**
  1. What is Glaze? / Glaze lets you build your own desktop apps just by describing what you want. They live on your Mac, launch instantly, and work offline, so you get real software that fits the way you work.
  2. How do I get started? / Download Glaze for Mac and start building. Glaze currently requires macOS Tahoe and Apple Silicon, with Windows and Linux support planned down the road.
  3. How do I use my Claude subscription? / Sign in with Claude CLI, then connect Glaze and allow it to use your subscription. Your Claude models appear in the model picker next to Glaze's own models. Runs on your subscription don't spend Glaze credits and are unlimited on Glaze's side during the Beta, subject only to Claude's own usage limits.
  4. How do I use Glaze without a Claude subscription? / You don't need one. You can build with Glaze using credits from your Free or Pro plan. Free includes a one-time pack of welcome credits and optional top-ups. Pro adds a monthly credit allowance that refreshes every billing month, plus top-ups without the platform fee.
  5. Can I work on my apps with other agents? / Yes. Every Glaze app's sources live in a regular folder on your Mac, so you can open a project with Claude Code, Cursor, Codex, or any editor and work on it directly. Glaze sets each project up so external agents know how to build and package your app, and your changes show up in Glaze like any other edit.
  6. What is a credit? / Credits are what the agent spends when it builds or edits an app with Glaze's own models. The more work a turn involves, the more it costs, so a quick tweak is cheap while building an app from scratch costs more, and more capable models cost more per turn. Credits track real usage rather than a flat per-message charge. Building on your own Claude subscription doesn't spend credits at all.
  7. What do I get on the Free plan? / The whole product. You can browse, install and run any app, build with your own Claude subscription or any other agent, and publish to the public store. To build with Glaze's own models you get a one-time pack of welcome credits, so you can start right away without waiting for a refresh, and you can buy top-ups at any time. There's no recurring credit allowance on Free, so that part pauses once your balance reaches zero. Pro adds monthly credits, our most capable models, top-ups without the platform fee and unlisted publishing.
  8. Do credits roll over? / On Pro, unused monthly subscription credits roll over into your next billing month (ie they are valid for 2 months from grant). Purchased top-up credits are valid for 3 months. Free welcome credits are a one-time allocation and do not roll over or recur.
  9. What happens when I run out of credits? / Building with Glaze's models pauses until you have credits again. You can buy a top-up on any plan, wait for the next monthly refill on Pro, or connect your own Claude subscription and keep building on that. Installing and running the apps you already have is unaffected.
  10. Can I buy more credits before my next refill? / Yes, on any plan. Top-ups are one-off packs you can buy at any time, priced at what the tokens cost us plus a small platform fee. Pro waives that fee.
  11. Are credits refundable? / Credits aren't refundable. They remain usable until they expire.
  12. How does the Team plan work? / The Team plan gives you a private Team Store: create one, invite teammates, and distribute apps that only your team can see. It's free during the Beta, and each member builds with their own Free or Pro subscription.
- Apostrophes in the live copy are straight `'` here (the landing page FAQ uses curly in some answers). Use the text above as-is.
- None open by default; one open at a time (same as landing). Answer links: none on this page.

### 1.4 Download CTA (`section#download`)
Identical to the landing-page S5 (CLONE_SPEC): `pt-[280px] pb-[200px] px-4` (`pt-[220px] pb-[64px]` below 480), 112x112 icon `app-icon-PC60coqE.png` (hover scale 1.05, active .95, 300ms `cubic-bezier(0,0,.2,1)`; click spawns the icon particles), h2 "What will you build?" (44px/48.4px, mb 32px), button **Download for Mac** `/api/download?cta=waitlist_download` (203.6x44, `#245aca`), caption "macOS Tahoe and Apple Silicon required" (Inter 12px/16.2px `#717171`). 1440 positions: section 1655 to 2444, icon y=1935, h2 y=2087, button y=2167.6, caption y=2227.6, footer y=2443.8.
The 17 `app-icon{1..17}` particle images are preloaded on load (all already in `public/assets/`).

### 1.5 Responsive changes
| Width | Change |
|---|---|
| >=992 | 3-column cards (312px each at 960 container). Footer block `mt-auto`. |
| 760 to 991 | 1 column; card height 406 (Free) / 410 (Pro) at 800; feature block mt 56px; footer block gets `pt-64` (so cards are taller than at <760: 800 gives 406 and 410 versus 358 and 362 at 624). |
| <760 (624 measured) | 1 column; feature mt 32px; footer block `mt-10` (40px), no pt. Cards 358 (Free) and 362 (Pro) tall at 624. |
| <480 | h1 36px; h2s 30px; captions swap to the `#717171` 14px/18.9px variant; FAQ sizes shrink. |
| 390 | Cards: Free 358x382.9 at y=211.6, Pro 358x362 at 606.5, Team 358x270.9 at 980.5. Page 2822 tall. |

### 1.6 Motion (/pricing)
- `document.getAnimations()` returned an empty list 1.5s after load: **no entrance animations** on this page (no AnimateIn / fade-in). Content is visible immediately.
- Tooltip fade 150ms (above). FAQ accordion and chevron 300ms. Link and button hovers: 150ms colors.
- Hover on cards: none measured (no hover styles on `article`).

### 1.7 Links on /pricing
Internal: `/` (logo, Home), `/pricing`, `/store`, `/blog`, `/changelog`, `/signup` (Sign in), `/api/download?cta=nav_download` (nav Download, and the API route is not a page: keep it as a link or stub), `/api/download?cta=waitlist_download` (CTA), `/blog`, `/terms`, `/privacy`, `/aup` (footer).
External (new tab, `rel=noopener noreferrer`): `https://manual.glaze.app`, `https://x.com/glazeapp`, `https://glaze.app/community`, `https://www.youtube.com/channel/UCZltNInxFzkNzBqg_G4EdXg`, `https://reddit.com/r/glazeapp`, `https://raycast.com`.

### 1.8 Assets on /pricing
No new assets. Only `logo-full-DAu7MkQ8.svg`, `app-icon-PC60coqE.png`, `app-icon1..17-*.png`, and the two latin font files; all exist locally. The Claude brand mark is inline SVG.

---

## 2. /download

### 2.1 Section structure
`main.flex.min-h-dvh.items-center.justify-center.px-4` (a single centered column; **no hero section, no footer rendered** (footer not found in the DOM) and no other sections). Page height equals the viewport (900 at 1440, 844 at 390). The nav is present.
Inside: `div.max-w-narrow.text-center` (480 max; shrink-wrapped, measured 249x348.1 at 1440 at x=595.5, y=276; 254.2x280.6 at 390):
1. Icon wrapper `div.relative.z-[10000].mx-auto.mb-8.h-[112px].w-[112px] icon-glow-static transition-transform duration-300 ease-out hover:scale-105 active:scale-95`. It contains `img` `/assets/app-icon-PC60coqE.png` 112x112 (natural 512x512), `select-none pointer-events-none`. `filter: drop-shadow(rgba(255,255,255,.12) 0 0 40px)`, `will-change: filter` (same as `.waitlist-icon-glow`). Margin-bottom 32px. Size is **112px at every width** (not 80px below 480 as on the landing CTA).
2. `h1` "Get Glaze": Inter (not Instrument Sans) **30px / 500 / lh 37.5px (leading-tight 1.25) / ls -0.75px** at >=480; **24px / 30px / -0.6px** below 480. `#fff`, `mb-2` (8px), `select-none`. At 1440 y=420, height 37.5.
3. `p` "Time to turn your ideas into apps": Inter **16px / 400 / lh 22.4px (1.4)**, `#a0a0a0`, `select-none`. y=465.5 (22.4 tall).
4. Action block `div.mt-6.flex.flex-col.items-center.justify-center` (margin-top 24px), 76.2px tall at 1440:
   - Mobile-only caption `p.xs:hidden` "Available for macOS Tahoe and Apple Silicon": Inter 12px / 400 / lh 16.2px `#717171`, centered. Visible only below 480; hidden at >=480.
   - Button `a.hidden xs:inline-flex` **Download for Mac** → `/api/download?cta=download_page`: `h-11 (44px) pl-4 (16px) pr-5 (20px) gap-2.5 (10px) rounded-full bg #245aca`, Inter 16/500/24 white, 203.6x44 at (618.2, 511.8). Apple logo svg 18x18 `relative -top-px`, `viewBox 0 0 17 20 fill currentColor` (same markup as CLONE_SPEC section 7). Hover: `opacity:.9` (opacity does not transition; the colors transition is 150ms). **Hidden below 480px**, where only the caption above shows and there is no button.
   - Desktop caption `p.hidden xs:mt-4 xs:block` "macOS Tahoe and Apple Silicon required": Inter 12px/16.2px `#717171`, `mt-4` (16px), y=571.8, 231.7x16.2. Hidden below 480.
5. Version row `div.mt-4.flex.h-5.items-center.justify-center` (margin-top 16px, height 20px) with `span.font-mono.text-xs` **"v 0.14.4.0"**: ui-monospace stack, 12px/16px, `#717171`, 65x16. The version string is dynamic (a server function, `_serverFn/85b2c5...`, returns it); treat "0.14.4.0" as the current value and make it a constant.
- Vertical centering: block is centered in `min-h-dvh` flex, so top = (viewport height - block height)/2.

### 2.2 Interactions
- Icon hover: scale 1.05 (300ms `cubic-bezier(0,0,.2,1)`); active .95. Click spawns the icon-particle burst (CLONE_SPEC M7). The click also created 4 `div.icon-particle` nodes in a `div.pointer-events-none.fixed.inset-0.z-[9999]` container, with `app-icon16` etc. Measured particle box ~134.5px (107px base with rotation).
- Button hover opacity .9. No other interactive elements.
- The nav "Download" link is `/api/download?cta=nav_download`.

### 2.3 Responsive
- 1440, 1024, 800, 624: same layout, centered; only the container x offset changes (x = (W - 249) / 2). Button visible (>=480).
- 390: button and desktop caption hidden; mobile caption shown; h1 24px; block 254.2x280.6 at (67.9, 281.7).

### 2.4 Motion
No animations (`getAnimations()` empty). Only hover transitions and the particle burst.

### 2.5 Links
Internal: nav links as in section 1.7, `/api/download?cta=download_page`. External: none in the page body (no footer on this route).

### 2.6 Assets
No new assets (icon, logo and the 17 particle icons already exist locally).

---

## 3. /awards

Page height: 5145 at 1440, 5033 at 1024, 5118 at 800, 6045 at 624, 5657 at 390. Black theme (section 0).

### 3.1 Section structure (DOM order)
`main.awards-page-background.flex.min-h-dvh.flex-col.bg-black.text-balance selection:bg-accent selection:text-white`:
1. **Hero** `section.px-4.pt-[clamp(0px,calc(225px-35.9vw),88px)] min-[624px]:pt-0`.
2. `div.animate-fade-in` (wrapper for everything below the hero; inline `opacity:0; animation-delay:500ms; animation-duration:600ms`):
   - a. **Winners** (`div.mt-10 px-4 xs:mt-14` > `section.dialog-focus-surface.mx-auto.max-w-page`): Gold, Silver/Bronze, then "Finalists".
   - b. **Entries** `div#entries.mt-24 scroll-mt-28 px-4 xs:mt-32`: "Browse N Entries", search, grid, pagination.
   - c. **Prizes** `div.px-4 mt-[160px] xs:mt-[256px]` > `fieldset`, then the "Eligible Countries" popover button.
   - d. **The jury** (`div.mt-[160px] xs:mt-[256px] px-4` > `section.text-center`).
   - e. **Selection criteria** (`div.px-4 mt-[160px] xs:mt-[256px]` > `section`).
   - f. **Download CTA** `section#download` (same as /pricing 1.4).
3. Footer (wrapped in an extra `div`).

### 3.2 Hero (1440)
- `section` 1440x678. Inner `div.mx-auto.max-w-page.text-center` (x=240, y=-16, 960x694).
- **Video block** `div.animate-fade-in w-full min-[624px]:-mt-4` (margin-top -16px at >=624), inline `opacity:0; animation-duration:800ms`. Inside `div.relative.left-1/2.aspect-video.w-screen.max-w-[1280px].-translate-x-1/2.overflow-hidden`: **1280x720 at x=80, y=-16** (it overflows the 960 container, centered on the viewport; below 1280px viewport it is full viewport width at 16:9: 1024x576 at 1024, 800x450 at 800, 624x351 at 624, 390x219.4 at 390).
  - `video.h-full.w-full.object-cover`, `src=/assets/awards-hero-84xk2ZFP.mp4`, `autoplay loop muted playsinline preload=auto`, no poster, no `<source>`. `aria-label="An abstract liquid-metal Glaze mark in motion"`. Natural size 1600x900, duration 16.43s, 1.38MB. Autoplays at all widths.
  - Two edge fades (`pointer-events-none absolute inset-y-0`, width 1/4 = 320px): left `bg-gradient-to-r from-black to-transparent` (`linear-gradient(to right in oklab, #000 0%, rgba(0,0,0,0) 100%)`), right `bg-gradient-to-l ...` mirrored.
- **Text block** `div.relative.z-10`: margin-top `clamp(-144px, -11vw, -48px)` at >=624 (**-144px** at 1440, -112.6px at 1024; the minimum -48px applies near 436px, which is below the 624 breakpoint, so it is unused); below 624 the margin is a fixed `-28px` (measured at 390). At 1440: block y=560, 960x118.
  1. Row `div.animate-in` (delay 100ms) > `div.flex.items-center.justify-center.gap-2.text-sm.font-medium.text-white` 960x20: `span` "Sponsored by" Inter **14px / 500 / lh 20px** `#fff` (92.8x20), then link `a` (aria-label "Visit Anthropic", `https://www.anthropic.com/`, `_blank`) containing `img.h-3.w-auto` (12px high, 106.9x12; natural 1024x115) whose `src` is an inline `data:image/svg+xml` of the white Anthropic wordmark (`viewBox 0 0 1024.2 115`, `fill #fff`). Take the SVG from the page source (the data URI is long; the clone can export it as `public/assets/marketing/anthropic-wordmark.svg`, not yet saved, see Ambiguities).
  2. `div.animate-in` (delay 200ms) > **h1 "Glaze Awards"**: Instrument Sans **48px / 500 / lh 52.8px / ls -1.2px** `#fff`, `mt-2` (8px), centered, 52.8 tall (36px/39.6px/-0.9px below 480). y=588.
  3. `div.animate-in` (delay 300ms) > `p.mx-auto.mt-2.max-w-[720px]`: "The results are in. Meet all the winners and finalists below." Inter **18px / 400 / lh 29.25px (leading-relaxed 1.625)** color `#999`, 720x29.3 at (360, 648.8) (18px at >=480, 16px below).
- Section end y=678; the below-the-fold wrapper starts at y=678.
- Hero section vertical layout at other widths: at 390 the section is 404 tall with top padding **84.99px** (`clamp(0px, 225px - 35.9vw, 88px)`) and video 390x219.4 at y=85, text block y=276.4 (margin -28px), h1 y=304.4. At 624: section 384, video 624x351 at y=-16, h1 y=294. At 800: section 464, h1 y=374. At 1024: section 565, h1 y=475.

### 3.3 Winners (`section.dialog-focus-surface.mx-auto.max-w-page`, 960 wide, y=734, `mt-14` 56px; `mt-10` 40px below 480)
- Layout `div.flex.flex-col.gap-3` (562.5 tall): Gold card full width (960x275.3 at y=734); then `div.grid.gap-3.min-[624px]:grid-cols-2` with Silver (474x275.3 at x=240, y=1021.3) and Bronze (474x275.3 at x=726). Below 624 the grid is 1 column (cards stacked, 12px gaps). At 624 measured: Gold 592x275, Silver 290x298 (the grid is 2-col at exactly 624 per `min-[624px]`; heights grow when text wraps).
- **Winner card** is a `button[type=button]` (aria-label "Gold winner: The Last Blockbuster" etc.): `relative flex flex-col items-center gap-2 (8px) rounded-2xl (18px) border 1px rgba(255,255,255,.10) px-8 (32px) py-12 (48px) text-center transition-colors`, transparent, **hover `bg rgba(255,255,255,.06)`** (150ms colors). Class `dialog-focus-surface` (focus: no outline, no box-shadow).
  - Medal badge `span.absolute.left-4.top-4.flex.items-center.gap-2` at (16,16) inside the card: `img.size-6.object-contain` 24x24 (`award-{gold|silver|bronze}@2x-*.png`, natural 128x128) + `span` Inter **16px / 500 / lh 24px** `#fff` "Gold" / "Silver" / "Bronze".
  - App icon `span.glaze-app-icon-glass.h-20.w-20` **80x80** (see 3.9 for the squircle mask), at card y+49, centered.
  - Name `span.mt-1.font-display.text-lg.font-medium.leading-tight`: Instrument Sans **18px / 500 / lh 22.5px**, `#fff`, margin-top 4px.
  - Tagline `span.line-clamp-2.max-w-[320px].text-balance.text-sm.leading-relaxed`: Inter **14px / 400 / lh 22.75px** `#999`, max 2 lines, max width 320px.
  - Author `span.mt-1.flex.items-center.gap-1.5.text-sm`: avatar `img.h-4.w-4.rounded-full.object-cover` 16x16 + `span.truncate` Inter 14px/20px `#999`. Gap 6px.
- Content:
  | Medal | App | Tagline | Author | App page |
  |---|---|---|---|---|
  | Gold | The Last Blockbuster | Rewind the tape, unlock the truth. | @zenithquinn | `/app/the-last-blockbuster-oRLCOs` |
  | Silver | My Stash | Photoshop for your macOS folders | Noman | not read (dialog link) |
  | Bronze | Elsewhere | When you need to be somewhere else | Yann-Edern Gillet | not read |
- **Click behavior:** a click opens a modal `role=dialog` (aria-label "<App> details") with a backdrop, and **the URL does not change**. Same dialog as the landing-page app-details dialog (CLONE_SPEC overlays): backdrop `animate-lightbox-in fixed inset-0 z-[80] bg-background/75 backdrop-blur-[5px]` (`--bg` is `#000` here, so rgba(0,0,0,.75)); dialog `fixed left-1/2 top-1/2 z-[90] flex h-[calc(100dvh-28px)] xs:h-[calc(100dvh-72px)] max-h-[800px] w-[calc(100%-32px)] max-w-page -translate-x-1/2 -translate-y-1/2`, measured 960x800 at (240,50) at 1440x900. Top-right controls `div.absolute.right-4.top-4 z-20 xs:right-6 xs:top-6` include a 44x44 link `aria-label="Open <App> as a full page"` → `/app/<slug>`. Esc closes the dialog. The dialog content is the store app page, which belongs to the store spec (another agent). Recommended clone: card click navigates or opens a minimal modal linking to `/app/<slug>`.
- Mobile (390): Gold card 358x275.3 at y=444. Section 358 wide.

### 3.4 Finalists
- `h2` "Finalists": Inter **18px / 500 / lh 22px** `#fff`, `truncate`, margin `mt-20` (80px) / `mb-4` (16px) at >=480 (`mt-16` 64px below), y=1376.5 at 1440.
- Grid `div.store-app-grid.grid.gap-x-5.gap-y-1.grid-cols-2.xs:grid-cols-2.md:grid-cols-3`: gap **4px row / 20px column**. Columns: 2 below 768 (`md` = 768; at 624 two 286px columns, at 390 two 169px columns), **3 at >=768** (242.66px at 800, 306.66px at 960 container), 4 at >=1920 (`store-app-grid` rule). Row height 72px. 7 finalists: 3+3+1 rows at 1440 (grid 960x224).
- **App card** `a.-mx-2.flex.h-[72px].items-center.gap-3.rounded-2xl.px-2.transition-colors.hover:bg-surface` (inside a plain `div`): box 322.7x72 at x=232 (extends 8px left and right of the column), padding 0 8px, gap 12px, radius 18px, **hover bg `rgba(255,255,255,.10)`**, 150ms colors. `aria-label="Open <name>"`, `href=/app/<slug>`.
  - Icon `span.glaze-app-icon-glass.h-14.w-14.shrink-0` 56x56 (3.9).
  - Text `div.min-w-0.flex-1`: name `h3.min-w-0.truncate.text-sm.font-medium.leading-[18px]` Inter 14/500/18px `#fff`; description `p.store-app-card-description.truncate.text-sm.leading-[18px]` Inter 14/400/18px `#999` (**hidden below 624px**: `[&_.store-app-card-description]:hidden min-[624px]:[&_...]:block`); author row `div.mt-0.5.flex.items-center.gap-1.5.text-sm.leading-[18px]` (margin-top 2px, gap 6px) with avatar `img.h-3.5.w-3.5.rounded-full` 14x14 (when the author has an avatar) + `span.truncate` Inter 14/400/18px `#999`.
- 7 finalists (order): Radical (The visual calendar; time, reimagined. / Maya Avendaño, `/app/radical-s4LsSN`); PDF Toolkit (Drop. Edit. Download. Done. / Ajay Odedra, `/app/pdf-toolkit-wmBfSO`); Brez (Breathing companion for calm focus / fra.raw, `/app/brez-nx6Oj0`); Amber (Perfect your coffee every single time / Vlad Bahara, `/app/amber-vZzCwc`); Mooboard (Visual spaces for all your folders. / James Dawson, `/app/mooboard-dqGeIk`); One Note (Leave a note on their Mac / Andrew Bondarenko, `/app/one-note-DhbXQo`); Mini Piano (Your keyboard is now a piano / André Pinto, `/app/mini-piano-vo46Jg`).

### 3.5 Entries (`#entries`, 489 total at capture time)
- Container `div#entries.mt-24.scroll-mt-28.px-4.xs:mt-32`: margin-top 128px (96px below 480), `scroll-margin-top` 112px, y=1766.5.
- Header row `div.mb-4 > div.flex.flex-col.gap-3 > div.flex.justify-between.gap-3.items-center` (960x36): left `h2` **"Browse 489 Entries"** (Inter 18/500/22px `#fff`, `truncate`; after a search it reads "1 Search Result" or "0 Search Results"); right a search pill.
- **Search pill** `div.liquid-glass.ml-auto.flex.h-9.shrink-0.items-center.overflow-hidden.rounded-full`: **240x36** at >=480 (h-9, `px-2.5` = 10px, `xs:w-[240px]`); **210x40 below 480** (`h-10 w-[210px] px-3`). `liquid-glass` styles (CLONE_SPEC 1.3): bg `rgba(35,35,35,.30)`, border `1px rgba(255,255,255,.08)`, `backdrop-filter: blur(12px) saturate(1.8)`; plus `box-shadow: 0 8px 30px rgba(0,0,0,.18)`; `transition: all .2s cubic-bezier(.4,0,.2,1)`. Contents: lucide `search` icon 16x16 (18x18 below 480), stroke 2, color `#999`, then `input.store-search-input` (type text, `aria-label="Search entries"`, placeholder "Search", transparent, `min-w-0 flex-1 px-2`, Inter **14px / 500** (16px below 480) `#fff`, placeholder `#666`; no focus outline or shadow). When the field has text a clear `button` (20x20 rounded-full, `text-text-secondary`, appears after the input) is rendered. Focusing the field did not change the pill size or bg (240px, rgba(35,35,35,.3)).
- **Search behavior (live, measured):** typing filters server-side after a short debounce; the URL becomes `?entriesQuery=<term>` (e.g. `?entriesQuery=piano` gave 1 result "Mini Piano" with no pagination); heading changes to "1 Search Result"; a no-match query shows heading "0 Search Results" and, in the grid area, "No entries found" with a sub-line `p.mt-2.text-sm.text-text-secondary` "Try a different search." (`#999`, 14px). Pagination is hidden for search results. Clearing the box restores the full list. A precise debounce time was not captured (sampling script was interrupted); use ~300ms.
- Grid: `store-app-grid` as 3.4: 24 cards per page, 8 rows at 3-col (960x604 at 1440, starts y=1818.5). Mobile 2-col: 12 rows (358x908 at 390; 908 at 624 too).
- **Pagination** `nav[aria-label="Entries pagination"].mt-8.grid.grid-cols-[1fr_auto_1fr].items-center` (960x32, margin-top 32px, y=2454.5):
  - Prev: `button.inline-flex.h-8.items-center.gap-1.rounded-full.text-sm.font-medium.text-secondary.justify-self-start`, padding `0 12px 0 4px` (`pl-1 pr-3`; 94.1x32) with lucide `chevron-left` 16px + label "Previous" (hidden below 480 where only the icon shows and the button is 28x32 with padding `0 8px 0 4px`). `disabled:opacity-35` (page 1 shows 0.35). hover `bg rgba(255,255,255,.10)` + `#fff`.
  - Center `div.flex.items-center.justify-center.gap-1` (212x32): page buttons `button.grid.size-8.place-items-center.rounded-full.text-sm.font-medium` 32x32, `aria-label="Page N"`, Inter 14/500/20. Current: `bg rgba(255,255,255,.10)` text `#fff`. Others: text `#999`, hover bg `.10` and `#fff`. Ellipsis `span.grid.size-8 text-sm text-tertiary` "…" Inter 14/400 `#666`. Page window at page 1: `1 2 3 4 … 21`; page 2: `1 2 3 4 … 21` (current 2); page 21: `1 … 18 19 20 21`.
  - Next: mirror of Prev, `justify-self-end`, padding `0 4px 0 12px`, label "Next" (67.3x32).
  - Behavior: clicking updates the URL `?entriesPage=N` (page 2 → `?entriesPage=2`, page 21 → `?entriesPage=21`), re-renders 24 cards (page 21 has 9, since 20x24+9=489), Prev disabled on page 1, Next disabled on the last page. A scroll after page change was observed (final scrollY 2021, which may just be Playwright scrolling the button into view); exact scroll target not verified.
  - Page-1 24 entries (name / author, `/app/` slug): CodeCanvas (OM CHANDANKAR, codecanvas-r9V0pc); Card Vault (Neeldhara Misra, card-vault-OZEFGP); FeedBagel (Graeme Fulton, feedbagel-AozKi4); Polite Package (Vaarun Sinha, polite-package-Ah56UM); Specimen (Nitrous, specimen-L1APKo); Stream (Ricardo Patel, no avatar, stream-cLg8Tt); Clouded (saurish, no avatar, clouded-oB6cWu); Speck (Deepto, speck-GQz6OW); Clip That! (Lefty, clip-that-h1OVuq); Mina — Terminal Companion (Brad Chin, no avatar, mina-terminal-companion-XwFKfD); Tempo (Mehul Chokshi, tempo-eJfpqe); What should I play? (Markus Käding, no avatar, what-should-i-play-ZzCJLk); Dispatch (Gareth Chainey, no avatar, dispatch-zM8HY8); Caption Craft (Sam Sitar, caption-craft-D4916q); Passage (騎山豬跑山, passage-Wtklof); BridgeDesk (Madan Chaolla Park, bridgedesk-XLK7X9); Teleprompter (ankita singh, teleprompter-36pCwv); Switchyard (Justin Alva, switchyard-9m7nIa); Mini Piano (André Pinto, mini-piano-vo46Jg); DayReceipt (1lsang, dayreceipt-7NQDsc); Dayshift (cg crew, dayshift-an3PsD); Saturn (Sachin, saturn-ewPgBX); Ludus (Samuel Lee, ludus-4RDpwn); Ghost (ImisiD, ghost-n7fZjc). Taglines are in the DOM per card (for example "Visual node map for your local codebase."); the card data is dynamic (loaded from the Glaze API), so the clone should use a small fixture, not scrape all 489. Page 2 starts with `/app/prosody-4eQt0V`, `/app/steelbuild-sheets-a5cQZS`, `/app/dumpster-fire-m1gBzP`.
- Card images are remote and proxied: icons `https://img.glaze.app/<sig>/rs:fit:128:128/<base64 url>` (256 for the 80px winner icons), avatars `rs:fit:40:40`. They are not downloaded (hundreds of dynamic user assets); use placeholders or a few local icons.

### 3.6 Cash prizes
- Wrapper `div.px-4.mt-[256px]` (mt-[160px] below 480), y=2742.5.
- `fieldset.mx-auto.min-w-0.max-w-page.rounded-3xl (26px).border.border-border-primary (1px rgba(255,255,255,.20)).bg-transparent.px-6.py-12`: padding **48px 24px** at >=480 (40px 12px below 480), 960x275.5 at 1440.
  - `legend.mx-auto.whitespace-nowrap.px-5.text-center.font-display.font-medium.text-secondary`: "Cash prizes for winners", Instrument Sans **16px / 500 / lh 24px** `#999` (14px/20px below 480), padding 0 20px (0 16px below 480), 210.9x24 at (614.6, 2742.5). It sits in the top border line.
  - Grid `div.grid.grid-cols-2.gap-x-3.gap-y-12.min-[760px]:grid-cols-4`: gap 48px row / 12px column; 4 columns of 218.5px at >=760 (910 wide at 1440; 170.5px at 800), 2 columns below 760 (265px at 624, 2 rows).
  - Each `article.flex.flex-col.items-center.text-center`: image `img.h-[72px] w-[72px] object-contain` (64px below 480; natural 128x128), `h2.mt-3` (12px) Instrument Sans **30px / 500 / lh 37.5px** `#fff` (24px below 480), `p.mt-2` (8px) Instrument Sans **20px / 500 / lh 25px** `#999` (18px below 480).
    1. `award-gold@2x-C2t6avtW.png`, "Gold", "$10,000"
    2. `award-silver@2x-Bg8X11yF.png`, "Silver", "$5,000"
    3. `award-bronze@2x-CZBT3HSE.png`, "Bronze", "$2,500"
    4. `award-peoples-choice@2x-C7Vw5M8e.png` (new), "7 Finalists", "$1,000 each"
  - Total advertised in the meta description: "$24,500" (10000+5000+2500+7x1000).
- **Eligible Countries** `div.mt-4.flex.justify-center` > `button` (`aria-expanded`, Base UI popover trigger): `flex cursor-default items-center gap-1.5 text-xs text-secondary transition-colors hover:text-white`; lucide `info` 14x14 + "Eligible Countries"; Inter 12/400/16px `#999`, hover or open `#fff`. 118.9x16, centered, y=3034 at 1440.
  - Popover (`side=bottom align=center`, opens on hover and click): `w-[min(560px,calc(100vw-48px))]` panel with the tooltip styling in section 0 (but no `max-w`, no `text-balance`), 560x178 at 1440. Text: "Due to applicable payment limitations, promotional contest restrictions, sanctions, and the regions in which the AI services powering Glaze are available, the Awards is not open to residents of the following regions: Afghanistan, Belarus, Bosnia and Herzegovina, Brazil, Burkina Faso, Burundi, Centra..." followed by a long list of country names (about 300 chars of terms clause 2.2). Copy the full text from clause 2.2 of /awards/terms when building (it is the same sentence).

### 3.7 The jury (`section.mx-auto.max-w-page.text-center`, y=3306)
- `h2` "The jury": Instrument Sans **44px / 500 / lh 48.4px / ls -1.1px** `#fff`, centered (30px/33px/-.75px below 480).
- Row `div.mt-12.flex.flex-wrap.justify-center.gap-x-3.gap-y-8 min-[760px]:gap-x-0 min-[760px]:gap-y-12` (margin-top 48px; 40px below 480): `gap` 48px/0 at >=760, 32px/12px below.
- Juror `article.flex.flex-col.items-center`, width **20% (192px at 960) at >=760**, `calc(33.333% - .5rem)` below 760 (3 per row: 154px at 800? at 800 article width 154 means the 3-per-row rule applies at 800 because the container's 768 and 760 breakpoint is by viewport; 800 >= 760 gives 20% = 153.6px, yes, 154. At 624: 189px = 3 per row).
  - Photo `img.rounded-full.object-cover.grayscale` **104px** at >=760 (88px below), `filter: grayscale(1)`, `alt=<name>`.
  - Name `h3.mt-4` Instrument Sans **18px / 500 / lh 22.5px** at >=760 (15px/18.8px below) `#fff`.
  - Role `p.mt-1.5.text-sm.leading-snug` > `span.block`: Inter 14/400/19.25px `#999`, e.g. "CEO," followed by a link; the link is `a.border-b.border-border-secondary` (bottom border 1px `rgba(255,255,255,.10)`), same color, **hover: color `#fff`, border `rgba(255,255,255,.20)`**, 150ms colors.
  - Link row `div.mt-4.flex.items-center.gap-2.5.text-tertiary` (`aria-label="<name> links"`): icon links 16x16 (14x14 below 760), color `#666`, hover `#fff`, each `aria-label`, `target=_blank`. Icons: lucide `globe` (website), X (`viewBox 0 0 16 16`), Threads (`viewBox 0 0 24 24`), Bluesky (24), LinkedIn.
- Jurors:
  | Name | Role | Org link | Image | Links |
  |---|---|---|---|---|
  | Thomas Paul Mann | CEO, | Raycast `https://www.raycast.com/` | `jury-thomas-paul-mann-DxpUeMsu.jpg` (400x400) | web `https://thomaspaulmann.com/`; X `https://x.com/thomaspaulmann`; Threads `https://www.threads.com/@thomaspaulmann`; Bluesky `https://bsky.app/profile/thomaspaulmann.com` |
  | Casey Newton | Founder, | Platformer `https://www.platformer.news/` | `jury-casey-newton-CgjmWGYh.jpg` (400x400) | web `https://cnewton.org/`; X `https://x.com/CaseyNewton`; Threads `https://www.threads.com/@crumbler`; Bluesky `https://bsky.app/profile/caseynewton.bsky.social` |
  | Aaron Epstein | General Partner, | YC `https://www.ycombinator.com/` | `jury-aaron-epstein-CI99EqL_.jpg` (612x612) | web `https://www.ycombinator.com/people/aaron-epstein`; X `https://x.com/aaron_epstein`; LinkedIn `https://www.linkedin.com/in/aaron-epstein-a97105/` |
  | Nate Parrott | Design, | Anthropic `https://www.anthropic.com/` | `jury-nate-parrott-DBsKCChd.jpg` (399x399) | web `https://nateparrott.com/`; X `https://x.com/nateparrott`; LinkedIn `https://www.linkedin.com/in/nate-p-69a2151b7/` |
  | Zeh Fernandes | Head of Design, (non-breaking spaces ` ` in "Head of Design,") | Resend `https://resend.com/` | `jury-zeh-fernandes-BrsmNVwG.jpg` (400x400) | web `https://zehfernandes.com/`; X `https://x.com/zehf`; LinkedIn `https://www.linkedin.com/in/zehfernandes` |
- At 1440 jurors are at x=240 + 192i (one row, 5 across), photos y=3402.4, name y=3522.4, role y=3550.9, links y=3586.2. Below 760 they wrap to 3 + 2 (390: jurors at 3 per row, the second row centered).

### 3.8 Selection criteria (`section.mx-auto.max-w-page`, y=3858.2)
- `h2` "Selection criteria": Instrument Sans 44px/48.4px/-1.1px `#fff`, centered (30/33 below 480).
- `div.mt-12.flex.flex-wrap.justify-center.gap-x-12.gap-y-12` (margin-top 48px, gap 48px): 5 `article.text-center`, width `w-full` (below 700), `calc(50% - 1.5rem)` at >=700, `calc(33.333% - 2rem)` at >=1000. At 1440 (960 container): 3 per row at 288px, then 2 centered below (articles at x=240, 576, 912; row 2 at x=408, 744; row pitch 164). At 800 (768 container) it is 2 per row at 360px (x=16 and 424). At 624 it is 1 per row full width (592).
- Each: `h3.flex.items-center.justify-center.gap-2` Instrument Sans **20px / 500 / lh 28px** `#fff` with a leading lucide icon `h-5 w-5` (20x20; stroke 1.8; the first is `sparkles`, the others are different lucide icons, not individually identified) and a `p.mt-2.5` Inter **16px / 400 / lh 26px** `#999` (14px below 480), `text-balance`.
  1. Design & Aesthetics: "A thoughtful, cohesive interface that feels polished in every detail and makes the app a pleasure to use."
  2. App Utility: "A focused app that solves a real problem, works reliably, and gives people a compelling reason to return."
  3. Creativity: "An original idea or unexpected approach that explores what personal desktop software can become."
  4. Branding & Presentation: "Overall branding in the Glaze Store, including the quality of your app icon, screenshots, and app presentation."
  5. Community Traction: "The genuine enthusiasm your app earns from the community, including upvotes within the Glaze Store."
- Section height 376.4 at 1440; mobile 750.8.

### 3.9 Shared widgets (new)
- **`.glaze-app-icon-glass`** (app icon squircle): `isolation:isolate; display:block; position:relative; overflow:hidden;` a CSS `mask` from an inline SVG data URI (`viewBox 0 0 64 64`, black squircle path `M0 28.16C0 18.30 0 13.38 1.92 9.60C3.61 6.31 6.31 3.61 9.60 1.92C13.38 0 18.30 0 28.16 0H35.84C45.70 0 50.62 0 54.40 1.92C57.69 3.61 60.39 6.31 62.08 9.60C64 13.38 64 18.30 64 28.16V35.84C64 45.70 64 50.62 62.08 54.40C60.39 57.69 57.69 60.39 54.40 62.08C50.62 64 45.70 64 35.84 64H28.16C18.30 64 13.38 64 9.60 62.08C6.31 60.39 3.61 57.69 1.92 54.40C0 50.62 0 45.70 0 35.84V28.16Z`) with `50%/100% 100% no-repeat`, so it works at any size. `:before` gloss overlay: `position:absolute; inset:0; z-index:1; pointer-events:none; background: radial-gradient(35% 35% at 0 0, #ffffff2e 0%, #ffffff0a 50%, #0000 80%), radial-gradient(35% 35% at 100% 100%, #ffffff1a 0%, #ffffff05 50%, #0000 80%)`. Children: a hover/placeholder overlay `span.absolute.inset-0.bg-white/[.06].transition-opacity.duration-200.opacity-0` (200ms `cubic-bezier(.4,0,.2,1)`; shows 0.06 white while the image is loading or missing, measured opacity 0 when loaded); the icon `img.absolute.inset-0.h-full.w-full.scale-[1.19].object-cover.transition-opacity.duration-200` (opacity 1, scaled 1.19 to crop out the source icon's own margin; box 95.2px for the 80px icon, 66.6px for the 56px icon); and an SVG border `svg.pointer-events-none.absolute.inset-0.z-20.h-full.w-full` (`viewBox 0 0 64 64`, `preserveAspectRatio=none`, path = the same squircle, `stroke="url(#grad)" stroke-width="2" vector-effect="non-scaling-stroke"`, gradient `x1=0% y1=0% x2=100% y2=100%` with stops: 0% white .45, 25% white .12, 50% white .06, 75% white .10, 100% white .25). Use a unique gradient id per instance.
- **Scrollbar/focus:** `.dialog-focus-surface:focus(-visible)` and `.store-search-input:focus(-visible)` have `outline:none; box-shadow:none`.

### 3.10 Responsive summary (/awards)
| Width | Changes |
|---|---|
| >=1280 | Hero video 1280x720, centered, overflowing the 960 container; text block overlaps it by 144px. |
| 1024 | Video 1024x576 (full viewport); heading overlap `clamp(-144px,-11vw,-48px)` = -112.6; 3-col entries (306px); prizes 4-col; jurors 5 across (20%); criteria 3-col (`>=1000`). |
| 800 | Video 800x450; entries 3-col (242.7px); pagination 278/212/278; prizes 4-col (170.5px); jurors 5 across at 153.6px; criteria 2 per row. |
| 624 | Video 624x351, `min-[624px]` rules active: winners Silver/Bronze 2-col; entries 2-col (286px, descriptions visible); prizes 2-col (265px); jurors 3 per row; criteria 1 per row (full width). Pagination row was not captured at 624 (selector missed). |
| <624 | Nav becomes the black strip; hero `pt` clamp; Silver/Bronze stack; descriptions on cards hidden; search pill 210x40. |
| 390 | Hero section 404 tall; video 390x219.4 at y=85; h1 36px at y=304.4; Gold card 358x275.3; finalists grid 169px x2 columns (300 tall, 4 rows); entries grid 169px x2 (908 tall); pagination grid 73/212/73 with icon-only Prev/Next (28x32); prizes fieldset 358x422 (`py-10 px-3`) in 2 columns; criteria 750.8 tall; CTA section `pt-220 pb-64`; footer y=5533 (124 tall). Page 5657. |

### 3.11 Motion (/awards)
Verified with `document.getAnimations()` 1.5s after load (all finished):
| Element | Animation | Duration | Delay | Easing |
|---|---|---|---|---|
| Video wrapper `div.animate-fade-in` (inline duration 800ms) | `fade-in` opacity 0 to 1 | **800ms** | 0 | `ease-out` (keyword) |
| "Sponsored by" row (`animate-in`) | `fade-in-up` (translateY 24px to 0 + opacity) | 600ms | **100ms** | ease-out |
| h1 | `fade-in-up` | 600ms | **200ms** | ease-out |
| Subtitle | `fade-in-up` | 600ms | **300ms** | ease-out |
| Below-the-fold wrapper `div.animate-fade-in` | `fade-in` | 600ms | **500ms** | ease-out |
Each element starts with inline `opacity:0` and fill `both`. Keyframes are in CLONE_SPEC 1.7. There are **no IntersectionObserver reveals** on the page (nothing below the fold animates on scroll). The hero video loops continuously. Hover transitions: cards 150ms colors; icon overlay 200ms opacity; search pill `all .2s`; popover 150ms opacity; dialog open uses `animate-lightbox-in` (opacity 0 to 1, 200ms ease-out) for both backdrop and dialog.

### 3.12 Links on /awards
Internal: nav and footer links as in section 1.7; `/app/<slug>` for every winner (via the dialog "Open as full page" link), finalist and entry card (Gold: `/app/the-last-blockbuster-oRLCOs`); `/api/download?cta=waitlist_download` (CTA); `?entriesPage=N` and `?entriesQuery=...` (query-string state on `/awards`).
External: `https://www.anthropic.com/` (Sponsored by logo and Nate Parrott's org), all juror org/website/social URLs in 3.7, and footer externals.

---

## 4. /awards/terms

Standard `#121212` page. Page height 6175 at 1440, 1024 and 800; 6494 at 624; 8541 at 390. No animations.

### 4.1 Section structure
`main.flex.min-h-dvh.flex-col` > `section.pt-[172px].pb-24.px-4` (padding 172px 16px 96px) > `div.max-w-content.mx-auto` (640 wide; x=400 at 1440, x=192 at 1024, x=80 at 800, x=16 at 624 with width 592 and at 390 width 358) > h1, "Last Updated" line, and one long prose `div`, then the footer.
- **h1** `h1.text-balance.text-4xl.xs:text-5xl.font-medium.leading-[1.1].tracking-tight.text-center.text-white.mb-3`: **two block spans** "Glaze Awards" / "Terms & Conditions", **Inter** (not Instrument Sans) **48px / 500 / lh 52.8px / ls -1.2px** (36px/39.6px/-0.9px below 480), `#fff`, `mb-3` 12px. Total 640x105.6 at y=172 (79.2 tall at 390).
- `p.text-sm.text-text-secondary.text-center.mb-8`: "Last Updated: 16 July, 2026" Inter 14px / 400 / lh 20px `#a0a0a0`, margin-bottom 32px, y=289.6.
- **Prose container** `div.text-base.leading-[1.6].text-white.space-y-4` with child selectors: `h2`: `text-balance font-semibold pt-6 text-3xl`; `h3`: `text-balance font-semibold pt-2 text-lg`; `a`: `underline hover:text-text-secondary transition-colors`; `ul`: `list-disc pl-6 space-y-2` (no lists present on this page); `strong`: `font-semibold`. Starts at y=341.6, 640x5615.3.
  - Measured: body text Inter **16px / 400 / lh 25.6px** `#fff`, paragraph margin-bottom **16px** (`space-y-4` on the children gives margin 0 0 16px in the computed output).
  - `h2`: Inter **30px / 600 / lh 36px** `#fff`, padding-top 24px, margin-bottom 16px (60px tall; 96px when it wraps to 2 lines at 390).
  - `h3`: Inter **18px / 600 / lh 28px** `#fff`, padding-top 8px, margin-bottom 16px (36px tall).
  - `strong`: weight 600.
  - Links: underline, text and underline color `#fff`, hover `#a0a0a0` (150ms colors), `target=_blank` for the `https://glaze.app/awards` and `/privacy` links and `mailto:` for the email.
- Body ends at y≈5957; the Schedule block has a different treatment (below). Footer begins at y=6052.9 (section padding-bottom 96px).

### 4.2 Content structure (headings exact; body is structure only)
All paragraphs are numbered clauses typed inline ("1.1 ...") with no list markup.
1. `h2` "1. The basics": 1 paragraph (clause 1.1, ~286 chars, mentions Raycast Technologies Ltd, an address in Altrincham, Cheshire). `h3` "1.2 The entry window": 4 paragraphs: "Thursday 23 July, 8:00 am BST (12:00 am PDT)" prefixed by bold "Opens :"; "12:00 am (midnight) PDT on Tuesday 28 July (8:00 am BST on Tuesday 28 July)" prefixed by bold "Closes :"; "(the "Contest Window"). Anything submitted outside the Contest Window is not eligible." (~86 chars); clause 1.3 (~236 chars). (The h3 sits inside section 1.)
2. `h2` "2. Who can enter": 6 paragraphs (2.1 ~103 chars, 2.2 ~300+ chars (the long excluded-regions list, 230px tall at 1440), 2.3 ~153, 2.4 ~102, 2.5 ~300, 2.6 ~158).
3. `h2` "3. Your entry": 6 paragraphs (3.1 ~107, 3.2 ~38, 3.3 ~132, 3.4 ~237, 3.5 ~294, 3.6 ~98).
4. `h2` "4. Judging": 4 paragraphs (4.1 ~120, 4.2 ~182, 4.3 ~171, 4.4 ~132 with the link `https://glaze.app/awards`).
5. `h2` "5. The prize": 4 paragraphs (5.1 ~57 with the link `https://glaze.app/awards`, 5.2 ~206, 5.3 ~138, 5.4 ~86).
6. `h2` "6. Winners and announcement": 4 paragraphs (6.1 ~132, 6.2 ~324 (contains a link), 6.3 ~297 (contains a link, the `privacy@glaze.app` mailto), 6.4 ~188).
7. `h2` "7. Fair play": 1 paragraph (7.1 ~240).
8. `h2` "8. Verification": 2 paragraphs (8.1 ~127, 8.2 ~92).
9. `h2` "9. Intellectual property": 4 paragraphs (9.1 ~89, 9.2 ~300 (128px tall), 9.3 ~190, 9.4 ~242).
10. `h2` "10. Data protection": 2 paragraphs (10.1 ~196, 10.2 ~222 with a link).
11. `h2` "11. Limitation of liability": 3 paragraphs (11.1 ~276, 11.2 ~300, 11.3 ~142).
12. `h2` "12. General": 3 paragraphs (12.1 ~122, 12.2 ~89, 12.3 ~127: "governed by the law of England and Wales").
- **Schedule block** `div.!mt-16.border-t.border-border-separator.pt-12.text-center` (margin-top 64px, border-top 1px `rgba(255,255,255,.10)`, padding-top 48px, 640x109 at y=5103): `p.text-sm.font-medium.text-text-secondary` "Schedule 1" (Inter 14/500/20 `#a0a0a0`), then `h2.!pt-1` "Judging criteria" (Inter 30/600/36px, padding-top 4px, centered).
- Then continuing in the same prose container: `h3` "S1.1 Assessment basis" + 1 paragraph (~178 chars); `h3` "Core judging criteria" + 5 paragraphs, each starting with a bold criterion name ending in " :" (**Design & Aesthetics :**, **App Utility :**, **Creativity :**, **Branding & Presentation :**, **Community Traction :**; the descriptions repeat the 5 criteria texts in 3.8) + 1 closing paragraph ("Each judge scores independently..." ~113 chars); `h3` "S1.2 Tie-break" + 1 paragraph (~239 chars).
- Totals: 13 `h2`s (12 numbered plus "Judging criteria"), 4 `h3`s ("1.2 The entry window", "S1.1 Assessment basis", "Core judging criteria", "S1.2 Tie-break"), about 60 paragraphs, 0 lists. Links in the body: `https://glaze.app/awards` (3 instances: 4.4, 5.1, and one in section 6), `mailto:privacy@glaze.app` (section 6), `https://www.glaze.app/privacy` (section 10).
- The exact legal text is not transcribed here per the brief; fetch from the live page text when building (or copy from `/Users/riyaghosh/V3/glaze/_reference/screens/awards-terms-1440.png` for visual check). The page text can be re-captured with `document.querySelector('main section > div > div:nth-child(3)').innerText`.

### 4.3 Responsive
- >=480: h1 48px; content 640px centered. Below 640+32 the container is full width minus 32px.
- 390: container 358 wide; h1 36px/39.6px (2 lines, 79.2 tall); "Last Updated" y=263.2; prose starts y=315.2; heading `h2`s start at 30px/36px; clause paragraphs wrap more (paragraph 1.1: 179.2 tall vs 102.4); page 8541.
- 624 and 800: container 592 and 640 respectively.

### 4.4 Links
Internal: nav/footer links; body links to `https://glaze.app/awards` and `https://www.glaze.app/privacy` are absolute glaze.app URLs, so map them to `/awards` and `/privacy` locally. Email: `mailto:privacy@glaze.app`.

---

## 5. New assets (original URL → local path)

Base `https://www.glaze.app/assets/` → `/Users/riyaghosh/V3/glaze/public/assets/marketing/`:
| Original | Local | Notes |
|---|---|---|
| `https://www.glaze.app/assets/awards-hero-84xk2ZFP.mp4` | `public/assets/marketing/awards-hero-84xk2ZFP.mp4` | 1600x900 H.264, 16.43s, 1.38MB; autoplay muted loop playsinline |
| `https://www.glaze.app/assets/award-peoples-choice@2x-C7Vw5M8e.png` | `public/assets/marketing/award-peoples-choice@2x-C7Vw5M8e.png` | 128x128 PNG |
| `https://www.glaze.app/assets/jury-thomas-paul-mann-DxpUeMsu.jpg` | `public/assets/marketing/jury-thomas-paul-mann-DxpUeMsu.jpg` | 400x400 |
| `https://www.glaze.app/assets/jury-casey-newton-CgjmWGYh.jpg` | `public/assets/marketing/jury-casey-newton-CgjmWGYh.jpg` | 400x400 |
| `https://www.glaze.app/assets/jury-aaron-epstein-CI99EqL_.jpg` | `public/assets/marketing/jury-aaron-epstein-CI99EqL_.jpg` | 612x612 |
| `https://www.glaze.app/assets/jury-nate-parrott-DBsKCChd.jpg` | `public/assets/marketing/jury-nate-parrott-DBsKCChd.jpg` | 399x399 |
| `https://www.glaze.app/assets/jury-zeh-fernandes-BrsmNVwG.jpg` | `public/assets/marketing/jury-zeh-fernandes-BrsmNVwG.jpg` | 400x400 |

Already in `public/assets/` (skipped): `award-gold@2x-C2t6avtW.png`, `award-silver@2x-Bg8X11yF.png`, `award-bronze@2x-CZBT3HSE.png`, `app-icon-PC60coqE.png`, `app-icon1..17-*.png`, `logo-full-DAu7MkQ8.svg`, `og-glaze@2x.jpg`, fonts.
Not downloaded: (a) the Anthropic wordmark is an inline `data:image/svg+xml` (not a network asset); (b) Claude brand-mark and all lucide icons are inline SVG; (c) remote user content from `img.glaze.app` (app icons and avatars; dynamic, proxied, hundreds of items); (d) the `/api/download` binary (not an asset).
Network requests seen on all four pages (not needed): `_proxy/dub/script` (Dub analytics), `us.i.posthog.com/flags` (PostHog), `_serverFn/85b2c5...` (server function; version and auth hint).

## 6. Ambiguities and gaps
1. Anthropic wordmark SVG is only available as a long data URI in the hero `img`; it was not saved. Build can re-extract it from `document.querySelector('main img[alt=Anthropic]').src` and save as `public/assets/marketing/anthropic-wordmark.svg` (or I can on request).
2. The first Free row uses the Claude brand-mark SVG (`#D97757`); only the start of its path was captured in this spec. Re-extract the full `outerHTML` from `/pricing` (first `svg.mt-0.5.h-3.5.w-3.5.shrink-0` in the first card).
3. Selection-criteria icons: only the first (`sparkles`) was identified; icons 2 to 5 are lucide 20px icons I did not name.
4. Winner dialog content (full store-app page) is out of scope; the Silver and Bronze `/app/` slugs were not read.
5. Search debounce time and the scroll-after-pagination target were not reliably captured (the sampling script crashed twice with exit 137 and a timeout). The pagination row at 624 was not captured.
6. FAQ scroll-dim (landing M6) was not tested on `/pricing`; the same wrapper classes exist (`transition-opacity duration-600`, `opacity-100`), so it is likely shared.
7. Entries data is live and dynamic (489 at capture time, 21 pages of 24); use a fixture. Only page 1 names, authors and slugs are listed here.
8. Because `/awards` is the black variant with a post-event heading ("The results are in..."), the live page reflects results; the earlier event copy (submission window July 23 to 27) survives only in the title and meta description.
9. `/download` has no footer in the DOM. Confirmed by `footer` selector returning null at both widths.
