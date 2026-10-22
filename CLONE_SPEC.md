Source: https://www.glaze.app/m (requested route), compared with https://www.glaze.app/ (the landing page)

# Glaze clone spec

Measured live in Chromium (Playwright) on 2026-10-22 at 1440x900 and 390x844, with spot checks at 768, 1024 and 1280. Every px value below is a computed style or bounding box, not an estimate. The original is built with **Tailwind v4** (oklab colors, `@layer theme`, `--spacing:.25rem`). The clone uses Tailwind v3, so the tokens are listed as plain hex/rgba values below.

Screens: `/Users/riyaghosh/V3/glaze/_reference/screens/`
- `home-1440-full.png`, `home-390-full.png`: full page "/"
- `home-390-menu-open.png`: mobile nav open (viewport only)
- `m-404-1440-full.png`, `m-404-390-full.png`: full page "/m"

Note: in the full-page screenshots of "/", the FAQ block may look dimmed (opacity .15). That is an artifact of the scroll pass done before capture (see Motion M6). On a fresh load it renders at opacity 1.

---

## 0. IMPORTANT: what `/m` actually is

- `https://www.glaze.app/m` returns **HTTP 404** for both desktop and iPhone user agents. Its title is `Page Not Found — Glaze` (the SSR HTML first emits the home title, then the client swaps it).
- Router: `/$persona` is a dynamic route. Valid persona slugs are `designers, product-managers, engineers, creators, teams, design, development, creativity, personal, fun, productivity`. `m` is not in that list, so the loader throws notFound and the app renders the shared 404 component (section 2).
- The `-m@2x` suffix on files like `feature-agent-m@2x-*.png` means **mobile** image variant (served below 800px through `<picture>`). It has nothing to do with the `/m` route.
- Conclusion: `/m` is not a distinct landing-page variant. It is the generic 404 page: nav, centered "Page not found" block and footer. The rich page that the saved `_reference/original.html` and the assets target is `/`, which is fully specced in section 3. Build `/m` as the 404 page (or as a catch-all 404) and `/` as the landing page.

---

## 1. Global design tokens (shared by all routes)

### 1.1 Fonts (files in `public/assets/fonts/`)
| Family | Weights (variable) | Files | unicode-range |
|---|---|---|---|
| Inter | 100–900 | `inter-latin-8kRkwJBP.woff2` (latin), `inter-latin-ext-B_-bZUTo.woff2` (latin-ext) | latin: `U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD`; ext: `U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF` |
| Instrument Sans | 400–700 | `instrument-sans-latin-CclBWeUS.woff2`, `instrument-sans-latin-ext-oUstOPQL.woff2` | same ranges |

- All faces use `font-style:normal; font-display:swap`. Only the two **latin** files load on the page; both are preloaded in `<head>` (`<link rel="preload" as="font" type="font/woff2" crossorigin>`).
- Stacks: sans `"Inter", sans-serif` (body default); display `"Instrument Sans", sans-serif` (class `font-display`); mono `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace` (only used in the inactive promo eyebrow).
- body: `-webkit-font-smoothing:antialiased; -moz-osx-font-smoothing:grayscale; margin:0`.

### 1.2 Colors
| Token | Value | Notes |
|---|---|---|
| `--bg` / page bg | `#121212` | set on html, body and `<meta name="theme-color">` |
| `--fg` / text-primary | `#ffffff` | |
| text-secondary | `#a0a0a0` (computed `color(srgb .628 .628 .628)` = `color-mix(#121212, #fff 60%)`) | |
| text-tertiary | `#717171` (computed `.442` = `color-mix(#121212, #fff 40%)`) | |
| text-quaternary / border-primary | `rgba(255,255,255,.20)` | |
| border-separator / border-secondary / surface | `rgba(255,255,255,.10)` | FAQ dividers |
| `--accent` | `#245aca` | primary buttons, `::selection` |
| surface-well | `#080808` | feature cards |
| surface-panel | `#28282894` = `rgba(40,40,40,.58)` | hover bg of dropdown trigger |
| surface-popover | `#222222f2` = `rgba(34,34,34,.95)` | dropdown menu |
| liquid-glass bg | `#2323234d` = `rgba(35,35,35,.30)` | nav pill, mobile nav, dropdown trigger |
| liquid-glass border | `1px solid #ffffff14` = `rgba(255,255,255,.08)` | |
| support palette (defined, not used on these pages) | red `#ff6363`, orange `#ff9217`, yellow `#ffc531`, green `#59d499`, blue `#56c2ff`, purple `#a485ff`, magenta `#cf2f98` | |
| white alpha utilities used | `.025, .04, .05, .06, .08, .10, .12, .14, .20, .30, .45, .60` | rgba(255,255,255,x) |
| black alpha used | `.15` (video scrim), `.25` (video scrim hover), `.80` (YouTube overlay) | |

### 1.3 Radii, shadows, blur
- Radii: `rounded-2xl` = **18px** (cards, mobile video), `rounded-3xl` = **26px** (desktop video, mobile nav panel), `rounded-full` = 9999px (pills/buttons), dropdown menu 14px, menu item 9px, lg .5rem, md .375rem, sm .25rem.
- `.liquid-glass`: `backdrop-filter: blur(12px) saturate(180%)` (plus `-webkit-` prefix); bg `#2323234d`; border `1px solid #ffffff14`.
- `.liquid-glass-interactive:focus-within { background:#23232399 }` with `transition: background .1s`.
- Mobile nav open (`.mobile-nav-panel-open`): `backdrop-filter: blur(24px) saturate(150%)`; bg `#121212c7` (rgba(18,18,18,.78)); border-color `#ffffff1f`; box-shadow `0 1px 4px #0000001f, 0 26px 48px #0006, 0 8px 18px #0003`.
- Dropdown trigger shadow: `0 8px 30px rgba(0,0,0,.18)`. Dropdown menu: `0 18px 60px rgba(0,0,0,.45)`, `backdrop-filter: blur(24px)`, border `1px solid rgba(255,255,255,.1)`.
- `.waitlist-icon-glow`: `filter: drop-shadow(0 0 40px #ffffff1f)` (rgba(255,255,255,.12)); `will-change: filter`.
- `.icon-particle`: `filter: drop-shadow(0 4px 12px #0006)`.
- Close-video / close-dialog button: `shadow-[0_10px_28px_rgba(0,0,0,0.28)]`, `backdrop-blur 12px`, `saturate 180%`, bg `rgba(35,35,35,.34)`; hover bg `rgba(42,42,42,.52)` and border `white/.14`.

### 1.4 Type scale (rem = 16px)
`text-xs` 12/16, `text-sm` 14/20, `text-md` 15 (no lh token), `text-base` 16/24, `text-lg` 18/28, `text-xl` 20/28, `text-2xl` 24/32, `text-3xl` 30/36, `text-4xl` 36/40, `text-5xl` 48/48, `text-hero` 34px. Leading: `leading-hero` 1.1, `tight` 1.25, `snug` 1.375, `relaxed` 1.625. `tracking-tight` = -0.025em. Arbitrary values are used in places (e.g. `leading-[1.1]`), so **always use the computed values in the typography tables**, not the scale.

### 1.5 Containers and breakpoints
- `max-w-page` 960px, `max-w-content` 640px, `max-w-narrow` 480px. Page side padding is `px-4` (16px) on every section, so at 1440 a 960 container sits at x=240.
- Custom `xs` = **480px** (`@media (width>=480px)`). Tailwind v3: add `screens: { xs: '480px' }`.
- Arbitrary breakpoints in use: `min-[380px]` (footer gaps), `min-[600px]` (persona grid 4-col, pillar descriptions, persona sizes), `min-[624px]` (desktop nav pill vs mobile nav panel), `min-[700px]` (footer row layout), `min-[800px]` (persona tabs vs dropdown, 2-col features, desktop feature images via `<picture media="(min-width: 800px)">`). JS-only: 623px (mobile video autoplay hook), 600/768 (particle physics).
- **768 / 1024 / 1280:** no layout change at 1024 or 1280. Both measure the same as 1440: docH 6141, 960px container, nav pill 590x48, video 960x540, persona grid 896px wide with 4x221px cols, feature 2-col rows 470+20+470. At **768** (≥624 and ≥600, but <800): desktop nav pill; hero same as desktop (h1 48px, video 736x414); persona switcher is the **dropdown** (tablist hidden); grid is 4 cols of 165px; features are **single column**, the **mobile** `-m@2x` images (700x550) scale up to 736 wide, card padding is 24px, h2 24px/26.4, p 14px/19.6; docH 8210.

### 1.6 Default transition
Tailwind `transition-colors` = `color, background-color, border-color, outline-color, text-decoration-color, fill, stroke` over **150ms `cubic-bezier(.4,0,.2,1)`**. `transition-transform` / `transition-all` use the same 150ms ease unless a duration is stated. Hover variants are wrapped in `@media (hover:hover)`.

### 1.7 Keyframes (from `styles-CpdsjlmX.css`)
```css
@keyframes nav-in      { 0%{opacity:0} to{opacity:1} }                                   /* .animate-nav-in: 1s ease-out both */
@keyframes fade-in-up  { 0%{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }  /* .animate-in: .6s ease-out both */
@keyframes fade-in     { 0%{opacity:0} to{opacity:1} }                                   /* .animate-fade-in: .6s ease-out both */
@keyframes lightbox-in { 0%{opacity:0} to{opacity:1} }                                   /* .animate-lightbox-in: .2s ease-out both */
@keyframes shake  { 0%,to{transform:translate(0)} 15%{transform:translate(-6px)} 30%{transform:translate(5px)} 45%{transform:translate(-4px)} 60%{transform:translate(3px)} 75%{transform:translate(-1px)} }  /* not used on / or /m */
@keyframes shimmer{ 0%{background-position:150%} 50%{background-position:-150%} to{background-position:-150%} }  /* not used on / or /m */
@keyframes spin   { to{transform:rotate(360deg)} }       /* animate-spin 1s linear infinite; unused here */
@keyframes pulse  { 50%{opacity:.5} }                    /* animate-pulse 2s cubic-bezier(.4,0,.6,1) infinite; unused here */
```
Note: `ease-out` in these shorthand rules is the CSS keyword `ease-out`, not Tailwind's `cubic-bezier(0,0,.2,1)`. Tailwind's `ease-out` utility, used in transitions such as `duration-300 ease-out`, *is* `cubic-bezier(0,0,.2,1)`. Both appear on the page.

---

## 2. Shared chrome (nav + footer), identical on `/` and `/m`

### 2.1 Desktop nav (≥624px)
- `<nav class="site-navigation">`: `position:fixed; left:0; right:0; top:16px` (top:8px <624); `z-index:50` (10002 while the mobile menu is open); `backface-visibility:hidden; will-change:transform; transform:translate(0)`. The nav has **no scroll behavior**. Measured at scrollY 0/100/600/2000 and scrolling back up, it stays fixed with identical styles: no hide on scroll, no background change, no shadow. It is transparent apart from the pill.
- Pill `div.liquid-glass`: **590x48** at 1440 (x=425, y=16), centered with `mx-auto w-fit`; `display:flex; align-items:center; gap:24px; padding:6px 6px 6px 15px; border-radius:9999px`, plus the glass styles above.
  1. Logo link `/` (aria-label "Go to home"): `img logo-full-DAu7MkQ8.svg`, `h-5` = **64x20**.
  2. Links group: `relative flex items-center gap-16px` (-mt-px below xs), 288x32. Five links: **Home** `/`, **Pricing** `/pricing`, **Store** `/store`, **Blog** `/blog`, **Changelog** `/changelog`. Each is `flex h-8 (32px) items-center`, Inter **14px / 500 / line-height 14px**. Active = `#fff`; inactive = `#a0a0a0`, which turns `#fff` on hover (transition-colors 150ms). Measured link widths: 40, 47, 36, 30, 73.
  3. Active dot: `span` 3x3, `border-radius:50%`, bg `#a0a0a0`, absolutely positioned at `left = linkCenterX - 1.5`, `top = linkBottom - containerTop - 4` (under "Home" on `/`, at y=52). Mount: starts `opacity:0; translateY(4px); transition:none`, then after two rAFs goes to `opacity:1; translateY(0)` with `transition: opacity .3s ease-out, transform .3s ease-out`. Route change: `transition: left .35s cubic-bezier(.4,0,.2,1), opacity .3s ease-out, transform .3s ease-out`. No active route (e.g. `/m`): `opacity:0; translateY(4px)` with `opacity .2s ease-in, transform .2s ease-in`. Recomputed on resize and on `document.fonts.ready`.
  4. Right cluster: a 1x16 divider `bg rgba(255,255,255,.12)` with `margin-left:-8px`; **Sign in** `/signup` (`ml-16px`, Inter 14/500/20, `#a0a0a0`, hover `#fff`); **Download** `/api/download?cta=nav_download` (`ml-14px`; button = `h-9 (36px) px-16px rounded-full bg #245aca`, Inter 14/500/20 white, `gap 8px`; hover `opacity:.9`; disabled `opacity:.5`); measured 99x36.
- `animate-nav-in` (nav-in 1s ease-out) is applied to the pill only on the first client render of `/` (module flag). It was **not** observed on direct loads in this session, so treat it as optional.

### 2.2 Mobile nav (<624px)
- Nav `padding:0 16px; top:8px`. Panel `div.liquid-glass.mobile-nav-panel`: full width 358 at 390, collapsed height **52px** (inline `height:52px`; open = `50 + content scrollHeight + border`, measured **396px**; `max-height: calc(100dvh - 16px)`), `border-radius:26px; overflow:hidden; transform-origin:top`, `transition: height .14s cubic-bezier(.16,1,.3,1); will-change:height`.
- Header row `h-50px`, padding `0 14px 0 18px`, `justify-between`. Logo `h-6` = 77x24. Hamburger `button` 36x36 rounded-full, `aria-label` "Open menu" / "Close menu", containing two 20x2 white bars (`rounded-full`, top 7px and 11px). Closed: `translate-y -3px` / `+3px`. Open: `translate-y 2px rotate 45deg` / `-2px rotate -45deg`. `transition-transform 150ms cubic-bezier(0,0,.2,1)`.
- Content `px-18px pt-14px pb-18px`, `transition-opacity 100ms ease-out` (opacity 0 + pointer-events none when closed):
  - Links (flex col, gap 6px): Home, Pricing, Store, Blog, Changelog in Instrument Sans **30px / 500 / 33px**. Active `#fff`, others `#717171`, hover `#fff`.
  - Divider `mt-24px h-0.5px` `linear-gradient(90deg, transparent, rgba(255,255,255,.14) 22%, rgba(255,255,255,.14) 78%, transparent)`.
  - **Sign In** `/signup` in Instrument Sans **24px / 500 / 30px**, `#717171`, `mt-16px`.
  - A second divider (`mt-16px`), then a row (`mt-12px`, space-between, 24px tall): 4 social icons (24x24 boxes, 20x20 svg, gap 12px, `#717171`, hover `#a0a0a0`) and "Made by Raycast" (Inter 12px/16px, gap 6px, Raycast svg 20x20).
- Backdrop: `body > button` fixed inset-0, `backdrop-filter: blur(2.5px)`, transparent bg, `transition-opacity 150ms ease-out`. Closed: `opacity:0; z-index:40; pointer-events:none`. Open: `opacity:1; z-index:10001`; clicking it closes the menu.
- Clicking a mobile link closes the menu, then after **150ms** sets `--bg` on html/body plus the theme-color meta and does a full `location.assign(href)`.

### 2.3 Footer
- `footer.mt-auto px-16 pb-56` (pb-20 below xs). Inner `max-w-page` flex col centered, gap 10px, Inter 14px/20 `#717171`.
- Row 1 (flex-row ≥700, gap 16; stacked <700 with gap 10):
  - group A: "Copyright © 2026" (span), **Manual** → `https://manual.glaze.app`, **Blog** → `/blog` (gap-x 16 ≥380, 12 below)
  - group B: **Terms** `/terms`, **Privacy Policy** `/privacy`, **Acceptable Use** `/aup` (wrap, gap 8/16)
  - Links are `py-1` (28px tall), `#717171`, hover `#a0a0a0`.
- Row 2 (gap 20 ≥380, 16 below, nowrap): social icons (gap 16 ≥380, 10 below), each a 24x24 link with a 20x20 svg, `#717171`, hover `#a0a0a0`: **X** `https://x.com/glazeapp`, **Slack** `https://glaze.app/community`, **YouTube** `https://www.youtube.com/channel/UCZltNInxFzkNzBqg_G4EdXg`, **Reddit** `https://reddit.com/r/glazeapp`. Then "Made by Raycast" → `https://raycast.com` (gap 6, 20x20 Raycast mark, `py-1`).
- 1440: footer 1440x122, inner 960x66 (rows at +0 and +38). 390: 390x124, inner 358x104 (three stacked rows at +0, +38, +76).
- SVGs are inline. Exact markup for all icons is in section 5.

---

## 3. Route `/m` (404 page)

`main.flex.min-h-dvh.flex-col`, then `section.flex-1.flex.items-center.justify-center.px-16.py-96`, then the footer.

| Element | 1440 box (x,y,w,h) | 390 box | Styles |
|---|---|---|---|
| section | 0,0,1440,778 | 0,0,390,720 | padding 96px 16px; vertically centers content |
| wrapper `max-w-narrow` (480) flex col center | 563,240,314,299 | 38,234,314,251 | text-align center |
| icon (`waitlist-icon-glow`, the same component as the landing Download CTA, including the click-particle effect) | 664,240,112x112 | 155,234,80x80 | img `app-icon-PC60coqE.png`; `mb-40px`; hover `scale 1.05`; active `scale .95`; `transition transform 300ms cubic-bezier(0,0,.2,1)`; glow drop-shadow |
| h1 "Page not found" | 572,392,296x48 | 94,354,202x33 | Instrument Sans **44px/500/48.4px, ls -1.1px** (390: **30px/33px, ls -.75px**), `#fff`, `mb-8px`, user-select none |
| p "The page you're looking for doesn't exist." | 563,448,314x22 | 38,395,314x22 | Inter 16px/400/22.4px `#a0a0a0`, `mb-24px` |
| a "Go Home" → `/` | 664,494,111x44 | 139,442,111x44 | `h-11 (44px) px-20px rounded-full bg #245aca`, Inter 16/500/24 white; hover opacity .9 |
| footer | y 778, h 122 | y 720, h 124 | see 2.3 |

docH = viewport height (900 / 844). No entrance animations on this route. Nav shows no active link, so the dot is hidden.

---

## 4. Route `/` (landing page), DOM order

`<main class="flex min-h-dvh flex-col">` contains: JSON-LD scripts, then `div#overview` (hero), then `div.animate-fade-in` (inline `opacity:0; animation-delay:500ms`) wrapping [persona showcase, #features, #faq, #download, footer], then the YouTube overlay (portal-like, conditional).

Per-section boxes (y is document top):

| # | Section | 1440 (y, h, w) | 390 (y, h, w) |
|---|---|---|---|
| S1 | Hero `#overview > section` | 0, 1211, 1440 | 0, 805, 390 |
| S2 | Persona showcase (wrapper `mt-256` / `mt-160`) | 1467, 536, 960 inner | 965, 573, 358 inner |
| S3 | Features `#features` (`mt-256` / `mt-160`, `scroll-mt-80`) | 2258, 2034 | 1697, 2522 |
| S4 | FAQ `#faq` (`mt-256` / `mt-160`, `scroll-mt-160`) | 4548, 682 | 4379, 651 |
| S5 | Download `section#download` | 5230, 789 | 5030, 529 |
| S6 | Footer | 6019, 122 | 5559, 124 |
| | Document height | **6141** | **5683** |

### S1 Hero
`section.relative px-16 pt-160` (pt-140 <480). Inner `max-w-page mx-auto flex flex-col items-center text-center`.

1. **Eyebrow** (AnimateIn, delay 0): `div.mb-12 inline-flex`, span Inter **16px/500/line-height 16px**: "Glaze" (`#fff`) + `ml-6px` "by " (`#a0a0a0`) + link **"Raycast"** → `https://www.raycast.com/blog/meet-glaze` (`target=_blank rel="noopener noreferrer"`, inherits `#a0a0a0`). Box 133x28 (16 text + 12 mb). 1440 x=654, y=160.
   - (The inactive promo variant "Use code WAVE20 for 20% off Pro", with `font-mono tracking-[0.02em]` on the code, appears only with the `waveform` partner promo. Ignore it.)
2. **H1** (AnimateIn, delay 100ms): `h1.font-display text-balance font-medium tracking-tight #fff`. The text is split on `\n` into spans with `<br>` between them: **"Desktop apps,"** / **"reimagined by you."**
   - ≥480: **48px / 500 / 52.8px / ls -1.2px**, `mb-16`. Box 398x106 at 1440 (x=521, y=188).
   - <480: **34px / 37.4px / ls -0.85px**, `mb-12`. Box 282x75.
3. **Sub** (AnimateIn, delay 200ms): `p.mx-auto max-w-content(640) text-balance leading-relaxed #717171`. Text: "Create any app in minutes by chatting with AI." then `<br class="hidden xs:block">` then "Beautiful, powerful, and truly personal."
   - ≥480: **18px/29.25px**, `mb-24`, 390x59.
   - <480: **16px/26px**, `mb-16`, 358x52. Line 1 wraps to 2 lines and the `<br>` is hidden.
4. **CTA block** (AnimateIn, delay 300ms, `mb-48` / `mb-32` <480, `w-full`):
   - Row `flex gap-8`, `flex-row` ≥480, column <480 (380x40 at 1440; 194x88 at 390).
     - **Download for Mac** `a` → `/api/download?cta=hero_download`: `h-10 (40px) pl-14 pr-16 rounded-full bg #245aca gap-8`, Apple svg 18x18 (`relative -top-px`, white fill) + span Inter **14/500/20** white, nowrap. 178x40. Hover opacity .9.
     - **Reinvent your wheel** `button` (aria-label same; opens YouTube overlay `NBVlr5xWEOE`, aspect 4/3): `h-10 pl-14 pr-16 rounded-full border 1px rgba(255,255,255,.08) bg rgba(255,255,255,.06) gap-8`, play-circle img 18x18 (data-URI svg, section 5) + span Inter 14/500/20 white. 194x40. Hover bg `rgba(255,255,255,.10)` and icon `scale 1.05` (150ms). Focus-visible: no outline, `ring-2 rgba(255,255,255,.45)`.
   - `p.mt-16` "macOS Tahoe and Apple Silicon required": Inter **12px/16.2px** `#717171`, 232x16.
   - Device variant (from code, not rendered here because Playwright uses a desktop UA): on a mobile/touch device (UA match Android|iPhone|iPad|iPod|IEMobile|Opera Mini, or MacIntel with maxTouchPoints>1) the CTA block instead shows a **Sign Up** button (`/signup`, size lg, `px-40`, hidden when signed in) plus `p` "Available for macOS Tahoe and Apple Silicon" (12px/16.2 `#717171`, `mt-12`). Before detection resolves: download row is `hidden xs:flex` and sign-up is `flex xs:hidden`.
5. **Video + pillars** (AnimateIn, delay 400ms, `w-full`):
   - Video card `div[role=button][tabindex=0]` (`max-w-page mx-auto`), `relative overflow-hidden cursor-pointer group`. ≥480: `rounded 26px`, aspect auto. <480: `rounded 18px`, `aspect-[16/10]`.
     - `<video src="/assets/intro-loop-0kts42Ml.mp4" autoplay loop muted playsinline preload="auto">` (1600x900 h264, 28.7s). ≥480: `h-auto object-contain` gives **960x540** at 1440 (x=240, y=512) and 736x414 at 768. <480: `h-full object-cover` gives **358x224** at 390.
     - Scrim `absolute inset-0 flex center bg rgba(0,0,0,.15)`, which becomes `.25` on group hover (150ms). Centered play img 48x48 at `opacity .9`, which on group hover goes to `opacity 1` and `scale 1.1` (`transition-all 150ms`).
     - Click, or Enter/Space: opens the YouTube overlay `https://www.youtube.com/embed/2s_NbPY_XuY` (16/9). Context menu is prevented.
   - Pillars `div.mt-56 w-full`, then `flex flex-row items-start justify-center` with gap **48px** ≥600 (8px <600). Three items, each `flex-col items-center`, `max-w-280` ≥600 (`flex-1` <600):
     - Icon (lucide, `#a0a0a0`, stroke 2): 24x24 ≥600 (20x20 <600), `mb-12` (mb-6 <600).
     - Title span Inter **16/500/24** `#a0a0a0` (14/20 <600), `mb-4`.
     - Description span Inter **14/400/19.25** `#717171`, text-balance, center. **Hidden <600.**
     - Items: (1) `hard-drive` "Local-first" / "Apps run on your machine, no server or internet connection required." (2) `laptop-minimal-check` "OS-integrated" / "Access files, tools, and anything on your operating system." (3) `sparkles` "Opinionated" / "Beautiful by default and personal when you want it to be."
     - Boxes at 1440: x=252/580/908, each 280x103, y=1108. At 390: each 114x50, gap 8.

### S2 Persona showcase ("Make apps for …")
`section.px-16` (aria-labelledby `persona-showcase-title`), then inner `mx-auto flex max-w-page flex-col items-center rounded-18 p-32` (p-16 <600). 960x536 at 1440; 358x573 at 390.

- **Switcher** `div.w-full py-4`:
  - ≥800, tablist row (896x40 at y 1503): `flex center gap-4`. Label span "Make apps for" (Inter 14/500/20 `#a0a0a0`, `h-34 pl-16 pr-10`). Then `div[role=tablist][aria-label="Choose an audience"]` with `flex gap-4 rounded-full bg rgba(255,255,255,.025) p-3px`, 551x40.
  - Tabs `button[role=tab]#persona-tab-{slug}`: `h-34px px-14 rounded-full`, Inter 14/500/20. Selected: `bg rgba(255,255,255,.08) #fff`. Others: `#a0a0a0`, hover `bg rgba(255,255,255,.04) #fff`. Focus-visible: `ring-2 white/.45`. Widths: 90, 74, 117, 93, 53, 99.
  - Order and labels: `personal` **Daily Life** (default), `design` **Design**, `development` **Development**, `creativity` **Creativity**, `fun` **Fun**, `teams` **Your Team**.
  - <800, dropdown row (326x44 at 390): "Make apps for" (14/500 `#a0a0a0`, `pr-12`), then a trigger `button` (aria-label "Choose an audience"). Trigger is liquid-glass, `h-11 (44px) px-16 gap-8 rounded-full`, shadow `0 8px 30px rgba(0,0,0,.18)`, label Inter 16/500/24 white (`max-w-128`, 150 ≥480, truncated), and a lucide chevron-down 16px (14px ≥480) `#a0a0a0` that rotates 180° when open. Hover bg = surface-panel `rgba(40,40,40,.58)`. Measured 128x44.
  - Menu (Base UI select): popup `w-52 (208px) rounded-14 border 1px white/.1 bg rgba(34,34,34,.95) p-6 shadow 0 18px 60px rgba(0,0,0,.45) backdrop-blur 24px`, Inter 14/500/20 white. Positioned below the trigger, measured 208x230.
  - Options: `flex h-9 (36px; 32px ≥480) w-full items-center gap-8 rounded-9 px-8`. Highlighted bg `white/.05`, selected bg `white/.10`. The trailing check icon is at opacity 0, or 1 when selected.
- **Panel** `div#persona-panel[role=tabpanel][tabindex=-1]`: `mt-40` (36 <480), `w-full`, class `animate-fade-in`. It is **re-keyed on every tab change**, so fade-in .6s ease-out replays each time.
  - h2 `#persona-showcase-title`: Instrument Sans **30px/500/37.5px, ls -.75px** `#fff` ≥600; **24px/30px, ls -.6px** <600. Text-balance. The trailing period is stripped.
  - p `mt-8`: Inter **16px/26px** `#a0a0a0` ≥600; **14px/19.25px** <600. Text-balance.
  - Content wrapper `mt-24` (16 <600).
  - **App grid** (all tabs except teams): `grid w-full gap-4`, `grid-cols-4` ≥600 (221px cols at 1440, 165px at 768), `grid-cols-2` <600 (161px). Shows the first 4 apps of the persona.
    - Card `a[href=/app/{slug}]` (aria-label "Preview {name}"): `flex flex-col items-center justify-center rounded-18 p-12 text-center`. `min-h-232px` ≥600 (221x232), `min-h-160` <600 (161x160). Hover bg `rgba(255,255,255,.04)` (150ms); nothing else changes on hover. Focus-visible: `ring-1 white/.30`. Click opens the app-details dialog (see "Not specced").
    - Icon `span.glaze-app-icon-glass`: **112x112** ≥600, **64x64** <600. `isolation:isolate; position:relative; overflow:hidden; mask` = squircle SVG (section 5). `::before` (z1) = `radial-gradient(35% 35% at 0 0, #ffffff2e 0%, #ffffff0a 50%, #0000 80%), radial-gradient(35% 35% at 100% 100%, #ffffff1a 0%, #ffffff05 50%, #0000 80%)`. Children: placeholder span `absolute inset-0 bg white/.06 opacity-0` (`transition-opacity 200ms`); img `absolute inset-0 w/h 100% object-cover scale(1.19)` (133px rendered at 112) with opacity 0→1 on load (200ms); border svg overlay z20 (squircle path stroked with a 5-stop white linear gradient, section 5).
    - Text `div.mt-16` (mt-12 <600): h3 Inter **16px/500/22px** `#fff` truncated (**15px/20.625px** <600). Below it, a `mt-10` row (mt-6 <600) with gap 6: a 16x16 rounded-full avatar img and the author span Inter **13px/400/16px** `#a0a0a0`, truncated.
    - Link below the grid: **"Explore the Glaze Store"** → `/store`. `mt-32` (16 <600), `group flex items-center gap-6`, Inter **16px/24** `#a0a0a0` (14/20 <600), hover `#fff`. Arrow svg 16x16 (stroke 1.5), which on group hover shifts `translate-x 2px` (150ms). 199x24 at 1440.
  - **Teams tab** replaces the grid with logos: `ul` (`grid grid-cols-2 min-h-320 gap-y-48` <600; `flex flex-wrap justify-center gap-x-128 gap-y-48 min-h-232` ≥600; measured 672x232 at 1440). Each `li` is `flex-col items-center gap-20` (12 <600), white: logo svg **72x72** (56x56 <600) + span Inter 16/500 (14 <600). Logos: Raycast, Linear, Vercel, Cursor. The link below reads **"See how teams use Glaze"** → `/blog/how-we-use-glaze-at-raycast`.
  - Panel height is 384 for every tab at 1440.
- Persona content (h2 / p / 4 apps as name, author, href). Local icon and avatar files are listed in ASSET_MANIFEST.md:
  - **Daily Life**: "Build tools for everyday life" / "Trackers, planners, and tiny helpers people made just for themselves:" / Mia Calendar (Daniela Muntyan, /app/mia-calendar-N2NgPq), Flor (David Martín Suárez, /app/flor-8Q7yXM), Reading Corner (Ivo Fonseca, /app/reading-corner-k3tfty), Alto (Wael, /app/alto-cvSTku)
  - **Design**: "Tools for the way you design" / "Product designers use Glaze to fill the gaps in their workflow. A few favorites:" / My Stash (Noman, /app/my-stash-CDBw9Z), Icon Keeper (Yann-Edern Gillet, /app/icon-keeper-x9TGum), Radius Match (Kristina Loewen, /app/radius-match-6p1dce), Font Finder (Alexander Artsvuni, /app/font-finder-O2kYPe)
  - **Development**: "Solve the problem at hand" / "Engineers skip the side project and just make the tool. Some of what they shipped:" / Yolo (Alexandr Subbotin, /app/yolo-PSjYlj), Awesome Script Commands (Thiago Holanda, /app/awesome-script-commands-Hi544G), AI Skills Browser (alexi.build, /app/ai-skills-browser-vMg0FR), Pro⁺ Usage (Boufford, /app/pro-usage-2iVSvr)
  - **Creativity**: "New instruments for your ideas" / "Creators use Glaze to dream up instruments that don't exist anywhere else:" / Elsewhere (Yann-Edern Gillet, /app/elsewhere-khfW1h), CS Glaze Synth (Combustion Studio, /app/cs-glaze-synth-9TGenH), Image Sequencer (Nichlas Wærnes Andersen, /app/image-sequencer-IxkyCn), Paper Shaders (Pedro Duarte, /app/paper-shaders-bjDU1y)
  - **Fun**: "Your ideas, now playable" / "Games and toys people made simply because they could:" / The Last Blockbuster (@zenithquinn, /app/the-last-blockbuster-oRLCOs), Pixel Runner (Per Nielsen Tikær, /app/pixel-runner-dZpJ2d), Raycast Maze (騎山豬跑山, /app/raycast-maze-Meh4qI), Toob (Maik Klotz, /app/toob-riVQfp)
  - **Your Team**: "Built around your team" / "Glaze is used to solve problems and improve workflows at:" / logos Raycast, Linear, Vercel, Cursor
  - Apps come from a server function at runtime. The list above is a live snapshot, so hardcode it in the clone.
- 1440 vertical rhythm: container top 1467, then pad 32, tabs 1499–1547, panel 1587 (h2 1587, p 1632), grid 1682–1914, link 1946–1970, container end 2003.

### S3 Features `#features`
`div.px-16 > div.max-w-page mx-auto flex flex-col gap-20` (gap 16 <800). Rows in order:
1. Full-width card **"Describe and create"**
2. Grid row (`grid-cols-2 gap-20` ≥800; 1 col, gap 16 <800): **"Bring your own agent"** + **"Annotate"**
3. Grid row: **"Publish effortlessly"** + **"Made for teams"**
4. Full-width card **"Discover & install"**

Card = `rounded-18 overflow-hidden bg #080808 h-full`, which contains:
- Header `div.p-28` (p-24 <800), then `flex` (row + `justify-between items-start gap-16` ≥800; column gap 12 <800):
  - h2 Instrument Sans **30px/500/33px ls -.75px** `#fff` `mb-8` (**24px/26.4px ls -.6px** <800)
  - p Inter **16px/26px** `#a0a0a0` text-balance (**14px/19.6px** <800)
  - Card 1 only: **"Watch Demo"** button (opens YouTube `4yztdmf6858`, 16/9): `flex items-center gap-8 rounded-full pl-6 pr-12 py-6 bg rgba(255,255,255,.05)`, hover `.10`, `transition-all 150ms`, `self-start shrink-0`, `-mr-8 -mt-4` ≥800. Contains the play img 18x18 and span Inter 14/400/20 white. 129x32.
- `<picture><source media="(min-width: 800px)" srcset="{desktop}"><img src="{mobile}" class="w-full h-auto block select-none pointer-events-none" alt="…"></picture>`
- Copy and images:
  | Title | Description | Desktop img (nat) | Mobile img (nat) | alt |
  |---|---|---|---|---|
  | Describe and create | Our agent helps you build anything, from first idea to finished app. | feature-agent@2x-DiXdV7jJ.png (1920x720) | feature-agent-m@2x-SqlCEaw_.png (700x550) | AI agent building a desktop app from a prompt |
  | Bring your own agent | Use a Claude subscription or Glaze credits to build, open app sources with any agent. | feature-byo-agent@2x-O6LGWpOW.png (920x720) | feature-byo-agent-m@2x-DzJfhShO.png | Model picker with Glaze Fast, Glaze Smart, and Claude subscription models |
  | Annotate | Send changes to your agent directly in your app. | feature-annotate@2x-CEgsXauF.png (920x720) | feature-annotate-m@2x-BUOqd2MG.png | In-app annotation prompting the agent to add a year option |
  | Publish effortlessly | Easily share with your team or release publicly. | feature-publish@2x-BAnZng48.png (920x720) | feature-publish-m@2x-CA9HDStp.png | Publishing an app to the store |
  | Made for teams | Build software for your specific tools and processes. | feature-teams@2x-BMpRWF7u.png (920x720) | feature-teams-m@2x-DAeBdK0q.png | Team dashboard showing launch progress |
  | Discover & install | Explore apps from your team and our wider community of builders. | feature-store@2x-C0XIoenz.png (1024x384) | feature-store-m@2x-D2JyDUG_.png | App store with community extensions |
- 1440 boxes: card1 y2258 960x483 (header 123, image 960x360); row2 y2761, 2x 470x517 (header 149 left because the text wraps to 2 lines, 123 right; both stretch to 517; images 470x368); row3 y3298 470x491; card4 y3809 960x483 (image 960x360).
- 390 boxes: card1 y1697 358x447 (header 166, which includes the Watch Demo button under the text; image 358x281); each of the next four cards 358x403 (Publish 383), gap 16; card4 ends at 4219.

### S4 FAQ `#faq`
Wrapper `div#faq` (dim behavior in Motion M6), then `section.px-16 text-balance`, then `div.max-w-content(640) mx-auto`.
- h2 "FAQ": Instrument Sans **44px/500/48.4px ls -1.1px** center `#fff` `mb-24` (**30px/33px ls -.75px** <480).
- List `divide-y` (1px `rgba(255,255,255,.1)`) plus `border-bottom 1px rgba(255,255,255,.1)`. Each item:
  - `button.w-full flex items-center justify-between py-16 text-left`, 60px tall at 1440 (56 at 390).
    - span question: Inter **20px/500/28px** `#fff`, `pr-16` (**16px/24px** <480).
    - Chevron svg 20x20 (path `M7.5 5L12.5 10L7.5 15`, stroke 1.5, path color `#717171`). Open state `rotate(90deg)`, `transition-transform 300ms cubic-bezier(.4,0,.2,1)`.
  - Answer `div.grid` with inline `grid-template-rows: 0fr` (closed) / `1fr` (open), `transition: all 300ms cubic-bezier(.4,0,.2,1)`. Child `div.overflow-hidden` contains `p` Inter **16px/26px** `#a0a0a0`, `pb-16`, `white-space:pre-line` (**14px/22.75px** <480).
  - Only one item is open at a time. Clicking the open item closes it. **None open by default.**
- Q/A (exact):
  1. What is Glaze? / Glaze lets you build your own desktop apps just by describing what you want. They live on your Mac, launch instantly, and work offline, so you get real software that fits the way you work.
  2. How do I get started? / Download Glaze for Mac and start building. Glaze currently requires macOS Tahoe and Apple Silicon, with Windows and Linux support planned down the road.
  3. Do I need to know how to code? / No. You describe what you want in plain language and Glaze builds it. If something isn’t right, just talk to it and change it. And if you do know how to code, you’ll feel right at home shaping things further.
  4. How is Glaze different from Lovable, Replit, or v0? / Those tools build for the browser. Glaze builds for your desktop. That means your apps can access your file system, keyboard shortcuts, menu bar integration, background processes, and deeper integration with your OS. Your data stays on your machine, not on someone else’s server. It’s a different category entirely.
  5. What kind of apps can I build? / Anything that comes to mind. Internal tools for your team, personal utilities, menu bar apps, workflow automations, or just quick one-off things that make your life easier. If you can describe it, Glaze can build it. `<a href="/store" class="text-white underline decoration-white/20 underline-offset-4 hover:text-white hover:decoration-white/60">Browse the store</a>` for inspiration.
  6. How do I use my Claude subscription? / Sign in with Claude CLI, then connect Glaze and allow it to use your subscription. Your Claude models appear in the model picker next to Glaze's own models. Runs on your subscription don't spend Glaze credits and are unlimited on Glaze's side during the Beta, subject only to Claude's own usage limits.
  7. Do I own the apps I build with Glaze? / Yes! You own your app, its code and content.
  8. How do I share the apps I've built? / You can share an app with anyone, they just need Glaze installed and to be signed in to their account. They don't have to be a paid subscriber to run it. On any plan you can publish to the public Glaze Store, where anyone can discover, download and use your app, or create a private Team Store to distribute apps inside your team, free while Team Stores are in Beta. Pro adds unlisted publishing for 1:1 sharing.
  9. Can I integrate with my tools or AI? / Yes. Glaze apps run on your Mac, so they can connect to your APIs, local files, and hardware. You can hook into the tools you already use, pull in AI models, or connect to any service with an API.
  10. What platforms does Glaze support? / Mac to start. Glaze currently requires macOS Tahoe and Apple Silicon. Windows and Linux will come down the road.
- The FAQ also emits FAQPage JSON-LD (optional).
- 1440: h2 at y 4548 (640x48), list 4620–5230, items every 61px.

### S5 Download CTA `section#download`
`pt-280 pb-200 px-16` (<480: `pt-220 pb-64`), then `max-w-narrow(480) mx-auto flex-col items-center text-center`.
- Particle layer `div.pointer-events-none fixed inset-0 z-[9999]` (empty until clicked).
- Icon wrapper `relative z-[10000]` > `div.waitlist-icon-glow mb-40` (hover scale 1.05, active .95, `transition-transform 300ms cubic-bezier(0,0,.2,1)`, `touch-manipulation`, select-none) > img `app-icon-PC60coqE.png` **112x112** (80x80 <480). **Click spawns the icon particles** (Motion M7).
- h2 "What will you build?": Instrument Sans **44px/500/48.4px ls -1.1px** `#fff` `mb-32` select-none (**30px/33px ls -.75px, mb-16** <480).
- Button **Download for Mac** → `/api/download?cta=waitlist_download`: `h-11 (44px) pl-16 pr-20 gap-10 rounded-full bg #245aca`, Apple svg 18x18 + span Inter **16/500/24** white. 204x44. Hover opacity .9. (Mobile-device variant: href `/signup`.)
- `p.mt-16` "macOS Tahoe and Apple Silicon required": Inter 12px/16.2px `#717171`.
- 1440: icon y 5510, h2 5662, button 5743, p 5803–5819, section end 6019.

### Overlays (conditional)
- **YouTube overlay** (hero video, Reinvent button, Watch Demo): `div.fixed inset-0 z-[100] flex center bg rgba(0,0,0,.8) backdrop-blur 4px (backdrop-blur-sm)`; click on the backdrop closes it, as does Esc. It sets `body.style.overflow=hidden` while open. No entrance animation.
  - Close button `absolute top-16 right-16` (top/right 24 ≥480), 44x44 (40x40 ≥480), rounded-full, liquid-glass-like styles (1.3), lucide `x` icon 20px stroke 2.25, aria-label "Close video".
  - Frame `div.w-full max-w-900 mx-16 rounded-12 border 1px white/.1` with inline `aspect-ratio` (16/9 default, 4/3 for Reinvent), containing `iframe.w-full h-full rounded-12` with `src="{embed}?autoplay=1&rel=0&modestbranding=1&showinfo=0&controls=1&color=white"` and `allow="autoplay; encrypted-media" allowFullScreen`.
- **App details dialog** (click on a persona app card): backdrop `fixed inset-0 z-80 bg rgba(18,18,18,.75) backdrop-blur 5px animate-lightbox-in (.2s)`. Dialog `fixed center z-90 h-[calc(100dvh-28px)] (72px ≥480) max-h-800 w-[calc(100%-32px)] max-w-960 animate-lightbox-in`, with an inner `rounded-32 (44 ≥480) border white/.1 bg #121212 shadow-2xl` that scrolls. It renders the full store app page plus prev/next buttons (←/→ keys). **Not specced:** the content is the `/app/:slug` store page loaded via a server function, which is outside the scope of this page. Recommend linking cards to `https://www.glaze.app/app/{slug}` instead, or a minimal modal.

### Page-level behavior
- On mount: `history.scrollRestoration = 'manual'` and `scrollTo(0,0)` once. Any URL hash is stripped. Deep-linking via router state scrolls smoothly to `#features` (offset 80) or another id (offset 160).
- `<html lang="en" class="bg-background" style="--bg:#121212;background:#121212">`; viewport `width=device-width, initial-scale=1, interactive-widget=resizes-content`.
- Title "Glaze — Build and Share Mac Apps with AI". Description "Create software for you and your team. Lives on your Mac, connects to your files, tools and hardware." og:image `/og-glaze@2x.jpg` (2400x1260). Favicons `/favicon.ico`, `/favicon.svg`, `/apple-touch-icon.png`.

---

## 5. Interaction states (complete list of matched `:hover`/`:focus-visible`/`:active` rules on `/`)

| Element | Rest | Hover | Other | Transition |
|---|---|---|---|---|
| Nav links (desktop) | `#a0a0a0` (active `#fff`) | `#fff` | — | colors 150ms cb(.4,0,.2,1) |
| Sign in (nav) | `#a0a0a0` | `#fff` | — | same |
| Accent buttons (nav Download, hero Download, CTA Download, Go Home) | bg `#245aca` | `opacity:.9` | disabled `opacity:.5` | colors 150ms (opacity snaps; it is not in the transition list) |
| Reinvent your wheel | bg white/.06, border white/.08 | bg white/.10; icon scale 1.05 | focus-visible ring-2 white/.45, no outline | colors 150ms; icon transform 150ms |
| Hero video | scrim black/.15, play icon op .9 | scrim black/.25; icon op 1, scale 1.1 | Enter/Space opens overlay | colors 150ms; icon all 150ms |
| Persona tab (unselected) | `#a0a0a0`, transparent | bg white/.04, `#fff` | focus-visible ring-2 white/.45 | colors 150ms |
| Persona dropdown trigger | glass bg | bg rgba(40,40,40,.58) | open: chevron rotate 180 | colors 150ms; chevron transform 150ms |
| App card | transparent | bg white/.04 | focus-visible ring-1 white/.30 | colors 150ms |
| Explore the Glaze Store / See how teams use Glaze | `#a0a0a0` | `#fff`; arrow translate-x 2px | — | colors 150ms; transform 150ms |
| Watch Demo | bg white/.05 | bg white/.10 | — | all 150ms |
| FAQ "Browse the store" link | `#fff`, underline color white/.20, offset 4px | decoration white/.60 | — | colors 150ms |
| Download CTA / 404 icon | scale 1 | scale 1.05 | active scale .95 | transform 300ms cb(0,0,.2,1) |
| Footer links + social icons | `#717171` | `#a0a0a0` | — | colors 150ms |
| Mobile menu links | `#717171` (active `#fff`) | `#fff` | — | colors 150ms |
| Close video / dialog buttons | rgba(35,35,35,.34), border white/.08 | rgba(42,42,42,.52), border white/.14 | focus-visible ring-2 white/.45 | colors 150ms |
| `.dialog-focus-surface:focus(-visible)` (persona panel) | — | — | `outline:none; box-shadow:none` | — |
| Text selection | `.selection:bg-accent` exists in CSS (not applied on these pages; default selection) | | | |

---

## 6. Motion

- **M1 Hero entrance (on load, not scroll-gated).** Five `AnimateIn` wrappers (`immediate`), each with inline `opacity:0` plus the class `animate-in` = `fade-in-up .6s ease-out both` (translateY 24px to 0, opacity 0 to 1). Delays: eyebrow **0ms**, h1 **100ms**, sub **200ms**, CTA block **300ms**, video+pillars **400ms**. Stagger is 100ms. Verified via `document.getAnimations()` at both widths.
- **M2 Below-the-fold wrapper.** `div.animate-fade-in` wrapping persona → footer, with inline `opacity:0; animation-delay:500ms`: `fade-in .6s ease-out .5s both`. Runs on load, not on scroll.
- **M3 Persona panel.** `animate-fade-in` (.6s ease-out both, no delay) on mount and **again on every tab switch** (React key = persona).
- **M4 AnimateIn component (generic).** Props `delay`, `duration`, `immediate`, `threshold` (default **0.15**), `variant` (`up` = animate-in, `fade` = animate-fade-in). Non-immediate instances use an `IntersectionObserver({threshold})` that adds the class once `isIntersecting` and then unobserves (one-shot). On `/` every instance is `immediate`, so **there are no scroll-triggered reveals besides M6**.
- **M5 Hero video.** CSS-free: autoplay muted loop. Below 623px a JS hook forces `muted/defaultMuted/playsInline` (+ `webkit-playsinline`) and calls `play()` at 0/100/400/900ms, on `canplay`, `loadeddata`, `pageshow`, `visibilitychange`, on IntersectionObserver intersect, and after ancestor `animationend`.
- **M6 FAQ dim on scroll-past.** IntersectionObserver on `#faq` with `threshold:[0, .35]`. Callback: if `entry.boundingClientRect.top < 0` (the FAQ is above the viewport top), `visible = intersectionRatio >= .35`; otherwise `visible = true`. Initial state is `true`. Class `opacity-100` toggles with `opacity-15`, using `transition: opacity .6s cubic-bezier(.4,0,.2,1)`. Effect: the FAQ fades to 15% as you scroll down past it into the Download CTA, and back to 100% when you scroll up. (Artifact: a programmatic jump from bottom to top skips the IO callback, so the FAQ can stay at .15.)
- **M7 Icon particles (Download CTA and 404 icon click).** Pure JS with rAF; no CSS keyframes.
  - Preload 17 images `app-icon1..17` via `requestIdleCallback` (fallback setTimeout 200).
  - Each click spawns **4** particles from the icon's center. Image picks are shuffled and avoid the previous burst's 4 when possible. At most **40** particles live at once (the oldest is removed first).
  - Launch angle (radians): viewport <600: 50% chance in `[-0.65π, -0.55π]`, else `[-0.45π, -0.35π]`. Viewport ≥600: `[-0.75π, -0.58π]` or `[-0.42π, -0.25π]`.
  - Speed: <600 → 650–1100 px/s; ≥600 → 800–1400 px/s. `vx = cos·speed`, `vy = sin·speed`.
  - Per frame (dt = min(Δ/1000, 0.05), first frame 1/60): `vy += 2400·dt; vx *= 0.99; x += vx·dt; y += vy·dt; rotation += rotationSpeed·dt`. Initial rotation is random ±20°; rotationSpeed is random ±360°/s.
  - Particles are removed when `y > innerHeight + 2·size`.
  - Transform: `translate(x - size/2, y - size/2) rotate(r deg)`, where JS `size = innerWidth < 768 ? 56 : 107`.
  - DOM: `div.icon-particle` (`position:fixed; top:0; left:0; z-index:9999; pointer-events:none; will-change:transform; filter:drop-shadow(0 4px 12px #0006)`; **64x64 below 600px, 107x107 ≥600**) > img (`object-fit:contain; border-radius:12px`, 22px ≥600; 100%). Appended into the fixed z-9999 container.
- **M8 Nav.** Active dot transitions (2.1). Mobile panel height 140ms `cubic-bezier(.16,1,.3,1)`; content opacity 100ms ease-out; burger bars 150ms; backdrop opacity 150ms. Optional pill `nav-in` 1s ease-out (2.1).
- **M9 FAQ accordion.** grid-template-rows 0fr↔1fr 300ms `cubic-bezier(.4,0,.2,1)`; chevron rotate 90° 300ms.
- **No** marquee, carousel, auto-scroll, parallax or scroll-linked transforms exist on `/` or `/m`. `prefers-reduced-motion` only defines `motion-reduce:transition-none`, which these pages do not use.

---

## 7. Inline SVG / data-URI markup (exact)

- Apple logo (Download buttons), 18x18, `viewBox="0 0 17 20" fill="currentColor"`:
  `<path d="M13.981 10.587c-.022-2.233 1.833-3.304 1.917-3.357-1.046-1.53-2.668-1.74-3.244-1.764-1.381-.14-2.695.813-3.396.813-.697 0-1.778-.792-2.923-.77-1.504.022-2.89.875-3.664 2.223-1.562 2.71-.4 6.724 1.123 8.92.744 1.076 1.632 2.285 2.797 2.24 1.123-.045 1.547-.726 2.904-.726s1.739.726 2.923.704c1.207-.023 1.973-1.097 2.711-2.178.854-1.249 1.207-2.458 1.229-2.52-.027-.012-2.351-.902-2.373-3.585ZM11.75 4.01c.617-.748 1.035-1.79.922-2.824-.89.036-1.968.593-2.606 1.34-.572.662-1.071 1.724-.936 2.738.993.077 2.008-.506 2.62-1.254Z"/>`
- Play-circle image (Reinvent, video, Watch Demo), used as `<img src>`:
  `data:image/svg+xml,%3csvg%20width='48'%20height='48'%20viewBox='0%200%2048%2048'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3ccircle%20cx='24'%20cy='24'%20r='12'%20fill='black'/%3e%3cpath%20d='M24%203C35.598%203%2045%2012.402%2045%2024C45%2035.598%2035.598%2045%2024%2045C12.402%2045%203%2035.598%203%2024C3%2012.402%2012.402%203%2024%203ZM21.4668%2015.3574C20.7745%2014.9123%2019.8943%2014.881%2019.1719%2015.2754C18.4495%2015.6698%2018%2016.427%2018%2017.25V30.75C18%2031.573%2018.4495%2032.3302%2019.1719%2032.7246C19.8943%2033.119%2020.7745%2033.0877%2021.4668%2032.6426L31.9668%2025.8926C32.6107%2025.4786%2033%2024.7656%2033%2024C33%2023.2344%2032.6107%2022.5214%2031.9668%2022.1074L21.4668%2015.3574Z'%20fill='white'/%3e%3c/svg%3e`
- Lucide icons (stroke currentColor, width 2, round caps/joins, 24 viewBox): use `lucide-react`'s `HardDrive`, `LaptopMinimalCheck`, `Sparkles`, `ChevronDown`, `Check` and `X` (close buttons use `strokeWidth 2.25`).
- Arrow (Explore link), 16x16: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8h10M9 4l4 4-4 4"/></svg>`
- FAQ chevron, 20x20: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-text-tertiary"/></svg>`
- Squircle path (icon mask and border), viewBox 64:
  `M0 28.16C0 18.30 0 13.38 1.92 9.60C3.61 6.31 6.31 3.61 9.60 1.92C13.38 0 18.30 0 28.16 0H35.84C45.70 0 50.62 0 54.40 1.92C57.69 3.61 60.39 6.31 62.08 9.60C64 13.38 64 18.30 64 28.16V35.84C64 45.70 64 50.62 62.08 54.40C60.39 57.69 57.69 60.39 54.40 62.08C50.62 64 45.70 64 35.84 64H28.16C18.30 64 13.38 64 9.60 62.08C6.31 60.39 3.61 57.69 1.92 54.40C0 50.62 0 45.70 0 35.84V28.16Z`
  - Mask: `-webkit-mask / mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Cpath fill='black' d='<path above>'/%3E%3C/svg%3E")` (center / 100% 100%, no-repeat).
  - Border overlay: `<svg class="pointer-events-none absolute inset-0 z-20 h-full w-full" viewBox="0 0 64 64" preserveAspectRatio="none" fill="none"><defs><linearGradient id="{unique}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="white" stop-opacity="0.45"/><stop offset="25%" stop-color="white" stop-opacity="0.12"/><stop offset="50%" stop-color="white" stop-opacity="0.06"/><stop offset="75%" stop-color="white" stop-opacity="0.1"/><stop offset="100%" stop-color="white" stop-opacity="0.25"/></linearGradient></defs><path d="<squircle>" stroke="url(#{unique})" stroke-width="2" vector-effect="non-scaling-stroke"/></svg>`
- Social (viewBox 16, `fill="currentColor"` on path):
  - X: `M1.034 1.467 6.44 8.674 1 14.534h1.224l4.762-5.13 3.848 5.13H15L9.29 6.92l5.063-5.454H13.13L8.744 6.192 5.2 1.467H1.034Zm1.8.899h1.914L13.2 13.634h-1.913L2.834 2.366Z`
  - Slack: `M3.651 9.979c0 .867-.707 1.576-1.575 1.576A1.58 1.58 0 0 1 .5 9.979a1.58 1.58 0 0 1 1.576-1.576h1.575v1.576Zm.794 0a1.58 1.58 0 0 1 1.576-1.576 1.58 1.58 0 0 1 1.576 1.576v3.945A1.58 1.58 0 0 1 6.021 15.5a1.58 1.58 0 0 1-1.576-1.576V9.98ZM6.021 3.65a1.579 1.579 0 0 1-1.576-1.575A1.58 1.58 0 0 1 6.021.5a1.58 1.58 0 0 1 1.576 1.576v1.575H6.021Zm0 .794a1.58 1.58 0 0 1 1.576 1.576 1.58 1.58 0 0 1-1.576 1.577H2.076A1.58 1.58 0 0 1 .5 6.02a1.58 1.58 0 0 1 1.576-1.576h3.945Zm6.328 1.576c0-.867.707-1.576 1.575-1.576A1.58 1.58 0 0 1 15.5 6.021a1.58 1.58 0 0 1-1.576 1.577h-1.575V6.02Zm-.794 0a1.58 1.58 0 0 1-1.576 1.577A1.58 1.58 0 0 1 8.403 6.02V2.076A1.58 1.58 0 0 1 9.979.5a1.58 1.58 0 0 1 1.576 1.576v3.945ZM9.979 12.35c.867 0 1.576.707 1.576 1.575A1.58 1.58 0 0 1 9.979 15.5a1.58 1.58 0 0 1-1.576-1.576V12.35h1.576Zm0-.794a1.58 1.58 0 0 1-1.576-1.576 1.58 1.58 0 0 1 1.576-1.576h3.945A1.58 1.58 0 0 1 15.5 9.979a1.58 1.58 0 0 1-1.576 1.576H9.979Z`
  - YouTube (evenodd): `M13.965 13.56a1.994 1.994 0 0 0 1.676-1.6c.16-.92.32-2.28.359-3.96 0-1.68-.2-3.04-.36-3.96a1.994 1.994 0 0 0-1.675-1.6C12.608 2.24 10.454 2 7.98 2s-4.668.24-5.985.44c-.838.12-1.516.76-1.676 1.6C.16 4.96 0 6.32 0 8c0 1.68.16 3.04.32 3.96.159.84.837 1.48 1.675 1.6 1.357.2 3.551.44 5.985.44 2.474 0 4.668-.24 5.985-.44ZM11.172 8 6.384 5.2v5.6L11.172 8Z`
  - Reddit (evenodd): `M15.5 8a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0ZM9.933 4.06c.453.13.947-.131 1.077-.607a.861.861 0 0 0-.606-1.056.866.866 0 0 0-1.077.606.99.99 0 0 0-.022.39L7.123 4.86a.216.216 0 0 0-.086.194l.13 1.25c-.995.087-1.926.368-2.662.844a1.204 1.204 0 0 0-1.92.974c0 .433.216.8.54 1.017a2.07 2.07 0 0 0-.022.281c0 1.732 2.161 3.137 4.832 3.137 2.68 0 4.842-1.405 4.842-3.137 0-.086 0-.173-.022-.26a1.202 1.202 0 1 0-1.363-1.97c-.736-.476-1.688-.779-2.725-.887L8.56 5.184l1.775-1.19c.064.023.129.045.194.066ZM5.47 9.29c-.432 0-.778-.346-.778-.779s.346-.78.779-.78.779.347.779.78a.775.775 0 0 1-.78.779Zm4.54 1.428c-.52.52-1.494.563-2.075.563-.585 0-1.559-.043-2.078-.563a.234.234 0 0 1 0-.347.234.234 0 0 1 .346 0c.326.325.996.412 1.732.412.736 0 1.405-.087 1.731-.412a.234.234 0 0 1 .346 0c.087.087.087.26 0 .347Zm-.238-1.428c.433 0 .779-.346.779-.779s-.346-.78-.78-.78c-.432 0-.778.347-.778.78s.346.78.779.78Z`
- Raycast mark (footer, viewBox 20): `M7.454 14.372 10.919 17.838 10.006 18.75l-4.378-4.378h1.826ZM11.372 14.372l1.502 1.501-.914.914-2.415-2.415h1.827ZM14.836 13.914l-.913.914-.979-.98.91-.911.982.977ZM5.628 12.546v1.826L1.25 9.994l.917-.91 3.461 3.462ZM18.75 9.998l-.912.913-3.462-3.459v2.089l2.416 2.416-.913.912-1.503-1.502v1.05h-6.79v-6.79h1.047L7.131 4.126l.913-.913 2.413 2.411h2.089L9.09 2.164 10.002 1.25l8.748 8.748ZM5.628 8.628v1.827L3.213 8.04l.914-.914 1.501 1.502ZM7.063 6.146l-.912.914-.979-.979.913-.914.978.98Z`
- Teams logos (viewBox 24, fill currentColor, white):
  - Raycast `M6.004 15.492v2.504L0 11.992l1.258-1.249Zm2.504 2.504H6.004L12.008 24l1.253-1.253zm14.24-4.747L24 11.997 12.003 0 10.75 1.251 15.491 6h-2.865L9.317 2.692 8.065 3.944l2.06 2.06H8.691v9.31H18v-1.432l2.06 2.06 1.252-1.252-3.312-3.32V8.506ZM6.63 5.372 5.38 6.625l1.342 1.343 1.251-1.253Zm10.655 10.655-1.247 1.251 1.342 1.343 1.253-1.251zM3.944 8.059 2.692 9.31l3.312 3.314v-2.506zm9.936 9.937h-2.504l3.314 3.312 1.25-1.252z`
  - Linear `M2.886 4.18A11.982 11.982 0 0 1 11.99 0C18.624 0 24 5.376 24 12.009c0 3.64-1.62 6.903-4.18 9.105L2.887 4.18ZM1.817 5.626l16.556 16.556c-.524.33-1.075.62-1.65.866L.951 7.277c.247-.575.537-1.126.866-1.65ZM.322 9.163l14.515 14.515c-.71.172-1.443.282-2.195.322L0 11.358a12 12 0 0 1 .322-2.195Zm-.17 4.862 9.823 9.824a12.02 12.02 0 0 1-9.824-9.824Z`
  - Vercel `m12 1.608 12 20.784H0Z`
  - Cursor `M11.503.131 1.891 5.678a.84.84 0 0 0-.42.726v11.188c0 .3.162.575.42.724l9.609 5.55a1 1 0 0 0 .998 0l9.61-5.55a.84.84 0 0 0 .42-.724V6.404a.84.84 0 0 0-.42-.726L12.497.131a1.01 1.01 0 0 0-.996 0M2.657 6.338h18.55c.263 0 .43.287.297.515L12.23 22.918c-.062.107-.229.064-.229-.06V12.335a.59.59 0 0 0-.295-.51l-9.11-5.257c-.109-.063-.064-.23.061-.23`

---

## 8. Not measurable / out of scope (explicit)
- The app-details dialog content (store app page fetched via server function) and `/api/download` (a server redirect to the DMG) are not reproduced. Point the links at the live URLs.
- The Sign Up variant of the hero/CTA for real mobile devices was read from code, not rendered (Playwright used a desktop UA at 390px).
- YouTube iframes are third-party. They were not opened during measurement; their classes and params come from code.
- PostHog and Dub analytics scripts load on the live site. They are not needed.
