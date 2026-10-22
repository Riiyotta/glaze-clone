import { FEATURE_ROWS, VIDEOS } from '../data/content'
import { PLAY_CIRCLE_SRC } from './icons'

function FeatureCard({ f, onOpenVideo }) {
  return (
    <div className="h-full overflow-hidden rounded-2xl bg-surface-well">
      <div className="p-6 min-[800px]:p-7">
        <div className="flex flex-col gap-3 min-[800px]:flex-row min-[800px]:items-start min-[800px]:justify-between min-[800px]:gap-4">
          <div>
            <h2 className="mb-2 font-display text-2xl font-medium leading-[1.1] tracking-tight text-text-primary min-[800px]:text-3xl min-[800px]:leading-[1.1]">
              {f.title}
            </h2>
            <p className="text-balance text-sm leading-[1.4] text-text-secondary min-[800px]:text-base min-[800px]:leading-relaxed">
              {f.description}
            </p>
          </div>
          {f.demo && (
            <button
              type="button"
              onClick={() => onOpenVideo(VIDEOS.demo)}
              className="flex shrink-0 select-none items-center gap-2 self-start rounded-full bg-white/5 py-1.5 pl-1.5 pr-3 text-sm text-white transition-all hover:bg-white/10 min-[800px]:-mr-2 min-[800px]:-mt-1"
            >
              <img alt="" src={PLAY_CIRCLE_SRC} draggable="false" className="pointer-events-none h-[18px] w-[18px] shrink-0 select-none" />
              <span className="select-none">Watch Demo</span>
            </button>
          )}
        </div>
      </div>
      <picture>
        <source media="(min-width: 800px)" srcSet={f.desktop} />
        <img alt={f.alt} src={f.mobile} className="pointer-events-none block h-auto w-full select-none" />
      </picture>
    </div>
  )
}

// CLONE_SPEC S3
export default function Features({ onOpenVideo }) {
  return (
    <div id="features" className="mt-[160px] scroll-mt-[80px] xs:mt-[256px]">
      <div className="px-4">
        <div className="mx-auto flex max-w-page flex-col gap-4 min-[800px]:gap-5">
          {FEATURE_ROWS.map((row, i) =>
            row.length === 1 ? (
              <div key={i}>
                <FeatureCard f={row[0]} onOpenVideo={onOpenVideo} />
              </div>
            ) : (
              <div key={i} className="grid grid-cols-1 gap-4 min-[800px]:grid-cols-2 min-[800px]:gap-5">
                {row.map((f) => (
                  <div key={f.title} className="min-w-0 flex-1">
                    <FeatureCard f={f} onOpenVideo={onOpenVideo} />
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}
