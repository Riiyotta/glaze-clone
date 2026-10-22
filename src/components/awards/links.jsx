import { Link } from '../../router'
import { getApp } from '../../data/store'

const LIVE = 'https://www.glaze.app'

// /app/<slug> stays local only when the slug exists in the store snapshot.
export function AppLink({ slug, children, ...rest }) {
  const path = `/app/${slug}`
  if (getApp(slug)) return <Link to={path} {...rest}>{children}</Link>
  return (
    <a href={`${LIVE}${path}`} {...rest}>
      {children}
    </a>
  )
}
