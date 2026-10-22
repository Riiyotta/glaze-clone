import '../blog.css'
import AuthorRow from '../components/blog/AuthorRow'
import Footer from '../components/Footer'
import { POSTS } from '../data/blog'
import { Link } from '../router'

// SPEC_blog sections 0.1 and 1. No entrance motion on this route.
export default function BlogIndex() {
  return (
    <main className="flex min-h-dvh flex-col">
      <section className="px-4 pb-20 pt-[140px] xs:pt-40">
        <div className="mx-auto mb-12 w-full max-w-[680px] text-center xs:mb-16">
          <h1 className="mb-4 px-4 font-display text-[36px] font-medium leading-[1.1] tracking-[-0.9px] text-text-primary xs:px-0 xs:text-5xl xs:tracking-[-1.2px]">
            Blog
          </h1>
          <p className="mx-auto text-base leading-relaxed text-text-tertiary xs:max-w-[440px] xs:text-lg">
            Notes on building personal desktop software.
          </p>
        </div>
        <div className="mx-auto w-full max-w-content">
          <div className="flex flex-col">
            {POSTS.map((post) => (
              <article key={post.slug} className="border-t border-border-separator py-10 first:border-t-0 xs:py-16">
                <div className="min-w-0">
                  <Link to={`/blog/${post.slug}`} className="group block">
                    <img
                      src={post.cover}
                      alt={post.coverAlt}
                      width={post.coverSize[0]}
                      height={post.coverSize[1]}
                      loading="lazy"
                      draggable="false"
                      onContextMenu={(e) => e.preventDefault()}
                      className="aspect-[1.9/1] h-auto w-full rounded-[12px] border border-border-separator object-cover transition-opacity group-hover:opacity-90"
                    />
                    <time dateTime={post.date} className="mt-8 block text-[15px] leading-[22px] text-text-tertiary">
                      {post.dateLabel}
                    </time>
                    <h2 className="mt-4 text-balance font-display text-[28px] font-medium leading-[1.08] tracking-tight text-text-primary transition-colors group-hover:text-text-secondary xs:text-[34px]">
                      {post.title}
                    </h2>
                  </Link>
                  <AuthorRow author={post.author} className="mt-5" />
                  <p className="mt-5 text-[16px] leading-[1.6] text-text-secondary xs:text-[17px]">{post.excerpt}</p>
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
