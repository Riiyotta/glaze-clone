// Derive the source-brand / source-copy / source-URL / source-asset protection lists from the REAL source project and
// write them to assets/source-protected.json and assets/protected-assets.json. Generated-mode PageSpecs are checked against
// these lists by schema/semantic_validate.py. Evidence tool: verify_all.py reads the recorded lists and (when the source is
// present) proves every recorded phrase and host still occurs in the source.
//
//   node extraction/derive_source_protected.mjs [--write]      (the source project is the parent of design-repo/)
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const DR = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const PROJECT = path.dirname(DR)
const require = createRequire(path.join(PROJECT, 'package.json'))
const { build } = require('esbuild')

const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
const words = (s) => norm(s).split(' ').filter(Boolean).length

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) walk(p, out)
    else out.push(p)
  }
  return out
}
const srcFiles = walk(path.join(PROJECT, 'src'))
const codeFiles = srcFiles.filter((f) => /\.(jsx?|css)$/.test(f))

// ---------------------------------------------------------------- hosts (every host the source mentions)
const hosts = new Set()
const textFiles = [...srcFiles.filter((f) => /\.(jsx?|css|json)$/.test(f)), path.join(PROJECT, 'index.html')]
for (const f of textFiles) {
  const t = fs.readFileSync(f, 'utf8')
  for (const m of t.matchAll(/https?:\/\/([a-zA-Z0-9][a-zA-Z0-9.-]*\.[a-zA-Z]{2,})/g)) hosts.add(m[1].toLowerCase())
}
hosts.delete('www.w3.org') // SVG/XML namespace, not a link

// ---------------------------------------------------------------- phrases
const phrases = new Map() // normalized -> original (first seen)
// numbered or lettered clause headings ("9. Intellectual property", "X. Termination") are generic legal boilerplate, not brand copy
const clause = /^\s*(?:[0-9]+(?:\.[0-9]+)*\.?|[IVXLC]+\.|S[0-9]+(?:\.[0-9]+)*)\s/
const addPhrase = (s) => {
  if (clause.test(String(s)) || /[=;{}]|\bcalc\(|\.[a-z]+[A-Z]|\dpx\b/.test(String(s))) return // clause heading, or code rather than copy
  const n = norm(s)
  if (words(s) < 3 || n.length < 14) return
  if (/^placeholder\b/.test(n)) return
  if (!phrases.has(n)) phrases.set(n, String(s).trim())
}
const classy = (s) => {
  const toks = s.split(/\s+/)
  const bad = toks.filter((t) => /[-:\[\]\/=]/.test(t) && !/^[A-Z]/.test(t)).length
  return bad / toks.length >= 0.34 || /\b(flex|grid|items-|justify-|rounded|bg-|px-|py-|mt-|mb-|min-\[|max-w|text-\w+ )/.test(s)
}
const sentencey = (s) => /^[A-Z0-9“"'(]/.test(s) && /\s/.test(s) && !classy(s) && !/[{}<>]|\\n/.test(s) && !/^https?:/.test(s)
for (const f of codeFiles) {
  if (/placeholder|lorem|store-about/.test(path.basename(f))) continue
  const t = fs.readFileSync(f, 'utf8')
  for (const m of t.matchAll(/'((?:[^'\\\n]|\\.){14,})'|"((?:[^"\\\n]|\\.){14,})"|`([^`$\n]{14,})`/g)) {
    const s = (m[1] || m[2] || m[3]).replace(/\\(['"])/g, '$1')
    if (sentencey(s)) addPhrase(s)
  }
  if (f.endsWith('.jsx')) {
    for (const m of t.matchAll(/>\s*([A-Za-z0-9“"'(][^<>{}]{10,}?)\s*</g)) {
      const s = m[1].replace(/\s+/g, ' ')
      if (sentencey(s)) addPhrase(s)
    }
  }
}
// data modules evaluated for real (strings that are computed or inside objects)
const r = await build({
  stdin: {
    contents: `
export { PLANS, PRICING_FAQS } from './src/data/pricing'
export { FAQS, PERSONAS, FEATURE_ROWS } from './src/data/content'
export { LANDING_HERO, PERSONA_PAGES } from './src/data/personas'
export { POSTS, AUTHORS } from './src/data/blog'
export { RELEASES } from './src/data/changelog'
export { WINNERS, FINALISTS } from './src/data/awards'
export { STORE_HEAD_INDEX } from './src/data/store-head-index'
export { CATEGORY_META, STORE_TITLE, STORE_DESCRIPTION } from './src/data/store-meta'
`, resolveDir: PROJECT, loader: 'js',
  },
  bundle: true, write: false, format: 'esm', platform: 'node', loader: { '.js': 'jsx' },
})
const d = await import(`data:text/javascript;base64,${Buffer.from(r.outputFiles[0].text).toString('base64')}`)
for (const h of [d.LANDING_HERO, ...Object.values(d.PERSONA_PAGES)]) { for (const l of h.heroHeadline.split('\n')) addPhrase(l); addPhrase(h.heroHeadline.replace('\n', ' ')); for (const l of h.heroSubheadline.split('\n')) addPhrase(l) }
for (const p of d.PERSONAS) { addPhrase(p.title); addPhrase(p.description) }
for (const c of d.FEATURE_ROWS.flat()) { addPhrase(c.title); addPhrase(c.description); addPhrase(c.alt) }
for (const f of [...d.FAQS, ...d.PRICING_FAQS]) { addPhrase(f.q); for (const s of f.a.split(/(?<=[.!?])\s+/)) addPhrase(s) }
for (const p of d.PLANS) { for (const f of p.features) { addPhrase(f.text); if (f.info) addPhrase(f.info) } if (p.caption) addPhrase(p.caption); if (p.lead) addPhrase(p.lead) }
for (const p of d.POSTS) { addPhrase(p.title); addPhrase(p.coverAlt); if (!/^Placeholder/.test(p.excerpt)) addPhrase(p.excerpt); for (const b of p.body) if (b.type === 'h2' || b.type === 'h3') addPhrase(b.text) }
for (const x of d.RELEASES) { addPhrase(x.title) }
for (const x of [...d.WINNERS, ...d.FINALISTS]) { addPhrase(x.name); addPhrase(x.tagline) }
const snap = JSON.parse(fs.readFileSync(path.join(PROJECT, 'src/data/store-snapshot.json'), 'utf8'))
const apps = Object.values(snap.apps)
for (const [name, tagline] of Object.values(d.STORE_HEAD_INDEX)) { addPhrase(name); addPhrase(tagline) }
for (const c of Object.values(d.CATEGORY_META)) { addPhrase(c.title); addPhrase(c.description) }
addPhrase(d.STORE_TITLE); addPhrase(d.STORE_DESCRIPTION)

// ---------------------------------------------------------------- entities
const people = new Set()
for (const a of Object.values(d.AUTHORS)) people.add(a.name)
const sections = fs.readFileSync(path.join(PROJECT, 'src/components/awards/Sections.jsx'), 'utf8')
for (const m of sections.matchAll(/name:\s*'([^']+)',\s*\n\s*role:/g)) people.add(m[1])
for (const a of apps) if (a.author?.name && words(a.author.name) >= 2) people.add(a.author.name.trim())
for (const x of [...d.WINNERS, ...d.FINALISTS]) if (words(x.author) >= 2) people.add(x.author.trim())
// Companies / products shown or named in source copy. Generic-word companies (Linear, Cursor, Resend) are deliberately NOT here:
// matching them as bare words would reject ordinary English; they are only protected inside the longer phrases above.
const companies = ['Glaze', 'Raycast', 'Anthropic', 'Claude', 'Claude Code', 'Codex', 'Platformer', 'Vercel', 'Lovable', 'Replit']
const allText = codeFiles.map((f) => fs.readFileSync(f, 'utf8')).join('\n') + JSON.stringify(snap)
const missing = companies.filter((c) => !allText.includes(c))
if (missing.length) throw new Error('company not in source: ' + missing.join(', '))

const out = {
  $description: 'Protection lists derived from the real source project by extraction/derive_source_protected.mjs. In mode "generated" a PageSpec may not contain any host below, any phrase below (normalized: lowercase, non-alphanumerics collapsed), or any entity name. Phrases are verbatim source copy of at least 3 words; entities are real people and companies named in the source.',
  derivedBy: 'extraction/derive_source_protected.mjs',
  normalization: 'lowercase; every run of non-alphanumeric characters becomes one space; a phrase matches when its normalized form occurs on word boundaries in the normalized text',
  allowedReservedHosts: ['example.com', 'example.org', 'example.net', '*.example', '*.invalid', '*.test', '*.localhost'],
  counts: { hosts: hosts.size, phrases: phrases.size, people: people.size, companies: companies.length },
  hosts: [...hosts].sort(),
  entities: { people: [...people].sort(), companies },
  phrases: [...phrases.values()].sort((a, b) => a.localeCompare(b)),
}
// protected asset files: every file of the source project's public/ tree
const pub = path.join(PROJECT, 'public')
const files = walk(pub).filter((f) => !/\.DS_Store$/.test(f)).map((f) => ({ path: path.relative(pub, f).split(path.sep).join('/'), bytes: fs.statSync(f).size })).sort((a, b) => a.path.localeCompare(b.path))
const assetsOut = {
  $description: 'Every file the source project serves from public/ (derived by extraction/derive_source_protected.mjs). A generated-mode PageSpec may not reference any of them: no string may contain a file name or a stem of at least 8 characters, and no string may point into the source asset folders.',
  counts: { files: files.length, bytes: files.reduce((n, f) => n + f.bytes, 0) },
  pathPatterns: ['(^|/)assets/(store|apps|blog|marketing|fonts)/', '(^|/)assets/[A-Za-z0-9._@-]+\\.(png|jpe?g|svg|mp4|webp|woff2?)$'],
  files,
}
console.log(JSON.stringify(out.counts), JSON.stringify(assetsOut.counts))
if (process.argv.includes('--write')) {
  fs.writeFileSync(path.join(DR, 'assets/source-protected.json'), JSON.stringify(out, null, 2) + '\n')
  fs.writeFileSync(path.join(DR, 'assets/protected-assets.json'), JSON.stringify(assetsOut, null, 1) + '\n')
  console.error('wrote assets/source-protected.json and assets/protected-assets.json')
}
