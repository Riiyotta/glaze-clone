// Record the computed typography of every probe in extraction/type_probes.json at 1440, 768 and 390px into
// extraction/measured-values.json -> typographyChecks. Evidence tool only: verify_all.py check 13 reads the recorded numbers.
//
//   node extraction/measure_type_probes.mjs --base http://localhost:5492 [--write]
//   PLAYWRIGHT_MODULE=<path or package name of playwright> (default: "playwright")
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const DR = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const arg = (n, d) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : d }
const base = arg('--base', 'http://localhost:5492')
const modSpec = process.env.PLAYWRIGHT_MODULE || 'playwright'
const { chromium } = await import(modSpec.startsWith('/') ? pathToFileURL(modSpec).href : modSpec)
const probes = JSON.parse(fs.readFileSync(path.join(DR, 'extraction/type_probes.json'), 'utf8')).probes
const WIDTHS = [1440, 768, 390]
const byRoute = {}
for (const p of probes) (byRoute[p.route] ||= []).push(p)

const checks = {}
const browser = await chromium.launch()
for (const [route, ps] of Object.entries(byRoute)) {
  for (const w of WIDTHS) {
    const page = await browser.newPage({ viewport: { width: w, height: 900 } })
    // hotlinked images are not needed to measure type; blocking them keeps the run offline and fast
    await page.route(/^https?:\/\/(?!localhost)/, (rt) => rt.abort())
    await page.goto(base + route, { waitUntil: 'load', timeout: 30000 })
    await page.waitForTimeout(1200)
    for (const p of ps) {
      if (p.viewports && !p.viewports.includes(w)) continue
      const m = await page.evaluate((sel) => {
        const e = document.querySelector(sel)
        if (!e) return null
        const s = getComputedStyle(e)
        return { fontFamily: s.fontFamily.split(',')[0].replace(/"/g, '').trim(), fontSize: s.fontSize, lineHeight: s.lineHeight, fontWeight: Number(s.fontWeight), letterSpacing: s.letterSpacing }
      }, p.selector)
      ;(checks[p.id] ||= { role: p.role, route: p.route, selector: p.selector, measured: {} }).measured[w] = m
    }
    await page.close()
  }
}
await browser.close()
const missing = Object.values(checks).flatMap((c) => Object.entries(c.measured).filter(([, m]) => !m).map(([w]) => `${c.role}@${w}`))
console.log(`${Object.keys(checks).length} probes, ${missing.length} not found: ${missing.join(', ')}`)
if (process.argv.includes('--write')) {
  const p = path.join(DR, 'extraction/measured-values.json')
  const mv = JSON.parse(fs.readFileSync(p, 'utf8'))
  mv.typographyChecks = { measuredWith: 'Playwright Chromium, getComputedStyle of the first match of each probe selector, 1200ms settle, external requests blocked', viewports: WIDTHS, checks }
  fs.writeFileSync(p, JSON.stringify(mv, null, 2) + '\n')
  console.error('wrote typographyChecks to extraction/measured-values.json')
}
