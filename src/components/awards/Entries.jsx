import { useEffect, useMemo, useRef, useState } from 'react'
import { ENTRIES, PAGE_SIZE, TOTAL_ENTRIES } from '../../data/awards'
import { ChevronLeftIcon, ChevronRightIcon, ClearIcon, SearchIcon } from '../marketing-icons'
import AppCard from './AppCard'

// Below 624px the search pill starts as a 40px icon button and expands on tap (live behavior,
// measured at 390/500/600/623; the spec's 210x40 is the expanded state).
function useWide() {
  const [wide, setWide] = useState(() => window.matchMedia('(min-width: 624px)').matches)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 624px)')
    const on = () => setWide(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return wide
}

const DEBOUNCE_MS = 300 // spec: not captured precisely, ~300ms

function readUrl() {
  const sp = new URLSearchParams(window.location.search)
  const q = sp.get('entriesQuery') || ''
  const n = parseInt(sp.get('entriesPage') || '1', 10)
  return { q, page: Number.isFinite(n) && n > 0 ? n : 1 }
}

function writeUrl({ q, page }, push) {
  const sp = new URLSearchParams(window.location.search)
  if (q) sp.set('entriesQuery', q)
  else sp.delete('entriesQuery')
  if (page > 1 && !q) sp.set('entriesPage', String(page))
  else sp.delete('entriesPage')
  const qs = sp.toString()
  const url = window.location.pathname + (qs ? `?${qs}` : '') + window.location.hash
  if (url === window.location.pathname + window.location.search + window.location.hash) return
  history[push ? 'pushState' : 'replaceState'](null, '', url)
}

// SPEC_marketing 3.5: 1 2 3 4 … 21 | 1 … 18 19 20 21 | 1 … 5 6 7 … 21
function pageWindow(cur, last) {
  if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1)
  if (cur <= 3) return [1, 2, 3, 4, '…', last]
  if (cur >= last - 2) return [1, '…', last - 3, last - 2, last - 1, last]
  return [1, '…', cur - 1, cur, cur + 1, '…', last]
}

const navBtn =
  'inline-flex h-8 items-center gap-1 rounded-full text-sm font-medium text-text-secondary transition-colors hover:bg-white/10 hover:text-white disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-text-secondary'

export default function Entries() {
  const initial = useMemo(readUrl, [])
  const [input, setInput] = useState(initial.q)
  const [query, setQuery] = useState(initial.q)
  const [page, setPage] = useState(initial.page)
  const rootRef = useRef(null)
  const inputRef = useRef(null)
  const wide = useWide()
  const [open, setOpen] = useState(false)
  const expanded = wide || open || input !== ''
  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  // back/forward
  useEffect(() => {
    const onPop = () => {
      const u = readUrl()
      setQuery(u.q)
      setInput(u.q)
      setPage(u.page)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  // debounce typing -> applied query + URL
  useEffect(() => {
    if (input === query) return
    const t = setTimeout(() => {
      setQuery(input.trim() ? input : '')
      setPage(1)
      writeUrl({ q: input.trim() ? input : '', page: 1 }, false)
    }, DEBOUNCE_MS)
    return () => clearTimeout(t)
  }, [input, query])

  const q = query.trim().toLowerCase()
  const searching = q.length > 0
  const results = useMemo(
    () => (searching ? ENTRIES.filter((e) => `${e.name} ${e.author} ${e.tagline}`.toLowerCase().includes(q)) : ENTRIES),
    [q, searching],
  )
  const last = Math.max(1, Math.ceil(TOTAL_ENTRIES / PAGE_SIZE))
  const cur = Math.min(page, last)
  const shown = searching ? results : ENTRIES.slice((cur - 1) * PAGE_SIZE, cur * PAGE_SIZE)

  const go = (n) => {
    setPage(n)
    writeUrl({ q: '', page: n }, true)
    rootRef.current?.scrollIntoView({ block: 'start' })
  }

  const clear = () => {
    setInput('')
    setQuery('')
    setPage(1)
    setOpen(false)
    writeUrl({ q: '', page: 1 }, false)
  }

  const heading = searching
    ? `${results.length} Search Result${results.length === 1 ? '' : 's'}`
    : `Browse ${TOTAL_ENTRIES} Entries`

  return (
    <div id="entries" ref={rootRef} className="mt-24 scroll-mt-28 px-4 xs:mt-32">
      <section className="mx-auto max-w-page">
        <div className="mb-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="truncate text-lg font-medium leading-[22px] text-white">{heading}</h2>
              <div
                className={`liquid-glass ml-auto flex h-10 shrink-0 items-center overflow-hidden rounded-full shadow-dropdown-trigger transition-all duration-200 xs:h-9 ${
                  expanded ? 'w-[210px] px-3 xs:w-[240px] xs:px-2.5' : 'w-10 px-0 xs:w-9'
                }`}
              >
                {expanded ? (
                  <>
                    <SearchIcon className="h-[18px] w-[18px] shrink-0 text-text-secondary xs:h-4 xs:w-4" />
                    <input
                      ref={inputRef}
                      type="text"
                      aria-label="Search entries"
                      placeholder="Search"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      className="store-search-input min-w-0 flex-1 bg-transparent px-2 text-base font-medium text-white outline-none placeholder:text-text-tertiary xs:text-sm"
                    />
                    {(input || !wide) && (
                      <button
                        type="button"
                        aria-label={wide ? 'Clear search' : 'Close search'}
                        onClick={clear}
                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-text-secondary transition-colors hover:text-white"
                      >
                        <ClearIcon className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </>
                ) : (
                  <button
                    type="button"
                    aria-label="Search entries"
                    onClick={() => setOpen(true)}
                    className="flex h-10 w-10 items-center justify-center text-white transition-colors hover:bg-white/10 focus-visible:bg-white/10 focus-visible:outline-none xs:h-9 xs:w-9"
                  >
                    <SearchIcon className="h-[18px] w-[18px] xs:h-4 xs:w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {shown.length ? (
          <div className="grid grid-cols-2 gap-x-5 gap-y-1 md:grid-cols-3 min-[1920px]:grid-cols-4">
            {shown.map((a) => (
              <AppCard key={a.slug} app={a} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <h3 className="text-base font-medium text-text-primary">No entries found</h3>
            <p className="mt-2 text-sm text-text-secondary">Try a different search.</p>
          </div>
        )}

        {/* Live keeps an empty 32px pager slot (mt-8 h-8) under search results. */}
        {searching && shown.length > 0 && <div className="mt-8 flex h-8 items-center justify-center" aria-hidden="true" />}

        {!searching && (
          <nav
            aria-label="Entries pagination"
            className="mt-8 grid grid-cols-[1fr_auto_1fr] items-center"
          >
            <button
              type="button"
              disabled={cur <= 1}
              aria-label="Previous page"
              onClick={() => go(cur - 1)}
              className={`${navBtn} justify-self-start pl-1 pr-2 xs:pr-3`}
            >
              <ChevronLeftIcon className="h-4 w-4" />
              <span className="hidden xs:inline">Previous</span>
            </button>
            <div className="flex items-center justify-center gap-1">
              {pageWindow(cur, last).map((p, i) =>
                p === '…' ? (
                  <span key={`e${i}`} className="grid size-8 place-items-center text-sm text-text-tertiary">
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    type="button"
                    aria-label={`Page ${p}`}
                    aria-current={p === cur ? 'page' : undefined}
                    onClick={() => go(p)}
                    className={`grid size-8 place-items-center rounded-full text-sm font-medium leading-5 transition-colors hover:bg-white/10 hover:text-white ${
                      p === cur ? 'bg-white/10 text-white' : 'text-text-secondary'
                    }`}
                  >
                    {p}
                  </button>
                ),
              )}
            </div>
            <button
              type="button"
              disabled={cur >= last}
              aria-label="Next page"
              onClick={() => go(cur + 1)}
              className={`${navBtn} justify-self-end pl-2 pr-1 xs:pl-3`}
            >
              <span className="hidden xs:inline">Next</span>
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </nav>
        )}
      </section>
    </div>
  )
}
