import { lazy } from 'react'
import { pageHead } from '../router'
import { CATEGORY_META, CATEGORY_PAGE_COUNTS, STORE_DESCRIPTION, STORE_TITLE } from '../data/store-meta'
import { STORE_HEAD_INDEX } from '../data/store-head-index'

import { appTitle } from '../data/store-title'

const APP_NOT_FOUND_HEAD = { title: 'App Not Found — Glaze', ogTitle: 'App Not Found — Glaze', twitterTitle: 'App Not Found — Glaze', robots: 'noindex' }

const Store = lazy(() => import('../pages/Store'))

export default [
  {
    path: '/store',
    component: Store,
    head: pageHead({ title: STORE_TITLE, description: STORE_DESCRIPTION, path: '/store' }),
  },
  {
    path: '/store/:category',
    component: Store,
    validate: (p) => Object.prototype.hasOwnProperty.call(CATEGORY_META, p.category),
    // Live canonical keeps ?page=N (N > 1, clamped to the page count) and drops it when ?q= is set.
    head: (p, search = '') => {
      const sp = new URLSearchParams(search)
      const count = CATEGORY_PAGE_COUNTS[p.category] || 1
      const page = sp.get('q') ? 1 : Math.min(Math.max(1, parseInt(sp.get('page') || '1', 10) || 1), count)
      return pageHead({
        title: CATEGORY_META[p.category].title,
        description: CATEGORY_META[p.category].description,
        path: `/store/${p.category}${page > 1 ? `?page=${page}` : ''}`,
      })
    },
  },
  {
    path: '/app/:slug',
    component: lazy(() => import('../pages/AppPage')),
    // Unknown slugs still match: AppPage renders the live "App not found" template.
    head: (p) => {
      if (!Object.prototype.hasOwnProperty.call(STORE_HEAD_INDEX, p.slug)) return APP_NOT_FOUND_HEAD
      const [name, tagline] = STORE_HEAD_INDEX[p.slug]
      return pageHead({
        title: appTitle(name, tagline),
        description: `${name}. ${tagline}. A desktop app built with Glaze for macOS.`,
        path: `/app/${p.slug}`,
      })
    },
  },
]
