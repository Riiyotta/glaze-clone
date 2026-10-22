# Changelog

## 1.1.0

- Citations: 17 in-range-but-wrong citations repointed at the real current lines (`ia.template.*` x3 in `ia.json`; `jsx.nav.*`, `jsx.navpill.*`, `jsx.mobilemenu.*` x14 in `Navbar.jsx`, each shifted by one line); source snapshot hashes refreshed. 4 new citations (`jsx.faq.wrapper`, `jsx.feature.wrapper`, `jsx.persona.section`, `jsx.overlay.dialog`): 199 total.
- Retrieval: `retrievalEligible` (closed boolean) on every section contract; `shell.youtube-overlay` is `false` with a reason. Wired through `schema/section-contract.schema.json`, the generated PageSpec schema, the allowlist (`retrievalIneligibleSections`, `retrievalEligible` node property), new graph rule `UTILITY_NOT_RETRIEVABLE` (14 rules) and `semantic_validate.check_contracts`, pinned independently of the registry.
- Provenance vs taxonomy: every section contract has `source` (`id`, `file`, `tag`, `domSelector`, `citation`) and `semantic` (`id`, `category`) as separate closed objects; `verify_all.py` traces each source to the cited element (checks 9a, 10a).
- Whole-page-wrapper gate (check 10b, `extraction/wrapper_gate.py`) with 19 recorded section heights at 1440px (`sectionHeights`, `extraction/measure_section_heights.mjs`).
- Adversarial suite: 74 mutations plus contract and gate cases. `prove_drift.py`: 18 new drift cases (35 total) including 3 warning-expected ones.
- Manifest: `measuredSectionHeights` added to counts; versions bumped to 1.1.0 (allowlist is machine-checked).

## 1.0.0

First build. Scope: landing `/`, five persona routes, 404.

- Tokens: foundation (colour, typography, spacing, radius, elevation, breakpoint, motion, icon size), semantic (colour, typography roles, motion recipes, shape), component, layout, dark theme, LLM allowlist, generated catalog, policy.
- 10 primitives, 11 components, 9 sections, 3 templates, compatibility graph with 13 rules.
- Generated draft-07 PageSpec schema, semantic validator, 3 example PageSpecs, adversarial suite.
- Evidence ledger with 195 citations checked for range and content against the source.
- Asset roles pinned to policies; licensing guidance for a real commercial site.
- Persona routes added to scope after the first draft (same sections as the landing page, hero copy and starting tab differ).
- Decisions recorded: pricing, download, awards, legal, blog, changelog, store and app-detail are not modelled; `GlazeIcon compact` (used outside scope) is not modelled.
