/*
 * ROUTE TABLE
 * ===========
 * Routes are auto-discovered from src/route-modules/*.js, so adding a page never means editing
 * a shared file. To register a new page:
 *
 *   1. Build the page component in src/pages/ (default export). It renders its own <main>
 *      (+ <Footer/>). Do NOT render <Navbar/>: the layout below provides it.
 *      It receives `params` (e.g. { slug }) plus anything in the route's `props`.
 *
 *   2. Create src/route-modules/<yourarea>.js that default-exports an ARRAY of routes:
 *
 *        import { lazy } from 'react'
 *        import { pageHead } from '../router'
 *
 *        export default [
 *          {
 *            path: '/store/:category',              // ':name' segments become params
 *            component: lazy(() => import('../pages/StoreCategory')),
 *            props: { any: 'static props' },        // optional
 *            validate: (p) => KNOWN.has(p.category),// optional; false = skip route -> falls to 404
 *            head: (params) => pageHead({           // title/description -> og + twitter
 *              title: `Glaze Store: ${params.category}`,
 *              description: '...',
 *              path: `/store/${params.category}`,   // becomes the absolute canonical + og:url
 *              twitterCard: 'summary',              // optional, default summary_large_image
 *            }),
 *          },
 *        ]
 *
 *      `head` may also be a plain object. Anything pageHead() does not cover can be passed
 *      directly (see HEAD_DEFAULTS in router.jsx: ogTitle, image, robots, canonical, ...).
 *
 *   3. Switch the matching link from `${LIVE}/x` to '/x' where it is defined (NAV_LINKS in
 *      src/data/content.js, footer links in components/Footer.jsx, FAQ/showcase links). All of
 *      them render through <Link to=...>, which does pushState for local paths and falls back to
 *      a plain <a> for absolute URLs. Legal-page links auto-switch once a route exists.
 *
 * Matching: static segments beat ':params' (so /store/featured wins over /store/:category)
 * regardless of file order. Trailing slashes are ignored. Unmatched paths render NotFound.
 * The nav active state follows usePathname(); a nav link is active when its local href equals the
 * path or is a parent segment of it ('/' only matches '/').
 */
import { lazy } from 'react'
import Navbar from './components/Navbar'
import { createMatcher } from './router'

const modules = import.meta.glob('./route-modules/*.js', { eager: true })
export const routes = Object.values(modules).flatMap((m) => m.default)

export const match = createMatcher(routes)
export const hasRoute = (path) => match(path) !== null

// CLONE_SPEC section 3. Title "Page Not Found — Glaze"; robots noindex; no canonical / og:url.
export const notFoundRoute = {
  path: '*',
  component: lazy(() => import('./pages/NotFoundPage')),
  head: {
    title: 'Page Not Found — Glaze',
    ogTitle: 'Page Not Found — Glaze',
    twitterTitle: 'Page Not Found — Glaze',
    robots: 'noindex',
  },
}

// Persistent chrome: the nav lives outside the page so its active dot animates between routes.
function Layout({ children }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  )
}

export const routerProps = { match, notFound: notFoundRoute, layout: Layout }
