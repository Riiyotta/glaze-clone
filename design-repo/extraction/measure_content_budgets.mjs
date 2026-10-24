// Measure the longest REAL source string behind each section content field and record it in
// extraction/measured-values.json -> contentBudgets. verify_all.py (check 14) then fails when a section contract's
// maxWords / maxItems is lower than what the source actually renders, so a budget can no longer drift below the real copy.
//
//   node extraction/measure_content_budgets.mjs [--write]      (the source project is the parent of design-repo/)
//
// `path` is a position inside the section's contentModel: `a.b` = properties a then b, `[]` = array items,
// `oneOfN` = N-th oneOf branch, `kind:p` = the oneOf branch whose `kind` const is p.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const DR = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const PROJECT = path.dirname(DR)
const require = createRequire(path.join(PROJECT, 'package.json'))
const { build } = require('esbuild')

const r = await build({
  stdin: {
    contents: `
export { PLANS, PRICING_FAQS } from './src/data/pricing'
export { FAQS, PERSONAS, FEATURE_ROWS } from './src/data/content'
export { LANDING_HERO, PERSONA_PAGES } from './src/data/personas'
export { TERMS_BLOCKS } from './src/data/legal/terms'
export { PRIVACY_BLOCKS } from './src/data/legal/privacy'
export { AUP_BLOCKS } from './src/data/legal/aup'
export { AWARDS_TERMS_BLOCKS } from './src/data/awards-terms'
export { POSTS } from './src/data/blog'
export { RELEASES } from './src/data/changelog'
export { WINNERS, FINALISTS, ENTRIES } from './src/data/awards'
export { STORE_HEAD_INDEX } from './src/data/store-head-index'
export { CATEGORY_META } from './src/data/store-meta'
`,
    resolveDir: PROJECT, loader: 'js',
  },
  bundle: true, write: false, format: 'esm', platform: 'node', loader: { '.js': 'jsx' },
})
const d = await import(`data:text/javascript;base64,${Buffer.from(r.outputFiles[0].text).toString('base64')}`)
const snap = JSON.parse(fs.readFileSync(path.join(PROJECT, 'src/data/store-snapshot.json'), 'utf8'))

const w = (s) => String(s ?? '').trim().split(/\s+/).filter(Boolean).length
const flat = (segs) => segs.map((x) => x.text).join(' ')
const apps = Object.values(snap.apps)
const rows = []
// [typeId, contract path, kind ('words' | 'items'), values[], where]
// `user` = copy authored by third-party store publishers (unbounded in the source, truncated to one line by the UI):
// the contract budget must cover the 95th percentile, not the single longest outlier.
const add = (type, p, kind, vals, where, user = false) => {
  const n = vals.map((v) => (kind === 'words' ? w(v) : v)).sort((a, b) => a - b)
  const p95 = n.length ? n[Math.min(n.length - 1, Math.ceil(0.95 * n.length) - 1)] : 0
  rows.push({ id: `${type}:${p}:${kind}`, type, path: p, kind, observed: Math.max(0, ...n), p95, samples: vals.length, ...(user ? { userGenerated: true } : {}), where })
}

// landing + personas
const heroes = [d.LANDING_HERO, ...Object.values(d.PERSONA_PAGES)]
add('hero.landing-hero', 'headline', 'words', heroes.map((h) => h.heroHeadline), 'src/data/personas.js')
add('hero.landing-hero', 'subheadline', 'words', heroes.map((h) => h.heroSubheadline), 'src/data/personas.js')
add('showcase.persona-tabs', 'tabs.[].oneOf0.label', 'words', d.PERSONAS.map((p) => p.label), 'src/data/content.js')
add('showcase.persona-tabs', 'tabs.[].oneOf0.title', 'words', d.PERSONAS.map((p) => p.title), 'src/data/content.js')
add('showcase.persona-tabs', 'tabs.[].oneOf0.description', 'words', d.PERSONAS.map((p) => p.description), 'src/data/content.js')
add('showcase.persona-tabs', 'tabs.[].oneOf0.apps.[].name', 'words', d.PERSONAS.flatMap((p) => (p.apps || []).map((a) => a.name)), 'src/data/content.js')
add('showcase.persona-tabs', 'tabs.[].oneOf0.apps.[].author', 'words', d.PERSONAS.flatMap((p) => (p.apps || []).map((a) => a.author)), 'src/data/content.js')
const cards = d.FEATURE_ROWS.flat()
add('features.feature-grid', 'rows.[].cards.[].title', 'words', cards.map((c) => c.title), 'src/data/content.js')
add('features.feature-grid', 'rows.[].cards.[].description', 'words', cards.map((c) => c.description), 'src/data/content.js')
add('support.faq', 'items.[].question', 'words', [...d.FAQS, ...d.PRICING_FAQS].map((f) => f.q), 'src/data/content.js + src/data/pricing.js')
add('support.faq', 'items.[].answer', 'words', [...d.FAQS, ...d.PRICING_FAQS].map((f) => f.a), 'src/data/content.js + src/data/pricing.js')
add('support.faq', 'items', 'items', [d.FAQS.length, d.PRICING_FAQS.length], 'src/data/content.js + src/data/pricing.js')
// pricing
add('commerce.pricing-plans', 'plans.[].title', 'words', d.PLANS.map((p) => p.title), 'src/data/pricing.js')
add('commerce.pricing-plans', 'plans.[].features.[].text', 'words', d.PLANS.flatMap((p) => p.features.map((f) => f.text)), 'src/data/pricing.js')
add('commerce.pricing-plans', 'plans.[].features.[].info', 'words', d.PLANS.flatMap((p) => p.features.filter((f) => f.info).map((f) => f.info)), 'src/data/pricing.js')
add('commerce.pricing-plans', 'plans.[].features.[].badge', 'words', d.PLANS.flatMap((p) => p.features.filter((f) => f.badge).map((f) => f.badge)), 'src/data/pricing.js')
add('commerce.pricing-plans', 'plans.[].features', 'items', d.PLANS.map((p) => p.features.length), 'src/data/pricing.js')
add('commerce.pricing-plans', 'plans.[].caption', 'words', d.PLANS.filter((p) => p.caption).map((p) => p.caption), 'src/data/pricing.js')
// legal
const legal = [d.TERMS_BLOCKS, d.PRIVACY_BLOCKS, d.AUP_BLOCKS, d.AWARDS_TERMS_BLOCKS]
const lb = legal.flat()
add('content.legal-body', 'blocks', 'items', legal.map((b) => b.length), 'src/data/legal/*.js + src/data/awards-terms.js')
add('content.legal-body', 'blocks.[].kind:h2.text', 'words', lb.filter((b) => b.t === 'h2').map((b) => b.text), 'src/data/legal/*.js')
add('content.legal-body', 'blocks.[].kind:h3.text', 'words', lb.filter((b) => b.t === 'h3').map((b) => b.text), 'src/data/legal/*.js')
add('content.legal-body', 'blocks.[].kind:p.text', 'words', lb.filter((b) => b.t === 'p').map((b) => b.text || ''), 'src/data/legal/*.js')
add('content.legal-body', 'blocks.[].kind:ul.items', 'items', lb.filter((b) => b.t === 'ul').map((b) => b.items.length), 'src/data/legal/*.js')
add('content.legal-body', 'blocks.[].kind:ul.items.[].text', 'words', lb.filter((b) => b.t === 'ul').flatMap((b) => b.items.map((i) => i.text)), 'src/data/legal/*.js')
// blog + changelog
add('content.post-card', 'title', 'words', d.POSTS.map((p) => p.title), 'src/data/blog.js')
add('content.post-card', 'excerpt', 'words', d.POSTS.map((p) => p.excerpt), 'src/data/blog.js')
add('content.post-card', 'author.name', 'words', d.POSTS.map((p) => p.author.name), 'src/data/blog.js')
const pb = d.POSTS.flatMap((p) => p.body)
add('content.article-body', 'blocks', 'items', d.POSTS.map((p) => p.body.length), 'src/data/blog.js')
add('content.article-body', 'blocks.[].kind:h2.text', 'words', pb.filter((b) => b.type === 'h2').map((b) => b.text), 'src/data/blog.js')
add('content.article-body', 'blocks.[].kind:h3.text', 'words', pb.filter((b) => b.type === 'h3').map((b) => b.text), 'src/data/blog.js')
add('content.article-body', 'blocks.[].kind:p.text', 'words', pb.filter((b) => b.type === 'p').map((b) => flat(b.segs)), 'src/data/blog.js')
add('content.article-body', 'blocks.[].kind:ul.items', 'items', pb.filter((b) => b.type === 'ul').map((b) => b.items.length), 'src/data/blog.js')
add('content.article-body', 'blocks.[].kind:ul.items.[].text', 'words', pb.filter((b) => b.type === 'ul').flatMap((b) => b.items.map((i) => flat(i.segs))), 'src/data/blog.js')
const rb = d.RELEASES.flatMap((x) => x.body)
add('content.release-entry', 'title', 'words', d.RELEASES.map((x) => x.title), 'src/data/changelog.js')
add('content.release-entry', 'blocks', 'items', d.RELEASES.map((x) => x.body.length), 'src/data/changelog.js')
add('content.release-entry', 'blocks.[].kind:h2.text', 'words', rb.filter((b) => b.type === 'h2').map((b) => b.text), 'src/data/changelog.js')
add('content.release-entry', 'blocks.[].kind:p.text', 'words', rb.filter((b) => b.type === 'p').map((b) => flat(b.segs)), 'src/data/changelog.js')
add('content.release-entry', 'blocks.[].kind:ul.items', 'items', rb.filter((b) => b.type === 'ul').map((b) => b.items.length), 'src/data/changelog.js')
add('content.release-entry', 'blocks.[].kind:ul.items.[].text', 'words', rb.filter((b) => b.type === 'ul').flatMap((b) => b.items.map((i) => flat(i.segs))), 'src/data/changelog.js')
// awards + store
const wins = d.WINNERS
add('showcase.award-winners', 'winners.gold.name', 'words', wins.map((x) => x.name), 'src/data/awards.js')
add('showcase.award-winners', 'winners.gold.tagline', 'words', wins.map((x) => x.tagline), 'src/data/awards.js')
add('showcase.award-winners', 'winners.gold.author', 'words', wins.map((x) => x.author), 'src/data/awards.js')
add('showcase.award-winners', 'finalists.[].name', 'words', d.FINALISTS.map((x) => x.name), 'src/data/awards.js')
add('showcase.award-winners', 'finalists.[].tagline', 'words', d.FINALISTS.map((x) => x.tagline), 'src/data/awards.js')
add('showcase.award-winners', 'finalists', 'items', [d.FINALISTS.length], 'src/data/awards.js')
const heads = Object.values(d.STORE_HEAD_INDEX)
add('store.app-shelves', 'shelves.[].apps.[].name', 'words', heads.map((h) => h[0]), 'src/data/store-head-index.js', true)
add('store.app-shelves', 'shelves.[].apps.[].tagline', 'words', heads.map((h) => h[1]), 'src/data/store-head-index.js', true)
add('store.app-shelves', 'shelves.[].apps.[].author', 'words', apps.map((a) => a.author?.name), 'src/data/store-snapshot.json', true)
add('store.app-header', 'name', 'words', heads.map((h) => h[0]), 'src/data/store-head-index.js', true)
add('store.app-header', 'tagline', 'words', heads.map((h) => h[1]), 'src/data/store-head-index.js', true)
add('store.category-nav', 'title', 'words', Object.values(d.CATEGORY_META).map((c) => c.label), 'src/data/store-meta.js')
add('store.category-nav', 'description', 'words', Object.values(d.CATEGORY_META).map((c) => c.description), 'src/data/store-meta.js')

console.log(JSON.stringify(rows.map((x) => `${x.id} = ${x.observed} (n=${x.samples})`), null, 1))
if (process.argv.includes('--write')) {
  const p = path.join(DR, 'extraction/measured-values.json')
  const mv = JSON.parse(fs.readFileSync(p, 'utf8'))
  mv.contentBudgets = {
    description: 'Longest real source string (words) or longest real array (items) behind each section content field. verify_all.py check 14: a section contract budget must not be lower than these. Re-measure with extraction/measure_content_budgets.mjs --write.',
    entries: rows,
  }
  fs.writeFileSync(p, JSON.stringify(mv, null, 2) + '\n')
  console.error('wrote contentBudgets to extraction/measured-values.json')
}
