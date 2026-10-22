// PLACEHOLDER CONTENT. The clause text below is neutral lorem-style filler generated
// deterministically (see ./legal/lorem.js) to match the paragraph counts and approximate lengths
// in specs/SPEC_marketing.md section 4.2 (chars / 6.4 = words). It is NOT the real Awards terms.
// Only the title, last-updated line, the 12 numbered h2s, the "Schedule 1" divider, the 4 h3s,
// the criteria labels (UI copy, same as on /awards), the entry-window labels/dates and the link
// targets mirror the original page.
import { createBuilder } from './legal/lorem.js'

const { p: gen, h2, h3 } = createBuilder(2026)
const w = (chars) => Math.max(3, Math.round(chars / 6.4))
const p = (chars, links) => gen(w(chars), links ? { links } : undefined)

export const AWARDS_TERMS_TITLE = ['Glaze Awards', 'Terms & Conditions']
export const AWARDS_TERMS_UPDATED = '16 July, 2026'

const AWARDS_URL = 'https://glaze.app/awards'
const PRIVACY_URL = 'https://www.glaze.app/privacy'
const MAIL = 'privacy@glaze.app'

const labelled = (label, text) => ({ t: 'p', label, text, links: [] })

export const AWARDS_TERMS_BLOCKS = [
  h2('1. The basics'),
  p(286),
  h3('1.2 The entry window'),
  labelled('Opens', 'Thursday 23 July, 8:00 am BST (12:00 am PDT)'),
  labelled('Closes', '12:00 am (midnight) PDT on Tuesday 28 July (8:00 am BST on Tuesday 28 July)'),
  p(86),
  p(236),

  h2('2. Who can enter'),
  p(103), p(330), p(153), p(102), p(300), p(158),

  h2('3. Your entry'),
  p(107), p(38), p(132), p(237), p(294), p(98),

  h2('4. Judging'),
  p(120), p(182), p(171), p(132, [AWARDS_URL]),

  h2('5. The prize'),
  p(57, [AWARDS_URL]), p(206), p(138), p(86),

  h2('6. Winners and announcement'),
  p(132), p(324, [AWARDS_URL]), p(297, [MAIL]), p(188),

  h2('7. Fair play'),
  p(240),

  h2('8. Verification'),
  p(127), p(92),

  h2('9. Intellectual property'),
  p(89), p(300), p(190), p(242),

  h2('10. Data protection'),
  p(196), p(222, [PRIVACY_URL]),

  h2('11. Limitation of liability'),
  p(276), p(300), p(142),

  h2('12. General'),
  p(122), p(89), p(127),

  { t: 'schedule', eyebrow: 'Schedule 1', title: 'Judging criteria' },
  h3('S1.1 Assessment basis'),
  p(178),
  h3('Core judging criteria'),
  labelled('Design & Aesthetics', 'A thoughtful, cohesive interface that feels polished in every detail and makes the app a pleasure to use.'),
  labelled('App Utility', 'A focused app that solves a real problem, works reliably, and gives people a compelling reason to return.'),
  labelled('Creativity', 'An original idea or unexpected approach that explores what personal desktop software can become.'),
  labelled('Branding & Presentation', 'Overall branding in the Glaze Store, including the quality of your app icon, screenshots, and app presentation.'),
  labelled('Community Traction', 'The genuine enthusiasm your app earns from the community, including upvotes within the Glaze Store.'),
  p(113),
  h3('S1.2 Tie-break'),
  p(239),
]
