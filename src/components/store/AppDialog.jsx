import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { getApp } from '../../data/store'
import AppDetail from './AppDetail'
import { LIcon } from './StoreIcons'
import '../../store.css'

// Landing-page app-details dialog (SPEC_store 7). `slugs` = the persona's apps, for ArrowRight.
export default function AppDialog({ slug, slugs, onChange, onClose }) {
  const app = getApp(slug)
  const ref = useRef(null)
  const scrollRef = useRef(null)
  const cb = useRef({})
  cb.current = { slug, slugs, onChange, onClose }

  useEffect(() => {
    ref.current?.focus()
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        cb.current.onClose()
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        const { slugs, slug, onChange } = cb.current
        const known = slugs.filter(getApp)
        const next = known[known.indexOf(slug) + (e.key === 'ArrowRight' ? 1 : -1)]
        if (next) {
          e.preventDefault()
          onChange(next)
        }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [])
  useEffect(() => {
    scrollRef.current?.scrollTo(0, 0)
  }, [slug])

  // Apps missing from the snapshot (not cloned) fall back to the live store page.
  useEffect(() => {
    if (!app) {
      onClose()
      window.location.assign(`https://www.glaze.app/app/${slug}`)
    }
  }, [app, slug, onClose])
  if (!app) return null
  const known = slugs.filter(getApp)
  const at = known.indexOf(slug)
  const navBtn = 'flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.08] bg-close-btn text-white shadow-close-btn backdrop-blur-[12px] backdrop-saturate-[180%] transition-colors xs:h-11 xs:w-11'
  return createPortal(
    <div>
      <div className="animate-lightbox-in fixed inset-0 z-[80] bg-background/75 backdrop-blur-[5px]" onClick={onClose} />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={`${app.name} details`}
        tabIndex={-1}
        className="dialog-focus-surface animate-lightbox-in fixed left-1/2 top-1/2 z-[90] flex h-[calc(100dvh-28px)] max-h-[800px] w-[calc(100%-32px)] max-w-page -translate-x-1/2 -translate-y-1/2 flex-col outline-none xs:h-[calc(100dvh-72px)]"
      >
        <button
          type="button"
          aria-label="Close app details"
          onClick={onClose}
          className="absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.08] bg-close-btn text-white shadow-close-btn backdrop-blur-[12px] backdrop-saturate-[180%] transition-colors hover:border-white/[0.14] hover:bg-close-btn-hover xs:right-6 xs:top-6 xs:h-10 xs:w-10 focus-visible:ring-2 focus-visible:ring-white/45"
        >
          <LIcon name="x" size={20} strokeWidth={2.25} />
        </button>
        <div className="relative min-h-0 flex-1 overflow-hidden rounded-[32px] border border-border-separator bg-[#121212] shadow-2xl xs:rounded-[44px]">
          <div ref={scrollRef} className="dialog-scroll-area h-full overflow-y-auto">
            <section className="px-6 pb-14 pt-6">
              <div className="mx-auto flex max-w-page flex-col gap-6">
                <AppDetail key={app.slug} app={app} dialog onNavigate={onClose} />
              </div>
            </section>
          </div>
        </div>
        {known.length > 1 && (
          <div className="mt-3 flex shrink-0 items-center justify-center gap-3">
            {[-1, 1].map((d) => {
              const disabled = !known[at + d]
              return (
                <button
                  key={d}
                  type="button"
                  disabled={disabled}
                  aria-label={d < 0 ? 'Previous app' : 'Next app'}
                  onClick={() => onChange(known[at + d])}
                  className={`${navBtn} ${disabled ? 'opacity-[.35]' : 'hover:border-white/[0.14] hover:bg-close-btn-hover'}`}
                >
                  <LIcon name={d < 0 ? 'chevron-left' : 'chevron-right'} size={20} />
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
