import { Link } from '../router'
import Footer from '../components/Footer'
import GlazeIcon from '../components/GlazeIcon'

// CLONE_SPEC section 3. No entrance animations on this route. Nav is rendered by the router layout.
export default function NotFoundPage({ onIconBurst }) {
  return (
    <main className="flex min-h-dvh flex-col">
      <section className="flex flex-1 items-center justify-center px-4 py-24">
        <div className="flex max-w-narrow flex-col items-center text-center">
          <GlazeIcon onBurst={onIconBurst} />
          <h1 className="mb-2 select-none font-display text-3xl font-medium leading-[1.1] tracking-tight text-text-primary xs:text-[44px] xs:leading-[1.1]">
            Page not found
          </h1>
          <p className="mb-6 text-base leading-[1.4] text-text-secondary">The page you're looking for doesn't exist.</p>
          <Link
            to="/"
            className="inline-flex h-11 items-center justify-center rounded-full bg-accent px-5 text-base font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50"
          >
            Go Home
          </Link>
        </div>
      </section>
      <Footer />
    </main>
  )
}
