import { useCallback, useRef, useState } from 'react'
import '../blog.css'
import AuthorRow, { Avatar } from '../components/blog/AuthorRow'
import Lightbox from '../components/blog/Lightbox'
import Prose from '../components/blog/Prose'
import DownloadCTA from '../components/DownloadCTA'
import Footer from '../components/Footer'
import { getPost } from '../data/blog'
import NotFoundPage from './NotFoundPage'

// SPEC_blog section 2. No entrance motion on this route.
export default function BlogPost({ params }) {
  const post = getPost(params.slug)
  const [open, setOpen] = useState(null)
  const [copied, setCopied] = useState(false)
  const origin = useRef(null)
  const timer = useRef(null)
  const close = useCallback(() => {
    setOpen(null)
    origin.current?.focus()
  }, [])
  if (!post) return <NotFoundPage />

  const images = post.body.filter((b) => b.type === 'img')
  const url = `https://www.glaze.app/blog/${post.slug}`

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: post.title, text: post.excerpt, url })
      } catch (e) {
        /* cancelled: do nothing */
      }
      return
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(false), 1600)
    } catch (e) {
      /* clipboard unavailable */
    }
  }

  return (
    <main className="flex min-h-dvh flex-col">
      <section className="px-4 pb-20 pt-[132px] xs:pt-[172px]">
        <div className="mx-auto w-full max-w-content">
          <article className="min-w-0">
            <div className="overflow-hidden rounded-[18px] border border-border-separator bg-white/[0.04]">
              <img
                src={post.cover}
                alt={post.coverAlt}
                width={post.coverSize[0]}
                height={post.coverSize[1]}
                draggable="false"
                className="aspect-[1.9/1] h-auto w-full object-cover"
              />
            </div>
            <header className="mt-10">
              <time dateTime={post.date} className="block text-[15px] leading-[22px] text-text-tertiary">
                {post.dateLabel}
              </time>
              <h1 className="mt-3 font-display text-[32px] font-medium leading-[1.05] tracking-[-0.8px] text-text-primary xs:text-[36px] xs:tracking-[-0.9px]">
                {post.title}
              </h1>
              <AuthorRow author={post.author} className="mt-5" />
            </header>
            <div className="mt-8">
              <Prose
                blocks={post.body}
                onImage={(i, el) => {
                  origin.current = el
                  setOpen(i)
                }}
              />
            </div>
            <footer className="mt-16 border-t border-border-separator pt-10 xs:mt-20 xs:pt-12">
              <div className="flex items-center justify-between gap-6 text-[15px] leading-[22px] text-text-tertiary">
                <div className="flex items-center gap-2.5">
                  <Avatar author={post.author} />
                  <span>{post.author.name}</span>
                  <span>·</span>
                  <time dateTime={post.date}>{post.dateLabel}</time>
                </div>
                <button
                  type="button"
                  onClick={share}
                  className="shrink-0 text-text-tertiary transition-colors hover:text-text-secondary"
                >
                  {copied ? 'Copied' : 'Share'}
                </button>
              </div>
            </footer>
            <DownloadCTA compact />
          </article>
        </div>
      </section>
      <Footer />
      {open !== null && <Lightbox images={images} start={open} onClose={close} />}
    </main>
  )
}
