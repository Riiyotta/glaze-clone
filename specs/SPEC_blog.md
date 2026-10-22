Source: https://www.glaze.app/blog (also /blog/<slug> x4 and /changelog)

# SPEC: Blog index, 4 blog posts, Changelog

Measured with an isolated headless Playwright (Chromium) on 2026-10-22 at 1440x900 and 390x844, plus spot checks of /changelog at 768/1024/1279/1280. Every px value is computed style or bounding box. Shared tokens, fonts, nav and footer are in `/Users/riyaghosh/V3/glaze/CLONE_SPEC.md` (sections 1 and 2); only deltas are recorded here. Article body text is intentionally NOT transcribed (outline and structure only).

Screens (all in `/Users/riyaghosh/V3/glaze/_reference/screens/`): `blog-index-{1440,390}-full.png`, `blog-index-1440-card-hover.png`, `blog-{teams,why,affiliate,raycast}-{1440,390}-full.png`, `blog-lightbox-1440.png`, `blog-changelog-{1440,390}-full.png`, `blog-changelog-1440-sticky.png`.

Notation: Inter = body font (`"Inter", sans-serif`), Display = Instrument Sans. Colors: primary `#fff`, secondary `#a0a0a0`, tertiary `#717171`, separator `rgba(255,255,255,.10)`, `white/80` = rgba(255,255,255,.8).

---

## 0. Shared across these routes

- Route structure: `<main class="flex min-h-dvh flex-col">` > `<section>` (page content) > shared `<footer class="mt-auto px-4 pb-5 xs:pb-14">` (see CLONE_SPEC 2.3; identical, 1440x122 / 390x124).
- Nav: same fixed pill. Active link + 3px dot: **Blog** active on `/blog` and all `/blog/*` (dot at x=712,y=52 at 1440); **Changelog** active on `/changelog` (dot x=779,y=52). Dot slides between links on client route change (CLONE_SPEC 2.1).
- Breakpoint used by all of these pages: `xs` = 480px (Tailwind `xs:` variants below). Plus `xl` = 1280px (changelog only). No other breakpoint changes on these pages (checked 768, 1024, 1279).
- Page titles: `/blog` "Glaze Blog"; post "<Post title> — Glaze Blog"; `/changelog` "Changelog — Glaze".
- Meta: blog description "Notes from the Glaze team on building personal desktop software, publishing apps, and shaping the future of local tools."; og:image `https://www.glaze.app/og-glaze@2x.jpg` (2400x1260); canonical = page URL. Post meta description = the card excerpt; og:image = post hero. Changelog description "See what's new in Glaze, from new features to fixes."
- No scroll listeners that drive visuals, no IntersectionObserver (0 instances), no entrance animations, no CSS animations running on load (`document.getAnimations()` empty on all 4 posts). The only motion is hover transitions, the Share copy label swap and the image lightbox (below).
- No table of contents, no reading time, no tags/categories, no share-button row beyond the single "Share" text button, no sticky elements on blog pages. Changelog has sticky version labels at >=1280.
- Link rule: all article-body links render `target="_blank" rel="noopener noreferrer"` for any absolute http(s) URL (including glaze.app ones; see Ambiguities). Relative links (start with `/`) would not get target. All body links in the 4 posts are absolute.

### 0.1 Page header block (index + changelog share it)
`div.mx-auto.mb-12 w-full max-w-[680px] text-center xs:mb-16` (margin-bottom 64px at 1440, 48px at 390).
- h1 Display 500, 48px/52.8px (lh 1.1), ls -1.2px, `#fff`, `mb-4` (16px). At 390: 36px/39.6px, ls -0.9px, `px-4` (16px side padding, only <480).
- p Inter 400, `leading-relaxed` (1.625), `#717171`, `mx-auto xs:max-w-[440px]`: 18px/29.25px at >=480; 16px/26px at 390.
- Section: `px-4 pb-20 pt-[140px] xs:pt-40` (top padding 160px >=480, 140px below, bottom 80px). h1 top at y=160 (1440) / 140 (390).

---

## 1. /blog (index)

### 1.1 Layout
- Section as above, content wrapper `div.mx-auto w-full max-w-[640px]` (x=400..1040 at 1440; 358 wide at 390) > `div.flex.flex-col` > 4x `<article>`.
- Page height: 3296 (1440), 2524 (390). Header block 680x98 at y=160 (1440).
- Article: `border-t border-border-separator py-10 first:border-t-0 xs:py-16` (padding 64px >=480, 40px below; 1px top border rgba(255,255,255,.1) except first). Article heights at 1440: 689.9, 727.6, 663.7, 690.9.
- Inside: `div.min-w-0` > `a.group.block` (image, date, title) then author row then excerpt (the author row and excerpt are outside the link).

### 1.2 Card anatomy, in order (1440 / 390)
| Element | Classes | Computed |
|---|---|---|
| Cover img | `aspect-[1.9/1] h-auto w-full rounded-[12px] border border-border-separator object-cover transition-opacity group-hover:opacity-90`, `loading=lazy`, draggable false, contextmenu prevented | 640x336.8 / 358x188.4; radius 12px; border 1px rgba(255,255,255,.1); `transition: opacity .15s cubic-bezier(.4,0,.2,1)` |
| `time` | `mt-8 block text-[15px] leading-[22px] text-text-tertiary` | Inter 15/22/400 `#717171`, margin-top 32px, `datetime="YYYY-MM-DD"` |
| h2 (title) | `mt-4 font-display text-balance text-[28px] xs:text-[34px] font-medium leading-[1.08] tracking-tight text-text-primary transition-colors group-hover:text-text-secondary` | Display 500; 34px/36.72px ls -0.85px at >=480; 28px/30.24px ls -0.7px at 390; margin-top 16px; text-wrap balance; color `#fff`, hover `#a0a0a0` (150ms color transition) |
| Author row | `flex min-w-0 items-center gap-3 text-[15px] leading-[22px] text-text-tertiary mt-5` | height 24, margin-top 20px, gap 12px. Avatar 24x24 round (`h-6 w-6 rounded-full bg-white/[0.08] ring-2 ring-[#121212] object-cover overflow-hidden`, fallback = first letter, 12px/500 `#a0a0a0`), name span `min-w-0 truncate` Inter 15/22 `#717171` |
| Excerpt p | `mt-5 text-[16px] xs:text-[17px] leading-[1.6] text-text-secondary` | 17px/27.2px at >=480 (16px/25.6px at 390), `#a0a0a0`, margin-top 20px |

Hover (whole `a.group` is the target, cursor pointer): cover opacity .9, title color `#a0a0a0`. Verified live: img opacity 0.9, h2 `rgb(160,160,160)`. Nothing else changes (no lift, no shadow). No pagination, no filters, no load-more (4 posts). Empty state (not shown): "No posts yet" h2 28px/500 + "Check back soon for updates from Glaze." p 16/1.5 `#a0a0a0` in `max-w-[420px] py-20 text-center`.

### 1.3 Cards (order = date desc)
| # | Date (datetime) | Title | Author | Excerpt (one sentence) | Cover (natural size; attr w/h) | Link |
|---|---|---|---|---|---|---|
| 1 | July 29, 2026 (2026-07-29) | How Teams use Glaze | Stephanie Leong | A quick overview of how teams from Linear, Vercel, and Cursor are using Glaze. | blog-cover@2x.png 3840x2160 (attrs 3840x2016, so the aspect-[1.9/1] crop applies) | /blog/how-teams-use-glaze |
| 2 | July 17, 2026 | Why Glaze when Claude Code and Codex exist? | Thomas Paul Mann | Coding agents give you a software project. Glaze gives you an app you can use, share, and improve. | og-whyglaze@2x.png 2400x1260 | /blog/why-glaze-when-claude-code-and-codex-exist |
| 3 | July 15, 2026 | Introducing our Affiliate Program | Pedro Duarte | Earn a 20% commission on payments from the people you bring to Glaze Pro. | affiliate-program/blog-cover@2x.png 2400x1260 | /blog/affiliate-program |
| 4 | July 8, 2026 | How we use Glaze at Raycast | Thomas Paul Mann | A quick tour of the internal apps we built with Glaze, from crash reporting to our own CRM, and why we keep building more of them. | how-we-use-glaze-at-raycast/blog-cover@2x.png 3840x2016 | /blog/how-we-use-glaze-at-raycast |

Excerpt = the post meta description (card 4 excerpt is 1 sentence but long; wraps to 2 lines at 1440).
Cover alt texts: (1) "Linear, Vercel and Cursor icons on a dark background" (2) "Glaze, Claude Code, and Codex app icons arranged on a dark background" (3) "Glaze app icon on a dark abstract background" (4) "Raycast and Glaze app icons on a dark abstract background".

---

## 2. Blog post template (all 4 posts)

### 2.1 Layout
`section.px-4 pb-20 pt-[132px] xs:pt-[172px]` > `div.mx-auto w-full max-w-[640px]` > `article.min-w-0` containing in order: hero, header, body, share footer, CTA section. Single column 640 at 1440 (x=400), 358 at 390 (x=16). Article top y=172 (1440) / 132 (390).

### 2.2 Block order and measurements
1. **Hero**: `div.overflow-hidden rounded-[18px] border border-border-separator bg-white/[0.04]` > `img.aspect-[1.9/1] h-auto w-full object-cover` (width/height attrs from data; draggable false; eager, not lazy). 640x337.8 outer at 1440 (inner img 638x335.8 inside the 1px border), 358x189.4 at 390. Not clickable (no lightbox).
2. **Header** `header.mt-10` (40px), contents:
   - `time` Inter 15/22 `#717171`, no margin (draws 97x19 box; displayed `July 29, 2026`, `datetime=YYYY-MM-DD`).
   - h1 `mt-3` (12px) Display 500, `leading-[1.05]`, tracking-tight; **36px/37.8px, ls -0.9px at >=480; 32px/33.6px, ls -0.8px at 390**; `#fff`; wraps naturally (2 lines for "Why Glaze when Claude Code and Codex exist?" = 75.6px tall).
   - Author row `mt-5` (20px): same component as card (24px avatar + name 15/22 `#717171`, gap 12px).
3. **Body wrapper** `div.mt-8` (32px) > `div.markdown-content min-w-0 space-y-5 text-base leading-[25px] text-white/80 xs:text-[17px] xs:leading-[27px]`. All direct children get `margin-top:20px` via space-y-5 (computed shows mb 20px on p as measured by gap; first child 0). Body text Inter 400, **17px/27px at >=480, 16px/25px at 390**, color rgba(255,255,255,.8).
4. **Share footer** `footer.mt-16 border-t border-border-separator pt-10 xs:mt-20 xs:pt-12` (margin-top 80px / 64px at 390; padding-top 48px / 40px; 1px top rule rgba(255,255,255,.1)). Inner `flex items-center justify-between gap-6 text-[15px] leading-[22px] text-text-tertiary`: left group `flex items-center gap-2.5` = [24px avatar + name] · "·" · `time` (same `July 17, 2026` format); right = **Share** `button.shrink-0 text-text-tertiary hover:text-text-secondary transition-colors` (Inter 15/22 `#717171`, hover `#a0a0a0`; 41x22). Row is 24px tall. Share behavior: `navigator.share({title, text: description, url})` if available; otherwise clipboard `writeText(post URL)` and label becomes **"Copied"** for 1600ms then back to "Share". Verified: clipboard received `https://www.glaze.app/blog/<slug>`. Cancelled native share (AbortError) does nothing.
5. **CTA section** `section.mt-20 pt-4 xs:mt-24` (96px >=480 / 80px at 390; pt 16px) > `div.max-w-[420px] mx-auto flex flex-col items-center text-center`: the same "What will you build?" Download block as the landing page S5 (CLONE_SPEC 3/S5, "compact" size): app icon `app-icon-PC60coqE.png` 80x80 (64x64 at 390, with `waitlist-icon-glow`, click spawns particles, `mb-8`/`mb-7`), h2 Display 500 36px/39.6px ls -0.9px (30px/33px at 390, `mb-7` >=480 / `mb-4`), button "Download for Mac" 203.6x44 `/api/download?cta=waitlist_download` (hidden <480; replaced by `p` "Available for macOS Tahoe and Apple Silicon" 12px/16.2px `#717171`), caption `p.xs:mt-4` "macOS Tahoe and Apple Silicon required" 12/16.2 `#717171`. Section 420x255.8 at 1440, 358x173.2 at 390. Then footer at section end + 80px (pb-20).

### 2.3 Prose block styles (from the markdown renderer; applies to blog + changelog)
| Block | Classes | Computed (1440 / 390) |
|---|---|---|
| p | `text-white/80` | 17/27 (16/25) 400, rgba(255,255,255,.8); margin below is the 20px stack gap |
| h2 | `pt-3 text-xl font-medium leading-[1.25] text-text-primary` | **Inter** (not Display) 20px/25px/500 `#fff`, padding-top 12px (so effective gap above = 20+12=32px), height 37 incl padding; same at 390; no letter-spacing |
| h3 | `pt-2 text-lg font-medium leading-[1.3] text-text-primary` | Inter 18px/23.4px/500 `#fff`, padding-top 8px, height 31.4 |
| h1/h4+ | h1 renders as h2 style (`ul` component), h4+ unstyled default (not used) | |
| strong | UA `bolder` | 700, same size/color as parent |
| em | UA | italic 400, same color |
| a | `text-text-primary underline decoration-white/30 underline-offset-4 transition-colors hover:text-text-secondary` | color `#fff`, underline color rgba(255,255,255,.3), offset 4px, thickness auto; hover color `#a0a0a0` (underline stays .3 white); external -> `target=_blank rel="noopener noreferrer"` |
| inline code | `rounded-[4px] bg-white/[0.06] px-1.5 py-0.5 text-[0.92em] text-text-primary` | mono stack `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`; 15.64px at 17px parent (14.72px at 390); padding 2px 6px; radius 4px; bg rgba(255,255,255,.06); color `#fff`; line-height inherits 27px |
| hr | `my-7 h-px border-0 bg-white/[0.08]` | 1px tall, rgba(255,255,255,.08), margin 28px 0 (28px replaces the 20px stack gap above/below) |
| ul | `.markdown-list.markdown-list-unordered text-white/80` | no bullets: `li` has `padding-left:24px` and a `::before` dash 12x1px, bg `#717171`, `left:4px; top:.76em`; `li + li { margin-top:8px }`; nested lists margin-top 8px; **element after a ul gets margin-top 28px** (`.markdown-content>.markdown-list+*`) |
| ol | `.markdown-list-ordered` | `li` padding-left 34px, `::before` counter "1." 24px wide, right-aligned, tabular-nums, `#717171`, absolute left 0 top 0 (not used on these pages) |
| task list | checkbox 16x16 radius 5px bg rgba(255,255,255,.13), checked .18 + check svg `#d8d8d8` | not used |
| blockquote | `border-l border-white/15 pl-5 text-[17px] italic leading-[27px] text-text-secondary [&_p]:!text-inherit` | defined in renderer but **not used**: quotes in the posts are plain `<p>` containing a single `<em>` (whole paragraph italic, `#fff` .8) |
| pre | `overflow-x-auto rounded-[8px] border border-border-separator bg-white/[0.04] p-4 text-sm leading-[22px] text-white/75 [&_code]:bg-transparent [&_code]:p-0` | defined, **not used**; fenced `code` = `block min-w-max text-sm leading-[22px] text-white/75` |
| table | `w-full border-collapse text-left text-base leading-[25px] text-white/80`; td `border-b border-white/[0.12] py-3 pr-6`; th `border-b border-white/[0.28] pb-3 pr-6 font-medium text-text-primary`; last row no border; wrapped in `overflow-x-auto` div | defined, **not used** |
| image | `my-6 block h-auto w-full rounded-[8px] border border-border-separator` (`loading=lazy`, draggable false, width/height attrs) | Rendered inside a `<p>` (20px stack gap) and, on blog posts, wrapped in `button.block w-full rounded-[8px] focus-visible:ring-2 focus-visible:ring-white/40` with `aria-label="Open image: <alt>"`. img has margin 24px top/bottom **in addition** to the p's stack gap (so ~44px above, 24px+20px below). Radius 8px, border 1px rgba(255,255,255,.1), width 640 (358 at 390), height by aspect |
| video | same classes, `autoPlay loop muted playsInline preload=metadata`, ext .mp4/.webm/.mov | defined, **not used** on these pages |

### 2.4 Image lightbox (blog posts only; changelog images are NOT clickable)
Clicking an inline image button opens a fullscreen gallery of **all** `img[data-markdown-image]` in the post.
- Container `fixed inset-0 z-[200]`; backdrop `bg-black` (solid `#000`), `animation: lightbox-in .2s ease-out both` (opacity 0 to 1); body scroll locked (`overflow:hidden`).
- Dialog `aria-label="Screenshot gallery"`.
- Current image: `absolute top-1/2 left-1/2 w-[70vw] max-h-[80vh] -translate-x-1/2 -translate-y-1/2 rounded-xl object-contain` (measured 1008x720 at x=216,y=90 at 1440x900; radius 18px? computed `br` 18px reported).
- Neighbors: `w-[60vw] max-h-[80vh] opacity-60 cursor-pointer`, prev at `left:-50%`, next at `right:-50%` (measured next at x=1296, 864 wide, opacity .6); click navigates.
- Close button: `absolute top-4 right-4 xs:top-6 xs:right-6 h-10 w-10 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors`, X icon 20x20 stroke 2.25 (measured x=1376,y=24, 40x40).
- Counter pill: `absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-sm tabular-nums text-white/70` text "1 / 5" (54.7x28 at y=852).
- Keys: ArrowLeft/ArrowRight navigate (clamped, no wrap), Esc and clicking the backdrop close; focus returns to the originating button. Reference: `blog-lightbox-1440.png`.

### 2.5 Post 1: "How Teams use Glaze" (`/blog/how-teams-use-glaze`)
- Date July 29, 2026; author Stephanie Leong (avatar `/team/stephanie.png` 408x408, shown at 24px); no reading time/tags.
- Hero `blog-cover@2x.png` 3840x2160 (attrs 3840x2016), alt "Linear, Vercel and Cursor icons on a dark background".
- Page height 4877 (1440) / 4935 (390). Body wrapper 640x3454.6 at y=700.
- Outline: H2 "What teams are building with Glaze"; H2 "Quinn at Linear: A CX hub that lives in the menu bar"; H2 "Florentin at Vercel: A PR tracker that lives in the menu bar"; H2 "Tarun at Cursor: A screenshot app with no friction". No H3.
- Block sequence (word counts approximate): h2 > p(72) > hr > h2 > p(63) > p(116) > p(21) > p(31, all italic quote) > image "Linear CX hub" 1920x1080 (renders 640x360.9) > image "Linear CX hub" (linear-app-2) 1920x1080 > hr > h2 > p(35) > p(75) > p(25, italic quote) > p(34) > p(14) > image "Vercel PR tracker" 1920x1080 > hr > h2 > p(55) > p(45, contains link "SnapClip") > p(31, italic quote) > hr > p(48) > p(12, closing line with link "Try Glaze →").
- Counts: 4 H2, 3 hr, 3 italic-quote paragraphs, 3 images, 15 other paragraphs, 0 lists, 0 code.
- Links: "SnapClip" -> https://www.glaze.app/app/snapclip-mLzkmr (internal glaze.app, but opens `_blank`); "Try Glaze →" -> https://glazeapp.com (external domain, glazeapp.com; this is the API/legacy domain, not glaze.app).

### 2.6 Post 2: "Why Glaze when Claude Code and Codex exist?" (`/blog/why-glaze-when-claude-code-and-codex-exist`)
- Date July 17, 2026; author Thomas Paul Mann (`/team/thomas-paul-mann.png` 192x192).
- Hero `og-whyglaze@2x.png` 2400x1260, alt "Glaze, Claude Code, and Codex app icons arranged on a dark background". h1 is 2 lines.
- Page height 2910 (1440) / 3028 (390). Body wrapper 640x1450 at y=737.
- Outline: H2 "The output is an app"; H2 "Creation is only the start"; H2 "A platform for apps". No H3. No hr, no images, no lists, no code.
- Sequence: p(20) p(6) p(31) p(33) > h2 > p(25) p(10) p(46) p(25, link) p(34) > h2 > p(24) p(51, link) p(31, link) p(36) > h2 > p(21) p(24, link). 18 paragraphs total.
- Links: "Raycast" -> https://www.raycast.com/ (external); "Store" -> https://www.glaze.app/store (internal); "collaboration" -> https://www.glaze.app/changelog/0-9-0-0 (internal; **this changelog detail route is not covered by this spec**, see Ambiguities); "use Glaze" -> https://www.glaze.app/ (internal).

### 2.7 Post 3: "Introducing our Affiliate Program" (`/blog/affiliate-program`)
- Date July 15, 2026; author Pedro Duarte (`/team/pedro-duarte.png` 512x512).
- Hero `affiliate-program/blog-cover@2x.png` 2400x1260, alt "Glaze app icon on a dark abstract background".
- Page height 2839 (1440) / 2956 (390). Body wrapper 640x1416.7 at y=700.
- Outline (uses **H3 only**, no H2): H3 "Can anyone join?"; H3 "How does the tracking work?"; H3 "Which affiliate platform are you using?"; H3 "How do I get paid?"; H3 "What counts as a referral?"; H3 "Can I refer myself?"; H3 "Any questions?".
- Sequence: intro p(43) p(8) p(25, with `<strong>` phrase) p(22, link) then 7x [h3 + one p] (p word counts 31, 61, 15 (a second p after the tracking one, with inline code), 18, 39, 25, 17, 18). Inline `code` appears 5 times (3 URL-like tokens in tracking answers, 1 email). No images, no lists, no hr.
- Links: "glz.so/affiliate-program" -> https://go.glz.so/affiliate-program (external, short-link domain); "affiliate terms" -> https://www.glaze.app/affiliate-terms (internal page, not covered); "Dub" -> https://dub.co (external); "X" -> https://x.com/glazeapp (external). Code tokens: `glaze.app?via=yourname`, `glz.so/yourname`, `yourname.com/glaze`, `affiliates@glaze.app` (plain text, not linked).
- The h3 stack gives: p end > 20px gap > h3 (8px padding-top, 23.4 line) > 20px > p.

### 2.8 Post 4: "How we use Glaze at Raycast" (`/blog/how-we-use-glaze-at-raycast`)
- Date July 8, 2026; author Thomas Paul Mann.
- Hero `how-we-use-glaze-at-raycast/blog-cover@2x.png` 3840x2016, alt "Raycast and Glaze app icons on a dark abstract background".
- Page height 7155 (1440) / 6619 (390). Body wrapper 640x5732.8 at y=700.
- Outline: H2 "Why we build our own tools"; H2 "The apps that run Raycast"; H3 "Product and Engineering"; H3 "Support"; H3 "Sales"; H2 "How we operate with these apps". (H3s sit under "The apps that run Raycast".)
- Sequence: p(50) p(20) > h2 > p(37) p(58) p(47) > h2 > p(60) > h3 > p(16) p(50, bold lead-in) > IMG mini-linear > p(81, bold lead-in) > IMG raydb > p(44, bold lead-in) > IMG quality > p(30) > h3 Support > p(52) > IMG extension-review > p(44) > h3 Sales > p(18) > IMG crm > p(95) > h2 > p(8, intro) > **ul with 3 items** (each begins with a bold lead-in phrase) > p(40) (margin-top 28px after list) > p(25, closing, link).
- Images (alt; attrs w x h; natural; rendered 640 wide at 1440 so height): "Mini Linear, our launch tracker" 664x904 attr (natural 1328x1808) renders 640x870.6; "RayDB, our database client" 1356x916 attr (2712x1832) renders 640x433; "Quality, our app health dashboard" 1262x1135 attr (2524x2270) renders 640x575.8; "Our extension review app" 1517x1042 attr (natural file 3034x2084) renders 640x440.2; "Our CRM, built on top of Notion" 1842x1129 attr (natural file 3684x2258) renders 640x393. Each image sits in a `p` > clickable button; image margins 24px; gallery has 5 images.
- Only link: "Glaze is open to everyone" -> https://glaze.app (note: apex domain `glaze.app`, opens `_blank`; internal).
- Counts: 3 H2, 3 H3, 5 images, 1 ul (3 items), 3 bold lead-ins in paragraphs, 0 hr, 0 quotes, 0 code. 390 height drops (6619 vs 7155) because images scale down.

---

## 3. /changelog

### 3.1 Layout
- Section `pt-[140px] xs:pt-40 pb-20 px-4`; same header block as 0.1 (h1 "What's new", p "Discover the latest releases in Glaze"). Different from blog: container `div.mx-auto w-full max-w-content xl:max-w-[1240px]` > `div.flex.flex-col` > `article` per release. Page height 21198 (1440) / 24373 (390). 11 releases rendered (no pagination, no "load more", all in one page, newest first; 11th is 0.7.0.0 plus no more below).
- Article: `grid border-t border-border-separator py-10 first:border-t-0 last:border-b xl:grid-cols-[minmax(0,1fr)_minmax(0,640px)_minmax(0,1fr)] xl:gap-x-16 xl:py-16`. Last article also has a 1px bottom border rgba(255,255,255,.1).
- **<1280px** (390, 768, 1024, 1279 identical): single column, width 640 centered (358 at 390), padding 40px 0, `aside` (version + date) above the entry with `mb-6` (24px). Measured at 768: container x=64 w=640; at 1024: x=192; at 1279: x=320.
- **>=1280px** (1280 and 1440): container max 1240 (x=100 at 1440; x=20 at 1280), grid columns `236px 640px 236px` at 1440 (1fr/640/1fr, gap 64px), padding 64px 0, aside in column 1 right-aligned (`xl:justify-self-end`), body in column 2 at x=400 (1440) / x=320 (1280). Aside `mb-0`.
- **Sticky label (>=1280)**: inner `div` has `xl:sticky xl:top-[116px] xl:justify-end xl:pt-[8px]`. The version+date pill row sticks at top:116px while scrolling through its own entry (aside spans the full entry height, e.g. 623px for entry 1), releasing at the entry end. Verified at scrollY 3500 (top=116 for the in-view entry). Reference screen `blog-changelog-1440-sticky.png`. At <1280 `position:static`.

### 3.2 Entry anatomy (per release)
| Part | Classes | Computed |
|---|---|---|
| Aside row | `flex items-center gap-3 text-sm text-text-tertiary` | Inter 14/20 `#717171`, gap 12px, 30px tall at xl (22px at <xl) |
| Version badge | `inline-flex shrink-0 items-center justify-center rounded-full font-medium bg-white/[0.08] text-text-secondary px-3 py-1 text-sm leading-none` | Inter 14px/14px/500, `#a0a0a0` on rgba(255,255,255,.08), padding 4px 12px, fully round, e.g. "0.14.3.0" = 75.5x22. Text is the raw version (leading `v` stripped), 4-part dotted version |
| Date | `<time datetime="2026-09-24 00:00:00+00">` | format `September 24, 2026` (Intl en, long month); Inter 14/20 `#717171` |
| Title link | `a.group.block.w-fit.max-w-full` -> `/changelog/<version-with-dashes>` (e.g. `/changelog/0-14-3-0`) | internal detail routes (not in scope) |
| Title h2 | `font-display text-balance text-3xl font-medium leading-[1.08] tracking-tight text-text-primary transition-colors group-hover:text-text-secondary` | Display 500 **30px/32.4px, ls -0.75px** (same at 390), `#fff`; hover `#a0a0a0` (verified), 150ms |
| Body | `div.mt-6` (24px) > `.markdown-content` | same prose styles as 2.3; body 640 wide |

Body structure patterns: sub-headings are emoji-prefixed **H2s** (Inter 20/25/500, padding-top 12px; effective gap above the 2nd+ H2 is **28px margin + 12px padding** because they follow a list); each H2 is followed by a `ul` of bullet items where each item starts with a `<strong>` lead-in ending in a colon (e.g. a bold "Label:" then a sentence). Lists use the dash bullets (2.3), items spaced 8px. Some releases start with a full-width hero image (see below), then optional intro paragraphs and feature sections (H2 + paragraphs + image). Standard tail sections, in this order when present: "✨ New", "📦 SDK & Developer Changes", "💎 Improvements", "🐞 Fixes". Empty-heading quirk: in 0.14.3.0 sections have 1 item etc. In 0.14.2.0 the "✨ New" H2 is immediately followed by another H2 (empty section, rendered as-is).

### 3.3 First 11 entries (version, date, title, headings, media)
| Version | Date (ISO) | Title | Section headings (in order) | Block counts / media |
|---|---|---|---|---|
| 0.14.3.0 | September 24, 2026 (2026-09-24) | Bug fixes and improvements | ✨ New; 💎 Improvements; 🐞 Fixes | ul 1/1/3 items; no media; article 751 tall |
| 0.14.2.0 | September 4, 2026 | Fable 5.1 and bug fixes | ✨ New (empty); 💎 Improvements; 🐞 Fixes | ul 2/4 items; no media |
| 0.14.1.0 | August 24, 2026 | Bug fixes & Improvements | ✨ New; 💎 Improvements; 🐞 Fixes | ul 1/1/5; no media |
| 0.14.0.0 | August 19, 2026 | Bring Your Own Agent, Creator Hub and more | 🤖 Bring Your Own Agent; 💻 Your projects, out in the open; 📊 Creator Hub; 💳 Pro is now $10; 👥 Team stores are free during beta; ✨ New; 💎 Improvements; 🐞 Fixes | 3 images, 18 paragraphs, 4 lists (6, 4, 5, 5 items), 3 inline code; article 4005 tall |
| 0.13.0.0 | August 5, 2026 | App Remixing & Native Swift support | ✨ New; 📦 SDK & Developer Changes; 💎 Improvements; 🐞 Fixes | 1 hero image (1200x600), 1 intro p(57), lists 7/4/3/6 |
| 0.12.0.0 | July 29, 2026 | Bug Fixes & Improvements | 💎 Improvements; 🐞 Fixes | 1 hero image; lists 9/7 |
| 0.11.0.0 | July 22, 2026 | Glaze AI: build, publish, and use AI-powered apps | ✨ Glaze AI; 🏆 Glaze Awards; ✨ New; 💎 Improvements; 🐞 Fixes | 1 hero image; 6 paragraphs; lists 3/5/6; inline code 2; link to glaze.app/awards |
| 0.10.0.0 | July 14, 2026 | Invite friends, affiliate program and MCP servers in apps | 🎁 Invite friends, earn rewards; ✨ New; 📦 SDK & Developer Changes; 💎 Improvements; 🐞 Fixes | 1 hero image; 4 paragraphs; lists 2/1/3/2; link "blog" -> /blog/affiliate-program (internal) |
| 0.9.0.0 | July 8, 2026 | App Feedback and Queue Editing | 💬 Send & Receive Feedback; ✏️ Edit & Reorder Queue; 🔬 Inspector in Annotation; ✨ New; 💎 Improvements; 🐞 Fixes | 3 images (hero + 2 inline); 9 paragraphs; 5 lists (3, 4, 4, 5, 10 items) |
| 0.8.0.0 | June 30, 2026 | Bug Fixes and Improvements | 💎 Improvements; 🐞 Fixes | lists 9/4; no media |
| 0.7.0.0 | June 26, 2026 | File Attachments & Team Store Trial | ⚡ Attach anything in chat; 👥 Team Store Trial; ✨ New; 📦 SDK & Developer Changes; 💎 Improvements; 🐞 Fixes | 1 hero image; 3 paragraphs; lists 4/4/3/4 |

Release dates are weekly/biweekly, page contains exactly these 11 (0.7.0.0 is the oldest listed).

### 3.4 Changelog media
- Images are plain `img.my-6 block h-auto w-full rounded-[8px] border border-border-separator` inside a `<p>` (no button, no lightbox), `alt="image"`, hosted **externally** on `misc-assets.raycast.com/glaze-misc-assets/releases/<sha256>.{jpg,png}`. Natural sizes: 2400x1200 (0.14.0.0, 0.12 to 0.9, 0.7) or 1200x600 (0.13.0.0). Rendered 640x321 at 1440 (2:1; a hero image is the first block of an entry).
- No video, no embeds, no code blocks, no tables, no tag/pill other than version badge. No "Latest" badge. No RSS link seen.
- The h2 title is a link to the per-release page `/changelog/<version>`; the body is the full text on the index too (not truncated).

### 3.5 Changelog JSON-LD / behavior
- CollectionPage + ItemList JSON-LD (not visual). No scroll behavior apart from CSS sticky. No IntersectionObserver.

---

## 4. Motion and interaction summary (all measured)
| Item | Trigger | Value |
|---|---|---|
| Card cover opacity | hover on index card link | to .9, `opacity .15s cubic-bezier(.4,0,.2,1)` |
| Card/changelog title color | hover | `#fff` to `#a0a0a0`, `color .15s cubic-bezier(.4,0,.2,1)` |
| Body links, Share, footer links | hover | color to `#a0a0a0`, same 150ms transition |
| Share label | click | "Share" to "Copied" for 1600ms |
| Lightbox | click on post image | backdrop fade `.2s ease-out`; no slide animation on image change; neighbor images dim to .6 |
| CTA icon | hover/active | scale 1.05 / .95, `transform 300ms cubic-bezier(0,0,.2,1)`; click spawns particle burst (CLONE_SPEC M7) |
| Changelog version label | scroll (>=1280) | CSS sticky, top 116px |
| Nav dot | route change | CLONE_SPEC 2.1 |
Nothing animates on load or scroll; no IntersectionObserver; focus ring on image buttons `ring-2 ring-white/40`.

---

## 5. Assets (original URL -> local path under `/Users/riyaghosh/V3/glaze/public/assets/blog/`)

Covers (used on index cards and as post hero):
- https://www.glaze.app/blog/how-teams-use-glaze/blog-cover@2x.png -> `covers/how-teams-use-glaze.png` (3840x2160, PNG, 9.2 MB)
- https://www.glaze.app/og-whyglaze@2x.png -> `covers/why-glaze-when-claude-code-and-codex-exist.png` (2400x1260, 1.9 MB)
- https://www.glaze.app/blog/affiliate-program/blog-cover@2x.png -> `covers/affiliate-program.png` (2400x1260, 374 KB)
- https://www.glaze.app/blog/how-we-use-glaze-at-raycast/blog-cover@2x.png -> `covers/how-we-use-glaze-at-raycast.png` (3840x2016, 3.4 MB)

Avatars (displayed 24x24, round):
- https://www.glaze.app/team/stephanie.png -> `avatars/stephanie.png` (408x408)
- https://www.glaze.app/team/thomas-paul-mann.png -> `avatars/thomas-paul-mann.png` (192x192)
- https://www.glaze.app/team/pedro-duarte.png -> `avatars/pedro-duarte.png` (512x512)

Inline post images:
- https://www.glaze.app/blog/how-teams-use-glaze/linear-app.png -> `how-teams-use-glaze/linear-app.png` (1920x1080)
- https://www.glaze.app/blog/how-teams-use-glaze/linear-app-2.png -> `how-teams-use-glaze/linear-app-2.png` (1920x1080)
- https://www.glaze.app/blog/how-teams-use-glaze/vercel-app.png -> `how-teams-use-glaze/vercel-app.png` (1920x1080)
- https://www.glaze.app/blog/how-we-use-glaze-at-raycast/mini-linear@2x.png -> `how-we-use-glaze-at-raycast/mini-linear@2x.png` (1328x1808)
- https://www.glaze.app/blog/how-we-use-glaze-at-raycast/raydb@2x.png -> `how-we-use-glaze-at-raycast/raydb@2x.png` (2712x1832)
- https://www.glaze.app/blog/how-we-use-glaze-at-raycast/quality@2x.png -> `how-we-use-glaze-at-raycast/quality@2x.png` (2524x2270)
- https://www.glaze.app/blog/how-we-use-glaze-at-raycast/extension-review@2x.png -> `how-we-use-glaze-at-raycast/extension-review@2x.png` (3034x2084)
- https://www.glaze.app/blog/how-we-use-glaze-at-raycast/crm@2x.png -> `how-we-use-glaze-at-raycast/crm@2x.png` (3684x2258)

Changelog images (original host is external `misc-assets.raycast.com`; local copies saved so the clone does not hotlink; filename = `<version-with-dashes>-<n>`):
- .../releases/9668b1f06c59311699c81d92e822a00b0452b6830d1a00ea9b9707ba043ecb3a.jpg -> `changelog/0-14-0-0-1.jpg` (2400x1200)
- .../releases/edc90fed8d327c7e0bf955e975cca4714c9caf0e8645a5afbb2b4725fc67782a.jpg -> `changelog/0-14-0-0-2.jpg` (2400x1200)
- .../releases/0e122d31b88898471c090a1a0cd5a7ce3b2a060320274352fad4ceecb8c05a45.jpg -> `changelog/0-14-0-0-3.jpg` (2400x1200)
- .../releases/02c8c5e9e03fc2bf8195d4c1009dc291b119da56574604a4cecbfbeb5907b51d.jpg -> `changelog/0-13-0-0-1.jpg` (1200x600)
- .../releases/4ac1efc0718588e7e369e8809c8bc8cbd00a6a1ff4ee89a661143f2385ab46ff.png -> `changelog/0-12-0-0-1.png` (2400x1200)
- .../releases/89a6a7d2eabc0879d7a129d1c141b93fa87bbd4c2ae52ac1babe5d7de622ed43.png -> `changelog/0-11-0-0-1.png` (2400x1200, 3.2 MB)
- .../releases/b2fa7443e0fd76467f6392853d519886b763990b8945fd5db55c5d725c60c437.png -> `changelog/0-10-0-0-1.png` (2400x1200)
- .../releases/704f64ab25603e1fad2be70a54654c18391f9617a7544d4e22ed6c70505d4f4c.png -> `changelog/0-9-0-0-1.png` (2400x1200)
- .../releases/58d0c39acea1e4aaeae7ce0c0c33beba071ff694c5d987e47f2e088bf3a9196b.png -> `changelog/0-9-0-0-2.png` (2400x1200)
- .../releases/d78f0a7a3f45a496e465df15404f7f60167782fab2468fce0a72a75b09b7471d.png -> `changelog/0-9-0-0-3.png` (2400x1200)
- .../releases/9a4b62d216d6a9f3de2ed827623c2bcefbd047bd2ddd1fa12de8ea70d72a3f4d.png -> `changelog/0-7-0-0-1.png` (2400x1200)
(prefix of every changelog URL: `https://misc-assets.raycast.com/glaze-misc-assets`. Note: 0.14.0.0 jpgs are ~1.3-1.6 MB each; the page loads them at 640 CSS px wide.)

Shared (already in the clone, not re-downloaded): `logo-full-DAu7MkQ8.svg`, `app-icon-PC60coqE.png`, fonts. On blog and changelog pages the CTA particle images `app-icon1..17` are preloaded as on `/`.

Production fonts loaded: Instrument Sans latin + Inter latin woff2 only.

---

## 6. Link inventory
- Internal (glaze.app): `/blog`, `/blog/<slug>` (4), `/changelog`, `/changelog/<version-dashed>` (detail route, not covered), `/store`, `/app/snapclip-mLzkmr`, `/affiliate-terms`, `/awards`, `/changelog/0-9-0-0`, `/` , `/api/download?cta=waitlist_download`, `/signup`, `/pricing`, `/terms`, `/privacy`, `/aup`, `https://glaze.app` (apex), `https://glaze.app/community`, `https://glaze.app/awards`.
- External (not cloned): `https://www.raycast.com/`, `https://raycast.com`, `https://manual.glaze.app`, `https://go.glz.so/affiliate-program`, `https://dub.co`, `https://x.com/glazeapp`, `https://www.youtube.com/channel/UCZltNInxFzkNzBqg_G4EdXg`, `https://reddit.com/r/glazeapp`, `https://glazeapp.com`.

## 7. Ambiguities / not measurable
- The blog has no reading-time, tags, TOC or categories anywhere (confirmed in DOM and renderer source); the brief's "reading time/tags" do not exist.
- "Internal" body links are absolute `https://www.glaze.app/...` URLs and still open in a new tab (renderer treats every absolute URL as external). In the clone either keep `_blank` for fidelity or make them router links; decision left to Build.
- `/changelog/<version>` detail pages and `/affiliate-terms`, `/app/snapclip-mLzkmr`, `/awards` were not recon'd (out of brief).
- Changelog 0.14.2.0 "✨ New" heading is empty in the original (two H2s back to back).
- Hero natural aspect (3840x2160 for card 1) differs from the attr aspect (3840x2016); display is always the `aspect-[1.9/1]` crop via object-cover, so use 1.9:1 and `object-cover`.
- Computed radius reported for lightbox image is 18px although class is `rounded-xl` (12px); likely a project-defined `--radius-xl`. Use 18px.
- Hover states on mobile and prefers-reduced-motion were not tested.
- Changelog hero images are on an external CDN; the originals are huge (up to 3.2 MB). Local copies are full size; Build may want to downscale.
