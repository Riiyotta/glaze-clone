import { Link } from '../../router'
import { LIcon } from './StoreIcons'

// Window algorithm from SPEC_store 5 (pages(p,t)); a one-number gap is filled, larger becomes an ellipsis.
export function pageWindow(p, t) {
  let set
  if (t <= 5) set = new Set(Array.from({ length: t }, (_, i) => i + 1))
  else if (p <= 3) set = new Set([1, 2, 3, 4, t])
  else if (p >= t - 2) set = new Set([1, t - 3, t - 2, t - 1, t])
  else set = new Set([1, t, p - 1, p, p + 1])
  const sorted = [...set].sort((a, b) => a - b)
  const out = []
  sorted.forEach((n, i) => {
    const prev = sorted[i - 1]
    if (prev !== undefined && n - prev === 2) out.push(prev + 1)
    else if (prev !== undefined && n - prev > 2) out.push('…')
    out.push(n)
  })
  return out
}

const nav = 'inline-flex h-8 items-center gap-1 rounded-full text-sm font-medium text-text-secondary'

export default function Pagination({ page, pageCount, hrefFor }) {
  if (pageCount <= 1) return null
  const prevDisabled = page <= 1
  const nextDisabled = page >= pageCount
  return (
    <nav aria-label="Pagination" className="mt-8 grid h-8 grid-cols-[1fr_auto_1fr] items-center">
      <div className="flex justify-start">
        {prevDisabled ? (
          <span aria-disabled="true" className={`${nav} pl-1 pr-3 opacity-[.35]`}>
            <LIcon name="chevron-left" size={16} />
            <span className="hidden xs:inline">Previous</span>
          </span>
        ) : (
          <Link to={hrefFor(page - 1)} className={`${nav} pl-1 pr-3 hover:bg-white/10 hover:text-white`}>
            <LIcon name="chevron-left" size={16} />
            <span className="hidden xs:inline">Previous</span>
          </Link>
        )}
      </div>
      <div className="flex items-center justify-center gap-1">
        {pageWindow(page, pageCount).map((n, k) =>
          n === '…' ? (
            <span key={`e${k}`} className="grid size-8 place-items-center text-sm font-normal text-text-tertiary">…</span>
          ) : (
            <Link
              key={n}
              to={hrefFor(n)}
              aria-label={`Page ${n}`}
              aria-current={n === page ? 'page' : undefined}
              className={`grid size-8 place-items-center rounded-full text-sm font-medium transition-colors ${
                n === page ? 'bg-white/10 text-white' : 'text-text-secondary hover:bg-white/10 hover:text-white'
              }`}
            >
              {n}
            </Link>
          ),
        )}
      </div>
      <div className="flex justify-end">
        {nextDisabled ? (
          <span aria-disabled="true" className={`${nav} pl-3 pr-1 opacity-[.35]`}>
            <span className="hidden xs:inline">Next</span>
            <LIcon name="chevron-right" size={16} />
          </span>
        ) : (
          <Link to={hrefFor(page + 1)} className={`${nav} pl-3 pr-1 hover:bg-white/10 hover:text-white`}>
            <span className="hidden xs:inline">Next</span>
            <LIcon name="chevron-right" size={16} />
          </Link>
        )}
      </div>
    </nav>
  )
}
