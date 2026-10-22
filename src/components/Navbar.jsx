import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { NAV_LINKS, SIGNUP_HREF, downloadHref } from '../data/content'
import { useNavDot } from '../motion'
import { Link, navigate, usePathname } from '../router'
import { RaycastMark, SOCIAL_LINKS, SocialIcon } from './icons'

const LOGO = '/assets/logo-full-DAu7MkQ8.svg'
const COLLAPSED_H = 52 // CLONE_SPEC 2.2
const HEADER_H = 50
const BORDER_Y = 2

// Local hrefs only: '/' matches exactly; others match themselves or a parent segment
// (so persona pages, legal pages and the 404 activate nothing).
function isActive(href, pathname) {
  if (!href.startsWith('/')) return false
  // Measured on live: Store is active on /store and on /app/* (real or unknown slug), but NOT on /store/<category>.
  if (href === '/store') return pathname === '/store' || pathname.startsWith('/app/')
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`)
}

export default function Navbar() {
  const pathname = usePathname()
  const activeIndex = NAV_LINKS.findIndex((l) => isActive(l.href, pathname))
  const linksRef = useRef(null)
  const dotStyle = useNavDot(linksRef, activeIndex)

  const [open, setOpen] = useState(false)
  const [openHeight, setOpenHeight] = useState(COLLAPSED_H)
  const contentRef = useRef(null)

  useLayoutEffect(() => {
    if (open && contentRef.current) {
      setOpenHeight(HEADER_H + contentRef.current.scrollHeight + BORDER_Y)
    }
  }, [open])

  // Live site locks page scroll while the mobile menu is open (body overflow hidden)
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 624) setOpen(false)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // CLONE_SPEC 2.2: close, then after 150ms set --bg / theme-color and navigate
  // (client-side for local paths, full navigation for glaze.app URLs that are not built yet).
  const onMobileLink = (e, href) => {
    e.preventDefault()
    setOpen(false)
    setTimeout(() => {
      const bg = '#121212'
      document.documentElement.style.setProperty('--bg', bg)
      document.body.style.setProperty('--bg', bg)
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', bg)
      if (href.startsWith('/')) navigate(href)
      else window.location.assign(href)
    }, 150)
  }

  return (
    <>
      {/* Mobile backdrop (CLONE_SPEC 2.2) */}
      <button
        type="button"
        aria-hidden="true"
        tabIndex={-1}
        onClick={() => setOpen(false)}
        className={`fixed inset-0 touch-none appearance-none border-0 bg-transparent p-0 backdrop-blur-[2.5px] transition-opacity duration-150 ease-out min-[624px]:hidden ${
          open ? 'z-[10001] opacity-100' : 'pointer-events-none z-40 opacity-0'
        }`}
      />

      <nav className={`site-navigation fixed left-0 right-0 top-2 px-4 min-[624px]:top-4 min-[624px]:px-0 ${open ? 'z-[10002]' : 'z-50'}`}>
        {/* Mobile panel (<624px) */}
        <div
          style={{ height: open ? openHeight : COLLAPSED_H, maxHeight: 'calc(100dvh - 16px)' }}
          className={`liquid-glass mobile-nav-panel mx-auto flex w-full origin-top flex-col overflow-hidden rounded-[26px] min-[624px]:hidden ${
            open ? 'mobile-nav-panel-open' : ''
          }`}
        >
          <div className="flex h-[50px] shrink-0 items-center justify-between pl-[18px] pr-[14px]">
            <Link aria-label="Go to home" className="flex h-[50px] shrink-0 items-center" to="/">
              <img src={LOGO} alt="Glaze" className="block h-6" draggable="false" />
            </Link>
            <button
              type="button"
              className="relative flex h-9 w-9 items-center justify-center rounded-full text-text-primary"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              <span className="relative h-5 w-5" aria-hidden="true">
                <span
                  className={`absolute left-0 top-[7px] h-0.5 w-5 rounded-full bg-current transition-transform duration-150 ease-out ${
                    open ? 'translate-y-[2px] rotate-45' : '-translate-y-[3px]'
                  }`}
                />
                <span
                  className={`absolute left-0 top-[11px] h-0.5 w-5 rounded-full bg-current transition-transform duration-150 ease-out ${
                    open ? '-translate-y-[2px] -rotate-45' : 'translate-y-[3px]'
                  }`}
                />
              </span>
            </button>
          </div>

          <div
            ref={contentRef}
            className={`min-h-0 overflow-y-auto px-[18px] pb-[18px] pt-[14px] transition-opacity duration-100 ease-out ${
              open ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
          >
            <div className="flex flex-col items-start gap-1.5">
              {NAV_LINKS.map((l, i) => (
                <a
                  key={l.label}
                  href={l.href}
                  onClick={(e) => onMobileLink(e, l.href)}
                  className={`block w-full font-display text-[30px] font-medium leading-[33px] transition-colors ${
                    i === activeIndex ? 'text-text-primary' : 'text-text-tertiary hover:text-text-primary'
                  }`}
                >
                  {l.label}
                </a>
              ))}
            </div>
            <div className="mt-6 h-[0.5px] w-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.14)_22%,rgba(255,255,255,0.14)_78%,transparent)]" />
            <div className="mt-4 flex flex-col items-start gap-1">
              <a
                href={SIGNUP_HREF}
                onClick={(e) => onMobileLink(e, SIGNUP_HREF)}
                className="block w-full text-left font-display text-2xl font-medium leading-[30px] text-text-tertiary transition-colors hover:text-text-primary"
              >
                Sign In
              </a>
            </div>
            <div className="mt-4 h-[0.5px] w-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.14)_22%,rgba(255,255,255,0.14)_78%,transparent)]" />
            <div className="mt-3 flex w-full items-center justify-between text-sm text-text-tertiary">
              <div className="flex items-center gap-3">
                {SOCIAL_LINKS.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="flex h-6 w-6 items-center justify-center transition-colors hover:text-text-secondary"
                  >
                    <SocialIcon name={s.label} />
                  </a>
                ))}
              </div>
              <a
                href="https://raycast.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-6 items-center gap-1.5 text-xs transition-colors hover:text-text-secondary"
              >
                Made by Raycast
                <RaycastMark />
              </a>
            </div>
          </div>
        </div>

        {/* Desktop pill (>=624px) */}
        <div
          data-anim="nav-in"
          className="liquid-glass mx-auto hidden h-12 w-fit items-center gap-6 rounded-full p-1.5 pl-[15px] min-[624px]:flex"
        >
          <Link aria-label="Go to home" className="shrink-0" to="/">
            <img src={LOGO} alt="Glaze" className="h-5" draggable="false" />
          </Link>
          <div ref={linksRef} className="relative flex items-center gap-4">
            {NAV_LINKS.map((l, i) => (
              <Link
                key={l.label}
                to={l.href}
                aria-current={i === activeIndex ? 'page' : undefined}
                className={`flex h-8 items-center text-sm font-medium leading-none transition-colors ${
                  i === activeIndex ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {l.label}
              </Link>
            ))}
            {/* Active dot (CLONE_SPEC 2.1 / M8): inline styles driven by useNavDot, as on the original */}
            <span data-anim="nav-dot" className="bg-text-secondary" style={dotStyle} />
          </div>
          <div className="flex shrink-0 items-center justify-end">
            <div className="flex items-center">
              <span aria-hidden="true" className="-ml-2 h-4 w-px shrink-0 bg-white/[0.12]" />
              <a
                href={SIGNUP_HREF}
                className="ml-4 shrink-0 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
              >
                Sign in
              </a>
              <a
                className="ml-3.5 inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-full bg-accent px-4 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50"
                href={downloadHref('nav_download')}
              >
                Download
              </a>
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}
