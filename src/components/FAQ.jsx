import { useState } from 'react'
import { FAQS } from '../data/content'
import { FaqChevron } from './icons'
import { useScrollPastDim } from '../motion'

// CLONE_SPEC S4: one item open at a time, none by default, clicking the open item closes it.
export default function FAQ({ items = FAQS, wrapperClassName = 'mt-[160px] xs:mt-[256px]' }) {
  const [openIndex, setOpenIndex] = useState(-1)
  const { ref, visible } = useScrollPastDim()

  return (
    // CLONE_SPEC M6: dims to .15 once scrolled past (IO threshold [0,.35]); opacity .6s cubic-bezier(.4,0,.2,1)
    <div
      ref={ref}
      id="faq"
      data-anim="faq-dim"
      className={`${wrapperClassName} scroll-mt-[160px] transition-opacity duration-[600ms] ${visible ? 'opacity-100' : 'opacity-15'}`}
    >
      <section className="text-balance px-4">
        <div className="mx-auto max-w-content">
          <h2 className="mb-6 text-center font-display text-3xl font-medium leading-[1.1] tracking-tight xs:text-[44px] xs:leading-[1.1]">FAQ</h2>
          <div className="divide-y divide-border-separator border-b border-border-separator">
            {items.map((item, i) => {
              const open = openIndex === i
              return (
                <div key={item.q}>
                  <button
                    type="button"
                    aria-expanded={open}
                    onClick={() => setOpenIndex(open ? -1 : i)}
                    className="flex w-full items-center justify-between py-4 text-left"
                  >
                    <span className="text-balance pr-4 text-base font-medium text-text-primary xs:text-xl">{item.q}</span>
                    <FaqChevron className={`shrink-0 transition-transform duration-300 ${open ? 'rotate-90' : ''}`} />
                  </button>
                  <div className="grid transition-all duration-300 ease-in-out" style={{ gridTemplateRows: open ? '1fr' : '0fr' }}>
                    <div className="overflow-hidden">
                      <p className="whitespace-pre-line text-balance pb-4 text-sm leading-relaxed text-text-secondary xs:text-base xs:leading-relaxed">
                        {item.a}
                        {item.link && (
                          <>
                            <a
                              href={item.link.href}
                              className="text-text-primary underline decoration-white/20 underline-offset-4 transition-colors hover:text-white hover:decoration-white/60"
                            >
                              {item.link.label}
                            </a>
                            {item.link.after}
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
