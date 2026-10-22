import { CriteriaIcon, GlobeIcon, BlueskyIcon, InfoIcon, LinkedInIcon, ThreadsIcon, XBrandIcon } from '../marketing-icons'
import Tooltip from '../Tooltip'

/* ------------------------------------------------------------------ prizes (3.6) */
const PRIZES = [
  { src: '/assets/award-gold@2x-C2t6avtW.png', title: 'Gold', sub: '$10,000' },
  { src: '/assets/award-silver@2x-Bg8X11yF.png', title: 'Silver', sub: '$5,000' },
  { src: '/assets/award-bronze@2x-CZBT3HSE.png', title: 'Bronze', sub: '$2,500' },
  { src: '/assets/marketing/award-peoples-choice@2x-C7Vw5M8e.png', title: '7 Finalists', sub: '$1,000 each' },
]

// The spec only captured the start of this sentence (it is clause 2.2 of the terms). Everything
// after "Burundi," is PLACEHOLDER filler, not the real list of regions.
const ELIGIBILITY =
  'Due to applicable payment limitations, promotional contest restrictions, sanctions, and the regions in which the AI services powering Glaze are available, the Awards is not open to residents of the following regions: Afghanistan, Belarus, Bosnia and Herzegovina, Brazil, Burkina Faso, Burundi, lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua, ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat, duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur, excepteur sint occaecat cupidatat non proident.'

export function Prizes() {
  return (
    <div className="mt-[160px] px-4 xs:mt-[256px]">
      <fieldset className="mx-auto min-w-0 max-w-page rounded-3xl border border-border-primary bg-transparent px-3 py-10 xs:px-6 xs:py-12">
        <legend className="mx-auto whitespace-nowrap px-4 text-center font-display text-sm font-medium leading-5 text-text-secondary xs:px-5 xs:text-base xs:leading-6">
          Cash prizes for winners
        </legend>
        <div className="grid grid-cols-2 gap-x-3 gap-y-12 min-[760px]:grid-cols-4">
          {PRIZES.map((p) => (
            <article key={p.title} className="flex flex-col items-center text-center">
              <img src={p.src} alt="" className="h-16 w-16 object-contain xs:h-[72px] xs:w-[72px]" />
              <h2 className="mt-3 font-display text-2xl font-medium leading-tight text-white xs:text-3xl xs:leading-tight">{p.title}</h2>
              <p className="mt-2 font-display text-lg font-medium leading-tight text-text-secondary xs:text-xl xs:leading-tight">{p.sub}</p>
            </article>
          ))}
        </div>
      </fieldset>
      <div className="mt-4 flex justify-center">
        <Tooltip side="bottom" content={ELIGIBILITY} panelClassName="w-[min(560px,calc(100vw-48px))]">
          {(tp) => (
            <button
              type="button"
              {...tp}
              className="flex cursor-default items-center gap-1.5 text-xs leading-4 text-text-secondary transition-colors hover:text-white aria-expanded:text-white"
            >
              <InfoIcon className="h-3.5 w-3.5" />
              Eligible Countries
            </button>
          )}
        </Tooltip>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ jury (3.7) */
const NB = ' '
const JURY = [
  {
    name: 'Thomas Paul Mann',
    role: 'CEO,',
    org: ['Raycast', 'https://www.raycast.com/'],
    img: '/assets/marketing/jury-thomas-paul-mann-DxpUeMsu.jpg',
    links: [
      ['website', GlobeIcon, 'https://thomaspaulmann.com/'],
      ['on X', XBrandIcon, 'https://x.com/thomaspaulmann'],
      ['on Threads', ThreadsIcon, 'https://www.threads.com/@thomaspaulmann'],
      ['on Bluesky', BlueskyIcon, 'https://bsky.app/profile/thomaspaulmann.com'],
    ],
  },
  {
    name: 'Casey Newton',
    role: 'Founder,',
    org: ['Platformer', 'https://www.platformer.news/'],
    img: '/assets/marketing/jury-casey-newton-CgjmWGYh.jpg',
    links: [
      ['website', GlobeIcon, 'https://cnewton.org/'],
      ['on X', XBrandIcon, 'https://x.com/CaseyNewton'],
      ['on Threads', ThreadsIcon, 'https://www.threads.com/@crumbler'],
      ['on Bluesky', BlueskyIcon, 'https://bsky.app/profile/caseynewton.bsky.social'],
    ],
  },
  {
    name: 'Aaron Epstein',
    role: 'General Partner,',
    org: ['YC', 'https://www.ycombinator.com/'],
    img: '/assets/marketing/jury-aaron-epstein-CI99EqL_.jpg',
    links: [
      ['website', GlobeIcon, 'https://www.ycombinator.com/people/aaron-epstein'],
      ['on X', XBrandIcon, 'https://x.com/aaron_epstein'],
      ['on LinkedIn', LinkedInIcon, 'https://www.linkedin.com/in/aaron-epstein-a97105/'],
    ],
  },
  {
    name: 'Nate Parrott',
    role: 'Design,',
    org: ['Anthropic', 'https://www.anthropic.com/'],
    img: '/assets/marketing/jury-nate-parrott-DBsKCChd.jpg',
    links: [
      ['website', GlobeIcon, 'https://nateparrott.com/'],
      ['on X', XBrandIcon, 'https://x.com/nateparrott'],
      ['on LinkedIn', LinkedInIcon, 'https://www.linkedin.com/in/nate-p-69a2151b7/'],
    ],
  },
  {
    name: 'Zeh Fernandes',
    role: `Head${NB}of${NB}Design,`,
    org: ['Resend', 'https://resend.com/'],
    img: '/assets/marketing/jury-zeh-fernandes-BrsmNVwG.jpg',
    links: [
      ['website', GlobeIcon, 'https://zehfernandes.com/'],
      ['on X', XBrandIcon, 'https://x.com/zehf'],
      ['on LinkedIn', LinkedInIcon, 'https://www.linkedin.com/in/zehfernandes'],
    ],
  },
]

const H2 = 'font-display text-3xl font-medium leading-[1.1] tracking-tight text-white xs:text-[44px] xs:leading-[1.1]'

export function Jury() {
  return (
    <div className="mt-[160px] px-4 xs:mt-[256px]">
      <section className="mx-auto max-w-page text-center">
        <h2 className={H2}>The jury</h2>
        <div className="mt-10 flex flex-wrap justify-center gap-x-3 gap-y-8 xs:mt-12 min-[760px]:gap-x-0 min-[760px]:gap-y-12">
          {JURY.map((j) => (
            <article key={j.name} className="flex w-[calc(33.333%-0.5rem)] flex-col items-center min-[760px]:w-1/5">
              <img
                src={j.img}
                alt={j.name}
                className="size-[88px] rounded-full object-cover grayscale min-[760px]:size-[104px]"
              />
              <h3 className="mt-4 font-display text-[15px] font-medium leading-[18.8px] text-white min-[760px]:text-lg min-[760px]:leading-[22.5px]">
                {j.name}
              </h3>
              <p className="mt-1.5 text-sm leading-snug text-text-secondary">
                <span className="block">
                  {j.role}{' '}
                  <a
                    href={j.org[1]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border-b border-border-secondary transition-colors hover:border-white/20 hover:text-white"
                  >
                    {j.org[0]}
                  </a>
                </span>
              </p>
              <div aria-label={`${j.name} links`} className="mt-4 flex items-center gap-2.5 text-text-tertiary">
                {j.links.map(([label, Icon, href]) => (
                  <a
                    key={href}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${j.name} ${label}`}
                    className="transition-colors hover:text-white"
                  >
                    <Icon className="h-3.5 w-3.5 min-[760px]:h-4 min-[760px]:w-4" />
                  </a>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

/* ------------------------------------------------------------------ criteria (3.8) */
const CRITERIA = [
  ['Design & Aesthetics', 'A thoughtful, cohesive interface that feels polished in every detail and makes the app a pleasure to use.'],
  ['App Utility', 'A focused app that solves a real problem, works reliably, and gives people a compelling reason to return.'],
  ['Creativity', 'An original idea or unexpected approach that explores what personal desktop software can become.'],
  ['Branding & Presentation', 'Overall branding in the Glaze Store, including the quality of your app icon, screenshots, and app presentation.'],
  ['Community Traction', 'The genuine enthusiasm your app earns from the community, including upvotes within the Glaze Store.'],
]

export function Criteria() {
  return (
    <div className="mt-[160px] px-4 xs:mt-[256px]">
      <section className="mx-auto max-w-page">
        <h2 className={`text-center ${H2}`}>Selection criteria</h2>
        <div className="mt-10 flex flex-wrap justify-center gap-x-12 gap-y-12 xs:mt-12">
          {CRITERIA.map(([title, body], i) => (
            <article key={title} className="w-full text-center min-[700px]:w-[calc(50%-1.5rem)] min-[1000px]:w-[calc(33.333%-2rem)]">
              <h3 className="flex items-center justify-center gap-2 font-display text-xl font-medium leading-7 text-white">
                <CriteriaIcon index={i} className="h-5 w-5 shrink-0" />
                {title}
              </h3>
              <p className="mt-2.5 text-balance text-sm leading-relaxed text-text-secondary xs:text-base xs:leading-[26px]">{body}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
