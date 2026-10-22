import { lazy } from 'react'
import { HEAD_DEFAULTS, pageHead } from '../router'

const Landing = lazy(() => import('../pages/Landing'))

export default [
  {
    path: '/',
    component: Landing,
    head: () => pageHead({ title: HEAD_DEFAULTS.title, description: HEAD_DEFAULTS.description, path: '/' }),
  },
]
