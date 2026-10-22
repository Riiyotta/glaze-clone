import { useId, useState } from 'react'
import { FALLBACK_ICON, iconUrl } from '../../data/store'
import { SQUIRCLE_PATH } from '../icons'

// Squircle glass icon (SPEC_store 1.3). `size` carries the Tailwind h/w classes.
export default function AppIcon({ app, size = 'h-14 w-14', eager = false, px = 56 }) {
  const gid = `store-icon-border-${useId().replace(/:/g, '')}`
  const [loaded, setLoaded] = useState(false)
  const [src, setSrc] = useState(iconUrl(app))
  return (
    <span className={`glaze-app-icon-glass shrink-0 ${size}`}>
      <span
        aria-hidden="true"
        className={`absolute inset-0 bg-white/[0.06] transition-opacity duration-200 ${loaded ? 'opacity-0' : 'opacity-100'}`}
      />
      <img
        alt=""
        src={src}
        width={px}
        height={px}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        draggable="false"
        ref={(el) => el?.complete && el.naturalWidth && setLoaded(true)}
        onLoad={() => setLoaded(true)}
        onError={() => {
          if (src !== FALLBACK_ICON) setSrc(FALLBACK_ICON)
          else setLoaded(true)
        }}
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
