import { Suspense, createContext, startTransition, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react'

// Minimal client router (no library). Route table + head data live in src/routes.jsx.

const NAV_EVENT = 'glaze:navigate'

// '/index.html' is the same document as '/'. Trailing slashes are ignored for matching.
export function normalizePath(pathname) {
  if (pathname === '/index.html') return '/'
  if (pathname.length > 1 && pathname.endsWith('/')) return pathname.replace(/\/+$/, '') || '/'
  return pathname
}

export function navigate(to, { replace = false } = {}) {
  const url = new URL(to, window.location.href)
  const same = url.pathname + url.search + url.hash === window.location.pathname + window.location.search + window.location.hash
  if (replace || same) history.replaceState(null, '', url)
  else history.pushState(null, '', url)
  window.dispatchEvent(new Event(NAV_EVENT))
}

const PathnameContext = createContext('/')
// Current normalized pathname ('/index.html' -> '/'). Use inside <Router>.
export const usePathname = () => useContext(PathnameContext)

// Pathname plus a `search` key so head data can depend on the query string (e.g. ?page=2 canonicals).
function useLocationPathname() {
  const [loc, setLoc] = useState(() => ({ pathname: normalizePath(window.location.pathname), search: window.location.search }))
  const pathname = loc.pathname
  useEffect(() => {
    const sync = () =>
      startTransition(() =>
        setLoc((prev) => {
          const next = { pathname: normalizePath(window.location.pathname), search: window.location.search }
          return prev.pathname === next.pathname && prev.search === next.search ? prev : next
        }),
      )
    window.addEventListener('popstate', sync)
    window.addEventListener(NAV_EVENT, sync)
    return () => {
      window.removeEventListener('popstate', sync)
      window.removeEventListener(NAV_EVENT, sync)
    }
  }, [])
  return loc
}

const isExternal = (to) => /^([a-z][a-z\d+.-]*:|\/\/)/i.test(to)

// <Link to="/terms">: pushState navigation for local paths; plain <a> for absolute URLs,
// so a nav/footer href can be switched from `${LIVE}/x` to '/x' without touching markup.
export function Link({ to, onClick, target, children, ...rest }) {
  const handleClick = (e) => {
    onClick?.(e)
    if (e.defaultPrevented || isExternal(to)) return
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    if (target && target !== '_self') return
    e.preventDefault()
    navigate(to)
  }
  return (
    <a href={to} target={target} onClick={handleClick} {...rest}>
      {children}
    </a>
  )
}

/* ------------------------------------------------------------------ matching */

function compile(path) {
  const keys = []
  const pattern = normalizePath(path)
    .split('/')
    .map((seg) => {
      if (seg.startsWith(':')) {
        keys.push(seg.slice(1))
        return '([^/]+)'
      }
      return seg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    })
    .join('/')
  return { re: new RegExp(`^${pattern || '/'}$`), keys }
}

// Static segments outrank params, so '/store/featured' wins over '/store/:category'
// regardless of registration order.
function specificity(path) {
  return path.split('/').filter(Boolean).map((s) => (s.startsWith(':') ? 1 : 2))
}
function compareSpecificity(a, b) {
  const sa = specificity(a.path)
  const sb = specificity(b.path)
  for (let i = 0; i < Math.max(sa.length, sb.length); i++) {
    const d = (sb[i] ?? 0) - (sa[i] ?? 0)
    if (d) return d
  }
  return 0
}

export function createMatcher(routes) {
  const compiled = [...routes].sort(compareSpecificity).map((r) => ({ ...r, ...compile(r.path) }))
  return (pathname) => {
    const path = normalizePath(pathname)
    for (const r of compiled) {
      const m = r.re.exec(path)
      if (!m) continue
      const params = Object.fromEntries(r.keys.map((k, i) => [k, decodeURIComponent(m[i + 1])]))
      if (r.validate && !r.validate(params)) continue
      return { route: r, params }
    }
    return null
  }
}

/* ------------------------------------------------------------------ head */

const SITE = 'https://www.glaze.app'
export const absoluteUrl = (path) => (path === '/' ? SITE : `${SITE}${path}`)

// Root defaults (index.html / CLONE_SPEC "Page-level behavior"). Images absolute per QA.
const DEFAULT_TITLE = 'Glaze — Build and Share Mac Apps with AI'
const DEFAULT_DESCRIPTION =
  'Create software for you and your team. Lives on your Mac, connects to your files, tools and hardware.'
export const HEAD_DEFAULTS = {
  title: DEFAULT_TITLE,
  description: DEFAULT_DESCRIPTION,
  ogTitle: DEFAULT_TITLE,
  ogDescription: DEFAULT_DESCRIPTION,
  twitterTitle: DEFAULT_TITLE,
  twitterDescription: DEFAULT_DESCRIPTION,
  twitterCard: 'summary_large_image',
  image: `${SITE}/og-glaze@2x.jpg`,
  robots: 'max-image-preview:large',
  canonical: null, // absolute URL; also used for og:url. null = no canonical, no og:url.
}

// Per-route head helper: title/description fan out to og + twitter; canonical doubles as og:url.
// `path` is the local path ('/terms'); output is always an absolute https://www.glaze.app URL.
export function pageHead({ title, description, path, twitterCard }) {
  return {
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    twitterTitle: title,
    twitterDescription: description,
    canonical: absoluteUrl(path),
    ...(twitterCard ? { twitterCard } : {}),
  }
}

function setMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (content == null) {
    el?.remove()
    return
  }
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

export function applyHead(partial) {
  const h = { ...HEAD_DEFAULTS, ...partial }
  document.title = h.title
  setMeta('name', 'description', h.description)
  setMeta('property', 'og:title', h.ogTitle)
  setMeta('property', 'og:description', h.ogDescription)
  setMeta('property', 'og:image', h.image)
  setMeta('property', 'og:url', h.canonical)
  setMeta('name', 'twitter:card', h.twitterCard)
  setMeta('name', 'twitter:title', h.twitterTitle)
  setMeta('name', 'twitter:description', h.twitterDescription)
  setMeta('name', 'twitter:image', h.image)
  setMeta('name', 'robots', h.robots)
  let link = document.head.querySelector('link[rel="canonical"]')
  if (!h.canonical) link?.remove()
  else {
    if (!link) {
      link = document.createElement('link')
      link.rel = 'canonical'
      document.head.appendChild(link)
    }
    link.href = h.canonical
  }
}

/* ------------------------------------------------------------------ Router */

export function Router({ match, notFound, layout: Layout = ({ children }) => children }) {
  const { pathname, search } = useLocationPathname()
  const hit = match(pathname)
  const route = hit ? hit.route : notFound
  const params = hit ? hit.params : {}
  const Page = route.component

  useEffect(() => {
    const head = typeof route.head === 'function' ? route.head(params, search) : route.head
    applyHead(head || {})
    // params is derived from pathname; pathname is the real dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route, pathname, search])

  // Scroll to top on every route change (push and back/forward). The first mount is handled
  // by the landing page's own scroll-restoration effect and the browser.
  const first = useRef(true)
  useLayoutEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
    if (first.current) first.current = false
    else window.scrollTo(0, 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  return (
    <PathnameContext.Provider value={pathname}>
      <Layout>
        <Suspense fallback={null}>
          <Page params={params} {...(route.props || {})} />
        </Suspense>
      </Layout>
    </PathnameContext.Provider>
  )
}
