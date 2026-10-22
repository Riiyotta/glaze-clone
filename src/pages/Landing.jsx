import { useCallback, useEffect, useState } from 'react'
import DownloadCTA from '../components/DownloadCTA'
import FAQ from '../components/FAQ'
import Features from '../components/Features'
import Footer from '../components/Footer'
import Hero from '../components/Hero'
import PersonaShowcase from '../components/PersonaShowcase'
import YouTubeOverlay from '../components/YouTubeOverlay'
import { LANDING_HERO } from '../data/personas'
import { animStyle } from '../motion'

// `/` and the five persona routes (SPEC_legal_persona A.1): same component, copy + tab swapped.
export default function Landing({
  heroHeadline = LANDING_HERO.heroHeadline,
  heroSubheadline = LANDING_HERO.heroSubheadline,
  initialPersona = LANDING_HERO.initialPersona,
}) {
  const [video, setVideo] = useState(null)
  const closeVideo = useCallback(() => setVideo(null), [])

  // CLONE_SPEC "Page-level behavior": manual scroll restoration, scroll to top once, strip hash.
  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)
    if (window.location.hash) {
      history.replaceState(history.state, '', window.location.pathname + window.location.search)
    }
  }, [])

  return (
    <main className="flex min-h-dvh flex-col">
      <Hero onOpenVideo={setVideo} headline={heroHeadline} subheadline={heroSubheadline} />
      {/* CLONE_SPEC M2: fade-in .6s ease-out, 500ms delay, on load */}
      <div data-anim="below-fold-fade" className="animate-fade-in" style={animStyle(500)}>
        <PersonaShowcase initialPersona={initialPersona} />
        <Features onOpenVideo={setVideo} />
        <FAQ />
        <DownloadCTA />
        <Footer />
      </div>
      <YouTubeOverlay video={video} onClose={closeVideo} />
    </main>
  )
}
