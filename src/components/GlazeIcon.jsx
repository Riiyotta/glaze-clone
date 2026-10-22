import { useRef } from 'react'
import { useIconParticles } from '../motion'

// Shared icon used by the Download CTA (S5) and the 404 page (section 3), with the
// flying-icons burst (CLONE_SPEC M7). Like the original, each icon owns its fixed z-9999
// particle layer and spawns from the centre of the icon wrapper's bounding box.
// `fixedSize` (/download, SPEC_marketing 2.1): 112px at every width, mb-8.
export default function GlazeIcon({ onBurst, compact = false, fixedSize = false }) {
  const iconRef = useRef(null)
  const { containerRef, spawnParticles } = useIconParticles()

  const handleClick = () => {
    const el = iconRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    spawnParticles(r.left + r.width / 2, r.top + r.height / 2)
    if (onBurst) onBurst({ layer: containerRef.current, icon: el })
  }

  return (
    <>
      <div ref={containerRef} data-particle-layer className="pointer-events-none fixed inset-0 z-[9999]" />
      <div className="relative z-[10000]">
        <div
          ref={iconRef}
          data-anim="icon-particles"
          onClick={handleClick}
          onContextMenu={(e) => e.preventDefault()}
          style={{ WebkitTouchCallout: 'none', WebkitUserSelect: 'none' }}
          className={`waitlist-icon-glow ${fixedSize ? 'mb-8' : compact ? 'mb-7 xs:mb-8' : 'mb-10'} touch-manipulation select-none transition-transform duration-300 ease-out hover:scale-105 active:scale-95`}
        >
          <img
            alt="Glaze"
            src="/assets/app-icon-PC60coqE.png"
            draggable="false"
            className={`pointer-events-none select-none ${fixedSize ? 'h-[112px] w-[112px]' : compact ? 'h-16 w-16 xs:h-20 xs:w-20' : 'h-20 w-20 xs:h-[112px] xs:w-[112px]'}`}
          />
        </div>
      </div>
    </>
  )
}
