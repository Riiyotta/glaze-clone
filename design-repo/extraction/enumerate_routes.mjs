// Enumerate the REAL route table of the source project (the clone) from its own route modules and data,
// and (with --write) record it in extraction/measured-values.json -> routeTable. Evidence tool only:
// verify_all.py reads the recorded table and never needs node or the source.
//
//   node extraction/enumerate_routes.mjs [--write]      (run from anywhere; the source project is the parent of design-repo/)
//
// The router (src/router.jsx + src/routes.jsx) auto-discovers src/route-modules/*.js. Each module default-exports
// an array of { path, component: lazy(() => import('../pages/X')), validate?, props? }. Dynamic segments are expanded
// with the same data the build uses (the vite plugin `spa-status-files` in vite.config.js enumerates them identically).
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createRequire } from 'node:module'

const DR = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const PROJECT = path.dirname(DR)
const require = createRequire(path.join(PROJECT, 'package.json'))
const { build: esbuild } = require('esbuild')

const read = (p) => fs.readFileSync(path.join(PROJECT, p), 'utf8')
const modDir = path.join(PROJECT, 'src/route-modules')

const r = await esbuild({
  stdin: {
    contents: `export { POSTS } from './src/data/blog'
export { PERSONA_PAGES } from './src/data/personas'
export { STORE_HEAD_INDEX } from './src/data/store-head-index'
export { CATEGORY_META } from './src/data/store-meta'`,
    resolveDir: PROJECT, loader: 'js',
  },
  bundle: true, write: false, format: 'esm', platform: 'node', loader: { '.js': 'jsx' },
})
const d = await import(`data:text/javascript;base64,${Buffer.from(r.outputFiles[0].text).toString('base64')}`)

const expand = {
  '/blog/:slug': d.POSTS.map((p) => p.slug),
  '/store/:category': Object.keys(d.CATEGORY_META),
  '/app/:slug': Object.keys(d.STORE_HEAD_INDEX),
}

// Load every route module for real (esbuild, stubbed react/router so no browser is needed). `lazy(() => import('../pages/X'))`
// keeps the page import as an external string, so the component file is read from the factory source.
const stubs = {
  react: "export const lazy = (f) => ({ $factory: f.toString() })",
  '../router': "export const pageHead = (x) => x\nexport const HEAD_DEFAULTS = { title: '', description: '' }",
}
const stubPlugin = {
  name: 'stubs',
  setup(b) {
    b.onResolve({ filter: /^react$|^\.\.\/router$/ }, (a) => ({ path: a.path, namespace: 'stub' }))
    b.onLoad({ filter: /.*/, namespace: 'stub' }, (a) => ({ contents: stubs[a.path], loader: 'js' }))
    b.onResolve({ filter: /^\.\.\/pages\// }, (a) => ({ path: a.path, external: true }))
  },
}
const routes = []
for (const f of fs.readdirSync(modDir).filter((x) => x.endsWith('.js')).sort()) {
  const rr = await esbuild({
    entryPoints: [path.join(modDir, f)], bundle: true, write: false, format: 'esm', platform: 'node',
    loader: { '.js': 'jsx' }, plugins: [stubPlugin], logLevel: 'silent',
  })
  const mod = await import(`data:text/javascript;base64,${Buffer.from(rr.outputFiles[0].text).toString('base64')}`)
  for (const rt of mod.default) {
    const m = /import\("\.\.\/pages\/(\w+)"\)/.exec(rt.component.$factory)
    routes.push({ path: rt.path, module: `src/route-modules/${f}`, component: `src/pages/${m[1]}.jsx`, kind: rt.path.includes(':') ? 'pattern' : 'static', validated: typeof rt.validate === 'function' || undefined })
  }
}
const notFound = { path: '*', module: 'src/routes.jsx', component: 'src/pages/NotFoundPage.jsx', kind: 'catch-all' }

const out = { generatedBy: 'extraction/enumerate_routes.mjs', routes: [...routes, notFound], patterns: {} }
for (const [pat, values] of Object.entries(expand)) out.patterns[pat] = { count: values.length, sample: values.slice(0, 3), all: pat === '/app/:slug' ? undefined : values }
const concrete = routes.filter((x) => x.kind === 'static').length
out.counts = {
  staticRoutes: concrete,
  patternRoutes: routes.filter((x) => x.kind === 'pattern').length,
  expandedRoutes: concrete + Object.values(expand).reduce((n, v) => n + v.length, 0),
  catchAll: 1,
  totalWithCatchAll: concrete + Object.values(expand).reduce((n, v) => n + v.length, 0) + 1,
}
out.note = '/store (no category) and /app/<unknown slug>: the router matches /app/:slug for ANY slug; an unknown slug renders the in-page "App not found" state (AppPage.jsx), which is not a separate route. /blog/:slug validates against the post list, so an unknown slug falls to the catch-all. /store/:category validates against the category map. /m and the six showcase tab ids are not registered and fall to the catch-all.'

console.log(JSON.stringify(out, null, 2))
if (process.argv.includes('--write')) {
  const p = path.join(DR, 'extraction/measured-values.json')
  const mv = JSON.parse(fs.readFileSync(p, 'utf8'))
  mv.routeTable = out
  fs.writeFileSync(p, JSON.stringify(mv, null, 2) + '\n')
  console.error('wrote routeTable to extraction/measured-values.json')
}
