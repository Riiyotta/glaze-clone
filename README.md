# Glaze clone: information architecture

`ia.json` is the only file to hand-edit. `IA.md` and `matrix.csv` are generated from it and get overwritten.

```bash
node validate.mjs && node build.mjs
```

## What the data shows

- **Route count is dominated by one template.** 1,924 of 1,953 routes (98.5%) are `/app/{slug}` app pages from a single template. The other 12 templates cover 29 routes, so the build effort is in those 12 plus one good app-detail page.
- **Only the landing family is built.** The landing page, the 5 persona routes and the 404 (7 routes) are implemented. The persona routes reuse the landing page's sections and change only the headline, subtext and starting tab, so they add no new components.
- **Sharing.** 10 sections are shared across templates and 9 are single-use. The navbar and footer appear on all 13 templates. The six landing sections are shared by the landing and persona templates, and the two store sections by the store index and categories. The 9 single-use sections (404 block, pricing, download page, awards, legal, blog list, article, changelog, app detail) should stay page-local until a second caller appears.
- **Planned vs built.** `implementedBy` is set only on sections that exist in `src/`. The sections without it are planned from the sitemap and still being specced.

## Notes on validator output

The scope-prose notes are informational. Several scopes say "the 5 persona routes, 6 routes in total", so the validator sees 5 beside the correct total of 6. The 404 block's scope mentions `/m` and 6 slugs, but the template counts as 1 route because it is a catch-all. Neither number is wrong.

`/awards` and `/awards/terms` share one provisional template until they are specced. `/*` stands for the catch-all 404 and is counted as a single route.
