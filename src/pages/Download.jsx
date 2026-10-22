import GlazeIcon from '../components/GlazeIcon'
import { AppleLogo } from '../components/icons'
import { downloadHref } from '../data/content'

// SPEC_marketing section 2. No footer, no animations. The version is a server function on the
// original; here it is a constant.
const VERSION = '0.14.4.0'

export default function Download() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <div className="max-w-narrow text-center">
        <div className="flex justify-center">
          <GlazeIcon fixedSize />
        </div>
        <h1 className="mb-2 select-none text-2xl font-medium leading-[1.25] tracking-tight text-white xs:text-3xl xs:leading-[1.25]">
          Get Glaze
        </h1>
        <p className="select-none text-base leading-[1.4] text-text-secondary">Time to turn your ideas into apps</p>
        <div className="mt-6 flex flex-col items-center justify-center">
          <p className="text-center text-xs leading-[1.35] text-text-tertiary xs:hidden">
            Available for macOS Tahoe and Apple Silicon
          </p>
          <a
            href={downloadHref('download_page')}
            className="hidden h-11 items-center justify-center gap-2.5 rounded-full bg-accent pl-4 pr-5 text-base font-medium text-white transition-colors hover:opacity-90 xs:inline-flex"
          >
            <AppleLogo />
            <span className="whitespace-nowrap">Download for Mac</span>
          </a>
          <p className="hidden text-center text-xs leading-[1.35] text-text-tertiary xs:mt-4 xs:block">
            macOS Tahoe and Apple Silicon required
          </p>
        </div>
        <div className="mt-4 flex h-5 items-center justify-center">
          <span className="font-mono text-xs text-text-tertiary">v {VERSION}</span>
        </div>
      </div>
    </main>
  )
}
