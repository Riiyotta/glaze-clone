import { useEffect, useId, useRef, useState } from 'react'
import { SQUIRCLE_PATH } from '../icons'

// SPEC_marketing 3.9 `.glaze-app-icon-glass`: squircle mask + gloss (CSS in index.css), image
// scaled 1.19 to crop the source icon's own margin, 0.06-white placeholder until it loads,
// and a gradient SVG border with a per-instance id.
export default function AppIcon({ src, className = '' }) {
  const gid = useId()
  const [loaded, setLoaded] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    setLoaded(false)
    if (ref.current?.complete && ref.current.naturalWidth) setLoaded(true)
  }, [src])
  return (
    <span className={`glaze-app-icon-glass ${className}`}>
      <span
        className={`absolute inset-0 bg-white/[.06] transition-opacity duration-200 ${loaded ? 'opacity-0' : 'opacity-100'}`}
      />
      {src && (
        <img
          ref={ref}
          src={src}
          alt=""
          draggable="false"
          onLoad={() => setLoaded(true)}
          className="absolute inset-0 h-full w-full scale-[1.19] object-cover transition-opacity duration-200"
          style={{ opacity: loaded ? 1 : 0 }}
        />
      )}
      <svg
        viewBox="0 0 64 64"
        preserveAspectRatio="none"
        fill="none"
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-20 h-full w-full"
      >
        <defs>
          <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fff" stopOpacity=".45" />
            <stop offset="25%" stopColor="#fff" stopOpacity=".12" />
            <stop offset="50%" stopColor="#fff" stopOpacity=".06" />
            <stop offset="75%" stopColor="#fff" stopOpacity=".10" />
            <stop offset="100%" stopColor="#fff" stopOpacity=".25" />
          </linearGradient>
        </defs>
        <path d={SQUIRCLE_PATH} stroke={`url(#${gid})`} strokeWidth="2" vectorEffect="non-scaling-stroke" />
      </svg>
    </span>
  )
}
