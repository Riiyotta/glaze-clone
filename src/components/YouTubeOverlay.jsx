import { useEffect, useRef } from 'react'
import { XIcon } from './icons'

// CLONE_SPEC section 4 "Overlays": no entrance animation.
export default function YouTubeOverlay({ video, onClose }) {
  const closeRef = useRef(null)
  useEffect(() => {
    if (!video) return
    // a11y: remember the trigger, move focus into the dialog, and give it back on close.
    const trigger = document.activeElement
    closeRef.current?.focus()
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
      if (trigger instanceof HTMLElement && trigger.isConnected) trigger.focus()
    }
  }, [video, onClose])

  if (!video) return null
  const src = `${video.src}?autoplay=1&rel=0&modestbranding=1&showinfo=0&controls=1&color=white`

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Video"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        ref={closeRef}
        type="button"
        aria-label="Close video"
        onClick={onClose}
        className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-glass-border bg-close-btn text-white shadow-close-btn backdrop-blur-[12px] backdrop-saturate-[1.8] transition-colors hover:border-white/[0.14] hover:bg-close-btn-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45 xs:right-6 xs:top-6 xs:h-10 xs:w-10"
      >
        <XIcon size={20} />
      </button>
      <div
        className="mx-4 w-full max-w-[900px] rounded-[12px] border border-white/10"
        style={{ aspectRatio: video.aspect }}
        onClick={(e) => e.stopPropagation()}
      >
        <iframe
          className="h-full w-full rounded-[12px]"
          src={src}
          title="Video"
          allow="autoplay; encrypted-media"
          allowFullScreen
        />
      </div>
    </div>
  )
}
