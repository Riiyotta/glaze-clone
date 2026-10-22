import { useCallback, useEffect, useRef, useState } from 'react'
import { navigate } from '../../router'
import { APPS, FEATURED, assetUrl, iconUrl } from '../../data/store'
import AppIcon from './AppIcon'
import { AwardPill } from './Awards'
import { LIcon } from './StoreIcons'

// Featured hero carousel (SPEC_store 4.1): 5-slide window, 4000 ms autoplay, 260 ms ease-out slide,
// pointer drag, horizontal wheel, queued clicks, infinite wrap.
const N = FEATURED.length
const GAP = 16
const SLIDE_MS = 260
const mod = (n) => ((n % N) + N) % N

const cardWidth = () => {
  const vw = window.innerWidth
  return vw >= 1920 ? Math.min(1440, vw - 48) : Math.min(960, vw - 32)
}

function coverFor(f) {
  const app = APPS[f.slug]
  return assetUrl(f.cover || app.featuredImage || app.screenshots[0]) || iconUrl(app)
}

export default function HeroCarousel() {
  const [active, setActive] = useState(0)
  const [offset, setOffset] = useState(0)
  const [ms, setMs] = useState(0)
  const [W, setW] = useState(cardWidth)
  const [hovered, setHovered] = useState(false)
  const busy = useRef(false)
  const queue = useRef([])
  const drag = useRef(null)
  const moved = useRef(false)
  const trackRef = useRef(null)
  const timers = useRef([])

  useEffect(() => {
    const onResize = () => setW(cardWidth())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const step = W + GAP
  const later = (fn, t) => timers.current.push(setTimeout(fn, t))

  const run = useCallback(
    (dir, duration = SLIDE_MS) => {
      busy.current = true
      setMs(duration)
      setOffset(-dir * step)
      later(() => {
        setMs(0)
        setActive((a) => mod(a + dir))
        setOffset(0)
        // replay queued navigation after 2 frames
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            busy.current = false
            const next = queue.current.shift()
            if (next) go(next)
          }),
        )
      }, duration)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [step],
  )
  const go = useCallback(
    (dir) => {
      if (busy.current) queue.current.push(dir)
      else run(dir)
    },
    [run],
  )
  const goRef = useRef(go)
  goRef.current = go

  // Autoplay: paused while hovered, animating or dragging.
  useEffect(() => {
    if (hovered) return
    const id = setInterval(() => {
      if (!busy.current && !drag.current) goRef.current(1)
    }, 4000)
    return () => clearInterval(id)
  }, [hovered])

  // Horizontal wheel (passive:false so it can preventDefault)
  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    let last = 0
    let fired = false
    const onWheel = (e) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY) || Math.abs(e.deltaX) < 6) return
      e.preventDefault()
      const now = performance.now()
      if (now - last > 180) fired = false
      last = now
      if (fired) return
      fired = true
      goRef.current(e.deltaX > 0 ? 1 : -1)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  const onPointerDown = (e) => {
    if (busy.current || e.button > 0) return
    drag.current = { x: e.clientX, y: e.clientY, dir: null, id: e.pointerId }
    moved.current = false
  }
  const onPointerMove = (e) => {
    const d = drag.current
    if (!d) return
    const dx = e.clientX - d.x
    const dy = e.clientY - d.y
    if (d.dir === null) {
      if (Math.hypot(dx, dy) < 6) return
      if (Math.abs(dy) > Math.abs(dx)) {
        drag.current = null
        return
      }
      d.dir = 'x'
      e.currentTarget.setPointerCapture?.(e.pointerId)
    }
    moved.current = true
    setMs(0)
    setOffset(Math.max(-step, Math.min(step, dx)))
  }
  const onPointerUp = (e) => {
    const d = drag.current
    drag.current = null
    if (!d || d.dir !== 'x') return
    const dx = e.clientX - d.x
    const threshold = Math.min(Math.max(W * 0.16, 72), 140)
    if (Math.abs(dx) >= threshold) {
      // finish from the current drag offset toward the next slide
      const dir = dx < 0 ? 1 : -1
      busy.current = true
      setMs(220)
      setOffset(-dir * step)
      later(() => {
        setMs(0)
        setActive((a) => mod(a + dir))
        setOffset(0)
        requestAnimationFrame(() => requestAnimationFrame(() => (busy.current = false)))
      }, 220)
    } else {
      setMs(180)
      setOffset(0)
    }
    setTimeout(() => (moved.current = false), 0)
  }

  const slides = [-2, -1, 0, 1, 2].map((o) => FEATURED[mod(active + o)])
  const dotGo = (i) => {
    const d = i - active
    if (d === 0) return
    if (Math.abs(d) === 1 || Math.abs(d) === N - 1) go(Math.abs(d) === 1 ? d : d > 0 ? -1 : 1)
    else if (!busy.current) setActive(i)
  }

  return (
    <section
      className="store-hero group/carousel relative left-1/2 flex w-screen -translate-x-1/2 flex-col gap-4 overflow-hidden"
      aria-roledescription="carousel"
      aria-label="Featured apps"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative">
        <div
          ref={trackRef}
          className="relative select-none overflow-hidden"
          style={{ touchAction: 'pan-y pinch-zoom' }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onContextMenu={(e) => e.preventDefault()}
        >
          <div
            className="flex gap-[16px]"
            style={{
              transform: `translateX(calc((100vw - var(--featured-card-width)) / 2 - 2 * (var(--featured-card-width) + var(--featured-card-gap)) + ${offset}px))`,
              transition: ms ? `transform ${ms}ms ease-out` : 'none',
            }}
          >
            {slides.map((f, k) => {
              const app = APPS[f.slug]
              const isActive = k === 2
              const open = () => navigate(`/app/${app.slug}`)
              return (
                <div
                  key={`${f.slug}-${k}`}
                  role="button"
                  tabIndex={isActive ? 0 : -1}
                  aria-label={`Open ${app.name}`}
                  aria-hidden={isActive ? undefined : 'true'}
                  onClick={() => !moved.current && open()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      open()
                    }
                  }}
                  className="group relative h-[clamp(220px,38vw,360px)] w-[var(--featured-card-width)] shrink-0 cursor-pointer overflow-hidden rounded-2xl focus-visible:shadow-none focus-visible:ring-2 focus-visible:ring-white/55 min-[1920px]:h-[clamp(360px,38vw,480px)] xs:rounded-3xl"
                >
                  <img
                    alt=""
                    src={coverFor(f)}
                    width="1920"
                    height="815"
                    draggable="false"
                    loading={isActive ? 'eager' : 'lazy'}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/[0.12] to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 z-30 flex items-end gap-5 p-4 xs:p-5">
                    <div className="pointer-events-none flex min-w-0 items-center gap-3">
                      <AppIcon app={app} size="h-14 w-14 xs:h-16 xs:w-16" px={64} eager={isActive} />
                      <div className="flex min-h-14 min-w-0 flex-col justify-center gap-0.5 xs:min-h-16">
                        <div className="flex min-w-0 items-center gap-2">
                          <h1 className="truncate text-lg font-semibold leading-[22px] text-white">{app.name}</h1>
                          {app.award && app.award !== 'finalist' && <AwardPill result={app.award} interactive />}
                        </div>
                        <p className="line-clamp-1 text-sm font-medium leading-4 text-white/[0.72] xs:leading-[17px]">{app.tagline}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        {[-1, 1].map((d) => (
          <button
            key={d}
            type="button"
            aria-label={d < 0 ? 'Previous featured app' : 'Next featured app'}
            onClick={() => go(d)}
            style={{ width: 'max(80px, calc((100vw - var(--featured-card-width)) / 2))' }}
            className={`carousel-edge-button absolute inset-y-0 z-40 hidden items-center justify-center xs:flex ${d < 0 ? 'left-0' : 'right-0'}`}
          >
            <span className="edge-glass liquid-glass flex size-9 items-center justify-center rounded-full shadow-dropdown-trigger">
              <LIcon
                name={d < 0 ? 'chevron-left' : 'chevron-right'}
                size={20}
                className="text-white"
                style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,.55))', transform: `translateX(${d}px)` }}
              />
            </span>
          </button>
        ))}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-30 hidden w-[min(18vw,220px)] bg-gradient-to-r from-background to-transparent xl:block" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-30 hidden w-[min(18vw,220px)] bg-gradient-to-l from-background to-transparent xl:block" />
      </div>
      <div className="flex justify-center gap-1 xs:gap-1.5">
        {FEATURED.map((f, i) => (
          <button
            key={f.slug}
            type="button"
            tabIndex={-1}
            aria-label={`Show ${APPS[f.slug].name}`}
            onClick={() => dotGo(i)}
            className={`h-[3px] w-7 rounded-full transition-all xs:h-1 xs:w-9 ${i === active ? 'bg-white' : 'bg-white/20 hover:bg-white/35'}`}
          />
        ))}
      </div>
    </section>
  )
}
