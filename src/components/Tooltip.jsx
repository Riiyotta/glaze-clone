import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

// Tooltip / popover primitive, SPEC_marketing section 0: opens on hover or focus (and on click),
// closes on leave, blur, Esc or outside press. Opacity-only 150ms cubic-bezier(.4,0,.2,1), no delay.
// `render(triggerProps, open)` draws the trigger; the panel is absolutely positioned around the wrapper.
const FADE_MS = 150
const EDGE = 12 // keep the panel this far from the viewport edge (the original's collision padding is unmeasured)
const GAP = 8 // trigger-to-panel gap: not measured in the spec

export default function Tooltip({ side = 'top', panelClassName = '', content, children, wrapperClassName = '' }) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)
  const [shift, setShift] = useState(0)
  const wrapRef = useRef(null)
  const panelRef = useRef(null)
  const timer = useRef(0)

  useEffect(() => {
    clearTimeout(timer.current)
    if (open) {
      setMounted(true)
      const raf = requestAnimationFrame(() => setVisible(true))
      return () => cancelAnimationFrame(raf)
    }
    setVisible(false)
    timer.current = window.setTimeout(() => setMounted(false), FADE_MS)
    return () => clearTimeout(timer.current)
  }, [open])

  useLayoutEffect(() => {
    if (!mounted || !panelRef.current) return
    const el = panelRef.current
    const r = el.getBoundingClientRect()
    const vw = document.documentElement.clientWidth
    const left = r.left - shift
    const right = r.right - shift
    let dx = 0
    if (left < EDGE) dx = EDGE - left
    else if (right > vw - EDGE) dx = vw - EDGE - right
    setShift(dx)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    const onDown = (e) => wrapRef.current && !wrapRef.current.contains(e.target) && setOpen(false)
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onDown)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onDown)
    }
  }, [open])

  const onOpen = useCallback(() => setOpen(true), [])
  const onClose = useCallback(() => setOpen(false), [])

  const triggerProps = {
    'aria-expanded': open,
    onMouseEnter: onOpen,
    onMouseLeave: onClose,
    onFocus: onOpen,
    onBlur: onClose,
    onClick: onOpen,
  }

  return (
    <span ref={wrapRef} className={`relative inline-flex ${wrapperClassName}`}>
      {children(triggerProps)}
      {mounted && (
        <span
          className={`absolute left-1/2 z-[20010] ${side === 'top' ? 'bottom-full' : 'top-full'}`}
          style={{
            transform: `translateX(calc(-50% + ${shift}px))`,
            [side === 'top' ? 'marginBottom' : 'marginTop']: GAP,
            pointerEvents: 'none',
          }}
        >
          <span
            ref={panelRef}
            role="tooltip"
            className={`block rounded-lg border border-white/10 bg-[#222222f2] px-3 py-2.5 text-left text-xs font-normal leading-[19.5px] text-white shadow-lg transition-opacity duration-150 ease-[cubic-bezier(.4,0,.2,1)] ${panelClassName}`}
            style={{ opacity: visible ? 1 : 0 }}
          >
            {content}
          </span>
        </span>
      )}
    </span>
  )
}
