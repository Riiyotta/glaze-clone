import { useEffect, useState } from 'react'

// SPEC_blog 2.4. Gallery of all post images; keys: arrows (clamped), Esc; backdrop click closes.
export default function Lightbox({ images, start, onClose }) {
  const [i, setI] = useState(start)
  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowLeft') setI((v) => Math.max(0, v - 1))
      else if (e.key === 'ArrowRight') setI((v) => Math.min(images.length - 1, v + 1))
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [images.length, onClose])

  const cur = images[i]
  const prev = images[i - 1]
  const next = images[i + 1]
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Screenshot gallery"
      className="fixed inset-0 z-[200] overflow-hidden"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black" style={{ animation: 'lightbox-in .2s ease-out both' }} />
      {prev && (
        <img
          src={prev.full}
          alt={prev.alt}
          draggable="false"
          onClick={(e) => { e.stopPropagation(); setI(i - 1) }}
          className="absolute top-1/2 w-[60vw] max-h-[80vh] -translate-y-1/2 cursor-pointer rounded-xl object-contain opacity-60"
          style={{ left: '-50%' }}
        />
      )}
      {next && (
        <img
          src={next.full}
          alt={next.alt}
          draggable="false"
          onClick={(e) => { e.stopPropagation(); setI(i + 1) }}
          className="absolute top-1/2 w-[60vw] max-h-[80vh] -translate-y-1/2 cursor-pointer rounded-xl object-contain opacity-60"
          style={{ right: '-50%' }}
        />
      )}
      <img
        src={cur.full}
        alt={cur.alt}
        draggable="false"
        onClick={(e) => e.stopPropagation()}
        className="absolute left-1/2 top-1/2 w-[70vw] max-h-[80vh] -translate-x-1/2 -translate-y-1/2 rounded-xl object-contain"
      />
      <button
        type="button"
        aria-label="Close"
        onClick={(e) => { e.stopPropagation(); onClose() }}
        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 xs:right-6 xs:top-6"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
      <div
        onClick={(e) => e.stopPropagation()}
        className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-sm tabular-nums text-white/70"
      >
        {i + 1} / {images.length}
      </div>
    </div>
  )
}
