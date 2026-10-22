import DownloadCTA from '../components/DownloadCTA'
import FAQ from '../components/FAQ'
import Footer from '../components/Footer'
import { CheckIcon } from '../components/icons'
import { ClaudeMark, InfoIcon } from '../components/marketing-icons'
import Tooltip from '../components/Tooltip'
import { PLANS, PRICING_FAQS } from '../data/pricing'

// SPEC_marketing section 1. No entrance animations on this page.
function Feature({ f, first }) {
  return (
    <li className={`flex items-start gap-2 ${first ? '' : 'mt-3'}`}>
      {f.icon === 'claude' ? (
        <ClaudeMark className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      ) : (
        <CheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-text-primary [stroke-width:1.8]" />
      )}
      <div className="flex min-w-0 flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
        <span>
          {f.text}
          {f.info && (
            <Tooltip
              side="top"
              content={f.info}
              panelClassName="w-max max-w-[min(280px,calc(100vw-48px))] text-balance"
              wrapperClassName="ml-1 align-[-2px]"
            >
              {(tp) => (
                <button
                  type="button"
                  aria-label={`About ${f.text}`}
                  {...tp}
                  className="inline-flex size-4 cursor-pointer touch-manipulation items-center justify-center text-text-secondary focus-visible:outline-none"
                >
                  <InfoIcon className="size-3" />
                </button>
              )}
            </Tooltip>
          )}
        </span>
        {f.badge && (
          <span className="inline-flex shrink-0 items-center justify-center rounded-full bg-white/[0.08] px-2 py-0.5 text-xs font-medium text-text-secondary">
            {f.badge}
          </span>
        )}
      </div>
    </li>
  )
}

function PlanCard({ plan }) {
  const footerBase = 'mt-10 flex flex-col items-start gap-2 text-left min-[760px]:mt-auto min-[760px]:pt-16'
  return (
    <article
      className={`flex flex-col rounded-2xl border border-border-separator p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] ${
        plan.highlighted ? 'bg-white/5' : ''
      }`}
    >
      <h2 className="text-3xl font-medium leading-none text-white">{plan.title}</h2>
      <div className="mt-8 flex flex-1 flex-col gap-5 text-sm font-medium leading-[18px] text-white min-[760px]:mt-14 min-[760px]:flex-none">
        <ul className="flex flex-col">
          {plan.lead && <li className="mb-3 list-none">{plan.lead}</li>}
          {plan.features.map((f, i) => (
            <Feature key={f.text} f={f} first={i === 0} />
          ))}
        </ul>
      </div>
      {plan.price ? (
        <div className={footerBase}>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 tracking-[0.022px]">
            <p className="text-xl font-medium leading-5 text-white">{plan.price.amount}</p>
            <p className="text-sm leading-[14px] text-text-secondary">{plan.price.unit}</p>
          </div>
        </div>
      ) : (
        <div className={`${footerBase} min-[760px]:min-h-5 min-[760px]:justify-center`}>
          <p className="hidden text-sm leading-[14px] text-text-secondary xs:block">{plan.caption}</p>
          <p className="text-sm leading-[1.35] text-text-tertiary xs:hidden">{plan.caption}</p>
        </div>
      )}
    </article>
  )
}

export default function Pricing() {
  return (
    <main className="flex min-h-dvh flex-col">
      <section className="px-4 pt-[140px] xs:pt-40">
        <div className="mx-auto max-w-page">
          <h1 className="text-center font-display text-4xl font-medium leading-[1.1] tracking-tight text-white xs:text-5xl xs:leading-[1.1]">
            Pricing
          </h1>
          <div className="mt-8 grid grid-cols-1 gap-3 min-[992px]:grid-cols-3">
            {PLANS.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        </div>
      </section>
      <FAQ items={PRICING_FAQS} wrapperClassName="mt-[128px] xs:mt-[180px]" />
      <DownloadCTA />
      <Footer />
    </main>
  )
}
