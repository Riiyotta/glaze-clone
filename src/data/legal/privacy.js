// PLACEHOLDER CONTENT: all paragraph and list text below is generated lorem-style filler
// (see lorem.js). Only the title, headings and link targets mirror the real page.
// Block shape: SPEC_legal_persona.md B.6 (word counts per block).
import { createBuilder } from './lorem.js'

const { p, ps, h2, h3, ul } = createBuilder(202)

export const PRIVACY_TITLE = 'Glaze Privacy Policy'

export const PRIVACY_BLOCKS = [
  p(82, { links: ['https://www.glaze.app'] }),
  ...ps([37, 44]),
  h2('1. Personal Data we collect'),
  h3('Personal Data you provide to us'),
  p(26),
  p(28, { label: true }),
  p(94, { label: true, links: ['https://stripe.com/gb/privacy'] }),
  ...ps([70, 24, 15], { label: true }),
  h3('Personal Data we receive from third parties'),
  ...ps([74, 43], { label: true }),
  h3('Personal Data we automatically collect'),
  ...ps([12, 9]),
  h2('2. How we use Personal Data'),
  p(8),
  ul(469, 8, { nested: [[3, 4]] }),
  h3('Analytics and Product Improvement'),
  ul(297, 8),
  h2('3. Sharing and disclosure of personal data'),
  p(16),
  ul(382, 5, { labelled: 5 }),
  p(19),
  h2('4. Special Category and Sensitive Data'),
  p(125),
  h2('5. International Data Transfers'),
  ...ps([61, 88]),
  h2('6. How long your personal data will be kept'),
  ...ps([55, 17]),
  h2('7. Your rights and choices'),
  ...ps([63, 39]),
  ul(138, 5),
  ...ps([81, 77, 41]),
  h2('8. Cookies and similar technologies'),
  ...ps([59, 60, 79, 56]),
  p(97, { links: ['www.allaboutcookies.org'] }),
  h2('9. Children'),
  p(44),
  h2('10. Links to other websites'),
  p(84),
  h2('11. Security'),
  ...ps([100, 82]),
  h2('12. Changes to privacy policy'),
  p(88),
  h2('13. Contact us'),
  p(25),
  p(39, { links: ['privacy@glaze.app'] }),
]
