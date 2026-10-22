import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { LIVE, PERSONAS } from '../data/content'
import { ArrowRightIcon, CheckIcon, ChevronDownIcon, SQUIRCLE_PATH, TEAM_LOGOS, TeamLogo } from './icons'

function AppIconGlass({ src }) {
  const gid = `glaze-app-icon-border-${useId().replace(/:/g, '')}`
  const [loaded, setLoaded] = useState(false)
  return (
    <span className="glaze-app-icon-glass h-16 w-16 shrink-0 min-[600px]:h-28 min-[600px]:w-28">
      <span
        aria-hidden="true"
        className={`absolute inset-0 bg-white/[0.06] transition-opacity duration-200 ${loaded ? 'opacity-0' : 'animate-pulse opacity-100'}`}
      />
      <img
        alt=""
        src={src}
        draggable="false"
        ref={(el) => el?.complete && setLoaded(true)}
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        className={`absolute inset-0 h-full w-full scale-[1.19] object-cover transition-opacity duration-200 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
      <svg className="pointer-events-none absolute inset-0 z-20 h-full w-full" viewBox="0 0 64 64" preserveAspectRatio="none" fill="none" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="white" stopOpacity="0.45" />
            <stop offset="25%" stopColor="white" stopOpacity="0.12" />
            <stop offset="50%" stopColor="white" stopOpacity="0.06" />
            <stop offset="75%" stopColor="white" stopOpacity="0.1" />
            <stop offset="100%" stopColor="white" stopOpacity="0.25" />
          </linearGradient>
        </defs>
        <path d={SQUIRCLE_PATH} stroke={`url(#${gid})`} strokeWidth="2" vectorEffect="non-scaling-stroke" />
      </svg>
    </span>
  )
}

function AppCard({ app }) {
  return (
    <a
      aria-label={`Preview ${app.name}`}
      href={app.href}
      className="flex min-h-40 flex-col items-center justify-center rounded-2xl p-3 text-center transition-colors hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/30 min-[600px]:min-h-[232px]"
    >
      <AppIconGlass src={app.icon} />
      <div className="mt-3 w-full min-w-0 min-[600px]:mt-4">
        <div className="flex min-w-0 items-center justify-center gap-1">
          <h3 className="min-w-0 truncate text-md font-medium leading-snug text-text-primary min-[600px]:text-base min-[600px]:leading-snug">
            {app.name}
          </h3>
          {app.award && (
            <img alt={app.award.alt} draggable="false" src={app.award.src} className="ml-0.5 h-4 w-4 shrink-0 object-contain" />
          )}
        </div>
        <div className="mt-1.5 flex items-center justify-center gap-1.5 text-[13px] leading-4 text-text-secondary min-[600px]:mt-2.5">
          <img alt="" src={app.avatar} draggable="false" className="h-4 w-4 shrink-0 rounded-full object-cover" />
          <span className="truncate">{app.author}</span>
        </div>
      </div>
    </a>
  )
}

function BottomLink({ href, children }) {
  return (
    <a
      href={href}
      className="group mt-4 flex items-center gap-1.5 text-sm text-text-secondary transition-colors hover:text-text-primary min-[600px]:mt-8 min-[600px]:text-base"
    >
      {children}
      <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
    </a>
  )
}

const POPUP_OFFSET = 7
const POPUP_PADDING = 5

// <800px audience dropdown (CLONE_SPEC S2 "dropdown row" + "Menu")
function PersonaDropdown({ selected, onSelect }) {
  const [open, setOpen] = useState(false)
  const [highlight, setHighlight] = useState(-1)
  const [side, setSide] = useState('bottom')
  const rootRef = useRef(null)
  const triggerRef = useRef(null)
  const popupRef = useRef(null)
  const current = PERSONAS.find((p) => p.slug === selected)

  // Live site (Base UI Select, alignItemWithTrigger off): side bottom, align center, 7px offset,
  // flips to top when there is no room below (5px viewport padding).
  useLayoutEffect(() => {
    if (!open || !triggerRef.current || !popupRef.current) return
    const t = triggerRef.current.getBoundingClientRect()
    const h = popupRef.current.offsetHeight
    const below = window.innerHeight - t.bottom - POPUP_OFFSET - POPUP_PADDING
    const above = t.top - POPUP_OFFSET - POPUP_PADDING
    setSide(below < h && above > below ? 'top' : 'bottom')
  }, [open])

  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => {
      if (e.key !== 'Escape') return
      setOpen(false)
      triggerRef.current?.focus()
    }
    // Live site locks page scroll while the select popup is open (body overflow hidden)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="flex items-center justify-center min-[800px]:hidden">
      <span className="pr-3 text-sm font-medium text-text-secondary">Make apps for</span>
      <div ref={rootRef} className="relative">
        <button
          ref={triggerRef}
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-label="Choose an audience"
          data-popup-open={open ? '' : undefined}
          onClick={() => setOpen((v) => !v)}
          className="liquid-glass group flex h-11 shrink-0 items-center gap-2 rounded-full px-4 text-base font-medium text-text-primary shadow-dropdown-trigger transition-colors hover:bg-surface-panel"
        >
          <span className="max-w-[128px] truncate xs:max-w-[150px]">{current.label}</span>
          <span aria-hidden="true">
            <ChevronDownIcon className="h-4 w-4 text-text-secondary transition-transform group-data-[popup-open]:rotate-180 xs:h-3.5 xs:w-3.5" />
          </span>
        </button>
        {open && (
          <div
            ref={popupRef}
            role="listbox"
            aria-label="Choose an audience"
            data-side={side}
            style={{ transformOrigin: side === 'top' ? '50% calc(100% + 7px)' : '50% -7px' }}
            className={`absolute left-1/2 z-50 w-52 -translate-x-1/2 ${side === 'top' ? 'bottom-full mb-[7px]' : 'top-full mt-[7px]'} rounded-popover border border-white/10 bg-surface-popover p-1.5 text-sm font-medium text-white shadow-dropdown-menu backdrop-blur-xl`}
            onMouseLeave={() => setHighlight(-1)}
          >
            {PERSONAS.map((p, i) => {
              const isSel = p.slug === selected
              return (
                <button
                  key={p.slug}
                  type="button"
                  role="option"
                  aria-selected={isSel}
                  onMouseEnter={() => setHighlight(i)}
                  onClick={() => {
                    onSelect(p.slug)
                    setOpen(false)
                    triggerRef.current?.focus()
                  }}
                  className={`flex h-9 w-full items-center gap-2 rounded-option px-2 text-left xs:h-8 ${
                    isSel ? 'bg-white/10' : highlight === i ? 'bg-white/5' : ''
                  }`}
                >
                  <span className="flex-1 truncate">{p.label}</span>
                  <CheckIcon className={`h-4 w-4 shrink-0 ${isSel ? 'opacity-100' : 'opacity-0'}`} />
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default function PersonaShowcase({ initialPersona = 'personal' }) {
  const [selected, setSelected] = useState(initialPersona)
  // SPEC_legal_persona A.2: reset the tab when the route's initialPersona changes client-side.
  useEffect(() => setSelected(initialPersona), [initialPersona])
  const persona = PERSONAS.find((p) => p.slug === selected)
  const tabRefs = useRef([])

  const onTabKey = (e, i) => {
    let next = null
    if (e.key === 'ArrowRight') next = (i + 1) % PERSONAS.length
    if (e.key === 'ArrowLeft') next = (i - 1 + PERSONAS.length) % PERSONAS.length
    if (next === null) return
    e.preventDefault()
    setSelected(PERSONAS[next].slug)
    tabRefs.current[next]?.focus()
  }

  return (
    <div className="mt-[160px] xs:mt-[256px]">
      <section className="px-4" aria-labelledby="persona-showcase-title">
        <div className="mx-auto flex max-w-page flex-col items-center overflow-visible rounded-2xl p-4 min-[600px]:p-8">
          <div className="w-full py-1">
            {/* >=800px tabs */}
            <div className="hidden items-center justify-center gap-1 min-[800px]:flex">
              <span className="flex h-[34px] shrink-0 items-center pl-4 pr-2.5 text-sm font-medium text-text-secondary">Make apps for</span>
              <div role="tablist" aria-label="Choose an audience" className="flex gap-1 rounded-full bg-white/[0.025] p-[3px]">
                {PERSONAS.map((p, i) => {
                  const isSel = p.slug === selected
                  return (
                    <button
                      key={p.slug}
                      ref={(el) => (tabRefs.current[i] = el)}
                      type="button"
                      role="tab"
                      id={`persona-tab-${p.slug}`}
                      aria-controls="persona-panel"
                      aria-selected={isSel}
                      tabIndex={isSel ? 0 : -1}
                      onClick={() => setSelected(p.slug)}
                      onKeyDown={(e) => onTabKey(e, i)}
                      className={`h-[34px] shrink-0 rounded-full px-3.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45 ${
                        isSel ? 'bg-white/[0.08] text-text-primary' : 'text-text-secondary hover:bg-white/[0.04] hover:text-text-primary'
                      }`}
                    >
                      {p.label}
                    </button>
                  )
                })}
              </div>
            </div>
            {/* <800px dropdown */}
            <PersonaDropdown selected={selected} onSelect={setSelected} />
          </div>

          {/* Re-keyed per persona so the Animation pass can replay fade-in (CLONE_SPEC M3) */}
          <div
            key={persona.slug}
            id="persona-panel"
            role="tabpanel"
            aria-labelledby={`persona-tab-${persona.slug}`}
            tabIndex={-1}
            data-anim="persona-panel"
            className="dialog-focus-surface animate-fade-in mt-9 w-full xs:mt-10"
          >
            <div className="mx-auto max-w-page text-center">
              <h2
                id="persona-showcase-title"
                className="text-balance font-display text-2xl font-medium leading-tight tracking-tight text-text-primary min-[600px]:text-3xl min-[600px]:leading-tight"
              >
                {persona.title}
              </h2>
              <p className="mx-auto mt-2 text-balance text-sm leading-snug text-text-secondary min-[600px]:text-base min-[600px]:leading-relaxed">
                {persona.description}
              </p>
            </div>
            <div className="mt-4 min-[600px]:mt-6">
              <div className="flex flex-col items-center">
                {persona.apps ? (
                  <>
                    <div className="grid w-full grid-cols-2 gap-1 min-[600px]:grid-cols-4">
                      {persona.apps.slice(0, 4).map((a) => (
                        <AppCard key={a.slug} app={a} />
                      ))}
                    </div>
                    <BottomLink href={`${LIVE}/store`}>Explore the Glaze Store</BottomLink>
                  </>
                ) : (
                  <>
                    <ul className="grid min-h-[320px] w-full grid-cols-2 items-center gap-y-12 min-[600px]:flex min-[600px]:min-h-[232px] min-[600px]:w-auto min-[600px]:flex-wrap min-[600px]:items-center min-[600px]:justify-center min-[600px]:gap-x-32 min-[600px]:gap-y-12">
                      {TEAM_LOGOS.map((l) => (
                        <li key={l.name} className="flex flex-col items-center gap-3 text-white min-[600px]:gap-5">
                          <TeamLogo d={l.d} label={l.name} className="h-14 w-14 min-[600px]:h-[72px] min-[600px]:w-[72px]" />
                          <span className="text-sm font-medium min-[600px]:text-base">{l.name}</span>
                        </li>
                      ))}
                    </ul>
                    <BottomLink href={`${LIVE}/blog/how-we-use-glaze-at-raycast`}>See how teams use Glaze</BottomLink>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
