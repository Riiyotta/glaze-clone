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
const PAGES = { 'template.landing': '/', 'template.persona': '/designers', 'template.not-found': '/this-route-does-not-exist' }
const W = 1440

const browser = await chromium.launch()
const out = { viewport: { width: W, height: 900 }, measuredWith: 'Playwright Chromium; getBoundingClientRect().height of the element matching each section contract source.domSelector; 1500ms settle for entrance animations', pages: {} }
for (const [tid, route] of Object.entries(PAGES)) {
  const page = await browser.newPage({ viewport: { width: W, height: 900 } })
  await page.goto(base + route, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)
  const rec = { route, documentHeightPx: await page.evaluate(() => document.documentElement.scrollHeight), sections: {} }
  for (const n of templates[tid].nodes) {
    const s = sections[n.section]
    const sel = s.source.domSelector
    let m = await page.evaluate((q) => { const e = document.querySelector(q); if (!e) return null; const cs = getComputedStyle(e); return { h: Math.round(e.getBoundingClientRect().height), fixed: cs.position === 'fixed' } }, sel)
    if (!m && n.section === 'shell.youtube-overlay') {
      const btn = page.locator('button', { hasText: /watch|play|video/i }).first()
      if (await btn.count()) { await btn.click().catch(() => {}); await page.waitForTimeout(400) }
      m = await page.evaluate((q) => { const e = document.querySelector(q); return e ? { h: Math.round(e.getBoundingClientRect().height), fixed: true } : null }, sel)
    }
    rec.sections[n.section] = m ? { heightPx: m.h, inFlow: !m.fixed, selector: sel } : { heightPx: null, inFlow: false, selector: sel, note: 'not rendered in the default state' }
  }
  out.pages[tid] = rec
  await page.close()
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
