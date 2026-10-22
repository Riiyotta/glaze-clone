import '../blog.css'
import Prose from '../components/blog/Prose'
import Footer from '../components/Footer'
import { RELEASES } from '../data/changelog'

// SPEC_blog section 3. No entrance motion; only CSS sticky at >=1280.
export default function Changelog() {
  return (
    <main className="flex min-h-dvh flex-col">
      <section className="px-4 pb-20 pt-[140px] xs:pt-40">
        <div className="mx-auto mb-12 w-full max-w-[680px] text-center xs:mb-16">
          <h1 className="mb-4 px-4 font-display text-[36px] font-medium leading-[1.1] tracking-[-0.9px] text-text-primary xs:px-0 xs:text-5xl xs:tracking-[-1.2px]">
            What's new
          </h1>
          <p className="mx-auto text-base leading-relaxed text-text-tertiary xs:max-w-[440px] xs:text-lg">
            Discover the latest releases in Glaze
          </p>
        </div>
        <div className="mx-auto w-full max-w-content xl:max-w-[1240px]">
          <div className="flex flex-col">
            {RELEASES.map((r) => (
              <article
                key={r.version}
                className="grid border-t border-border-separator py-10 first:border-t-0 last:border-b xl:grid-cols-[minmax(0,1fr)_minmax(0,640px)_minmax(0,1fr)] xl:gap-x-16 xl:py-16"
              >
                <aside className="mb-6 xl:mb-0 xl:justify-self-end">
                  <div className="flex items-center gap-3 text-sm text-text-tertiary xl:sticky xl:top-[116px] xl:justify-end xl:pt-[8px]">
                    <span className="inline-flex shrink-0 items-center justify-center rounded-full bg-white/[0.08] px-3 py-1 text-sm font-medium leading-none text-text-secondary">
                      {r.version}
                    </span>
                    <time dateTime={`${r.date} 00:00:00+00`}>{r.dateLabel}</time>
                  </div>
                </aside>
                <div className="min-w-0 xl:col-start-2">
                  <a
                    href={`https://www.glaze.app/changelog/${r.version.replace(/\./g, '-')}`}
                    className="group block w-fit max-w-full"
                  >
                    <h2 className="text-balance font-display text-3xl font-medium leading-[1.08] tracking-tight text-text-primary transition-colors group-hover:text-text-secondary">
                      {r.title}
                    </h2>
                  </a>
                  <div className="mt-6">
                    <Prose blocks={r.body} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
