// Measure rendered section heights of a RUNNING build of the source project and write them to
// extraction/measured-values.json -> sectionHeights. Evidence tool only: verify_all.py reads the
// recorded numbers and never needs a browser. Selectors come from sections/*.json source.domSelector.
//
//   node extraction/measure_section_heights.mjs --base http://localhost:5471 [--write]
//   PLAYWRIGHT_MODULE=<path or package name of playwright> (default: "playwright")
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const DR = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const arg = (n, d) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : d }
const base = arg('--base', 'http://localhost:5471')
const write = process.argv.includes('--write')
const modSpec = process.env.PLAYWRIGHT_MODULE || 'playwright'
const { chromium } = await import(modSpec.startsWith('/') ? pathToFileURL(modSpec).href : modSpec)

const sections = Object.fromEntries(
  fs.readdirSync(path.join(DR, 'sections')).filter((f) => f.endsWith('.json'))
    .map((f) => JSON.parse(fs.readFileSync(path.join(DR, 'sections', f), 'utf8'))).map((s) => [s.typeId, s]),
)
const templates = JSON.parse(fs.readFileSync(path.join(DR, 'templates/templates.json'), 'utf8')).templates
// one representative route per template
// a template may list several representative routes: the first route that renders a section supplies its height
// (the app-detail template needs a remix for the lineage banner and a covered app for the cover header)
const PAGES = {
  'template.landing': '/', 'template.persona': '/designers', 'template.not-found': '/this-route-does-not-exist',
  'template.pricing': '/pricing', 'template.download': '/download', 'template.awards': '/awards', 'template.legal': '/terms',
  'template.blog-index': '/blog', 'template.blog-post': '/blog/how-teams-use-glaze', 'template.changelog': '/changelog',
  'template.store-index': '/store', 'template.store-category': '/store/design', 'template.app-detail': ['/app/my-stash-CDBw9Z', '/app/airwayfl-XD7JA5'],
}
// utility sections render only when opened: how to open each one (selector clicked, then the section is measured)
const OPENERS = {
  'shell.youtube-overlay': { text: /watch|play|video/i, role: 'button' },
  'shell.app-dialog': { css: '#persona-panel a[aria-label^="Preview"], main button[aria-label^="Gold winner"]' },
  'shell.image-lightbox': { css: '.markdown-content button[aria-label^="Open image"]' },
}
const W = 1440

const browser = await chromium.launch()
const out = { viewport: { width: W, height: 900 }, measuredWith: 'Playwright Chromium; getBoundingClientRect().height of the element matching each section contract source.domSelector; 1500ms settle for entrance animations', pages: {} }
for (const [tid, routeSpec] of Object.entries(PAGES)) {
  const routes = [].concat(routeSpec)
  const rec = { route: routes[0], ...(routes.length > 1 ? { alsoMeasuredOn: routes.slice(1) } : {}), documentHeightPx: null, sections: {} }
  for (const route of routes) {
    const page = await browser.newPage({ viewport: { width: W, height: 900 } })
    // hotlinked images are not needed for layout here; blocking them keeps the run offline and deterministic
    await page.route(/^https?:\/\/(?!localhost)/, (rt) => rt.abort())
    await page.goto(base + route, { waitUntil: 'load', timeout: 30000 })
    await page.waitForTimeout(1500)
    if (rec.documentHeightPx === null) rec.documentHeightPx = await page.evaluate(() => document.documentElement.scrollHeight)
    for (const n of templates[tid].nodes) {
      if (rec.sections[n.section]?.heightPx != null) continue
      const s = sections[n.section]
      const sel = s.source.domSelector
      // a selector list (comma) is a union: the section is the bounding box of all matches (e.g. page title plus the line under it)
      const measure = (q) => page.evaluate((q) => {
        const all = [...document.querySelectorAll(q)]
        const els = q.includes(',') ? all : all.slice(0, 1) // first match only, unless the selector is a list
        if (!els.length) return null
        const rs = els.map((e) => e.getBoundingClientRect())
        const top = Math.min(...rs.map((r) => r.top)), bottom = Math.max(...rs.map((r) => r.bottom))
        // repeated nodes (post cards, release entries, app lists): the first instance is the section height, the sum of all instances is the in-flow total
        const total = !q.includes(',') && all.length > 1 ? Math.round(all.reduce((n, e) => n + e.getBoundingClientRect().height, 0)) : null
        return { h: Math.round(bottom - top), fixed: els.every((e) => getComputedStyle(e).position === 'fixed'), instances: all.length, total }
      }, q)
      let m = await measure(sel)
      const op = OPENERS[n.section]
      if (!m && op) {
        const target = op.css ? page.locator(op.css).first() : page.locator(op.role, { hasText: op.text }).first()
        if (await target.count()) { await target.click().catch(() => {}); await page.waitForTimeout(500) }
        m = await measure(sel)
        if (m) m.fixed = true
        await page.keyboard.press('Escape') // close it again so the next utility section is measured on its own
        await page.waitForTimeout(250)
      }
      rec.sections[n.section] = m ? { heightPx: m.h, inFlow: !m.fixed, selector: sel, ...(m.total != null ? { instances: m.instances, totalHeightPx: m.total } : {}), ...(route !== routes[0] ? { measuredOn: route } : {}) } : { heightPx: null, inFlow: false, selector: sel, note: 'not rendered in the default state' }
    }
    await page.close()
  }
  out.pages[tid] = rec
}
await browser.close()
console.log(JSON.stringify(out, null, 2))
if (write) {
  const p = path.join(DR, 'extraction/measured-values.json')
  const mv = JSON.parse(fs.readFileSync(p, 'utf8'))
  mv.sectionHeights = { ...(mv.sectionHeights || {}), ...out, wrapperWhitelist: mv.sectionHeights?.wrapperWhitelist || [] }
  fs.writeFileSync(p, JSON.stringify(mv, null, 2) + '\n')
  console.error('wrote sectionHeights to extraction/measured-values.json')
}
