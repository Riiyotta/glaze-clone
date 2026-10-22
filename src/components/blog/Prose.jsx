import { hasRoute } from '../../routes'
import { Link } from '../../router'

// Resolve absolute glaze.app URLs to local routes when one exists (SPEC_blog 7, Build's decision).
function resolve(href) {
  const m = /^https?:\/\/(?:www\.)?glaze\.app(\/[^?#]*)?$/i.exec(href)
  if (m) {
    const path = m[1] || '/'
    if (hasRoute(path)) return { to: path, local: true }
  }
  return { to: href, local: false }
}

const linkCls =
  'text-text-primary underline decoration-white/30 underline-offset-4 transition-colors hover:text-text-secondary'

export function Segs({ segs }) {
  return segs.map((s, i) => {
    if (s.k === 'strong') return <strong key={i}>{s.text}</strong>
    if (s.k === 'em') return <em key={i}>{s.text}</em>
    if (s.k === 'code')
      return (
        <code key={i} className="rounded-[4px] bg-white/[0.06] px-1.5 py-0.5 font-mono text-[0.92em] text-text-primary">
          {s.text}
        </code>
      )
    if (s.k === 'a') {
      const r = resolve(s.href)
      return r.local ? (
        <Link key={i} to={r.to} className={linkCls}>
          {s.text}
        </Link>
      ) : (
        <a key={i} href={r.to} target="_blank" rel="noopener noreferrer" className={linkCls}>
          {s.text}
        </a>
      )
    }
    return <span key={i}>{s.text}</span>
  })
}

// Renders placeholder blocks. `onImage(index)` makes images clickable (blog posts); omitted on the changelog.
export default function Prose({ blocks, onImage }) {
  let imgIndex = -1
  return (
    <div className="markdown-content min-w-0 space-y-5 text-base leading-[25px] text-white/80 xs:text-[17px] xs:leading-[27px]">
      {blocks.map((b, i) => {
        switch (b.type) {
          case 'h2':
            return (
              <h2 key={i} className="pt-3 text-xl font-medium leading-[1.25] text-text-primary">
                {b.text}
              </h2>
            )
          case 'h3':
            return (
              <h3 key={i} className="pt-2 text-lg font-medium leading-[1.3] text-text-primary">
                {b.text}
              </h3>
            )
          case 'hr':
            return <hr key={i} style={{ margin: '28px 0' }} className="h-px border-0 bg-white/[0.08]" />
          case 'ul':
            return (
              <ul key={i} className="markdown-list markdown-list-unordered text-white/80">
                {b.items.map((it, j) => (
                  <li key={j}>
                    <Segs segs={it.segs} />
                  </li>
                ))}
              </ul>
            )
          case 'img': {
            const idx = ++imgIndex
            const el = (
              <img
                src={b.src}
                alt={b.alt}
                width={b.width}
                height={b.height}
                loading="lazy"
                draggable="false"
                data-markdown-image
                className="my-6 block h-auto w-full rounded-[8px] border border-border-separator"
              />
            )
            return (
              <p key={i}>
                {onImage ? (
                  <button
                    type="button"
                    aria-label={`Open image: ${b.alt}`}
                    onClick={(e) => onImage(idx, e.currentTarget)}
                    className="block w-full rounded-[8px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                  >
                    {el}
                  </button>
                ) : (
                  el
                )}
              </p>
            )
          }
          default:
            return (
              <p key={i}>
                <Segs segs={b.segs} />
              </p>
            )
        }
      })}
    </div>
  )
}
