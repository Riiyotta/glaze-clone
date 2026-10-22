Source: https://www.glaze.app/m (404 page) and https://www.glaze.app/ (landing page)

# Asset manifest

Every asset loaded by the live `/` and `/m` pages, with original URL, local path, format, dimensions and bytes. Local paths are relative to `/Users/riyaghosh/V3/glaze/` and served by Vite at `/assets/...`. Status: **existing** = already present before this run (contents verified byte-identical to live where checked); **downloaded** = fetched in this run.

## Fonts (`public/assets/fonts/`)

| Original URL | Local path | Format | Bytes | Used | Status |
|---|---|---|---|---|---|
| https://www.glaze.app/assets/inter-latin-8kRkwJBP.woff2 | public/assets/fonts/inter-latin-8kRkwJBP.woff2 | woff2 | 48,432 | Inter 100-900 latin (loaded, preloaded) | downloaded |
| https://www.glaze.app/assets/inter-latin-ext-B_-bZUTo.woff2 | public/assets/fonts/inter-latin-ext-B_-bZUTo.woff2 | woff2 | 85,272 | Inter latin-ext (declared, not loaded on these pages) | downloaded |
| https://www.glaze.app/assets/instrument-sans-latin-CclBWeUS.woff2 | public/assets/fonts/instrument-sans-latin-CclBWeUS.woff2 | woff2 | 29,904 | Instrument Sans 400-700 latin (loaded, preloaded) | downloaded |
| https://www.glaze.app/assets/instrument-sans-latin-ext-oUstOPQL.woff2 | public/assets/fonts/instrument-sans-latin-ext-oUstOPQL.woff2 | woff2 | 11,092 | Instrument Sans latin-ext (declared, not loaded) | downloaded |

## Brand / chrome

| Original URL | Local path | Format | Dimensions | Bytes | Used where | Status |
|---|---|---|---|---|---|---|
| https://www.glaze.app/assets/logo-full-DAu7MkQ8.svg | public/assets/logo-full-DAu7MkQ8.svg | svg | 2233x700 | 43,046 | nav logo (h 20px desktop / 24px mobile) | existing (verified identical) |
| https://www.glaze.app/assets/app-icon-PC60coqE.png | public/assets/app-icon-PC60coqE.png | png | 512x512 | 322,901 | Download CTA + 404 icon (112px / 80px) | existing (verified identical) |
| https://www.glaze.app/favicon.ico | public/assets/favicon.ico | ico | 32x32 | 8,254 | `<link rel=icon sizes=any>` | downloaded |
| https://www.glaze.app/favicon.svg | public/assets/favicon.svg | svg | 32x32 | 41,534 | `<link rel=icon type=image/svg+xml>` | downloaded |
| https://www.glaze.app/apple-touch-icon.png | public/assets/apple-touch-icon.png | png | 180x180 | 53,214 | `<link rel=apple-touch-icon>` | downloaded |
| https://www.glaze.app/og-glaze@2x.jpg | public/assets/og-glaze@2x.jpg | jpg | 2400x1260 | 590,090 | og:image (2400x1260) | downloaded |

Note: the live site serves favicons, apple-touch-icon and the OG image from the site root (`/favicon.ico` etc.). They were saved into `public/assets/` as instructed. Reference them as `/assets/favicon.ico` etc., or copy them to `public/` root if root URLs are wanted.

## Hero video

| Original URL | Local path | Format | Dimensions | Bytes | Used | Status |
|---|---|---|---|---|---|---|
| https://www.glaze.app/assets/intro-loop-0kts42Ml.mp4 | public/assets/intro-loop-0kts42Ml.mp4 | mp4 (H.264, 29.97fps, 28.73s, no poster) | 1600x900 | 3,540,300 | hero autoplay loop | downloaded |

## Feature card images (`<picture>`: desktop source at min-width 800px, mobile `-m@2x` img fallback)

| Original URL | Local path | Format | Dimensions | Bytes | Card | Status |
|---|---|---|---|---|---|---|
| https://www.glaze.app/assets/feature-agent@2x-DiXdV7jJ.png | public/assets/feature-agent@2x-DiXdV7jJ.png | png | 1920x720 | 385,109 | Describe and create | downloaded |
| https://www.glaze.app/assets/feature-agent-m@2x-SqlCEaw_.png | public/assets/feature-agent-m@2x-SqlCEaw_.png | png | 700x550 | 118,440 | Describe and create | existing (verified identical) |
| https://www.glaze.app/assets/feature-byo-agent@2x-O6LGWpOW.png | public/assets/feature-byo-agent@2x-O6LGWpOW.png | png | 920x720 | 145,764 | Bring your own agent | downloaded |
| https://www.glaze.app/assets/feature-byo-agent-m@2x-DzJfhShO.png | public/assets/feature-byo-agent-m@2x-DzJfhShO.png | png | 700x550 | 55,863 | Bring your own agent | existing |
| https://www.glaze.app/assets/feature-annotate@2x-CEgsXauF.png | public/assets/feature-annotate@2x-CEgsXauF.png | png | 920x720 | 44,083 | Annotate | downloaded |
| https://www.glaze.app/assets/feature-annotate-m@2x-BUOqd2MG.png | public/assets/feature-annotate-m@2x-BUOqd2MG.png | png | 700x550 | 22,720 | Annotate | existing |
| https://www.glaze.app/assets/feature-publish@2x-BAnZng48.png | public/assets/feature-publish@2x-BAnZng48.png | png | 920x720 | 114,221 | Publish effortlessly | downloaded |
| https://www.glaze.app/assets/feature-publish-m@2x-CA9HDStp.png | public/assets/feature-publish-m@2x-CA9HDStp.png | png | 700x550 | 74,483 | Publish effortlessly | existing |
| https://www.glaze.app/assets/feature-teams@2x-BMpRWF7u.png | public/assets/feature-teams@2x-BMpRWF7u.png | png | 920x720 | 161,531 | Made for teams | downloaded |
| https://www.glaze.app/assets/feature-teams-m@2x-DAeBdK0q.png | public/assets/feature-teams-m@2x-DAeBdK0q.png | png | 700x550 | 103,475 | Made for teams | existing |
| https://www.glaze.app/assets/feature-store@2x-C0XIoenz.png | public/assets/feature-store@2x-C0XIoenz.png | png | 1024x384 | 51,891 | Discover & install | downloaded |
| https://www.glaze.app/assets/feature-store-m@2x-D2JyDUG_.png | public/assets/feature-store-m@2x-D2JyDUG_.png | png | 700x550 | 312,035 | Discover & install | existing |

## Particle icons (Download CTA / 404 icon click easter egg, preloaded on idle)

| Original URL | Local path | Format | Dimensions | Bytes | Status |
|---|---|---|---|---|---|
| https://www.glaze.app/assets/app-icon1-B6nyDjUn.png | public/assets/app-icon1-B6nyDjUn.png | png | 256x256 | 92,582 | downloaded |
| https://www.glaze.app/assets/app-icon2-DjnGgdo3.png | public/assets/app-icon2-DjnGgdo3.png | png | 256x256 | 92,525 | downloaded |
| https://www.glaze.app/assets/app-icon3-CJBSEBl6.png | public/assets/app-icon3-CJBSEBl6.png | png | 256x256 | 80,701 | downloaded |
| https://www.glaze.app/assets/app-icon4-aPALpHlP.png | public/assets/app-icon4-aPALpHlP.png | png | 256x256 | 43,219 | downloaded |
| https://www.glaze.app/assets/app-icon5-Cqa_0ar_.png | public/assets/app-icon5-Cqa_0ar_.png | png | 256x256 | 85,073 | downloaded |
| https://www.glaze.app/assets/app-icon6-1ZpMIA6w.png | public/assets/app-icon6-1ZpMIA6w.png | png | 256x256 | 119,925 | downloaded |
| https://www.glaze.app/assets/app-icon7-BrPwq4JI.png | public/assets/app-icon7-BrPwq4JI.png | png | 256x256 | 66,386 | downloaded |
| https://www.glaze.app/assets/app-icon8-nORZcwze.png | public/assets/app-icon8-nORZcwze.png | png | 256x256 | 88,713 | downloaded |
| https://www.glaze.app/assets/app-icon9-rnjqIe5j.png | public/assets/app-icon9-rnjqIe5j.png | png | 256x256 | 92,796 | downloaded |
| https://www.glaze.app/assets/app-icon10-CkBmQBFY.png | public/assets/app-icon10-CkBmQBFY.png | png | 256x256 | 96,201 | downloaded |
| https://www.glaze.app/assets/app-icon11-BLP9K6-T.png | public/assets/app-icon11-BLP9K6-T.png | png | 256x256 | 106,828 | downloaded |
| https://www.glaze.app/assets/app-icon12-r_ceZ9Ek.png | public/assets/app-icon12-r_ceZ9Ek.png | png | 256x256 | 55,361 | downloaded |
| https://www.glaze.app/assets/app-icon13-BT4UL4Qn.png | public/assets/app-icon13-BT4UL4Qn.png | png | 256x256 | 78,151 | downloaded |
| https://www.glaze.app/assets/app-icon14-C80wEv97.png | public/assets/app-icon14-C80wEv97.png | png | 256x256 | 102,442 | downloaded |
| https://www.glaze.app/assets/app-icon15-_lEqsNc-.png | public/assets/app-icon15-_lEqsNc-.png | png | 256x256 | 92,160 | downloaded |
| https://www.glaze.app/assets/app-icon16-Djwb4XYP.png | public/assets/app-icon16-Djwb4XYP.png | png | 256x256 | 101,218 | downloaded |
| https://www.glaze.app/assets/app-icon17-Dq0CjLqB.png | public/assets/app-icon17-Dq0CjLqB.png | png | 256x256 | 96,178 | downloaded |

## Persona showcase app icons and author avatars (`public/assets/apps/`)

Rendered sources are `img.glaze.app` resize-proxy URLs: icons `rs:fit:256:256`, avatars `rs:fit:40:40`. The path segment after the size is base64 of the original `api.glazeapp.com` storage URL. Icons render at 112px (64px <600) with `scale(1.19)`; avatars render at 16px, rounded-full, object-cover.

| Tab | App slug | App / author | Kind | Original URL | Local path | Format | Dimensions |
|---|---|---|---|---|---|---|---|
| personal | mia-calendar-N2NgPq | Mia Calendar / Daniela Muntyan | icon | https://img.glaze.app/61YzYQV5vLNQttfWqCFdT3XeDczVwu5TIsESSIWJSBs/rs:fit:256:256/aHR0cHM6Ly9hcGkuZ2xhemVhcHAuY29tL3N0b3JhZ2UvdjEvb2JqZWN0L3B1YmxpYy9nbGF6ZS1wdWJsaWMtYXNzZXRzL2ljb25zLzU3YWJmNjkzLTdlYzMtNDNkNC1hNjZlLWYyODllYjg1MzFjMi1pY29uLTUxMi5wbmc | public/assets/apps/mia-calendar-N2NgPq-icon.png | png | 256x256 |
| personal | mia-calendar-N2NgPq | Mia Calendar / Daniela Muntyan | avatar | https://img.glaze.app/und_er4EDBfDHJKLIStByPzqp8S6cmiTSTnHioED4G8/rs:fit:40:40/aHR0cHM6Ly9hcGkuZ2xhemVhcHAuY29tL3N0b3JhZ2UvdjEvb2JqZWN0L3B1YmxpYy9nbGF6ZS1wdWJsaWMtYXNzZXRzL2F2YXRhcnMvdXNlcnMvYWZjZmE1M2QtNmE1YS00YzA0LWJjNWItMTI0ZTc2NDFlNTAxLmpwZw | public/assets/apps/mia-calendar-N2NgPq-avatar.jpg | jpeg | 40x40 |
| personal | flor-8Q7yXM | Flor / David Martín Suárez | icon | https://img.glaze.app/rwUyMWMNBlez3kbhF2HeeNMkyaEa6J6ZnZNBJ122rSw/rs:fit:256:256/aHR0cHM6Ly9hcGkuZ2xhemVhcHAuY29tL3N0b3JhZ2UvdjEvb2JqZWN0L3B1YmxpYy9nbGF6ZS1wdWJsaWMtYXNzZXRzL2ljb25zL2NmNTgwMjgxLWRjYTctNGFjYS04ZjlkLTY5OTI5ODk5MDJhYi1pY29uLTUxMi5wbmc | public/assets/apps/flor-8Q7yXM-icon.png | png | 256x256 |
| personal | flor-8Q7yXM | Flor / David Martín Suárez | avatar | https://img.glaze.app/c5mSRoldk2BWmsBhxkHyQU249Tr3Zdos1SNbgd0sr88/rs:fit:40:40/aHR0cHM6Ly9hcGkuZ2xhemVhcHAuY29tL3N0b3JhZ2UvdjEvb2JqZWN0L3B1YmxpYy9nbGF6ZS1wdWJsaWMtYXNzZXRzL2F2YXRhcnMvMDNhY2E2MjMtODU1ZC00ZGZlLWI0NDQtNGVlYWM4NjM4YTU3LzIzMTk1ZjZkLWU5ZTQtNGZhYS1hM2UzLTdiMzBkMzBiMGEwZC5wbmc | public/assets/apps/flor-8Q7yXM-avatar.png | png | 40x40 |
| personal | reading-corner-k3tfty | Reading Corner / Ivo Fonseca | icon | https://img.glaze.app/-gQLirFIrENHfszfENsJ3OBiwNN5OEZYGlkgjfziGC0/rs:fit:256:256/aHR0cHM6Ly9hcGkuZ2xhemVhcHAuY29tL3N0b3JhZ2UvdjEvb2JqZWN0L3B1YmxpYy9nbGF6ZS1wdWJsaWMtYXNzZXRzL2ljb25zLzMxNTYzOTIzLWVlYTMtNDI5NS1hNmU4LWQyNDIyNTNkYjJkMy1pY29uLTUxMi5wbmc | public/assets/apps/reading-corner-k3tfty-icon.png | png | 256x256 |
| personal | reading-corner-k3tfty | Reading Corner / Ivo Fonseca | avatar | https://img.glaze.app/vTT3WFbbqqUWYyvkN86Dyv4O-AXd8FdvutEaIV2JVBM/rs:fit:40:40/aHR0cHM6Ly9hcGkuZ2xhemVhcHAuY29tL3N0b3JhZ2UvdjEvb2JqZWN0L3B1YmxpYy9nbGF6ZS1wdWJsaWMtYXNzZXRzL2F2YXRhcnMvYjgwOTg0NTMtMjdmYy00NTJkLTkzMmItMGFjMzI3NzhjYWZjL2EyY2RkZTI4LWI4ZGEtNGNhZi1hYTBjLWJkOTE3NWI0NTEzMi5qcGVn | public/assets/apps/reading-corner-k3tfty-avatar.jpg | jpeg | 31x40 |
| personal | alto-cvSTku | Alto / Wael | icon | https://img.glaze.app/-AFc7Jwv8tBCQscN_VhePgQBN1XvO6gSsGH3v4coF6A/rs:fit:256:256/aHR0cHM6Ly9hcGkuZ2xhemVhcHAuY29tL3N0b3JhZ2UvdjEvb2JqZWN0L3B1YmxpYy9nbGF6ZS1wdWJsaWMtYXNzZXRzL2ljb25zL2M4ODZhNGRjLWYxNzgtNDY2MC05MWIwLTkyZmQ4ZDFkZGQ5Mi1pY29uLTUxMi5wbmc | public/assets/apps/alto-cvSTku-icon.png | png | 256x256 |
| personal | alto-cvSTku | Alto / Wael | avatar | https://img.glaze.app/1LOKycWD9ReRUqGu24CJLttk7Jsx1hmFatiF5iSFFJQ/rs:fit:40:40/aHR0cHM6Ly9hcGkuZ2xhemVhcHAuY29tL3N0b3JhZ2UvdjEvb2JqZWN0L3B1YmxpYy9nbGF6ZS1wdWJsaWMtYXNzZXRzL2F2YXRhcnMvdXNlcnMvZGE3NTk3MDQtMDAwZi00OTEwLWIxZTItZGIyODYxMGVjMzU1LnBuZw | public/assets/apps/alto-cvSTku-avatar.png | png | 32x40 |
| design | my-stash-CDBw9Z | My Stash / Noman | icon | https://img.glaze.app/OSxvYycLgyjq0CTp19AonmFR48OGN83fTDCXqLkJ_fQ/rs:fit:256:256/aHR0cHM6Ly9hcGkuZ2xhemVhcHAuY29tL3N0b3JhZ2UvdjEvb2JqZWN0L3B1YmxpYy9nbGF6ZS1wdWJsaWMtYXNzZXRzL2ljb25zL2MxYmM3ZTlkLTYyNzMtNDhjNi1iMWEzLTllMzg4M2E3ZTU1MS1pY29uLTUxMi5wbmc | public/assets/apps/my-stash-CDBw9Z-icon.png | png | 256x256 |
| design | my-stash-CDBw9Z | My Stash / Noman | avatar | https://img.glaze.app/-Xij7zO8t108lfP0JdqABzaSgDBDNja6m2ODTJt5hnU/rs:fit:40:40/aHR0cHM6Ly9hcGkuZ2xhemVhcHAuY29tL3N0b3JhZ2UvdjEvb2JqZWN0L3B1YmxpYy9nbGF6ZS1wdWJsaWMtYXNzZXRzL2F2YXRhcnMvNDcxMGM5NjAtZjBjZS00NWU5LWE0MDEtMmRkYTdmYTBjNTEwL2Y3MDE1MDlmLTYwNTctNGUwOC04ZWU5LTAxNzhhNzAzM2E4ZS5qcGVn | public/assets/apps/my-stash-CDBw9Z-avatar.jpg | jpeg | 31x40 |
| design | icon-keeper-x9TGum | Icon Keeper / Yann-Edern Gillet | icon | https://img.glaze.app/fVcZpbUwqtc9pVgxEJbCl_UVYcO6ZSo-o_0gIuayXms/rs:fit:256:256/aHR0cHM6Ly9hcGkuZ2xhemVhcHAuY29tL3N0b3JhZ2UvdjEvb2JqZWN0L3B1YmxpYy9nbGF6ZS1wdWJsaWMtYXNzZXRzL2ljb25zLzc5MzFmNjUxLWYxMjItNDAxMS05YmQ4LTdhZjcyMDYzNjc4MC1pY29uLTUxMi5wbmc | public/assets/apps/icon-keeper-x9TGum-icon.png | png | 256x256 |
| design | icon-keeper-x9TGum | Icon Keeper / Yann-Edern Gillet | avatar | https://img.glaze.app/19MNXRQUHR6BFzWGQxtf3rUD_mNbKp3XGWiVChNpfS4/rs:fit:40:40/aHR0cHM6Ly9hcGkuZ2xhemVhcHAuY29tL3N0b3JhZ2UvdjEvb2JqZWN0L3B1YmxpYy9nbGF6ZS1wdWJsaWMtYXNzZXRzL2F2YXRhcnMvdXNlcnMvYzBjMjE4YzEtNzE2ZS00Nzc5LWE1ODUtZTZhZmUzMWRjOTZiLmpwZw | public/assets/apps/icon-keeper-x9TGum-avatar.jpg | jpeg | 40x40 |
| design | radius-match-6p1dce | Radius Match / Kristina Loewen | icon | https://img.glaze.app/cMlq9reOYNSJxI_I8Io3yw14DJvk4gvAuOQeZaSqG5A/rs:fit:256:256/aHR0cHM6Ly9hcGkuZ2xhemVhcHAuY29tL3N0b3JhZ2UvdjEvb2JqZWN0L3B1YmxpYy9nbGF6ZS1wdWJsaWMtYXNzZXRzL2ljb25zLzMwMmYwZGNlLTNhNzYtNDZiMC05OGMwLTQ1NGM0YjNiNjQ0MC1pY29uLTUxMi5wbmc | public/assets/apps/radius-match-6p1dce-icon.png | png | 256x256 |
| design | radius-match-6p1dce | Radius Match / Kristina Loewen | avatar | https://img.glaze.app/NHdJqLOKl78v-tY0lYr30MPUn3pMI2Z1Z1adRlE1nwE/rs:fit:40:40/aHR0cHM6Ly9hcGkuZ2xhemVhcHAuY29tL3N0b3JhZ2UvdjEvb2JqZWN0L3B1YmxpYy9nbGF6ZS1wdWJsaWMtYXNzZXRzL2F2YXRhcnMvdXNlcnMvYzA0NzdkNDAtY2FhOC00OTAwLTg2YmEtZWFjMWFhMjMyZWRhLmpwZw | public/assets/apps/radius-match-6p1dce-avatar.jpg | jpeg | 40x40 |
| design | font-finder-O2kYPe | Font Finder / Alexander Artsvuni | icon | https://img.glaze.app/HGznCFhvYD_tDMeYhb932MsRDmah2XrqeMwU6TggEIo/rs:fit:256:256/aHR0cHM6Ly9hcGkuZ2xhemVhcHAuY29tL3N0b3JhZ2UvdjEvb2JqZWN0L3B1YmxpYy9nbGF6ZS1wdWJsaWMtYXNzZXRzL2ljb25zLzg1MTNlNTBiLThjNTItNGI0OS1hZGRiLTI4MzM3OGM5Nzk0OC1pY29uLTUxMi5wbmc | public/assets/apps/font-finder-O2kYPe-icon.png | png | 256x256 |
| design | font-finder-O2kYPe | Font Finder / Alexander Artsvuni | avatar | https://img.glaze.app/L8qFfSrKDQM9gXTdmMMrtdr33LcpsiNUNAkIDx3ENi0/rs:fit:40:40/aHR0cHM6Ly9hcGkuZ2xhemVhcHAuY29tL3N0b3JhZ2UvdjEvb2JqZWN0L3B1YmxpYy9nbGF6ZS1wdWJsaWMtYXNzZXRzL2F2YXRhcnMvYWY2MTE3MWQtOTRhNC00ZGRmLTg3YWQtYTlhMThmODkzZWVmLzEyYzUyZTVhLTFiMzYtNDAwYS1hMDdlLWM4ZmExOGM4MzgyMS5qcGc | public/assets/apps/font-finder-O2kYPe-avatar.jpg | jpeg | 37x40 |
| development | yolo-PSjYlj | Yolo / Alexandr Subbotin | icon | https://img.glaze.app/d4bzHE2pp6tMthQ4GRgWpa75OZVqa6zLcLivMGo7CPQ/rs:fit:256:256/aHR0cHM6Ly9hcGkuZ2xhemVhcHAuY29tL3N0b3JhZ2UvdjEvb2JqZWN0L3B1YmxpYy9nbGF6ZS1wdWJsaWMtYXNzZXRzL2ljb25zLzFmNjUzY2Q4LTM4NTMtNDQ4YS05MTJlLWIyNzhkY2I5ZjI5ZS1pY29uLTUxMi5wbmc | public/assets/apps/yolo-PSjYlj-icon.png | png | 256x256 |
| development | yolo-PSjYlj | Yolo / Alexandr Subbotin | avatar | https://img.glaze.app/28dl-QC_lntlSF3r03jZ7rLB4i1vQqWF2zVqeUdAW3U/rs:fit:40:40/aHR0cHM6Ly9hcGkuZ2xhemVhcHAuY29tL3N0b3JhZ2UvdjEvb2JqZWN0L3B1YmxpYy9nbGF6ZS1wdWJsaWMtYXNzZXRzL2F2YXRhcnMvdXNlcnMvZmY1NzYzOTMtMGQ3MC00YjgzLTgyYjYtZDA3MmVkM2IxNWQ4LmpwZw | public/assets/apps/yolo-PSjYlj-avatar.jpg | jpeg | 40x40 |
| development | awesome-script-commands-Hi544G | Awesome Script Commands / Thiago Holanda | icon | https://img.glaze.app/vVGl4_eGTMfEiuhtnYkKqNTDm5XIAfAYUH1CDZTVeyU/rs:fit:256:256/aHR0cHM6Ly9hcGkuZ2xhemVhcHAuY29tL3N0b3JhZ2UvdjEvb2JqZWN0L3B1YmxpYy9nbGF6ZS1wdWJsaWMtYXNzZXRzL2ljb25zL2UxNjYzOGE2LTdkMDMtNDAyZC1hYWYxLTAzMjlhNGIwNzRiZC1pY29uLTUxMi5wbmc | public/assets/apps/awesome-script-commands-Hi544G-icon.png | png | 256x256 |
| development | awesome-script-commands-Hi544G | Awesome Script Commands / Thiago Holanda | avatar | https://img.glaze.app/NJ_It2E_9HLJ5b6217wzfrUWIsN6c2QO2q_bMDIJ4iE/rs:fit:40:40/aHR0cHM6Ly9hcGkuZ2xhemVhcHAuY29tL3N0b3JhZ2UvdjEvb2JqZWN0L3B1YmxpYy9nbGF6ZS1wdWJsaWMtYXNzZXRzL2F2YXRhcnMvdXNlcnMvNDQyNDcxODctODY5Mi00NTU1LWFmNmUtMTUwYWU1MGJlZmQwLmpwZw | public/assets/apps/awesome-script-commands-Hi544G-avatar.jpg | jpeg | 40x40 |
| development | ai-skills-browser-vMg0FR | AI Skills Browser / alexi.build | icon | https://img.glaze.app/ONk-I9haYckLB4LNKQVGTtuvRvSO4DI5mYZ1Om1_twQ/rs:fit:256:256/aHR0cHM6Ly9hcGkuZ2xhemVhcHAuY29tL3N0b3JhZ2UvdjEvb2JqZWN0L3B1YmxpYy9nbGF6ZS1wdWJsaWMtYXNzZXRzL2ljb25zLzA3NGExNzU5LTAxZjktNGRkZC1hZjFhLTUyZmNhMzE0YjVjMC1pY29uLTUxMi5wbmc | public/assets/apps/ai-skills-browser-vMg0FR-icon.png | png | 256x256 |
| development | ai-skills-browser-vMg0FR | AI Skills Browser / alexi.build | avatar | https://img.glaze.app/rcqpxPWJjO9yUA4YuITBfr1pUhcWShgHX23dEwIthQs/rs:fit:40:40/aHR0cHM6Ly9hcGkuZ2xhemVhcHAuY29tL3N0b3JhZ2UvdjEvb2JqZWN0L3B1YmxpYy9nbGF6ZS1wdWJsaWMtYXNzZXRzL2F2YXRhcnMvMjFlMTIyYmQtNDExMy00YjJjLWIwNWYtMzljMzk3ZTQzYmU4L2FmMDY2YTNiLWIyNjUtNDAzNC1iMWMyLWQ0ODc3MzcyNzBjZC5qcGc | public/assets/apps/ai-skills-browser-vMg0FR-avatar.jpg | jpeg | 40x40 |
| development | pro-usage-2iVSvr | Pro⁺ Usage / Boufford | icon | https://img.glaze.app/2u1GSmgnF_zEdkT24uCt2NQYfbULIOj_6nqXi6eGRKo/rs:fit:256:256/aHR0cHM6Ly9hcGkuZ2xhemVhcHAuY29tL3N0b3JhZ2UvdjEvb2JqZWN0L3B1YmxpYy9nbGF6ZS1wdWJsaWMtYXNzZXRzL2ljb25zL2U3ZTc3Y2FlLWM3OGItNDgzYy04MDlmLThjOGQ4MDZlMjIzZS1pY29uLTUxMi5wbmc | public/assets/apps/pro-usage-2iVSvr-icon.png | png | 256x256 |
| development | pro-usage-2iVSvr | Pro⁺ Usage / Boufford | avatar | https://img.glaze.app/wTIEUwiZemoQpVBy0E_i3D6azDFlE3fdi0PYH4k_J4M/rs:fit:40:40/aHR0cHM6Ly9hcGkuZ2xhemVhcHAuY29tL3N0b3JhZ2UvdjEvb2JqZWN0L3B1YmxpYy9nbGF6ZS1wdWJsaWMtYXNzZXRzL2F2YXRhcnMvNzJkYWRjMzctMjA1NC00N2I1LTkwNzEtMjIwZTUxMDBlYjM3L2U1MTZkMmQ4LTYwZDEtNDE5Ny1hMzU5LTY1OTY2NmY2NDE4NC5qcGc | public/assets/apps/pro-usage-2iVSvr-avatar.jpg | jpeg | 40x40 |
| creativity | elsewhere-khfW1h | Elsewhere / Yann-Edern Gillet | icon | https://img.glaze.app/23H5Yw_CsxvO2aYhjPy8IOc9minY7teeNJ1ajgF2cyI/rs:fit:256:256/aHR0cHM6Ly9hcGkuZ2xhemVhcHAuY29tL3N0b3JhZ2UvdjEvb2JqZWN0L3B1YmxpYy9nbGF6ZS1wdWJsaWMtYXNzZXRzL2ljb25zL2JhNTRhZDc1LTdkNjYtNDdjZi05NTFmLWFlNzE1NjAxMzJhOS1pY29uLTUxMi5wbmc | public/assets/apps/elsewhere-khfW1h-icon.png | png | 256x256 |
| creativity | elsewhere-khfW1h | Elsewhere / Yann-Edern Gillet | avatar | https://img.glaze.app/19MNXRQUHR6BFzWGQxtf3rUD_mNbKp3XGWiVChNpfS4/rs:fit:40:40/aHR0cHM6Ly9hcGkuZ2xhemVhcHAuY29tL3N0b3JhZ2UvdjEvb2JqZWN0L3B1YmxpYy9nbGF6ZS1wdWJsaWMtYXNzZXRzL2F2YXRhcnMvdXNlcnMvYzBjMjE4YzEtNzE2ZS00Nzc5LWE1ODUtZTZhZmUzMWRjOTZiLmpwZw | public/assets/apps/elsewhere-khfW1h-avatar.jpg | jpeg | 40x40 |
| creativity | cs-glaze-synth-9TGenH | CS Glaze Synth / Combustion Studio | icon | https://img.glaze.app/KNRXoOcIYnE1cPUFm_TK0AgDrDJJvWyJS4Wl2Z5CDhw/rs:fit:256:256/aHR0cHM6Ly9hcGkuZ2xhemVhcHAuY29tL3N0b3JhZ2UvdjEvb2JqZWN0L3B1YmxpYy9nbGF6ZS1wdWJsaWMtYXNzZXRzL2ljb25zL2Q1NWExMjMxLTA5YzQtNDk1NS05ZDlkLWJlNjE4MDUxN2YxYi1pY29uLTUxMi5wbmc | public/assets/apps/cs-glaze-synth-9TGenH-icon.png | png | 256x256 |
| creativity | cs-glaze-synth-9TGenH | CS Glaze Synth / Combustion Studio | avatar | https://img.glaze.app/JsaRH4Nrdbvc2j6N-Wq8uvSk7btdwo8grS7j7ZR-fZ8/rs:fit:40:40/aHR0cHM6Ly9hcGkuZ2xhemVhcHAuY29tL3N0b3JhZ2UvdjEvb2JqZWN0L3B1YmxpYy9nbGF6ZS1wdWJsaWMtYXNzZXRzL2F2YXRhcnMvdXNlcnMvNTkyZjE1MDctNjI5MC00MDQzLTg4MjUtOGJlNzliMTc2MWQ2LnBuZw | public/assets/apps/cs-glaze-synth-9TGenH-avatar.png | png | 40x40 |
| creativity | image-sequencer-IxkyCn | Image Sequencer / Nichlas Wærnes Andersen | icon | https://img.glaze.app/qnfWGy0EDU7qT_HoNurxzdUqZWlUEVlzpTXN7mhAX0g/rs:fit:256:256/aHR0cHM6Ly9hcGkuZ2xhemVhcHAuY29tL3N0b3JhZ2UvdjEvb2JqZWN0L3B1YmxpYy9nbGF6ZS1wdWJsaWMtYXNzZXRzL2ljb25zLzQ5YjRjODM2LTY4YzItNGVjNy05ZTNiLWZjZDM2NzQxMThiOC1pY29uLTUxMi5wbmc | public/assets/apps/image-sequencer-IxkyCn-icon.png | png | 256x256 |
| creativity | image-sequencer-IxkyCn | Image Sequencer / Nichlas Wærnes Andersen | avatar | https://img.glaze.app/vB6aw5BmCimAwS5UZsmhtqAaNuVzNfr0L-tQ5UjcihE/rs:fit:40:40/aHR0cHM6Ly9hcGkuZ2xhemVhcHAuY29tL3N0b3JhZ2UvdjEvb2JqZWN0L3B1YmxpYy9nbGF6ZS1wdWJsaWMtYXNzZXRzL2F2YXRhcnMvdXNlcnMvNTA2ZWVhMDUtMTc0My00ZmU1LWFhODAtOGQwOTk2OGNmNmU5LnBuZw | public/assets/apps/image-sequencer-IxkyCn-avatar.png | png | 40x40 |
| creativity | paper-shaders-bjDU1y | Paper Shaders / Pedro Duarte | icon | https://img.glaze.app/Y4Tpp48WMcaeh3NcZlUqbMqrSvzTbCnMYrihZ8sOx-I/rs:fit:256:256/aHR0cHM6Ly9hcGkuZ2xhemVhcHAuY29tL3N0b3JhZ2UvdjEvb2JqZWN0L3B1YmxpYy9nbGF6ZS1wdWJsaWMtYXNzZXRzL2ljb25zL2ZlZjk0NGY2LTM5YmQtNDI4OS04N2ZjLThmYjA3NzcwMGNkNC1pY29uLTUxMi5wbmc | public/assets/apps/paper-shaders-bjDU1y-icon.png | png | 256x256 |
| creativity | paper-shaders-bjDU1y | Paper Shaders / Pedro Duarte | avatar | https://img.glaze.app/U2QqbfdyXtGpQ7XPXPbsy1GWxZn3vV7Lh1MlFBgqaUU/rs:fit:40:40/aHR0cHM6Ly9hcGkuZ2xhemVhcHAuY29tL3N0b3JhZ2UvdjEvb2JqZWN0L3B1YmxpYy9nbGF6ZS1wdWJsaWMtYXNzZXRzL2F2YXRhcnMvdXNlcnMvZGU5N2ZjYmEtNmQxOS00YWU4LWFlZDYtYzNiYjU4NDg2NGVjLmpwZw | public/assets/apps/paper-shaders-bjDU1y-avatar.jpg | jpeg | 40x40 |
| fun | the-last-blockbuster-oRLCOs | The Last Blockbuster / @zenithquinn | icon | https://img.glaze.app/miCi9DPhrIy_sGs-ZnRpkj-d1QbduOGVCVEOtb0Z1kE/rs:fit:256:256/aHR0cHM6Ly9hcGkuZ2xhemVhcHAuY29tL3N0b3JhZ2UvdjEvb2JqZWN0L3B1YmxpYy9nbGF6ZS1wdWJsaWMtYXNzZXRzL2ljb25zLzhhMWEzZjBjLTQ0MWItNDAyYS1hZmNkLTk2MDNkMTJmZGYwNy1pY29uLTUxMi5wbmc | public/assets/apps/the-last-blockbuster-oRLCOs-icon.png | png | 256x256 |
| fun | the-last-blockbuster-oRLCOs | The Last Blockbuster / @zenithquinn | avatar | https://img.glaze.app/dX_8mvbf3kAW3Am7iKDZDLJXnbUxh8OA2w20zLQZwAc/rs:fit:40:40/aHR0cHM6Ly9hcGkuZ2xhemVhcHAuY29tL3N0b3JhZ2UvdjEvb2JqZWN0L3B1YmxpYy9nbGF6ZS1wdWJsaWMtYXNzZXRzL2F2YXRhcnMvNmRjNTY2NmQtZDIzOS00NWNiLWFiNTItODUxOGQ1YTMzMGMxL2RlNThhOWVkLWQ0MDYtNGJmNS04NmYyLTM4YjU0ODliZjNiMS5wbmc | public/assets/apps/the-last-blockbuster-oRLCOs-avatar.png | png | 40x33 |
| fun | pixel-runner-dZpJ2d | Pixel Runner / Per Nielsen Tikær | icon | https://img.glaze.app/LYazQF2dn5YoE5l46oW1CH4fDgR5ZtbtZjAraTsaocs/rs:fit:256:256/aHR0cHM6Ly9hcGkuZ2xhemVhcHAuY29tL3N0b3JhZ2UvdjEvb2JqZWN0L3B1YmxpYy9nbGF6ZS1wdWJsaWMtYXNzZXRzL2ljb25zLzhiYmI1YWI1LTc0OWItNGZkZi05NTMwLTRkN2I0ZDNlNzZlMi1pY29uLTUxMi5wbmc | public/assets/apps/pixel-runner-dZpJ2d-icon.png | png | 256x256 |
| fun | pixel-runner-dZpJ2d | Pixel Runner / Per Nielsen Tikær | avatar | https://img.glaze.app/COv3sOGBzHHxaBjlPJWv8cJFEfFb6PtcPmnm-qCAkcg/rs:fit:40:40/aHR0cHM6Ly9hcGkuZ2xhemVhcHAuY29tL3N0b3JhZ2UvdjEvb2JqZWN0L3B1YmxpYy9nbGF6ZS1wdWJsaWMtYXNzZXRzL2F2YXRhcnMvdXNlcnMvOTFkMGIyYWQtMmEzZS00ZWQ4LWIzNmItMWM4NGQ2MzNjZTlmLnBuZw | public/assets/apps/pixel-runner-dZpJ2d-avatar.png | png | 40x40 |
| fun | raycast-maze-Meh4qI | Raycast Maze / 騎山豬跑山 | icon | https://img.glaze.app/_ySnK0zOmRn-LaupPCIZwhwxnh0bT9kYI-8HW_NNoYQ/rs:fit:256:256/aHR0cHM6Ly9hcGkuZ2xhemVhcHAuY29tL3N0b3JhZ2UvdjEvb2JqZWN0L3B1YmxpYy9nbGF6ZS1wdWJsaWMtYXNzZXRzL2ljb25zLzAxYzMxNTA5LTNhMDMtNDU2Ni05ZTc1LTQ0ZDU2ZjBlMGFjZS1pY29uLTUxMi5wbmc | public/assets/apps/raycast-maze-Meh4qI-icon.png | png | 256x256 |
| fun | raycast-maze-Meh4qI | Raycast Maze / 騎山豬跑山 | avatar | https://img.glaze.app/WUM6f5C9j9cgayoWpOLQ-w2HZ6zshwCdSbhlGsGhJ54/rs:fit:40:40/aHR0cHM6Ly9hcGkuZ2xhemVhcHAuY29tL3N0b3JhZ2UvdjEvb2JqZWN0L3B1YmxpYy9nbGF6ZS1wdWJsaWMtYXNzZXRzL2F2YXRhcnMvdXNlcnMvZDg3MWY1NDQtYTVmNi00NTkxLThhMDQtOTlkNzJiZjg2NWM5LnBuZw | public/assets/apps/raycast-maze-Meh4qI-avatar.png | png | 40x40 |
| fun | toob-riVQfp | Toob / Maik Klotz | icon | https://img.glaze.app/dZEiplXQM8zfPwZEEz9eDYx8cPjDI2mHxpSCuEYoyQU/rs:fit:256:256/aHR0cHM6Ly9hcGkuZ2xhemVhcHAuY29tL3N0b3JhZ2UvdjEvb2JqZWN0L3B1YmxpYy9nbGF6ZS1wdWJsaWMtYXNzZXRzL2ljb25zL2UxOTQ3MmY5LTRhZTktNGIyNS1iN2E5LTU2YmM1OWEwMGU5NS1pY29uLTUxMi5wbmc | public/assets/apps/toob-riVQfp-icon.png | png | 256x256 |
| fun | toob-riVQfp | Toob / Maik Klotz | avatar | https://img.glaze.app/BzS5SWmQvLsVtkpjQWlwNmx9ZTZWtogzcHTFaLEu14M/rs:fit:40:40/aHR0cHM6Ly9hcGkuZ2xhemVhcHAuY29tL3N0b3JhZ2UvdjEvb2JqZWN0L3B1YmxpYy9nbGF6ZS1wdWJsaWMtYXNzZXRzL2F2YXRhcnMvNmU3MWIyYmItMTE3NS00ODVjLWIxMzQtOTJjZjk3ZGM2YWQyLzUwMjc4ZDk1LTg3ZTQtNGE2MC04M2M2LTQ0ZGI0ZTIxMTVmYS5qcGc | public/assets/apps/toob-riVQfp-avatar.jpg | jpeg | 40x40 |

### Earlier copies of the Daily Life assets (existing, UUID-named, from the saved reference)

These correspond to the `<link rel=preload>` originals on `api.glazeapp.com`. Their actual pixel sizes are 256px icons and ~40px avatars despite the `-icon-512` names. They duplicate the Daily Life rows above; either set works.

| Original URL (preloaded) | Local path | Dimensions | Maps to |
|---|---|---|---|
| https://api.glazeapp.com/storage/v1/object/public/glaze-public-assets/icons/57abf693-7ec3-43d4-a66e-f289eb8531c2-icon-512.png | public/assets/57abf693-7ec3-43d4-a66e-f289eb8531c2-icon-512.png | 256x256 | Mia Calendar icon |
| https://api.glazeapp.com/storage/v1/object/public/glaze-public-assets/avatars/users/afcfa53d-6a5a-4c04-bc5b-124e7641e501.jpg | public/assets/afcfa53d-6a5a-4c04-bc5b-124e7641e501.jpg | 40x40 | Daniela Muntyan avatar |
| https://api.glazeapp.com/storage/v1/object/public/glaze-public-assets/icons/cf580281-dca7-4aca-8f9d-6992989902ab-icon-512.png | public/assets/cf580281-dca7-4aca-8f9d-6992989902ab-icon-512.png | 256x256 | Flor icon |
| https://api.glazeapp.com/storage/v1/object/public/glaze-public-assets/avatars/03aca623-855d-4dfe-b444-4eeac8638a57/23195f6d-e9e4-4faa-a3e3-7b30d30b0a0d.png | public/assets/23195f6d-e9e4-4faa-a3e3-7b30d30b0a0d.png | 40x40 | David Martín Suárez avatar |
| https://api.glazeapp.com/storage/v1/object/public/glaze-public-assets/icons/31563923-eea3-4295-a6e8-d242253db2d3-icon-512.png | public/assets/31563923-eea3-4295-a6e8-d242253db2d3-icon-512.png | 256x256 | Reading Corner icon |
| https://api.glazeapp.com/storage/v1/object/public/glaze-public-assets/avatars/b8098453-27fc-452d-932b-0ac32778cafc/a2cdde28-b8da-4caf-aa0c-bd9175b45132.jpeg | public/assets/a2cdde28-b8da-4caf-aa0c-bd9175b45132.jpg | 31x40 | Ivo Fonseca avatar |
| https://api.glazeapp.com/storage/v1/object/public/glaze-public-assets/icons/c886a4dc-f178-4660-91b0-92fd8d1ddd92-icon-512.png | public/assets/c886a4dc-f178-4660-91b0-92fd8d1ddd92-icon-512.png | 256x256 | Alto icon |
| https://api.glazeapp.com/storage/v1/object/public/glaze-public-assets/avatars/users/da759704-000f-4910-b1e2-db28610ec355.png | public/assets/da759704-000f-4910-b1e2-db28610ec355.png | 32x40 | Wael avatar |

## Inline / data-URI assets (no file needed)

- Apple logo, play-circle data URI, lucide icons (hard-drive, laptop-minimal-check, sparkles, chevron-down, check, x), arrow, FAQ chevron, squircle mask and border, social icons (X, Slack, YouTube, Reddit), Raycast mark, and teams logos (Raycast, Linear, Vercel, Cursor). Exact markup is in CLONE_SPEC.md section 7.

## Not downloaded / not applicable

- YouTube embeds (`2s_NbPY_XuY`, `NBVlr5xWEOE`, `4yztdmf6858`): third-party iframes. Embed them by URL.
- `/api/download?cta=*`: server redirect to the app binary. Link to it; do not mirror.
- PostHog (`us-assets.i.posthog.com`) and Dub (`/_proxy/dub/script`) analytics: not needed.
- JS/CSS bundles: reference copies of `styles-CpdsjlmX.css` and `index-BNXJhYAk.js` are in `_reference/original_files/`.
