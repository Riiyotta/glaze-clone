import { LIVE } from '../data/content'
import { Link } from '../router'
import { RaycastMark, SOCIAL_LINKS, SocialIcon } from './icons'

const linkCls = 'py-1 text-text-tertiary transition-colors hover:text-text-secondary'

// CLONE_SPEC 2.3
export default function Footer() {
  return (
    <footer className="mt-auto px-4 pb-5 xs:pb-14">
      <div className="mx-auto flex max-w-page flex-col items-center justify-center gap-2.5 text-sm leading-5 text-text-tertiary">
        <div className="flex w-full flex-col items-center justify-center gap-2.5 min-[700px]:flex-row min-[700px]:gap-4">
          <div className="flex items-center justify-center gap-x-3 min-[380px]:gap-x-4">
            <span>Copyright © 2026</span>
            <a href="https://manual.glaze.app/" target="_blank" rel="noopener noreferrer" className={linkCls}>
              Manual
            </a>
            <Link to={`${LIVE}/blog`} className={linkCls}>
              Blog
            </Link>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 min-[380px]:gap-x-4">
            <Link to="/terms" className={linkCls}>
              Terms
            </Link>
            <Link to="/privacy" className={linkCls}>
              Privacy Policy
            </Link>
            <Link to="/aup" className={linkCls}>
              Acceptable Use
            </Link>
          </div>
        </div>
        <div className="flex w-full items-center justify-center gap-4 whitespace-nowrap min-[380px]:gap-5">
          <div className="flex items-center gap-2.5 min-[380px]:gap-4">
            {SOCIAL_LINKS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="flex h-6 w-6 items-center justify-center text-text-tertiary transition-colors hover:text-text-secondary"
              >
                <SocialIcon name={s.label} />
              </a>
            ))}
          </div>
          <a
            href="https://raycast.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-1.5 py-1 transition-colors hover:text-text-secondary"
          >
            Made by Raycast
            <RaycastMark />
          </a>
        </div>
      </div>
    </footer>
  )
}
