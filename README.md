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

## Status codes for unknown paths (static hosting)

The clone is a client-routed SPA. `vite dev`, `vite preview` and a plain static host that rewrites everything to `index.html` answer **200** for any path, including unknown ones; the Not Found page is only drawn by the client. That is a soft 404 and is not fixed by anything in this repo alone, because the status code is decided by the host.

What `npx vite build` adds (plugin `spa-status-files` in `vite.config.js`, output in `dist/`):

- `dist/404.html`: a copy of the SPA shell.
- `dist/<route>/index.html`: the same shell for every route the router knows (static pages, `/store/<category>`, blog posts, persona pages, and `/app/<slug>` for every slug in the snapshot). Known routes therefore resolve to a real file and answer 200.

For a real 404 status the host must:

1. Serve `404.html` with status 404 for any path that has no matching file (Netlify, GitHub Pages and Cloudflare Pages do this by default; for nginx use `try_files $uri $uri/index.html =404; error_page 404 /404.html;`; for S3/CloudFront map the 403/404 error document to `/404.html` and keep the 404 status).
2. NOT define a catch-all rewrite such as `/* /index.html 200` or `try_files ... /index.html`, which overrides the 404.

Limits: query strings are ignored by the host (`/store/design?page=2` is the `/store/design` file, which is correct). An unknown `/app/<slug>` returns 404 on such a host and still renders the "App not found" template from the client. Hosts that cannot do the above (and the dev server) keep the 200 soft 404.
