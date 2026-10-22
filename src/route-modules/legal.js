import { lazy } from 'react'
import { pageHead } from '../router'

// SPEC_legal_persona B.5: all three also set twitter:card=summary.
const legal = (path, component, title, description) => ({
  path,
  component,
  head: () => pageHead({ title, description, path, twitterCard: 'summary' }),
})

export default [
  legal(
    '/terms',
    lazy(() => import('../pages/Terms')),
    'Glaze Terms of Service',
    'Terms of Service for Glaze by Raycast.',
  ),
  legal(
    '/privacy',
    lazy(() => import('../pages/Privacy')),
    'Glaze Privacy Policy',
    'Privacy Policy for Glaze by Raycast.',
  ),
  legal(
    '/aup',
    lazy(() => import('../pages/Aup')),
    'Glaze Platform Acceptable Use Policy (including Platform Terms of Use)',
    'Acceptable Use Policy for the Glaze platform.',
  ),
]
