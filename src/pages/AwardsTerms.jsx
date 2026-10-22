import Footer from '../components/Footer'
import { AWARDS_TERMS_BLOCKS, AWARDS_TERMS_TITLE, AWARDS_TERMS_UPDATED } from '../data/awards-terms'
import { Link } from '../router'
import { hasRoute } from '../routes'

// SPEC_marketing section 4. Same page shell as LegalPage but with its own typography
// (h2 30px/600, h3 18px/600, Schedule divider, h1 in two block spans), so it does not reuse it.

function Anchor({ href, text }) {
  try {
    const u = new URL(href)
    if (u.hostname === 'glaze.app' || u.hostname === 'www.glaze.app') {
      const path = u.pathname.replace(/\/+$/, '') || '/'
      if (hasRoute(path)) return <Link to={path}>{text}</Link>
    }
  } catch {
    /* mailto: */
  }
  return (
    <a href={href} target={href.startsWith('mailto:') ? undefined : '_blank'} rel="noopener noreferrer">
      {text}
    </a>
  )
}

function Paragraph({ b }) {
  return (
    <p>
      {b.label && <strong className="font-semibold">{b.label} :</strong>}
      {b.label && ' '}
      {b.text}
      {(b.links || []).map((l, i) => (
        <span key={l.href}>
          {b.text || i ? ' ' : ''}
          <Anchor {...l} />
        </span>
      ))}
    </p>
  )
}

export default function AwardsTerms() {
  return (
    <main className="flex min-h-dvh flex-col">
      <section className="px-4 pb-24 pt-[172px]">
        <div className="mx-auto max-w-content">
          <h1 className="mb-3 text-balance text-center text-4xl font-medium leading-[1.1] tracking-tight text-white xs:text-5xl xs:leading-[1.1]">
            {AWARDS_TERMS_TITLE.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h1>
          <p className="mb-8 text-center text-sm text-text-secondary">Last Updated: {AWARDS_TERMS_UPDATED}</p>
          <div
            className={[
              'text-base leading-[1.6] text-white [&>*:not(:last-child)]:mb-4',
              '[&_h2]:text-balance [&_h2]:pt-6 [&_h2]:text-3xl [&_h2]:font-semibold [&_h2]:leading-9',
              '[&_h3]:text-balance [&_h3]:pt-2 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:leading-7',
              '[&_a]:underline [&_a]:transition-colors [&_a:hover]:text-text-secondary',
            ].join(' ')}
          >
            {AWARDS_TERMS_BLOCKS.map((b, i) => {
              if (b.t === 'h2') return <h2 key={i}>{b.text}</h2>
              if (b.t === 'h3') return <h3 key={i}>{b.text}</h3>
              if (b.t === 'schedule')
                return (
                  <div key={i} className="mt-16 border-t border-border-separator pt-12 text-center">
                    <p className="text-sm font-medium text-text-secondary">{b.eyebrow}</p>
                    <h2 className="!pt-1">{b.title}</h2>
                  </div>
                )
              return <Paragraph key={i} b={b} />
            })}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
