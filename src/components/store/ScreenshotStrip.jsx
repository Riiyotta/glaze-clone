import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { assetDims, assetUrl } from '../../data/store'
import { LIcon } from './StoreIcons'

// Lightbox (SPEC_store 6.7): solid black backdrop (0.2s ease-out fade), 70vw current image,
// 60vw clickable peeks at +/-50% offsets, 40px close button, "1 / N" pill, arrows, Esc.
function Lightbox({ shots, start, onClose }) {
  const [i, setI] = useState(start)
  const ref = useRef(null)
  const n = shots.length
  const go = useCallback((d) => setI((v) => Math.min(n - 1, Math.max(0, v + d))), [n])

  useEffect(() => {
    const returnTo = document.activeElement
    ref.current?.focus()
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        e.stopImmediatePropagation() // keep a parent dialog open
        onClose()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        e.stopImmediatePropagation()
        go(1)
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        e.stopImmediatePropagation()
        go(-1)
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => {
      window.removeEventListener('keydown', onKey, true)
      document.body.style.overflow = prevOverflow
      returnTo?.focus?.()
    }
  }, [go, onClose])

  const peek = (idx, side) => (
    <img
      key={idx}
      alt=""
      src={assetUrl(shots[idx])}
      draggable="false"
      onClick={() => setI(idx)}
      className={`absolute top-1/2 max-h-[80vh] w-[60vw] -translate-y-1/2 cursor-pointer rounded-xl object-contain opacity-60 ${side === 'r' ? 'right-[-50%]' : 'left-[-50%]'}`}
    />
  )
  const [w, h] = assetDims(shots[i], [1344, 1008])
  return createPortal(
    <div className="fixed inset-0 z-[200]">
      <div className="animate-lightbox-in fixed inset-0 bg-black" onClick={onClose} />
      <div ref={ref} role="dialog" aria-modal="true" aria-label="Screenshot gallery" tabIndex={-1} className="dialog-focus-surface fixed inset-0 outline-none" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <button
          type="button"
          aria-label="Close gallery"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 h-10 w-10 rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 xs:right-6 xs:top-6"
        >
          <LIcon name="x" size={20} strokeWidth={2.25} className="mx-auto" />
        </button>
        {i > 0 && peek(i - 1, 'l')}
        {i < n - 1 && peek(i + 1, 'r')}
        <img
          alt={`Screenshot ${i + 1}`}
          src={assetUrl(shots[i])}
          width={w}
          height={h}
          draggable="false"
          className="absolute left-1/2 top-1/2 max-h-[80vh] w-[70vw] -translate-x-1/2 -translate-y-1/2 rounded-xl object-contain"
        />
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-sm tabular-nums leading-5 text-white/70">
          {i + 1} / {n}
        </div>
      </div>
    </div>,
    document.body,
  )
}

const arrowBtn =
  'grid size-9 place-items-center rounded-full border border-white/[0.12] bg-white/10 text-white/90 shadow-[0_10px_28px_rgba(0,0,0,.28)] backdrop-blur-[12px]'

export default function ScreenshotStrip({ shots }) {
  const stripRef = useRef(null)
  const [edge, setEdge] = useState({ left: false, right: false })
  const [open, setOpen] = useState(null)

  const measure = useCallback(() => {
    const el = stripRef.current
    if (!el) return
    setEdge({ left: el.scrollLeft > 1, right: el.scrollLeft + el.clientWidth < el.scrollWidth - 1 })
  }, [])
  useEffect(() => {
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [measure, shots])

  const scrollStep = (d) => {
    const el = stripRef.current
    const kids = [...el.children]
    const lefts = kids.map((k) => k.offsetLeft - 16)
    const target = d > 0 ? lefts.find((l) => l > el.scrollLeft + 4) : [...lefts].reverse().find((l) => l < el.scrollLeft - 4)
    el.scrollTo({ left: target ?? (d > 0 ? el.scrollWidth : 0), behavior: 'smooth' })
  }

  const fade = (side, on) => (
    <div
      className={`pointer-events-none absolute inset-y-0 z-30 w-16 from-background to-transparent transition-opacity duration-300 ${side === 'l' ? 'left-0 bg-gradient-to-r' : 'right-0 bg-gradient-to-l'} ${on ? 'opacity-100' : 'opacity-0'}`}
    />
  )

  return (
    <div className="relative -mx-4 h-[220px] xs:h-[260px]">
      <div
        ref={stripRef}
        onScroll={measure}
        className="hide-scrollbar flex h-full gap-3 overflow-x-auto px-4"
        style={{ scrollSnapType: 'x mandatory', overscrollBehaviorX: 'contain', scrollPadding: '0 16px' }}
      >
        {shots.map((url, k) => {
          const [w, h] = assetDims(url, [346, 260])
          return (
            <img
              key={url}
              alt={`Screenshot ${k + 1}`}
              src={assetUrl(url)}
              width={w}
              height={h}
              loading="lazy"
              decoding="async"
              draggable="false"
              onClick={() => setOpen(k)}
              onLoad={measure}
              className="h-full w-auto shrink-0 cursor-pointer rounded-lg object-cover"
              style={{ scrollSnapAlign: 'start' }}
            />
          )
        })}
      </div>
      {fade('l', edge.left)}
      {fade('r', edge.right)}
      {edge.left && (
        <div className="absolute inset-y-0 left-0 z-40 flex w-20 items-center justify-center">
          <button type="button" aria-label="Previous screenshot" onClick={() => scrollStep(-1)} className={arrowBtn}>
            <LIcon name="chevron-left" size={20} />
          </button>
        </div>
      )}
      {edge.right && (
        <div className="absolute inset-y-0 right-0 z-40 flex w-20 items-center justify-center">
          <button type="button" aria-label="Next screenshot" onClick={() => scrollStep(1)} className={arrowBtn}>
            <LIcon name="chevron-right" size={20} />
          </button>
        </div>
      )}
      {open !== null && <Lightbox shots={shots} start={open} onClose={() => setOpen(null)} />}
    </div>
  )
}
