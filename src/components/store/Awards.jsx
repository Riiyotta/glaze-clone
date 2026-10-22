import { Link } from '../../router'
import { AWARDS } from '../../data/content'

const LABEL = { gold: 'Gold', silver: 'Silver', bronze: 'Bronze' }

// 16px inline medal after a card title (SPEC_store 1.4)
export function AwardInline({ result }) {
  const a = AWARDS[result]
  if (!a) return null
  return <img alt={a.alt} src={a.src} width="16" height="16" draggable="false" className="ml-0.5 size-4 shrink-0 object-contain" />
}

export function AwardPill({ result, interactive = false }) {
  const a = AWARDS[result]
  if (!a) return null
  return (
    <Link
      to="/awards"
      aria-label={`View Glaze Awards: ${LABEL[result]}`}
      className={`shrink-0 rounded-full ${interactive ? 'pointer-events-auto relative z-20' : ''}`}
      onClick={(e) => e.stopPropagation()}
    >
      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/35 py-1 pl-1.5 pr-2 text-xs font-medium leading-4 text-white backdrop-blur-md transition-colors hover:border-white/15 hover:bg-white/10">
        <img alt="" src={a.src} width="14" height="14" draggable="false" className="size-3.5 object-contain" />
        {LABEL[result]}
      </span>
    </Link>
  )
}
