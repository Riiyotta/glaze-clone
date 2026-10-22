import { useEffect, useMemo, useRef, useState } from 'react'

const NAV_EVENT = 'glaze:navigate' // dispatched by router.navigate()

// Reactive window.location.search (the router only re-renders on pathname changes).
export function useSearchParams() {
  const [search, setSearch] = useState(() => window.location.search)
  useEffect(() => {
    const sync = () => setSearch(window.location.search)
    window.addEventListener('popstate', sync)
    window.addEventListener(NAV_EVENT, sync)
    return () => {
      window.removeEventListener('popstate', sync)
      window.removeEventListener(NAV_EVENT, sync)
    }
  }, [])
  return useMemo(() => new URLSearchParams(search), [search])
}

// Grid column count (SPEC_store 4.4): <480 1, 480-767 2, 768-1919 3, >=1920 4.
const COLS = [
  ['(min-width: 1920px)', 4],
  ['(min-width: 768px)', 3],
  ['(min-width: 480px)', 2],
]
const readCols = () => (COLS.find(([q]) => window.matchMedia(q).matches) || [null, 1])[1]
export function useColumns() {
  const [cols, setCols] = useState(readCols)
  useEffect(() => {
    const mqs = COLS.map(([q]) => window.matchMedia(q))
    const sync = () => setCols(readCols())
    mqs.forEach((m) => m.addEventListener('change', sync))
    sync()
    return () => mqs.forEach((m) => m.removeEventListener('change', sync))
  }, [])
  return cols
}

// Horizontal trackpad wheel navigation (SPEC_store 4.1): 6px threshold, 180ms gesture gap,
// one step per gesture. Vertical scroll is never hijacked.
export function useWheelNav(ref, onNav) {
  const cb = useRef(onNav)
  cb.current = onNav
  useEffect(() => {
    const el = ref.current
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
      cb.current(e.deltaX > 0 ? 1 : -1)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [ref])
}
