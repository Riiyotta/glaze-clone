import { lazy } from 'react'
import { getPost } from '../data/blog'
import { pageHead } from '../router'

const SITE = 'https://www.glaze.app'

export default [
  {
    path: '/blog',
    component: lazy(() => import('../pages/BlogIndex')),
    head: pageHead({
      title: 'Glaze Blog',
      description:
        'Notes from the Glaze team on building personal desktop software, publishing apps, and shaping the future of local tools.',
      path: '/blog',
    }),
  },
  {
    path: '/blog/:slug',
    component: lazy(() => import('../pages/BlogPost')),
    validate: (p) => !!getPost(p.slug),
    head: (params) => {
      const post = getPost(params.slug)
      return {
        ...pageHead({ title: `${post.title} — Glaze Blog`, description: post.excerpt, path: `/blog/${post.slug}` }),
        image: `${SITE}${post.cover}`,
      }
    },
  },
  {
    path: '/changelog',
    component: lazy(() => import('../pages/Changelog')),
    head: pageHead({
      title: 'Changelog — Glaze',
      description: "See what's new in Glaze, from new features to fixes.",
      path: '/changelog',
    }),
  },
]
