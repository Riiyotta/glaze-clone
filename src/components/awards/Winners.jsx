import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { WINNERS, FINALISTS } from '../../data/awards'
import { XIcon } from '../icons'
import { ArrowUpRight } from './ArrowUpRight'
import AppCard from './AppCard'
import AppIcon from './AppIcon'
import { AppLink } from './links'

const MEDALS = {
  gold: { label: 'Gold', src: '/assets/award-gold@2x-C2t6avtW.png' },
  silver: { label: 'Silver', src: '/assets/award-silver@2x-Bg8X11yF.png' },
  bronze: { label: 'Bronze', src: '/assets/award-bronze@2x-CZBT3HSE.png' },
}

function WinnerCard({ w, onOpen }) {
  const m = MEDALS[w.tier]
  return (
    <button
      type="button"
      aria-label={`${m.label} winner: ${w.name}`}
      onClick={(e) => onOpen(w, e.currentTarget)}
      className="dialog-focus-surface relative flex flex-col items-center gap-2 rounded-2xl border border-border-separator px-8 py-12 text-center transition-colors hover:bg-white/[0.06]"
    >
      <span className="absolute left-4 top-4 flex items-center gap-2">
        <img src={m.src} alt="" className="size-6 object-contain" />
        <span className="text-base font-medium leading-6 text-white">{m.label}</span>
      </span>
      <AppIcon src={w.icon} className="h-20 w-20" />
      <span className="mt-1 font-display text-lg font-medium leading-tight text-white">{w.name}</span>
      <span className="line-clamp-2 max-w-[320px] text-balance text-sm leading-relaxed text-text-secondary">{w.tagline}</span>
      <span className="mt-1 flex items-center gap-1.5 text-sm">
        {w.avatar && <img src={w.avatar} alt="" className="h-4 w-4 rounded-full object-cover" />}
        <span className="truncate text-text-secondary">{w.author}</span>
      </span>
    </button>
  )
}

// Winner details overlay. The URL does not change (SPEC_marketing 3.3). The original renders the
// full store app page here; that page belongs to the store, so this is a minimal summary with the
// "Open as a full page" link (top-right, 44x44).
function WinnerDialog({ w, onClose, returnFocus }) {
  const closeRef = useRef(null)
  useEffect(() => {
    closeRef.current?.focus()
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
      if (returnFocus?.isConnected) returnFocus.focus()
    }
  }, [onClose, returnFocus])
  const m = MEDALS[w.tier]
  const ctl =
    'flex h-11 w-11 items-center justify-center rounded-full border border-glass-border bg-close-btn text-white shadow-close-btn backdrop-blur-[12px] backdrop-saturate-[1.8] transition-colors hover:border-white/[0.14] hover:bg-close-btn-hover focus-visible:outline-none'
  // Portaled: the page wrapper's fade-in animation creates a stacking context that would trap z-[80]/z-[90] under the nav.
  return createPortal(
    <>
      <div
        aria-hidden="true"
        onClick={onClose}
        className="awards-lightbox-in fixed inset-0 z-[80] bg-black/75 backdrop-blur-[5px]"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${w.name} details`}
        className="awards-lightbox-in fixed left-1/2 top-1/2 z-[90] flex h-[calc(100dvh-28px)] max-h-[800px] w-[calc(100%-32px)] max-w-page -translate-x-1/2 -translate-y-1/2 xs:h-[calc(100dvh-72px)]"
      >
        <div className="relative flex w-full flex-col items-center justify-center overflow-y-auto rounded-[32px] border border-white/10 bg-[#121212] px-6 py-16 text-center shadow-2xl xs:rounded-[44px]">
          <div className="absolute right-4 top-4 z-20 flex gap-2 xs:right-6 xs:top-6">
            <AppLink slug={w.slug} aria-label={`Open ${w.name} as a full page`} className={ctl}>
              <ArrowUpRight />
            </AppLink>
            <button ref={closeRef} type="button" aria-label="Close" onClick={onClose} className={ctl}>
              <XIcon size={20} />
            </button>
          </div>
          <span className="mb-6 flex items-center gap-2">
            <img src={m.src} alt="" className="size-6 object-contain" />
            <span className="text-base font-medium leading-6 text-white">{m.label} winner</span>
          </span>
          <AppIcon src={w.icon} className="h-[112px] w-[112px]" />
          <h2 className="mt-6 font-display text-3xl font-medium leading-tight tracking-tight text-white">{w.name}</h2>
          <p className="mt-2 max-w-[420px] text-balance text-base leading-relaxed text-text-secondary">{w.tagline}</p>
          <p className="mt-3 flex items-center gap-1.5 text-sm text-text-secondary">
            {w.avatar && <img src={w.avatar} alt="" className="h-4 w-4 rounded-full object-cover" />}
            {w.author}
          </p>
        </div>
      </div>
    </>,
    document.body,
  )
}

export default function Winners() {
  const [open, setOpen] = useState(null)
  const [trigger, setTrigger] = useState(null)
  const onOpen = useCallback((w, el) => {
    setOpen(w)
    setTrigger(el)
  }, [])
  const onClose = useCallback(() => setOpen(null), [])
  const [gold, silver, bronze] = WINNERS
  return (
    <div className="mt-10 px-4 xs:mt-14">
      <section className="dialog-focus-surface mx-auto max-w-page">
        <div className="flex flex-col gap-3">
          <WinnerCard w={gold} onOpen={onOpen} />
          <div className="grid gap-3 min-[624px]:grid-cols-2">
            <WinnerCard w={silver} onOpen={onOpen} />
            <WinnerCard w={bronze} onOpen={onOpen} />
          </div>
        </div>
        <h2 className="mb-4 mt-16 truncate text-lg font-medium leading-[22px] text-white xs:mt-20">Finalists</h2>
        <div className="grid grid-cols-2 gap-x-5 gap-y-1 md:grid-cols-3 min-[1920px]:grid-cols-4">
          {FINALISTS.map((a) => (
            <AppCard key={a.slug} app={a} />
          ))}
        </div>
      </section>
      {open && <WinnerDialog w={open} onClose={onClose} returnFocus={trigger} />}
    </div>
  )
}
