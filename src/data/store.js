// Store data layer over src/data/store-snapshot.json (SPEC_store sections 0 and 2).
import snapshot from './store-snapshot.json'
import { DIMS, OPTIMIZED } from './store-optimized'

export const APPS = snapshot.apps
export const CATEGORIES = snapshot.categories
export const FALLBACK_ICON = '/assets/app-icon-PC60coqE.png'
export const PAGE_SIZE = 24

export const slugify = (name) =>
  String(name)
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')

export const getApp = (slug) => (Object.prototype.hasOwnProperty.call(APPS, slug) ? APPS[slug] : null)

// Snapshot URL -> downscaled local copy (public/assets/store/optimized) when downloaded, else the
// original api.glazeapp.com storage URL (hotlinked). Never img.glaze.app.
export function assetUrl(remote) {
  if (!remote) return null
  const local = snapshot.localAssets[remote]
  if (!local) return remote
  return OPTIMIZED[local] || local
}
export const iconUrl = (app) => assetUrl(app.icon) || FALLBACK_ICON

export { CATEGORY_META, STORE_TITLE, STORE_DESCRIPTION } from './store-meta'

/* ------------------------------------------------------------------ store home */

const section = (slug) => snapshot.store.sections.find((s) => s.slug === slug)
// Featured order is random per request on the live site; hardcoded to the snapshot's /store order.
export const FEATURED = section('featured').items.map((i) => ({ slug: i.app, cover: i.coverImage }))
export const OUR_PICKS = section('our_picks').items.map((i) => i.app).slice(0, 24)
export const TRENDING = section('trending').items.map((i) => i.app)
export const LATEST = snapshot.store.latest
export const MADE_TO_REMIX = snapshot.store.madeToRemix
export const AWARD_WINNERS = snapshot.store.awardWinners // 3 medals then finalists, already ordered

/* ------------------------------------------------------------------ category pages */

function mulberry32(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const hash = (s) => [...s].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) >>> 0, 7)

const ALL = Object.values(APPS)
const poolFor = (category) => (category === 'remixable' ? ALL.filter((a) => a.remixable) : ALL.filter((a) => a.category === category))

// Real page counts/totals come from the snapshot. Only page 1 (and design page 2) were captured;
// other pages are a deterministic seeded shuffle of the category's known apps (placeholder content).
export function categoryPage(category, page) {
  const cp = snapshot.categoryPages[category]
  if (!cp) return null
  const p = Math.min(Math.max(1, page | 0 || 1), cp.pageCount)
  let slugs
  if (p === 1) slugs = cp.apps
  else if (category === 'design' && p === 2) slugs = cp.page2Sample
  else {
    const pool = poolFor(category).map((a) => a.slug)
    const rnd = mulberry32(hash(`${category}:${p}`))
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1))
      ;[pool[i], pool[j]] = [pool[j], pool[i]]
    }
    const count = Math.min(PAGE_SIZE, cp.total - (p - 1) * PAGE_SIZE)
    slugs = pool.slice(0, count)
  }
  return { page: p, pageCount: cp.pageCount, total: cp.total, apps: slugs }
}
export const REMIXABLE_MADE_TO_REMIX = snapshot.categoryPages.remixable.madeToRemix

/* ------------------------------------------------------------------ search */

// Client-side stand-in for the live server search (name, tagline, ids, author).
export function searchApps(q, page) {
  const needle = q.trim().toLowerCase()
  const hits = needle
    ? ALL.filter((a) =>
        [a.name, a.tagline, a.slug, a.publicId, a.author.name, a.author.username].some((v) => v && String(v).toLowerCase().includes(needle)),
      )
    : []
  const pageCount = Math.max(1, Math.ceil(hits.length / PAGE_SIZE))
  const p = Math.min(Math.max(1, page | 0 || 1), pageCount)
  return { total: hits.length, pageCount, page: p, apps: hits.slice((p - 1) * PAGE_SIZE, p * PAGE_SIZE).map((a) => a.slug) }
}

/* ------------------------------------------------------------------ app page */

// Real remixes / suggested lists come from each app page's SSR payload (snapshot.appPages, all
// fetched apps; 6 live pages have an empty suggested list and render none). The seeded shuffle is only a fallback for slugs without a fetched page
// (the 38 extra apps that only appear in other pages' lists).
export function relatedApps(app) {
  const page = snapshot.appPages[app.slug]
  if (page) return { related: page.related, remixes: page.remixes }
  const remixes = ALL.filter((a) => a.remixLineage?.parent_public_id === app.publicId).map((a) => a.slug)
  const rnd = mulberry32(hash(app.slug))
  const same = ALL.filter((a) => a.category === app.category && a.slug !== app.slug).map((a) => a.slug)
  for (let i = same.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    ;[same[i], same[j]] = [same[j], same[i]]
  }
  return { related: same.slice(0, 5), remixes }
}

export const parentSlug = (l) => `${slugify(l.parent_display_name)}-${l.parent_public_id}`

export function formatSize(bytes) {
  if (!bytes) return '—'
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  return `${Math.round(bytes / 1024)} KB`
}
export function formatInstalls(n) {
  return n >= 100 ? String(n) : '<100'
}
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
export function formatDate(iso) {
  const d = new Date(iso)
  if (isNaN(d)) return '—'
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}
export const updatedLabel = (app) => formatDate(app.stats.publishedAt || app.stats.updatedAt)

export const AI_TOOLTIP = (app) => `${app.ai.purpose} AI usage is billed to your Glaze credits, with a daily cap.`
export const DOWNLOAD_HREF = 'https://www.glaze.app/api/download'

// Natural [w,h] for downloaded images; hotlinked images fall back to the supplied default.
export function assetDims(remote, fallback) {
  const local = snapshot.localAssets[remote]
  const opt = local && OPTIMIZED[local]
  return (opt && DIMS[opt]) || fallback
}
