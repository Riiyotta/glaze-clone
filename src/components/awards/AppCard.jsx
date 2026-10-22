import AppIcon from './AppIcon'
import { AppLink } from './links'

// SPEC_marketing 3.4 app card (finalists and entries): 72px row, -mx-2 so the hover pill
// extends 8px past the column.
export default function AppCard({ app }) {
  return (
    <div>
      <AppLink
        slug={app.slug}
        aria-label={`Open ${app.name}`}
        className="-mx-2 flex h-[72px] items-center gap-3 rounded-2xl px-2 transition-colors hover:bg-white/10 [&_.store-app-card-description]:hidden min-[624px]:[&_.store-app-card-description]:block"
      >
        <AppIcon src={app.icon} className="h-14 w-14 shrink-0" />
        <div className="min-w-0 flex-1">
          <h3 className="min-w-0 truncate text-sm font-medium leading-[18px] text-white">{app.name}</h3>
          <p className="store-app-card-description truncate text-sm leading-[18px] text-text-secondary">{app.tagline}</p>
          {app.author && (
            <div className="mt-0.5 flex items-center gap-1.5 text-sm leading-[18px]">
              {app.avatar && <img src={app.avatar} alt="" className="h-3.5 w-3.5 rounded-full object-cover" />}
              <span className="truncate text-text-secondary">{app.author}</span>
            </div>
          )}
        </div>
      </AppLink>
    </div>
  )
}
