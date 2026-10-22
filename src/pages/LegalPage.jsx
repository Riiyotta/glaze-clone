import Footer from '../components/Footer'
import { Link } from '../router'
import { hasRoute } from '../routes'

// Shared legal template (SPEC_legal_persona.md B.1/B.2). Block types:
//   { t:'p',  label?, text, links? }          paragraph, optional bold "Label:" lead, trailing links
//   { t:'h2' | 'h3', text }
//   { t:'ul', items:[{ label?, text, links?, children? }] }   children = nested <ul>
// Content in src/data/legal/* is PLACEHOLDER prose, see lorem.js.

const LAST_UPDATED = '30 June, 2026' // spec default; none of the three pages override it
const ENUMERATOR = /^\(?[a-z]\)?[).]\s/i // "(a) " style items: no bullet, keep the indent

// Internal glaze.app URLs -> local route when one exists (pricing/store/blog light up automatically
// once another agent registers them). Everything else keeps its spec target and opens in a new tab.
function resolveLink(href) {
  try {
    const u = new URL(href)
    if (u.hostname === 'glaze.app' || u.hostname === 'www.glaze.app') {
      const path = u.pathname.replace(/\/+$/, '') || '/'
      if (hasRoute(path)) return { local: path + u.search + u.hash }
    }
  } catch {
    /* mailto: etc. */
  }
  return { href }
}

function LegalLink({ text, href }) {
  const r = resolveLink(href)
  if (r.local) return <Link to={r.local}>{text}</Link>
  return (
    <a href={r.href} target="_blank" rel="noopener noreferrer">
      {text}
    </a>
  )
}

function Inline({ item }) {
  return (
    <>
      {item.label && <strong>{item.label}:</strong>}
      {item.label && item.text ? ' ' : ''}
      {item.text}
      {(item.links || []).map((l, i) => (
        <span key={l.href + i}>
          {item.text || item.label || i ? ' ' : ''}
          <LegalLink {...l} />
        </span>
      ))}
    </>
  )
}

function List({ items }) {
  return (
    <ul>
      {items.map((it, i) => (
        <li key={i} className={ENUMERATOR.test(it.text) ? 'list-none' : undefined}>
          <Inline item={it} />
          {it.children && <List items={it.children} />}
        </li>
      ))}
    </ul>
  )
}

export default function LegalPage({ title, blocks }) {
  return (
    <main className="flex min-h-dvh flex-col">
      <section className="px-4 pb-24 pt-[172px]">
        <div className="mx-auto max-w-content">
          <h1 className="mb-3 text-balance text-center text-4xl font-medium leading-[1.1] tracking-tight text-white xs:text-5xl xs:leading-[1.1]">
            {title}
          </h1>
          <p className="mb-8 text-center text-sm text-text-secondary">Last Updated: {LAST_UPDATED}</p>
          <div className="legal-prose space-y-4 text-base leading-[1.6] text-white">
            {blocks.map((b, i) => {
              if (b.t === 'h2') return <h2 key={i}>{b.text}</h2>
              if (b.t === 'h3') return <h3 key={i}>{b.text}</h3>
              if (b.t === 'ul') return <List key={i} items={b.items} />
              return (
                <p key={i}>
                  <Inline item={b} />
                </p>
              )
            })}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
