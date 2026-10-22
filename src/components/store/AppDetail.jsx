import { Link } from '../../router'
import {
  APPS,
  AI_TOOLTIP,
  DOWNLOAD_HREF,
  assetUrl,
  formatInstalls,
  formatSize,
  getApp,
  parentSlug,
  relatedApps,
  updatedLabel,
} from '../../data/store'
import { placeholderAbout } from '../../data/store-about-placeholder'
import AppIcon from './AppIcon'
import AppRow from './AppRow'
import { AwardPill } from './Awards'
import ScreenshotStrip from './ScreenshotStrip'
import { LIcon } from './StoreIcons'
import '../../store.css'

const LIVE = 'https://www.glaze.app'
const authorHref = (a) => `${LIVE}/@${a.username}` // author pages are out of scope for the clone

function AiBadge({ app }) {
  return (
    <span className="tip-wrap relative">
      <span className="inline-flex items-center justify-center gap-1.5 rounded-full bg-white/[0.08] py-1 pl-1.5 pr-2 text-xs font-medium text-accent transition-colors hover:bg-white/[0.12]" tabIndex={0}>
        <LIcon name="sparkles" size={14} className="text-accent" />
        Glaze AI
      </span>
      <span
        role="tooltip"
        className="absolute bottom-full left-1/2 z-50 mb-2 w-max max-w-[240px] -translate-x-1/2 text-balance rounded-md border border-border-separator bg-surface-popover px-2 py-1 text-left text-xs leading-snug text-white shadow-lg"
      >
        {AI_TOOLTIP(app)}
      </span>
    </span>
  )
}

function Ctas({ app }) {
  return (
    <div className="mt-2 hidden items-center gap-2 xs:flex">
      <a
        href={DOWNLOAD_HREF}
        target="_blank"
        rel="noreferrer"
        className="inline-flex h-8 items-center justify-center gap-2 rounded-full bg-accent px-3.5 text-sm font-medium leading-5 text-white transition-colors hover:opacity-90"
      >
        Open in Glaze
      </a>
      {app.remixable ? (
        <span className="tip-wrap relative">
          <a
            href={DOWNLOAD_HREF}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-8 items-center justify-center gap-2 rounded-full border border-border-separator bg-white/10 px-3.5 text-sm font-medium leading-5 text-white transition-colors hover:bg-white/[0.12]"
          >
            <LIcon name="shuffle" size={16} />
            Remix
          </a>
          <span
            role="tooltip"
            className="absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md border border-border-separator bg-surface-popover px-2 py-1 text-xs leading-none text-white shadow-lg"
          >
            Creates a copy of this app you can edit in Glaze
          </span>
        </span>
      ) : (
        <a
          href={DOWNLOAD_HREF}
          className="inline-flex h-8 items-center justify-center gap-2 rounded-full border border-border-separator bg-white/10 px-3.5 text-sm font-medium leading-5 text-white transition-colors hover:bg-white/[0.12]"
        >
          Download Glaze
        </a>
      )}
    </div>
  )
}

function HeaderBlock({ app, cover, dialog }) {
  const medal = app.award && app.award !== 'finalist' ? app.award : null
  const body = (
    <div className={`flex items-center gap-4 xs:gap-6 ${dialog ? 'pr-12 xs:pr-14' : ''}`}>
      <AppIcon app={app} size="h-20 w-20 xs:h-28 xs:w-28" px={112} eager />
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <h1 className="text-balance text-lg font-medium leading-tight text-white xs:text-xl xs:leading-[26px]">{app.name}</h1>
          {(medal || app.ai) && (
            <div className="flex shrink-0 items-center gap-1">
              {medal && <AwardPill result={medal} />}
              {app.ai && <AiBadge app={app} />}
            </div>
          )}
        </div>
        <p className={`flex min-w-0 items-center gap-1.5 overflow-hidden whitespace-nowrap text-xs leading-4 xs:text-sm xs:leading-[18px] ${cover ? 'text-white/[0.72]' : 'text-text-secondary'}`}>
          <span className="truncate">{app.tagline}</span>
        </p>
        <Ctas app={app} />
      </div>
    </div>
  )
  if (!cover) return <div className={dialog ? '' : 'pt-6 xs:pt-10'}>{body}</div>
  return (
    <div className="relative isolate h-[clamp(220px,38vw,360px)] overflow-hidden rounded-2xl bg-surface-well min-[1920px]:h-[clamp(360px,38vw,480px)] xs:rounded-3xl">
      <img alt="" src={assetUrl(app.featuredImage)} width="1600" height="680" draggable="false" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
      <span className="pointer-events-none absolute right-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/45 py-1.5 pl-2 pr-3 text-xs font-medium leading-none text-white shadow-[0_8px_24px_rgba(0,0,0,.28)] backdrop-blur-md xs:right-4 xs:top-4">
        <LIcon name="star" size={12} fill="currentColor" />
        Featured
      </span>
      <div className="absolute inset-x-0 bottom-0 z-10 p-4 xs:p-5">{body}</div>
    </div>
  )
}

function Lineage({ l, onNavigate }) {
  const slug = parentSlug(l)
  const known = !!getApp(slug)
  const cls = 'text-white transition-colors hover:text-text-secondary focus-visible:shadow-none focus-visible:ring-1 focus-visible:ring-white/30'
  return (
    <div className="flex items-center gap-2 rounded-xl bg-white/[0.04] px-4 py-2.5 text-sm leading-[18px] text-text-secondary">
      <LIcon name="shuffle" size={16} className="shrink-0" />
      <p className="min-w-0 truncate">
        Remixed from{' '}
        {known ? (
          <Link to={`/app/${slug}`} onClick={onNavigate} className={cls}>{l.parent_display_name}</Link>
        ) : (
          <span className="text-white">{l.parent_display_name}</span>
        )}{' '}
        by{' '}
        <a href={`${LIVE}/@${l.parent_author_username}`} className={cls}>{l.parent_author_name}</a>
      </p>
    </div>
  )
}

function Stat({ label, children, className = '' }) {
  return (
    <div className={`flex min-w-0 flex-col items-center gap-0.5 px-1 py-2.5 xs:gap-1 xs:px-3 xs:py-3 ${className || 'flex-1'}`}>
      <span className="text-2xs font-medium uppercase leading-3 text-text-tertiary xs:text-xs xs:leading-[14px]">{label}</span>
      {children}
    </div>
  )
}

function Stats({ app }) {
  const avatar = assetUrl(app.author.avatar)
  const val = 'max-w-full truncate text-xs leading-4 text-white xs:text-sm xs:leading-[18px]'
  return (
    <div className="flex overflow-hidden border-y border-border-separator">
      <Stat label="Author" className="flex-none min-w-[20%] max-w-[40%] xs:min-w-[25%] xs:max-w-[50%]">
        <a
          href={authorHref(app.author)}
          aria-label={`View ${app.author.name}`}
          className="flex max-w-full items-center gap-1.5 text-xs leading-4 text-white transition-colors hover:text-text-secondary xs:text-sm xs:leading-[18px]"
        >
          {avatar && <img alt="" src={avatar} width="20" height="20" draggable="false" className="size-4 shrink-0 rounded-full object-cover xs:size-5" />}
          <span className="truncate">{app.author.name}</span>
        </a>
      </Stat>
      <Stat label="Size"><span className={val}>{formatSize(app.stats.sizeBytes)}</span></Stat>
      <Stat label="Updated"><span className={val}>{updatedLabel(app)}</span></Stat>
      <Stat label="Installs"><span className={val}>{formatInstalls(app.stats.installs)}</span></Stat>
    </div>
  )
}

function List({ title, slugs, remixIcon, onNavigate }) {
  return (
    <div className="mt-4 flex flex-col gap-3">
      <h2 className="text-base font-medium leading-[22px] text-white">{title}</h2>
      <div className="grid grid-cols-1 gap-px sm:grid-cols-2 xs:-ml-2">
        {slugs.filter((s) => APPS[s]).map((s) => (
          <AppRow key={s} app={APPS[s]} list remixIcon={remixIcon} onNavigate={onNavigate} />
        ))}
      </div>
    </div>
  )
}

// Shared body of /app/:slug and the landing-page dialog (SPEC_store 6 and 7). `dialog` forces
// header B with right padding for the close button.
export default function AppDetail({ app, dialog = false, onNavigate }) {
  const { related, remixes } = relatedApps(app) // live renders the first 4 of the 5 suggested apps in its payload
  return (
    <>
      <HeaderBlock app={app} cover={!dialog && !!app.featuredImage} dialog={dialog} />
      {app.remixLineage && <Lineage l={app.remixLineage} onNavigate={onNavigate} />}
      <Stats app={app} />
      {app.screenshots.length > 0 && <ScreenshotStrip shots={app.screenshots} />}
      <section>
        <h2 className="sr-only">About {app.name}</h2>
        <p className="whitespace-pre-line text-balance text-sm leading-[18px] text-text-secondary">{placeholderAbout(app)}</p>
      </section>
      {remixes.length > 0 && <List title="Remixes" slugs={remixes} remixIcon onNavigate={onNavigate} />}
      {related.length > 0 && <List title="Suggested Apps" slugs={related.slice(0, 4)} onNavigate={onNavigate} />}
    </>
  )
}
