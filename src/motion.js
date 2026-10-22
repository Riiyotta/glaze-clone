import { useCallback, useEffect, useRef, useState } from 'react'

// Motion ported 1:1 from the live glaze.app bundle (index-BNXJhYAk.js, animate-in-D3qAuuH8.js,
// landing-page-BoLE0uv2.js). Values are the original's, not approximations.

/* ---------------------------------------------------------------- M1/M2/M3 AnimateIn */
// Original AnimateIn: inline {opacity:0, animationDelay}, class `animate-in` (fade-in-up .6s ease-out both)
// or `animate-fade-in` (fade-in .6s ease-out both). Every instance on `/` is `immediate`.
export function animStyle(delayMs) {
  return delayMs ? { opacity: 0, animationDelay: `${delayMs}ms` } : { opacity: 0 }
}

/* ---------------------------------------------------------------- M5 mobile video autoplay */
function noop() {}
export function useMobileAutoplay() {
  const ref = useRef(null)
  useEffect(() => {
    if (!window.matchMedia('(max-width: 623px)').matches) return
    const v = ref.current
    if (!v) return
    v.muted = true
    v.defaultMuted = true
    v.playsInline = true
    v.setAttribute('muted', '')
    v.setAttribute('playsinline', '')
    v.setAttribute('webkit-playsinline', '')
    const play = () => {
      if (v.paused) v.play().catch(noop)
    }
    const onVis = () => {
      if (document.visibilityState === 'visible') play()
    }
    const extra = []
    const onAnimStart = () => extra.push(window.setTimeout(play, 50))
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) play()
    })
    const timers = [0, 100, 400, 900].map((ms) => window.setTimeout(play, ms))
    v.addEventListener('canplay', play)
    v.addEventListener('loadeddata', play)
    window.addEventListener('pageshow', play)
    document.addEventListener('visibilitychange', onVis)
    io.observe(v)
    const ancestors = []
    let p = v.parentElement
    while (p && p !== document.body) {
      if (p.style.opacity === '0') {
        p.addEventListener('animationstart', onAnimStart)
        p.addEventListener('animationend', play)
        ancestors.push(p)
      }
      p = p.parentElement
    }
    return () => {
      timers.forEach(window.clearTimeout)
      extra.forEach(window.clearTimeout)
      v.removeEventListener('canplay', play)
      v.removeEventListener('loadeddata', play)
      window.removeEventListener('pageshow', play)
      document.removeEventListener('visibilitychange', onVis)
      ancestors.forEach((a) => {
        a.removeEventListener('animationstart', onAnimStart)
        a.removeEventListener('animationend', play)
      })
      io.disconnect()
    }
  }, [])
  return ref
}

/* ---------------------------------------------------------------- M6 FAQ dim */
// IO threshold [0, .35]; above viewport top -> visible = ratio >= .35, else visible.
export function useScrollPastDim() {
  const ref = useRef(null)
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => (e.boundingClientRect.top < 0 ? setVisible(e.intersectionRatio >= 0.35) : setVisible(true)),
      { threshold: [0, 0.35] },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return { ref, visible }
}

/* ---------------------------------------------------------------- M8 nav active dot */
const DOT_BASE = { position: 'absolute', width: 3, height: 3, borderRadius: '50%', pointerEvents: 'none', opacity: 0 }
const dotHide = (s) => ({ ...s, opacity: 0, transform: 'translateY(4px)', transition: 'opacity 0.2s ease-in, transform 0.2s ease-in' })
const dotShow = (s) => ({ ...s, opacity: 1, transform: 'translateY(0)', transition: 'opacity 0.3s ease-out, transform 0.3s ease-out' })

export function useNavDot(containerRef, activeIndex) {
  const [style, setStyle] = useState(DOT_BASE)
  const prev = useRef(null)
  const update = useCallback(() => {
    const before = prev.current
    const active = activeIndex >= 0 ? activeIndex : null
    prev.current = active
    if (active !== null) {
      const c = containerRef.current
      const link = c && c.querySelectorAll('a')[active]
      if (!link) return
      const cr = c.getBoundingClientRect()
      const lr = link.getBoundingClientRect()
      const pos = { left: lr.left - cr.left + lr.width / 2 - 1.5, top: lr.bottom - cr.top - 4 }
      if (before === null) {
        setStyle({ ...DOT_BASE, ...pos, opacity: 0, transform: 'translateY(4px)', transition: 'none' })
        requestAnimationFrame(() => requestAnimationFrame(() => setStyle(dotShow)))
      } else {
        setStyle((s) => ({
          ...s,
          ...pos,
          opacity: 1,
          transform: 'translateY(0)',
          transition: 'left 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.3s ease-out, transform 0.3s ease-out',
        }))
      }
      return
    }
    if (before !== null) setStyle(dotHide)
  }, [containerRef, activeIndex])

  useEffect(() => {
    update()
  }, [update])
  useEffect(() => {
    window.addEventListener('resize', update)
    document.fonts.ready.then(update)
    return () => window.removeEventListener('resize', update)
  }, [update])
  return style
}

/* ---------------------------------------------------------------- M7 icon particles */
export const PARTICLE_ICONS = [
  '/assets/app-icon1-B6nyDjUn.png', '/assets/app-icon2-DjnGgdo3.png', '/assets/app-icon3-CJBSEBl6.png',
  '/assets/app-icon4-aPALpHlP.png', '/assets/app-icon5-Cqa_0ar_.png', '/assets/app-icon6-1ZpMIA6w.png',
  '/assets/app-icon7-BrPwq4JI.png', '/assets/app-icon8-nORZcwze.png', '/assets/app-icon9-rnjqIe5j.png',
  '/assets/app-icon10-CkBmQBFY.png', '/assets/app-icon11-BLP9K6-T.png', '/assets/app-icon12-r_ceZ9Ek.png',
  '/assets/app-icon13-BT4UL4Qn.png', '/assets/app-icon14-C80wEv97.png', '/assets/app-icon15-_lEqsNc-.png',
  '/assets/app-icon16-Djwb4XYP.png', '/assets/app-icon17-Dq0CjLqB.png',
]
let preloaded = false
function preloadIcons() {
  if (preloaded) return
  preloaded = true
  PARTICLE_ICONS.forEach((src) => {
    const img = new Image()
    img.src = src
  })
}
if (typeof window !== 'undefined') (window.requestIdleCallback ?? ((cb) => setTimeout(cb, 200)))(preloadIcons)

const PER_BURST = 4
const MAX_LIVE = 40
const GRAVITY = 2400
const DRAG = 0.99
// Original quirk kept on purpose: JS centring size is 56 below 768px while CSS draws the
// particle at 64px (<600) / 107px (>=600), so the offset does not match the box between 0-767px.
const particleSize = () => (window.innerWidth < 768 ? 56 : 107)
const rand = (a, b) => Math.random() * (b - a) + a
const noCtx = (e) => e.preventDefault()

export function useIconParticles() {
  const containerRef = useRef(null)
  const particles = useRef([])
  const raf = useRef(0)
  const running = useRef(false)
  const lastT = useRef(0)
  const lastPicks = useRef([])

  const step = useCallback((now) => {
    const dt = lastT.current ? Math.min((now - lastT.current) / 1000, 0.05) : 1 / 60
    lastT.current = now
    const list = particles.current
    const vh = window.innerHeight
    let i = list.length
    while (i--) {
      const p = list[i]
      if (p.dead) {
        p.el.remove()
        list.splice(i, 1)
        continue
      }
      p.vy += GRAVITY * dt
      p.vx *= DRAG
      p.x += p.vx * dt
      p.y += p.vy * dt
      p.rotation += p.rotationSpeed * dt
      if (p.y > vh + particleSize() * 2) {
        p.dead = true
        continue
      }
      const h = particleSize() / 2
      p.el.style.transform = `translate(${p.x - h}px, ${p.y - h}px) rotate(${p.rotation}deg)`
    }
    if (list.length > 0) raf.current = requestAnimationFrame(step)
    else {
      running.current = false
      lastT.current = 0
    }
  }, [])

  const spawnParticles = useCallback(
    (x, y) => {
      const layer = containerRef.current
      if (!layer) return
      const list = particles.current
      while (list.length + PER_BURST > MAX_LIVE) {
        const old = list.shift()
        if (old) old.el.remove()
      }
      const fresh = PARTICLE_ICONS.filter((s) => !lastPicks.current.includes(s))
      const picks = [...(fresh.length >= PER_BURST ? fresh : PARTICLE_ICONS)].sort(() => Math.random() - 0.5)
      lastPicks.current = picks.slice(0, PER_BURST)
      const narrow = window.innerWidth < 600
      for (let k = 0; k < PER_BURST; k++) {
        const angle = narrow
          ? Math.random() < 0.5
            ? rand(-Math.PI * 0.65, -Math.PI * 0.55)
            : rand(-Math.PI * 0.45, -Math.PI * 0.35)
          : Math.random() < 0.5
            ? rand(-Math.PI * 0.75, -Math.PI * 0.58)
            : rand(-Math.PI * 0.42, -Math.PI * 0.25)
        const speed = narrow ? rand(650, 1100) : rand(800, 1400)
        const el = document.createElement('div')
        el.className = 'icon-particle'
        el.style.cssText = '-webkit-touch-callout: none; -webkit-user-select: none; user-select: none;'
        el.oncontextmenu = noCtx
        const img = document.createElement('img')
        img.src = picks[k]
        img.draggable = false
        img.style.cssText = '-webkit-touch-callout: none; -webkit-user-select: none; user-select: none; pointer-events: none;'
        el.appendChild(img)
        const h = particleSize() / 2
        el.style.transform = `translate(${x - h}px, ${y - h}px)`
        layer.appendChild(el)
        list.push({
          el,
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          rotation: rand(-20, 20),
          rotationSpeed: rand(-360, 360),
          dead: false,
        })
      }
      if (!running.current) {
        running.current = true
        lastT.current = 0
        raf.current = requestAnimationFrame(step)
      }
    },
    [step],
  )

  useEffect(() => () => raf.current && cancelAnimationFrame(raf.current), [])
  return { containerRef, spawnParticles }
}
