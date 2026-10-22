# Glaze design-repo

An AI-ready, machine-validated design system extracted from a clone of the Glaze landing page. An agent composes new pages from it by choosing a template, filling section props, and passing a validator. It never invents colours, sizes, timings, copy budgets or assets.

Status: `design-review-pending`, not production approved (`registry.manifest.json`).

<!-- counts: {"primitives": 10, "components": 11, "sections": 9, "templates": 3, "tokens": 311, "typographyRoles": 20, "motionRecipes": 21, "assetRoles": 10, "graphRules": 13, "examplePageSpecs": 3, "routeEntries": 7, "citations": 195} -->
Counts (recomputed and enforced by `extraction/verify_all.py`): 10 primitives, 11 components, 9 sections, 3 templates, 311 leaf tokens, 20 type roles, 21 motion recipes, 10 asset roles, 13 graph rules, 3 example PageSpecs, 7 route entries, 195 evidence citations.

## Scope (read this first)

Modelled: the landing page `/`, the five persona routes (`/designers`, `/product-managers`, `/engineers`, `/creators`, `/teams`, same sections, different hero copy and starting tab), and the 404 (catch-all, includes `/m` and the six showcase tab ids that are not real routes).

Deliberately NOT modelled: pricing, download, awards, legal, blog, changelog, store and app-detail. They appear in the repo-level `ia.json` and were still being specced and built when this repo was written. Do not guess their structure from this repo; add a template when their specs settle.

Links: nav and footer links in the source point at absolute `https://www.glaze.app/...` URLs today and are expected to become local routes. External domains (YouTube, Raycast, x.com, reddit, slack) are intentionally not cloned; examples use `example.com`.

## Licensing and AI generation

The source is a real, live commercial product (Glaze by Raycast). `assets/asset-roles.json` is a closed vocabulary of 10 roles. AI generation must never reproduce Glaze or Raycast logos or app icons, real users' avatars or names, real apps' icons or screenshots, or the site's proprietary copy. Example PageSpecs are placeholder text. Roles are pinned to policies (`must-reuse-exact`, `may-generate-new`, `must-not-fabricate`, `must-not-reuse-live-endpoint`) and `verify_all.py` fails if one is changed to a different valid policy. Asset files and fonts are not shipped here. Do not publish this repo or its zip publicly.

## Layer model

```
tokens/00-foundation   raw measured values (colour, type, space, radius, elevation, breakpoint, motion, icon size)
tokens/10-semantic     roles that only reference foundation (text.primary, surface.well, typography roles, motion recipes)
tokens/20-component    component sizing, references only
tokens/30-layout       container widths, z-index scale, section paddings
tokens/themes          dark.json (the only theme; the site is dark-only)
tokens/llm             allowlist, generated token catalog, token policy
primitives/   10       Button, Link, Text, Badge, Image, Icon, Divider, GlassSurface, AppIcon, Container
components/   11       NavPill, MobileMenuPanel, PersonaTabs, PersonaDropdown, AppCard, FeatureCard, FAQItem,
                       YouTubeOverlay, GlazeIconBurst, Pillar, TeamLogoGrid
sections/      9       one contract per section type: content model with maxWords, motion, responsive, constraints
templates/             template.landing, template.persona, template.not-found: ordered nodes + container rules
compatibility/         graph.json: adjacency and rhythm rules with severity
schema/                pagespec.schema.json (generated, draft-07), semantic_validate.py, examples, tests
extraction/            measured-values.json (evidence ledger), verify_all.py, prove_drift.py
assets/                asset-roles.json
```

Each layer may only use the layer below it. A primitive references tokens. A component composes primitives. A section composes components and primitives and adds the content contract. A template orders sections. Contracts are JSON, not React: the host app renders them (the source implementation is in the clone's `src/components`).

## How an agent composes a page

1. Pick a template from `templates/templates.json`. Its `nodes` are the only sections allowed, in that order. `required` and `repeatable` are enforced. Each template lists `routes` and `constraints` (for example `routeInitialTab` per persona route, and `navActiveLinkHref`).
2. For each node, read `sections/<type>.json`. `contentModel` is the exact field list with `maxWords` per text field. Extra fields are rejected. Use only `motion.allowedPatterns`, and always set `reducedMotionFallback`.
3. Fill props with short, original copy. Every media field names an `assetRole` and a host-resolved `assetRef`; read the role's `guidance` first.
4. Write a PageSpec (see `schema/example.pagespec.json`, and `schema/examples/` for persona and 404). Required keys: `id`, `route`, `template`, `theme`, `nodes`.
5. Validate: `python3 schema/semantic_validate.py my-page.json`. Fix every error; warnings are advisory.

Persona routes: change only `headline`, `subheadline` and `initialTab` (must match the route, see the template constraints). A subheadline without a newline renders as one line.

## Rules

- Tokens only. No raw hex, rgba, px, ms or cubic-bezier in primitives, components, sections or templates. Use `{path.to.token}`. `verify_all.py` lints for this and resolves every reference.
- No values from outside the repo. A new colour, size or timing means adding a measured token with a citation first.
- PageSpecs have no style or token-override field. Styling belongs to contracts, never to an instance.
- Only listed templates, sections, props, patterns and asset roles (`tokens/llm/component-allowlist.json`).
- Never fabricate brand marks, avatars, app icons, screenshots or copy of the source.

## Motion rules

Motion comes from `tokens/10-semantic/motion.json` recipes, which compose foundation durations, easings and delays. All values were measured or ported from the source bundle (CLONE_SPEC M1 to M9).

- Entrance: only the hero rise (600ms, delays 0/100/200/300/400ms), one below-the-fold fade (600ms, 500ms delay) and the persona panel fade. Nothing is scroll-reveal. The 404 has no entrance animation.
- Hover and colour changes use the one 150ms standard-easing transition. Hover is wrapped in `@media (hover: hover)`.
- Two different `ease-out` curves exist: the CSS keyword (keyframes, nav dot) and Tailwind's utility (press, panel content, burger). They are separate tokens. Do not substitute one for the other.
- Every node carries `motion.pattern` from its section's allowed list and a `reducedMotionFallback` (`none`, `opacity-only` or `static`). The motion object is closed: only `pattern`, `delayMs`, `reducedMotionFallback`.
- Hard limits: at most one icon burst per page (4 particles per click, 40 live), one open FAQ item at a time, FAQ dims to 0.15 opacity once scrolled past.

## Verify

Requires Python 3.9+ and `python3 -m pip install jsonschema`. No node tooling.

```
python3 extraction/verify_all.py            # 12 checks, exit 0 on pass
python3 schema/tests/adversarial_test.py    # mutations must be rejected, controls must pass
python3 extraction/prove_drift.py           # proves the parity, citation, count and pinned-role checks catch injected drift
python3 schema/build_schema.py              # regenerate the schema after editing sections/
python3 tokens/build_catalog.py             # regenerate the token catalog after editing tokens/
```

Checks that rely on the source project (citation range and content, comparison with `ia.json`) run when `design-repo/` sits next to the clone and emit warnings, not failures, when used standalone.

## Adding a template

1. Add section contracts under `sections/` for any new section type (file name is the type id with `-`), and primitives or components if needed. Use tokens only.
2. Append the template to `templates/templates.json` with `nodes`, `routes`, `containers`, `constraints`.
3. Add the ids to `tokens/llm/component-allowlist.json`, graph rules to `compatibility/graph.json` and a matching branch in `schema/semantic_validate.py` (`IMPLEMENTED_RULES` must equal the graph's rule ids).
4. Run `schema/build_schema.py`, `tokens/build_catalog.py`, add an example under `schema/examples/`, update `registry.manifest.json` counts and the counts marker above, add citations.
5. Run the three scripts above.

## Delivery

`design-repo.zip` (a sibling of this folder) is built with the CLI `zip` tool, last, after verification, and is never committed. Do not ship `__pycache__`.
