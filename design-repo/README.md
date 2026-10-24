# Glaze design-repo

Version 2.0.0 (see CHANGELOG.md). PageSpec contract 2.0.0.

An AI-ready, machine-validated design system extracted from a clone of the Glaze site (landing, persona, pricing, download, awards, legal, blog, changelog, store, app detail and 404). An agent composes new pages from it by choosing a template, filling section props, and passing a validator. It never invents colours, sizes, timings, copy budgets or assets, and a PageSpec says whether it is a page FOR the source brand (`mode: reference`) or a new page for ANY OTHER brand (`mode: generated`).

Status: `design-review-pending`, not production approved (`registry.manifest.json`).

<!-- counts: {"primitives": 10, "components": 27, "sections": 40, "templates": 13, "tokens": 400, "typographyRoles": 69, "motionRecipes": 30, "assetRoles": 30, "graphRules": 31, "examplePageSpecs": 27, "routeEntries": 27, "citations": 435, "measuredSectionHeights": 77, "routesCovered": 294, "generatedExamplePageSpecs": 13, "typographyProbes": 74, "layoutProbes": 62, "specCrossChecks": 32, "contentBudgets": 52, "protectedHosts": 66, "protectedPhrases": 680, "protectedAssetFiles": 464} -->
Counts (recomputed and enforced by `extraction/verify_all.py`): 10 primitives, 27 components, 40 sections, 13 templates, 400 leaf tokens, 69 type roles, 30 motion recipes, 30 asset roles, 31 graph rules, 27 example PageSpecs (13 in generated mode), 27 route entries covering 294 routes, 435 evidence citations, 77 measured section heights, 74 typography probes, 62 layout and motion probes, 32 live-site document heights cross-checked, 52 real-copy budget checks, 66 protected hosts, 680 protected phrases, 464 protected asset files.

## Scope (read this first)

Every route of the clone's real route table is modelled. The table is enumerated from the clone's own route modules (`src/route-modules/*.js`, auto-discovered by `src/routes.jsx`) by `extraction/enumerate_routes.mjs` and recorded in `extraction/measured-values.json` `routeTable`: 19 declarations plus the catch-all, expanding to 294 routes. `extraction/verify_all.py` check 16 fails when a route is mapped to no template, to two templates, or when a template names a route the table does not have.

| Template | Routes | Sections between navbar and footer |
|---|---|---|
| `template.landing` | `/` | hero.landing-hero, showcase.persona-tabs, features.feature-grid, support.faq, cta.download-icon (+ youtube-overlay, app-dialog) |
| `template.persona` | `/designers`, `/product-managers`, `/engineers`, `/creators`, `/teams` | same as landing; only hero copy and initial tab change |
| `template.not-found` | catch-all `/*` (also `/m` and the showcase tab ids) | content.not-found-block |
| `template.pricing` | `/pricing` | hero.page-title, commerce.pricing-plans, support.faq, cta.download-icon |
| `template.download` | `/download` | cta.download-page (no footer) |
| `template.awards` | `/awards` | hero.awards-hero, showcase.award-winners, showcase.award-entries, content.award-prizes, content.award-jury, content.award-criteria, cta.download-icon (+ app-dialog) |
| `template.legal` | `/terms`, `/privacy`, `/aup`, `/awards/terms` | content.legal-header, content.legal-body (typography `policy` or `terms` by route) |
| `template.blog-index` | `/blog` | hero.page-header, content.post-card (repeatable, at most 20) |
| `template.blog-post` | `/blog/:slug` (pattern, 4 posts in the clone) | content.article-cover, content.article-header, content.article-body, content.article-footer, cta.download-compact (+ image-lightbox) |
| `template.changelog` | `/changelog` | hero.page-header, content.release-entry (repeatable, at most 60) |
| `template.store-index` | `/store` | store.featured-carousel, store.category-nav, store.app-shelves |
| `template.store-category` | `/store/<8 categories>` | store.featured-carousel, store.category-nav, store.app-grid |
| `template.app-detail` | `/app/:slug` (pattern, 265 apps in the clone) | store.app-header, store.remix-lineage, store.app-stats, store.screenshot-strip, store.app-about, store.app-list (repeatable, at most 2) |

Deliberately not templates: the in-page "App not found" state of `/app/<unknown slug>` (centred block, no footer; the router matches `/app/:slug` for any slug) and the search / pagination states of `/store`, `/store/:category` and `/awards` (`?q=`, `?page=`, `?entriesQuery=`, `?entriesPage=`), which render on modelled routes.

Long-form pages are decomposed, never one whole-page section: legal (header + body), blog post (cover, header, body, footer, CTA), blog index and changelog (page header + one node per post card or release), awards (hero, winners, entries, prizes, jury, criteria, CTA), app detail (header, lineage, stats, screenshots, about, lists). The long text body of a legal page or an article legitimately is most of its page: that is recorded as a reviewed `majorityAccepted` entry in `sectionHeights`, not hidden.

Links: internal nav, footer, blog, store and legal links in the clone are local routes (the router `Link`). Sign-in, download, the manual, Raycast, the sponsor, jurors' sites and the social profiles are absolute external URLs. Reference examples use `example.com`; generated examples use reserved `.example` hosts.

## PageSpec modes: reference and generated

`mode` is a required, closed enum on every PageSpec (`schema/pagespec.schema.json`, `registry.manifest.json` `pageSpecVersion` 2.0.0).

- `reference`: a clone or fidelity-validation page for the SOURCE brand. Each field accepts only its `referenceRoles` (the roles observed on the source). Generation-safe-only roles are rejected (`REFERENCE_MODE_ROLE`).
- `generated`: a new page for any OTHER brand. Only generation-safe roles (placeholder, generated, user-supplied), only each field's `generatedRoles`, and nothing from the source: `schema/semantic_validate.py` `check_mode()` rejects the source brand (`assets/asset-roles.json` `sourceBrand`), verbatim source copy of 3 or more words, real people and companies, source hosts, any absolute URL that is not on a reserved domain, references to files of the source's `public/` tree, `assetRef` values that are not `placeholder:` / `user:` / `generated:` refs, and enum values the contract marks `blockedInGeneratedMode` (the third-party mark in a plan row).

Every asset role has `availability` in `assets/asset-roles.json`:

| availability | roles | meaning |
|---|---|---|
| `reference-only` (12) | brand.wordmark, brand.app-icon, particle.app-icon, app.icon, avatar.person, badge.award, screenshot.feature, video.hero-loop, cover.image, article.image, screenshot.app, video.awards-hero | the source's own marks, artwork, video and the third-party app icons and screenshots it shows: reference mode only; each names generation-safe substitutes |
| `blocked-for-generation` (5) | logo.partner, embed.video, person.photo, logo.sponsor, mark.third-party | real trademarks, real people and live endpoints: never in a generated page |
| `generation-safe` (13) | brand.wordmark-placeholder / -user-supplied, brand.app-icon-placeholder / -user-supplied, particle.placeholder, app.icon-generated, avatar.placeholder, badge.award-generated, media.generated, media.user-supplied, video.user-supplied, logo.placeholder, logo.user-supplied | available in both modes |

Policy AND availability of every role are pinned in `extraction/verify_all.py` (`PINNED`, `PINNED_AVAILABILITY`), independent of the registry. The protection lists are derived from the real source by `extraction/derive_source_protected.mjs` (`assets/source-protected.json`: 66 hosts, 680 phrases, people and companies; `assets/protected-assets.json`: 464 files) and traced back to the source by check 15. `assets/asset-roles.json` `observedAssets` maps each of those files to exactly one role (check 7c).

What the mode layer does NOT do: a PageSpec carries roles and refs, not files, so a renderer is still responsible for what it draws for a role; the English word "glaze" is blocked in generated copy together with the brand; companies whose names are ordinary words (Linear, Cursor, Resend) are protected only inside the longer phrases, not as bare words.

## Licensing and AI generation

The source is a real, live commercial product (Glaze by Raycast). `assets/asset-roles.json` is a closed vocabulary of 30 roles. AI generation must never reproduce Glaze or Raycast logos or app icons, real users' avatars or names, real apps' icons or screenshots, real jurors' or authors' portraits, a sponsor's mark, or the site's proprietary copy. Roles are pinned to policies (`must-reuse-exact`, `may-generate-new`, `must-not-fabricate`, `must-not-reuse-live-endpoint`). Asset files and fonts are not shipped here. Do not publish this repo or its zip publicly.

## Layer model

```
tokens/00-foundation   raw measured values (colour, type, space, radius, elevation, breakpoint, motion, icon size); pages.json holds the values added for the page families beyond landing
tokens/10-semantic     roles that only reference foundation (text.primary, surface.well, typography roles, motion recipes)
tokens/20-component    component sizing, references only
tokens/30-layout       container widths, z-index scale, section paddings
tokens/themes          dark.json (the only theme; the site is dark-only)
tokens/llm             allowlist, generated token catalog, token policy
primitives/   10       Button, Link, Text, Badge, Image, Icon, Divider, GlassSurface, AppIcon, Container
components/   27       landing: NavPill, MobileMenuPanel, PersonaTabs, PersonaDropdown, AppCard, FeatureCard, FAQItem, YouTubeOverlay, GlazeIconBurst, Pillar, TeamLogoGrid;
                       pages: PlanCard, InfoTooltip, AuthorRow, ProseBlocks, LegalBlocks, ReleaseAside, AppRow, SearchField, CategoryChip, Pagination, Shelf, StatCell, WinnerCard, PrizeCard, JuryCard, CriteriaItem
sections/     40       one contract per section type: content model with maxWords, motion, responsive, constraints
templates/             13 templates: ordered nodes + container rules + per-route constraints
compatibility/         graph.json: adjacency and rhythm rules with severity
assets/                asset-roles.json, source-protected.json, protected-assets.json
schema/                pagespec.schema.json (generated, draft-07), section-contract.schema.json (hand-written), semantic_validate.py, examples (27), tests
extraction/            measured-values.json (evidence ledger), verify_all.py, prove_drift.py, wrapper_gate.py, probes and the optional node evidence tools
```

Each layer may only use the layer below it. A primitive references tokens. A component composes primitives. A section composes components and primitives and adds the content contract. A template orders sections. Contracts are JSON, not React: the host app renders them (the source implementation is in the clone's `src/components` and `src/pages`).

## How an agent composes a page

1. Decide the `mode`. Pick a template from `templates/templates.json`. Its `nodes` are the only sections allowed, in that order. `required`, `repeatable` and `maxCount` are enforced. Each template lists `routes` and `constraints` (for example `routeInitialTab`, `routeTypography`, `routeCategory`, `navActiveLinkHref`).
2. For each node, read `sections/<type>.json`. `contentModel` is the exact field list with `maxWords` per text field. Extra fields are rejected. Use only `motion.allowedPatterns`, and always set `reducedMotionFallback`.
3. Fill props with short, original copy. Every media field names an `assetRole` and a host-resolved `assetRef`; read the role's `guidance` and, in generated mode, its `generatedModeGuidance`. The field's `generatedRoles` are the only roles a generated page may use there.
4. Write a PageSpec (see `schema/example.pagespec.json` and `schema/examples/`: one reference example per template, and `generated.*` examples with a fictional brand, original copy and reserved `.example` URLs). Required keys: `id`, `mode`, `route`, `template`, `theme`, `nodes`.
5. Validate: `python3 schema/semantic_validate.py my-page.json`. Fix every error; warnings are advisory.

Persona routes: change only `headline`, `subheadline` and `initialTab` (must match the route, see the template constraints). A subheadline without a newline renders as one line.

## Section contract identity: provenance, taxonomy, retrieval

Every `sections/*.json` carries three separate, closed groups (`schema/section-contract.schema.json`):

- `source` is PROVENANCE: `{id, file, tag, domSelector, citation}`. `id` is `src.<component file>.<dom tag>` with an ordinal suffix (`.N`, the N-th `<tag` opening in that file up to the cited line) where one file holds several sections with the same tag; `citation` is a measured-values id whose file must equal `file` and whose cited lines must contain `<tag`; `domSelector` is what the height measurement uses (a comma makes it a union: the section is the bounding box of all matches, for example a page title and the line under it). It says where in the source project the section comes from and nothing about what it means.
- `semantic` is TAXONOMY: `{id, category}`. `id` equals `registryId`, `category` equals the contract `category` and the typeId prefix (closed enum: shell, hero, showcase, features, support, cta, content, commerce, store). The two groups are never inferred from each other.
- `retrievalEligible` (boolean, default true) says whether the section may be returned as a standalone retrieval chunk. The utility overlays `shell.youtube-overlay`, `shell.app-dialog` and `shell.image-lightbox` are `false` with a required `retrievalIneligibleReason`. Any cookie, consent, dialog, modal, popup or lightbox-type section must also be `false`. The pin is hard-coded in `schema/semantic_validate.py` (`UTILITY_SECTIONS`, `UTILITY_KEYWORDS`) independently of the registry, mirrored in the allowlist (`retrievalIneligibleSections`), the generated PageSpec schema (a node may omit `retrievalEligible` but may never contradict its contract) and the graph rule `UTILITY_NOT_RETRIEVABLE`.

Conversion blocks are `cta.*` sections that directly precede the footer (`CTA_BEFORE_FOOTER`): `cta.download-icon` (landing, persona, pricing, awards), `cta.download-compact` (blog post), `cta.download-page` (the footer-less download screen).

## Whole-page-wrapper gate

`extraction/measured-values.json` `sectionHeights` records each section's rendered height at 1440px for all 13 templates (Playwright, `extraction/measure_section_heights.mjs`, selectors from `source.domSelector`; utility overlays are opened first, optional sections come from a second representative route). `extraction/wrapper_gate.py`, run by `verify_all.py` check 10b: a hero-category section taller than 1800px is a warning; taller than 3000px is an error unless `sectionHeights.wrapperWhitelist` has an entry for it with `reviewedBy`, a justification of at least 30 characters and a `maxHeightPx` that covers it (an accepted hit still warns); one section holding more than 50% of a page's in-flow height warns (pages with at least 3 in-flow sections), and `majorityAccepted` marks a reviewed long-form body (content/store sections only; still a warning); a missing measurement is an error. Current state: the landing hero is 1211px; whitelist empty; 3 majority warnings, all reviewed and accepted (legal body 99%, article body 79%, category grid 53%). Not covered: visual parity with the live site (there is no live-site capture pipeline here, so no parity number is claimed).

## Recheck against the clone (checks 13, 14, 17)

Three offline checks compare the contracts with what the clone renders, using numbers recorded by the node evidence tools:

- Check 13, typography: every typography role (with its responsive overrides) against the computed family, size, line height, weight and letter spacing of one probe element per role at 1440, 768 and 390px (`extraction/type_probes.json`, `measure_type_probes.mjs`). A known clone defect is pinned as a `cloneDeviation` so it cannot go stale silently.
- Check 14, copy budgets: the longest real source string (or array) behind each section field against the contract's `maxWords` / `maxItems` (`measure_content_budgets.mjs`). Copy authored by third-party store publishers must be covered at its 95th percentile.
- Check 17, layout and motion: spacing, sizes, radii, animation and transition durations of 62 probes, as token expressions over the viewport (`extraction/layout_probes.json`, `measure_layout_probes.mjs`; tolerance 0.51px).

## Rules

- Tokens only. No raw hex, rgba, px, ms or cubic-bezier in primitives, components, sections or templates. Use `{path.to.token}`. `verify_all.py` lints for this and resolves every reference.
- No values from outside the repo. A new colour, size or timing means adding a measured token with a citation first.
- PageSpecs have no style or token-override field. Styling belongs to contracts, never to an instance.
- Only listed templates, sections, props, patterns and asset roles (`tokens/llm/component-allowlist.json`).
- Never fabricate brand marks, avatars, app icons, screenshots or copy of the source. In generated mode the validator enforces it.

## Motion rules

Motion comes from `tokens/10-semantic/motion.json` and `pages-motion.json` recipes, which compose foundation durations, easings and delays. Values were measured or ported from the source bundle (CLONE_SPEC M1 to M9) and re-measured on the new routes.

- Entrance: the landing hero rise (600ms, delays 0/100/200/300/400ms), one below-fold fade (600ms, 500ms delay), the persona panel fade, and on `/awards` the video fade (800ms) with sponsor, title and subtitle rise at 100/200/300ms. Nothing else is scroll-reveal; pricing, legal, blog, changelog, store, app detail, download and 404 have no entrance animation.
- Hover and colour changes use the one 150ms standard-easing transition, wrapped in `@media (hover: hover)`. Store carousel: 260ms slide, 4000ms autoplay; store shelves: 500ms slide; dialogs and the lightbox: 200ms fade.
- Two different `ease-out` curves exist: the CSS keyword (keyframes, nav dot) and Tailwind's utility (press, panel content, burger). They are separate tokens. Do not substitute one for the other.
- Every node carries `motion.pattern` from its section's allowed list and a `reducedMotionFallback` (`none`, `opacity-only` or `static`). The motion object is closed: only `pattern`, `delayMs`, `reducedMotionFallback`.
- Hard limits: at most one icon burst per page (4 particles per click, 40 live), one open FAQ item at a time, FAQ dims to 0.15 opacity once scrolled past.

## Verify

Requires Python 3.9+ and `python3 -m pip install jsonschema`. No node tooling for verification.

```
python3 extraction/verify_all.py            # numbered checks 0-17 incl. 7c, 9a, 10a, 10b; exit 0 on pass
python3 schema/tests/adversarial_test.py    # mutations must be rejected, controls must pass
python3 extraction/prove_drift.py           # proves each check catches injected drift (scratch copies; the live repo is never touched)
python3 schema/build_schema.py              # regenerate the schema after editing sections/
python3 tokens/build_catalog.py             # regenerate the token catalog after editing tokens/
```

Checks that rely on the source project (citation range and content, comparison with `ia.json`, protection-list tracing, route declarations) run when `design-repo/` sits next to the clone and emit warnings, not failures, when used standalone.

Evidence tools (optional; they re-record numbers from a running build of the source project and write into `extraction/measured-values.json` or `assets/` with `--write`): `enumerate_routes.mjs`, `measure_section_heights.mjs`, `measure_type_probes.mjs`, `measure_layout_probes.mjs` (Playwright, `PLAYWRIGHT_MODULE=<path to playwright>`, `--base <preview url>`), `measure_content_budgets.mjs`, `derive_source_protected.mjs` (node and the clone's esbuild).

## Adding a template

1. Add section contracts under `sections/` for any new section type (file name is the type id with `-`), and primitives or components if needed. Use tokens only. Every media field uses `ROLE`-style enums with `referenceRoles` and `generatedRoles`.
2. Append the template to `templates/templates.json` with `nodes`, `routes`, `containers`, `constraints`, and the same template to the repo-level `ia.json` (then `node build.mjs` and `node validate.mjs`).
3. Add the ids to `tokens/llm/component-allowlist.json`, graph rules to `compatibility/graph.json` and a matching branch in `schema/semantic_validate.py` (`IMPLEMENTED_RULES` must equal the graph's rule ids).
4. Run `schema/build_schema.py`, `tokens/build_catalog.py`, add a reference and a generated example under `schema/examples/`, add probes to `extraction/type_probes.json` and `layout_probes.json`, re-record with the evidence tools, update `registry.manifest.json` counts and the counts marker above, add citations.
5. Run the three scripts above.

## Delivery

`design-repo.zip` (a sibling of this folder) is built with the CLI `zip` tool, last, after verification, and is never committed (`.gitignore`). Do not ship `__pycache__`.
