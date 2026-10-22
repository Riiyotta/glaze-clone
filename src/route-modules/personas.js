import { lazy } from 'react'
import { PERSONA_PAGES, personaTitle } from '../data/personas'
import { pageHead } from '../router'

const Landing = lazy(() => import('../pages/Landing'))

// SPEC_legal_persona A.1/A.5. Only these five slugs exist; /design, /development, /creativity,
// /personal, /fun and /productivity are intentionally NOT registered, so they render the 404 (A.3).
export default Object.entries(PERSONA_PAGES).map(([slug, persona]) => ({
  path: `/${slug}`,
  component: Landing,
  props: persona,
  head: () =>
    pageHead({
      title: personaTitle(persona),
      description: persona.heroSubheadline,
      path: `/${slug}`,
    }),
}))
