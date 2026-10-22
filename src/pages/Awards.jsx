import { useEffect } from 'react'
import DownloadCTA from '../components/DownloadCTA'
import Footer from '../components/Footer'
import Entries from '../components/awards/Entries'
import { Criteria, Jury, Prizes } from '../components/awards/Sections'
import Winners from '../components/awards/Winners'
import { useMobileAutoplay } from '../motion'
import '../awards.css'

// SPEC_marketing section 3. /awards is the black-themed page: html/body get class bg-black,
// data-page=awards and --bg:#000 for as long as the page is mounted.
function useAwardsTheme() {
  useEffect(() => {
    const els = [document.documentElement, document.body]
    els.forEach((el) => {
      el.classList.add('bg-black')
      el.dataset.page = 'awards'
      el.style.setProperty('--bg', '#000000')
      el.style.background = '#000000'
    })
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#000000')
    return () => {
      els.forEach((el) => {
        el.classList.remove('bg-black')
        delete el.dataset.page
        el.style.removeProperty('--bg')
        el.style.removeProperty('background')
      })
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#121212')
    }
  }, [])
}

// Motion values are the spec's (3.11): video fade-in 800ms, then fade-in-up rows at 100/200/300ms,
// then the below-the-fold wrapper fade-in at 500ms / 600ms.
const hidden = (delay) => ({ opacity: 0, ...(delay ? { animationDelay: `${delay}ms` } : {}) })

export default function Awards() {
  useAwardsTheme()
  const videoRef = useMobileAutoplay()
  return (
    <main className="awards-page-background flex min-h-dvh flex-col bg-black text-balance selection:bg-accent selection:text-white">
      <section className="px-4 pt-[clamp(0px,calc(225px-35.9vw),88px)] min-[624px]:pt-0">
        <div className="mx-auto max-w-page text-center">
          <div
            data-anim="awards-video-fade"
            className="animate-fade-in w-full min-[624px]:-mt-4"
            style={{ opacity: 0, animationDuration: '800ms' }}
          >
            <div className="relative left-1/2 aspect-video w-screen max-w-[1280px] -translate-x-1/2 overflow-hidden">
              <video
                ref={videoRef}
                src="/assets/marketing/awards-hero-84xk2ZFP.mp4"
                aria-label="An abstract liquid-metal Glaze mark in motion"
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                className="h-full w-full object-cover"
              />
              <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-black to-transparent" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-black to-transparent" />
            </div>
          </div>
          <div className="relative z-10 mt-[-28px] min-[624px]:mt-[clamp(-144px,-11vw,-48px)]">
            <div data-anim="awards-sponsor" className="animate-in" style={hidden(100)}>
              <div className="flex items-center justify-center gap-2 text-sm font-medium text-white">
                <span className="leading-5">Sponsored by</span>
                <a href="https://www.anthropic.com/" target="_blank" rel="noopener noreferrer" aria-label="Visit Anthropic">
                  <img src="/assets/marketing/anthropic-wordmark.svg" alt="Anthropic" className="h-3 w-auto" />
                </a>
              </div>
            </div>
            <div data-anim="awards-title" className="animate-in" style={hidden(200)}>
              <h1 className="mt-2 text-center font-display text-4xl font-medium leading-[1.1] tracking-tight text-white xs:text-5xl xs:leading-[1.1]">
                Glaze Awards
              </h1>
            </div>
            <div data-anim="awards-subtitle" className="animate-in" style={hidden(300)}>
              <p className="mx-auto mt-2 max-w-[720px] text-base leading-relaxed text-text-secondary xs:text-lg xs:leading-relaxed">
                The results are in. Meet all the winners and finalists below.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div data-anim="awards-below-fold" className="animate-fade-in" style={{ opacity: 0, animationDelay: '500ms', animationDuration: '600ms' }}>
        <Winners />
        <Entries />
        <Prizes />
        <Jury />
        <Criteria />
        <DownloadCTA />
        <Footer />
      </div>
    </main>
  )
}
