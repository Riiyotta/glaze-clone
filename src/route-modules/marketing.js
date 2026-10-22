import { lazy } from 'react'
import { pageHead } from '../router'

// SPEC_marketing section 0 (static head per route). og:image / twitter:card use the router defaults.
export default [
  {
    path: '/pricing',
    component: lazy(() => import('../pages/Pricing')),
    head: () =>
      pageHead({
        title: 'Glaze Pricing — Plans for building desktop apps with AI',
        description:
          'Glaze pricing plans. Start free with your Claude subscription and welcome credits, or go Pro from $10/month to build and publish more desktop apps. Private team stores are free during Beta.',
        path: '/pricing',
      }),
  },
  {
    path: '/download',
    component: lazy(() => import('../pages/Download')),
    // Live /download has no canonical and no og:url (measured); the default title/description apply.
    head: () => ({
      title: 'Glaze — Build and Share Mac Apps with AI',
      description: 'Create software for you and your team. Lives on your Mac, connects to your files, tools and hardware.',
      ogTitle: 'Glaze — Build and Share Mac Apps with AI',
      ogDescription: 'Create software for you and your team. Lives on your Mac, connects to your files, tools and hardware.',
      twitterTitle: 'Glaze — Build and Share Mac Apps with AI',
      twitterDescription: 'Create software for you and your team. Lives on your Mac, connects to your files, tools and hardware.',
      canonical: null,
    }),
  },
  {
    path: '/awards',
    component: lazy(() => import('../pages/Awards')),
    head: () =>
      pageHead({
        title: 'Glaze Awards · July 23–27',
        description: "Build the app you've always wanted with Glaze from July 23 to 27 and compete for $24,500 in cash prizes.",
        path: '/awards',
      }),
  },
  {
    path: '/awards/terms',
    component: lazy(() => import('../pages/AwardsTerms')),
    head: () =>
      pageHead({
        title: 'Glaze Awards: Terms & Conditions',
        description: 'Terms & Conditions for the Glaze Awards by Raycast.',
        path: '/awards/terms',
      }),
  },
]
