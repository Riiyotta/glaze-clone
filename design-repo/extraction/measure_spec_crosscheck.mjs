// Record the document height the clone renders for every entry of extraction/spec_heights.json (the numbers the clone's specs
// recorded on the live site) into measured-values.json -> specCrossCheck. verify_all.py check 18 compares them offline.
//
//   node extraction/measure_spec_crosscheck.mjs --base http://localhost:5492 [--write]
//   PLAYWRIGHT_MODULE=<path or package name of playwright> (default: "playwright")
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const DR = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const arg = (n, d) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : d }
const base = arg('--base', 'http://localhost:5492')
const modSpec = process.env.PLAYWRIGHT_MODULE || 'playwright'
const { chromium } = await import(modSpec.startsWith('/') ? pathToFileURL(modSpec).href : modSpec)
const spec = JSON.parse(fs.readFileSync(path.join(DR, 'extraction/spec_heights.json'), 'utf8'))
const browser = await chromium.launch()
const entries = []
for (const e of spec.entries) {
  const page = await browser.newPage({ viewport: { width: e.viewport, height: 900 } })
  await page.route(/^https?:\/\/(?!localhost)/, (rt) => rt.abort())
  await page.goto(base + e.route, { waitUntil: 'load', timeout: 30000 })
  await page.waitForTimeout(1200)
  const h = await page.evaluate(() => document.documentElement.scrollHeight)
  entries.push({ ...e, clonePx: h, deltaPx: h - e.specPx, deltaPct: Math.round(((h - e.specPx) / e.specPx) * 1000) / 10 })
  await page.close()
}
await browser.close()
const big = entries.filter((e) => Math.abs(e.deltaPct) > spec.tolerancePct)
console.log(`${entries.length} entries; ${entries.length - big.length} within ${spec.tolerancePct}%; ${big.length} outside`)
for (const e of big) console.log(`  ${e.route}@${e.viewport}: spec ${e.specPx} clone ${e.clonePx} (${e.deltaPct}%)`)
if (process.argv.includes('--write')) {
  const p = path.join(DR, 'extraction/measured-values.json')
  const mv = JSON.parse(fs.readFileSync(p, 'utf8'))
  mv.specCrossCheck = { measuredWith: 'Playwright Chromium, document.documentElement.scrollHeight, 1200ms settle, external requests blocked', tolerancePct: spec.tolerancePct, entries }
  fs.writeFileSync(p, JSON.stringify(mv, null, 2) + '\n')
  console.error('wrote specCrossCheck to extraction/measured-values.json')
}
