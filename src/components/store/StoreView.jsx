import { useEffect, useRef, useState } from 'react'
import { Link, navigate, usePathname } from '../../router'
import {
  APPS,
  AWARD_WINNERS,
  CATEGORIES,
  CATEGORY_META,
  LATEST,
  MADE_TO_REMIX,
  OUR_PICKS,
  REMIXABLE_MADE_TO_REMIX,
  TRENDING,
  categoryPage,
  searchApps,
} from '../../data/store'
import Footer from '../Footer'
import AppRow from './AppRow'
import HeroCarousel from './HeroCarousel'
import Pagination from './Pagination'
import Slider from './Slider'
import { LIcon } from './StoreIcons'
import { useSearchParams } from './hooks'
import '../../store.css'

const CHIP_ICONS = {
  all: 'star',
  remixable: 'shuffle',
  'developer-tools': 'hammer',
  productivity: 'chart-line',
  utilities: 'wrench',
  media: 'headphones',
  design: 'paintbrush',
  lifestyle: 'heart',
  'games-and-fun': 'gamepad-2',
}
const SHORT_SIZES = { 1: 6, 2: 4, 3: 3, 4: 4 } // Made to Remix / Award Winners: {2:4,3:3,4:4}, default 6
const GRID_SIZES = { 1: 24, 2: 24, 3: 24, 4: 24 }
const row = (slug) => <AppRow key={slug} app={APPS[slug]} />

function Search({ path, q }) {
  const [value, setValue] = useState(q)
  const sent = useRef(q)
  useEffect(() => {
    if (q !== sent.current) {
      sent.current = q
      setValue(q)
    }
  }, [q])
  useEffect(() => {
    const next = value.trim().toLowerCase()
    if (next === sent.current) return
    // 250 ms debounce, URL updated with replace (no scroll reset)
    const t = setTimeout(() => {
      sent.current = next
      navigate(next ? `${path}?q=${encodeURIComponent(next)}` : path, { replace: true })
    }, 250)
    return () => clearTimeout(t)
  }, [value, path])
  return (
    <div className="liquid-glass ml-auto flex h-10 w-[210px] items-center overflow-hidden rounded-full px-3 shadow-dropdown-trigger transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] xs:h-9 xs:w-60 xs:px-2.5">
      <LIcon name="search" size={16} className="shrink-0 text-text-secondary max-xs:size-[18px]" />
      <input
        type="search"
        aria-label="Search store"
        placeholder="Search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="store-search-input min-w-0 flex-1 appearance-none bg-transparent px-2 text-base font-medium leading-5 text-white xs:text-sm"
      />
    </div>
  )
}

function Chips({ category }) {
  return (
    <nav aria-label="Store categories" className="hide-scrollbar -mx-4 overflow-x-auto">
      <ul role="list" className="flex w-max items-center gap-[3px] px-4">
        {CATEGORIES.map((c) => {
          const active = c.value === category
          return (
            <li key={c.value} className="shrink-0 font-medium">
              <Link
                to={c.href}
                aria-current={active ? 'page' : undefined}
                className={`flex h-8 items-center gap-1.5 whitespace-nowrap rounded-full border px-[9px] text-[13px] leading-none transition-colors focus-visible:border-white/35 focus-visible:shadow-none ${
                  active
                    ? 'border-white/[0.12] bg-white/10 text-white'
                    : 'border-white/[0.08] bg-white/[0.03] text-text-secondary hover:bg-white/[0.07] hover:text-white'
                }`}
              >
                <LIcon name={CHIP_ICONS[c.value]} size={13} className="shrink-0" />
                {c.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

const NoApps = () => (
  <div className="flex h-[148px] items-center justify-center text-center text-sm font-medium text-text-secondary">No apps found</div>
)

function ViewAll({ to }) {
  return (
    <Link to={to} className="flex min-h-7 items-center gap-0.5 rounded-sm text-sm font-medium text-text-secondary transition-colors hover:text-white focus-visible:shadow-none focus-visible:ring-1 focus-visible:ring-white/30">
      View All
      <LIcon name="chevron-right" size={14} />
    </Link>
  )
}

function GridWithPagination({ slugs, page, pageCount, hrefFor }) {
  return (
    <div>
      <Slider items={slugs} sizes={GRID_SIZES} pad={false} renderItem={row} />
      <Pagination page={page} pageCount={pageCount} hrefFor={hrefFor} />
    </div>
  )
}

export default function StoreView({ category = 'all' }) {
  const path = usePathname()
  const params = useSearchParams()
  const q = (params.get('q') || '').trim().toLowerCase()
  const pageParam = parseInt(params.get('page') || '1', 10) || 1
  const meta = CATEGORY_META[category]

  const hrefFor = (n) => {
    const sp = new URLSearchParams()
    if (q) sp.set('q', q)
    if (n > 1) sp.set('page', String(n))
    const s = sp.toString()
    return s ? `${path}?${s}` : path
  }

  let body
  let result = null
  if (q) result = searchApps(q, pageParam)
  else if (meta) result = categoryPage(category, pageParam)

  // Out-of-range ?page redirects (replace) to the last page.
  useEffect(() => {
    if (result && pageParam > result.pageCount) navigate(hrefFor(result.pageCount), { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result?.pageCount, pageParam])

  if (q) {
    body = result.apps.length ? <GridWithPagination slugs={result.apps} page={result.page} pageCount={result.pageCount} hrefFor={hrefFor} /> : <NoApps />
  } else if (category === 'all') {
    body = (
      <>
        <Slider title="Our Picks" items={OUR_PICKS} renderItem={row} />
        <Slider title="Trending" items={TRENDING} renderItem={row} />
        <Slider title="Made to Remix" accessory={<ViewAll to="/store/remixable" />} items={MADE_TO_REMIX} sizes={SHORT_SIZES} renderItem={row} />
        <Slider
          title="Award Winners"
          accessory={<ViewAll to="/awards" />}
          items={AWARD_WINNERS}
          sizes={SHORT_SIZES}
          renderItem={(w) => <AppRow key={w.app} app={APPS[w.app]} award={w.result} />}
        />
        <Slider title="Latest" items={LATEST} renderItem={row} />
      </>
    )
  } else if (category === 'remixable') {
    body = (
      <>
        {/* Live /store/remixable shows all 8 Made to Remix apps as one grid, no pager (screens/store-remixable-1440-full.png) */}
        <Slider title="Made to Remix" items={REMIXABLE_MADE_TO_REMIX} sizes={{ 1: 8, 2: 8, 3: 8, 4: 8 }} pad={false} renderItem={row} />
        <div>
          <h2 className="mb-1.5 flex min-h-7 items-center text-base font-medium leading-[22px] text-white xs:mb-2">All Remixable Apps</h2>
          <GridWithPagination slugs={result.apps} page={result.page} pageCount={result.pageCount} hrefFor={hrefFor} />
        </div>
      </>
    )
  } else {
    body = <GridWithPagination slugs={result.apps} page={result.page} pageCount={result.pageCount} hrefFor={hrefFor} />
  }

  return (
    <main className="flex min-h-dvh flex-col">
      <section className="px-4 pb-20 pt-[76px] xs:pt-[80px]">
        <div className="mx-auto flex w-full max-w-page flex-col gap-3 min-[1920px]:max-w-[1440px]">
          <HeroCarousel />
          <div className="mt-6">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <h1 className="truncate text-lg font-medium leading-[22px] text-white">
                  {q ? 'Search Results' : meta ? meta.label : 'Browse Store'}
                </h1>
                <Search path={path} q={q} />
              </div>
              {meta && !q && <p className="sr-only">{meta.description}</p>}
              <Chips category={category} />
            </div>
          </div>
          <div className="mt-8 flex flex-col gap-8">{body}</div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
