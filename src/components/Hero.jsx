import { SIGNUP_HREF, VIDEOS, downloadHref } from '../data/content'
import { animStyle, useMobileAutoplay } from '../motion'
import { AppleLogo, HardDriveIcon, LaptopMinimalCheckIcon, PLAY_CIRCLE_SRC, SparklesIcon } from './icons'

// CLONE_SPEC S1 device variant detection
export function isMobileDevice() {
  const ua = navigator.userAgent
  return (
    /Android|iPhone|iPad|iPod|IEMobile|Opera Mini/i.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  )
}

const PILLARS = [
  { Icon: HardDriveIcon, title: 'Local-first', text: 'Apps run on your machine, no server or internet connection required.' },
  { Icon: LaptopMinimalCheckIcon, title: 'OS-integrated', text: 'Access files, tools, and anything on your operating system.' },
  { Icon: SparklesIcon, title: 'Opinionated', text: 'Beautiful by default and personal when you want it to be.' },
]

export default function Hero({ onOpenVideo, headline, subheadline }) {
  const [h1a, h1b] = headline.split('\n')
  const [subA, subB] = subheadline.split('\n')
  const mobile = isMobileDevice()
  const videoRef = useMobileAutoplay()

  const openIntro = () => onOpenVideo(VIDEOS.intro)

  return (
    <div id="overview">
      <section className="relative px-4 pt-[140px] xs:pt-40">
        <div className="mx-auto flex max-w-page flex-col items-center text-center">
          {/* 1. Eyebrow */}
          <div data-anim="hero-fade-1" className="animate-in" style={animStyle(0)}>
            <div className="flex flex-col items-center">
              <div className="mb-3 inline-flex items-center">
                <span className="text-base font-medium leading-none">
                  <span className="text-white">Glaze</span>
                  <span className="ml-1.5 text-text-secondary">
                    by{' '}
                    <a href="https://www.raycast.com/blog/meet-glaze" target="_blank" rel="noopener noreferrer">
                      Raycast
                    </a>
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* 2. Headline */}
          <div data-anim="hero-fade-2" className="animate-in" style={animStyle(100)}>
            <h1 className="mb-3 text-balance font-display text-hero font-medium leading-hero tracking-tight text-text-primary xs:mb-4 xs:text-5xl xs:leading-hero">
              <span>{h1a}</span>
              <span>
                <br />
                {h1b}
              </span>
            </h1>
          </div>

          {/* 3. Sub */}
          <div data-anim="hero-fade-3" className="animate-in" style={animStyle(200)}>
            <p className="mx-auto mb-4 max-w-content text-balance text-base leading-relaxed text-text-tertiary xs:mb-6 xs:text-lg xs:leading-relaxed">
              <span>{subA}</span>
              {/* Persona subs have no "\n": single span, no <br> (SPEC_legal_persona A.4) */}
              {subB != null && (
                <span>
                  <br className="hidden xs:block" /> {subB}
                </span>
              )}
            </p>
          </div>

          {/* 4. CTA block */}
          <div data-anim="hero-fade-4" className="animate-in mb-8 w-full xs:mb-12" style={animStyle(300)}>
            {mobile ? (
              <div className="flex flex-col items-center">
                <a
                  href={SIGNUP_HREF}
                  className="inline-flex h-11 items-center justify-center gap-2.5 rounded-full bg-accent px-10 text-base font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50"
                >
                  Sign Up
                </a>
                <p className="mt-3 text-center text-xs leading-[1.35] text-text-tertiary">
                  Available for macOS Tahoe and Apple Silicon
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="flex flex-col items-center justify-center gap-2 xs:flex-row">
                  <a
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-accent pl-3.5 pr-4 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50"
                    href={downloadHref('hero_download')}
                  >
                    <AppleLogo />
                    <span className="whitespace-nowrap">Download for Mac</span>
                  </a>
                  <button
                    type="button"
                    aria-label="Reinvent your wheel"
                    onClick={() => onOpenVideo(VIDEOS.reinvent)}
                    className="group inline-flex h-10 items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.06] pl-3.5 pr-4 text-sm font-medium text-text-primary transition-colors hover:bg-white/[0.1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45"
                  >
                    <img
                      alt=""
                      src={PLAY_CIRCLE_SRC}
                      draggable="false"
                      className="h-[18px] w-[18px] shrink-0 select-none transition-transform group-hover:scale-105"
                    />
                    <span className="whitespace-nowrap">Reinvent your wheel</span>
                  </button>
                </div>
                <p className="mt-4 text-center text-xs leading-[1.35] text-text-tertiary">macOS Tahoe and Apple Silicon required</p>
              </div>
            )}
          </div>

          {/* 5. Video + pillars */}
          <div data-anim="hero-fade-5" className="animate-in w-full" style={animStyle(400)}>
            <div className="mx-auto max-w-page">
              <div
                role="button"
                tabIndex={0}
                onClick={openIntro}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    openIntro()
                  }
                }}
                onContextMenu={(e) => e.preventDefault()}
                className="group relative aspect-[16/10] cursor-pointer overflow-hidden rounded-2xl xs:aspect-auto xs:rounded-3xl"
              >
                <video
                  data-anim="hero-video"
                  ref={videoRef}
                  src="/assets/intro-loop-0kts42Ml.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                  className="block h-full w-full object-cover xs:h-auto xs:object-contain"
                />
                <div className="absolute inset-0 flex select-none items-center justify-center bg-black/15 transition-colors group-hover:bg-black/25">
                  <img
                    alt="Play"
                    src={PLAY_CIRCLE_SRC}
                    draggable="false"
                    className="pointer-events-none h-12 w-12 select-none opacity-90 transition-all group-hover:scale-110 group-hover:opacity-100"
                  />
                </div>
              </div>
            </div>

            <div className="mt-14 w-full">
              <div className="flex w-full flex-row items-start justify-center gap-2 min-[600px]:gap-12">
                {PILLARS.map(({ Icon, title, text }) => (
                  <div key={title} className="flex flex-1 flex-col items-center min-[600px]:max-w-[280px] min-[600px]:flex-initial">
                    <div className="mb-1.5 flex h-5 items-center gap-1 min-[600px]:mb-3 min-[600px]:h-6 min-[600px]:gap-1.5">
                      <Icon className="h-5 w-5 text-text-secondary min-[600px]:h-6 min-[600px]:w-6" />
                    </div>
                    <span className="mb-1 text-sm font-medium text-text-secondary min-[600px]:text-base">{title}</span>
                    <span className="hidden text-balance text-center text-sm font-normal leading-snug text-text-tertiary min-[600px]:block">
                      {text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
