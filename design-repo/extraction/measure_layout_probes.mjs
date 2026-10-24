// Record computed spacing, sizes and radii of every probe in extraction/layout_probes.json into
// extraction/measured-values.json -> layoutChecks. verify_all.py check 17 evaluates the token expressions against them.
//
//   node extraction/measure_layout_probes.mjs --base http://localhost:5492 [--write]
//   PLAYWRIGHT_MODULE=<path or package name of playwright> (default: "playwright")
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const DR = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const arg = (n, d) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : d }
const base = arg('--base', 'http://localhost:5492')
const modSpec = process.env.PLAYWRIGHT_MODULE || 'playwright'
const { chromium } = await import(modSpec.startsWith('/') ? pathToFileURL(modSpec).href : modSpec)
const spec = JSON.parse(fs.readFileSync(path.join(DR, 'extraction/layout_probes.json'), 'utf8'))
const byRoute = {}
for (const p of spec.probes) (byRoute[p.route] ||= []).push(p)
const checks = {}
const browser = await chromium.launch()
for (const [route, ps] of Object.entries(byRoute)) {
  const widths = [...new Set(ps.flatMap((p) => p.viewports))]
  for (const w of widths) {
    const page = await browser.newPage({ viewport: { width: w, height: 900 } })
    await page.route(/^https?:\/\/(?!localhost)/, (rt) => rt.abort())
    await page.goto(base + route, { waitUntil: 'load', timeout: 30000 })
    await page.waitForTimeout(1200)
    for (const p of ps) {
      if (!p.viewports.includes(w)) continue
      const m = await page.evaluate(({ sel, props }) => {
        const e = document.querySelector(sel)
        if (!e) return null
        const s = getComputedStyle(e), r = e.getBoundingClientRect(), o = {}
        const ms = (v) => { const t = String(v).split(',')[0].trim(); return t.endsWith('ms') ? parseFloat(t) : parseFloat(t) * 1000 }
        for (const k of props) o[k] = k === 'width' ? r.width : k === 'height' ? r.height : /^(animation|transition)(Duration|Delay)$/.test(k) ? ms(s[k]) : parseFloat(s[k])
        return o
      }, { sel: p.selector, props: Object.keys(p.expect) })
      ;(checks[p.id] ||= { route: p.route, selector: p.selector, measured: {} }).measured[w] = m
    }
    await page.close()
  }
}
const overflow = {}
for (const route of spec.overflowRoutes || []) {
  for (const w of spec.overflowViewports || []) {
    const page = await browser.newPage({ viewport: { width: w, height: 900 } })
    await page.route(/^https?:\/\/(?!localhost)/, (rt) => rt.abort())
    await page.goto(base + route, { waitUntil: 'load', timeout: 30000 })
    await page.waitForTimeout(800)
    overflow[`${route}@${w}`] = await page.evaluate(() => document.documentElement.scrollWidth)
    await page.close()
  }
}
await browser.close()
const missing = Object.entries(checks).flatMap(([id, c]) => Object.entries(c.measured).filter(([, m]) => !m).map(([w]) => `${id}@${w}`))
console.log(`${Object.keys(checks).length} layout probes, ${missing.length} not found: ${missing.join(', ')}`)
if (process.argv.includes('--write')) {
  const p = path.join(DR, 'extraction/measured-values.json')
  const mv = JSON.parse(fs.readFileSync(p, 'utf8'))
  mv.layoutChecks = { overflow, measuredWith: 'Playwright Chromium, getComputedStyle / getBoundingClientRect of the first match of each probe selector, 1200ms settle, external requests blocked', checks }
  fs.writeFileSync(p, JSON.stringify(mv, null, 2) + '\n')
  console.error('wrote layoutChecks to extraction/measured-values.json')
}
