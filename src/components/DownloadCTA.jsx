import { SIGNUP_HREF, downloadHref } from '../data/content'
import GlazeIcon from './GlazeIcon'
import { isMobileDevice } from './Hero'
import { AppleLogo } from './icons'

// CLONE_SPEC S5. `onIconBurst` is the hook for the flying-icons effect (M7).
export default function DownloadCTA({ onIconBurst, compact = false }) {
  const mobile = isMobileDevice()
  if (compact) return <CompactCTA onIconBurst={onIconBurst} mobile={mobile} />
  return (
    <section id="download" className="px-4 pb-[64px] pt-[220px] xs:pb-[200px] xs:pt-[280px]">
      <div className="mx-auto flex max-w-narrow flex-col items-center text-center">
        <GlazeIcon onBurst={onIconBurst} />
        <h2 className="mb-4 select-none font-display text-3xl font-medium leading-[1.1] tracking-tight xs:mb-8 xs:text-[44px] xs:leading-[1.1]">
          What will you build?
        </h2>
        <div className="w-full">
          <div className="flex flex-col items-center">
            <a
              className="inline-flex h-11 items-center justify-center gap-2.5 rounded-full bg-accent pl-4 pr-5 text-base font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50"
              href={mobile ? SIGNUP_HREF : downloadHref('waitlist_download')}
            >
              <AppleLogo />
              <span className="whitespace-nowrap">Download for Mac</span>
            </a>
            <p className="mt-4 text-center text-xs leading-[1.35] text-text-tertiary">macOS Tahoe and Apple Silicon required</p>
          </div>
        </div>
      </div>
    </section>
  )
}

// SPEC_blog 2.2 item 5: "compact" Download block used under blog posts.
function CompactCTA({ onIconBurst, mobile }) {
  return (
    <section className="mt-20 pt-4 xs:mt-24 xs:pt-0">
      <div className="mx-auto flex max-w-[420px] flex-col items-center text-center">
        <GlazeIcon onBurst={onIconBurst} compact />
        <h2 className="mb-4 select-none font-display text-[30px] font-medium leading-[1.1] tracking-[-0.9px] xs:mb-7 xs:text-[36px]">
          What will you build?
        </h2>
        <div className="w-full">
          <div className="flex flex-col items-center">
            <a
              className="hidden h-11 items-center justify-center gap-2.5 rounded-full bg-accent pl-4 pr-5 text-base font-medium text-white transition-colors hover:opacity-90 xs:inline-flex"
              href={mobile ? SIGNUP_HREF : downloadHref('waitlist_download')}
            >
              <AppleLogo />
              <span className="whitespace-nowrap">Download for Mac</span>
            </a>
            <p className="text-center text-xs leading-[1.35] text-text-tertiary xs:hidden">Available for macOS Tahoe and Apple Silicon</p>
            <p className="mt-4 hidden text-center text-xs leading-[1.35] text-text-tertiary xs:block">macOS Tahoe and Apple Silicon required</p>
          </div>
        </div>
      </div>
    </section>
  )
}
