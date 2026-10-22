import { Link } from '../../router'
import { assetUrl } from '../../data/store'
import AppIcon from './AppIcon'
import { AwardInline } from './Awards'
import { LIcon } from './StoreIcons'

// Store app row card (SPEC_store 4.5). `list` = Remixes / Suggested variant (no negative margin,
// px-0 below 480). `award` overrides the app's own award (Award Winners keeps finalists).
export default function AppRow({ app, list = false, award, remixIcon = false, onNavigate }) {
  const result = award === undefined ? app.award : award
  const lin = remixIcon ? app.remixLineage : null
  const avatar = assetUrl(app.author.avatar)
  return (
    <Link
      to={`/app/${app.slug}`}
      aria-label={`Open ${app.name}`}
      onClick={onNavigate}
      className={`flex h-[72px] items-center gap-3 rounded-2xl transition-colors hover:bg-white/10 ${list ? 'px-0 xs:px-2' : '-mx-2 px-2'}`}
    >
      <AppIcon app={app} />
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-1">
          <h3 className="min-w-0 truncate text-sm font-medium leading-[18px] text-white">{app.name}</h3>
          {result === 'finalist' ? (
            <span className="ml-1 shrink-0 text-sm font-normal leading-[18px] text-text-tertiary">Finalist</span>
          ) : (
            result && <AwardInline result={result} />
          )}
          {lin && (
            <span
              title={`Remix of ${lin.parent_display_name} by ${lin.parent_author_name}`}
              aria-label={`Remix of ${lin.parent_display_name} by ${lin.parent_author_name}`}
              className="ml-0.5 shrink-0 text-text-tertiary"
            >
              <LIcon name="shuffle" size={14} />
            </span>
          )}
        </div>
        <p className="truncate text-sm leading-[18px] text-text-secondary">{app.tagline}</p>
        <div className="mt-0.5 flex items-center gap-1.5 text-sm leading-[18px] text-text-secondary">
          {avatar && <img alt="" src={avatar} width="14" height="14" loading="lazy" draggable="false" className="h-3.5 w-3.5 rounded-full object-cover" />}
          <span className="truncate">{app.author.name}</span>
        </div>
      </div>
    </Link>
  )
}
