import AppDetail from '../components/store/AppDetail'
import Footer from '../components/Footer'
import { FALLBACK_ICON, getApp } from '../data/store'

export default function AppPage({ params }) {
  const app = getApp(params.slug)
  if (!app) {
    // Live "App not found" template: centered block, no footer, h1 Inter 24/30 (30/37.5 at xs).
    return (
      <div className="flex min-h-dvh items-center justify-center px-4">
        <div className="max-w-narrow text-center">
          <img src={FALLBACK_ICON} alt="Glaze" className="mx-auto mb-8 h-[80px] w-[80px] select-none xs:h-[100px] xs:w-[100px]" draggable="false" />
          <h1 className="mb-2 text-2xl font-medium leading-[1.25] tracking-tight text-text-primary xs:text-3xl xs:leading-[1.25]">App not found</h1>
          <p className="text-base leading-[1.4] text-text-secondary">This app doesn't exist or is no longer available.</p>
        </div>
      </div>
    )
  }
  return (
    <main className="flex min-h-dvh flex-col">
      <section className="px-4 pb-14 pt-[76px] xs:pt-[80px]">
        <div className="mx-auto flex max-w-page flex-col gap-6">
          <AppDetail key={app.slug} app={app} />
        </div>
      </section>
      <Footer />
    </main>
  )
}
