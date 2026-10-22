// Body text below is PLACEHOLDER (deterministic filler). Versions, dates, titles, section
// headings, list sizes and media placement follow SPEC_blog.md section 3.
import { h2, img, p, ul } from './placeholder'

const C = '/assets/blog/optimized/changelog-'
const hero = (v, n = 1) => img(`${C}${v}-${n}.jpg`, 'image', 2400, 1200)
const NEW = '✨ New'
const SDK = '📦 SDK & Developer Changes'
const IMP = '💎 Improvements'
const FIX = '🐞 Fixes'
const I = 11 // words per list item
const J = 23 // longer items in the first three releases (article heights per spec)

export const RELEASES = [
  { version: '0.14.3.0', date: '2026-09-24', dateLabel: 'September 24, 2026', title: 'Bug fixes and improvements',
    body: [h2(NEW), ul(1, J), h2(IMP), ul(1, J), h2(FIX), ul(3, J)] },
  { version: '0.14.2.0', date: '2026-09-04', dateLabel: 'September 4, 2026', title: 'Fable 5.1 and bug fixes',
    body: [h2(NEW), h2(IMP), ul(2, J), h2(FIX), ul(4, J)] },
  { version: '0.14.1.0', date: '2026-08-24', dateLabel: 'August 24, 2026', title: 'Bug fixes & Improvements',
    body: [h2(NEW), ul(1, J), h2(IMP), ul(1, J), h2(FIX), ul(5, J)] },
  { version: '0.14.0.0', date: '2026-08-19', dateLabel: 'August 19, 2026', title: 'Bring Your Own Agent, Creator Hub and more',
    body: [
      h2('🤖 Bring Your Own Agent'), p(36), p(27), hero('0-14-0-0', 1), p(30),
      h2('💻 Your projects, out in the open'), p(39, { codes: ['~/Glaze/projects'] }), p(26), p(21),
      h2('📊 Creator Hub'), p(33), hero('0-14-0-0', 2), p(22), p(28, { codes: ['hub.glaze'] }), ul(5, I),
      h2('💳 Pro is now $10'), p(31), p(25), p(20, { codes: ['pro'] }), hero('0-14-0-0', 3),
      h2('👥 Team stores are free during beta'), p(28), p(22), p(16), p(14),
      h2(NEW), ul(6, I), h2(IMP), ul(4, I), h2(FIX), ul(5, I),
    ] },
  { version: '0.13.0.0', date: '2026-08-05', dateLabel: 'August 5, 2026', title: 'App Remixing & Native Swift support',
    hero: true, heroSize: [1200, 600],
    body: [img(`${C}0-13-0-0-1.jpg`, 'image', 1200, 600), p(57), h2(NEW), ul(7, I), h2(SDK), ul(4, I), h2(IMP), ul(3, I), h2(FIX), ul(6, I)] },
  { version: '0.12.0.0', date: '2026-07-29', dateLabel: 'July 29, 2026', title: 'Bug Fixes & Improvements',
    body: [hero('0-12-0-0'), h2(IMP), ul(9, I), h2(FIX), ul(7, I)] },
  { version: '0.11.0.0', date: '2026-07-22', dateLabel: 'July 22, 2026', title: 'Glaze AI: build, publish, and use AI-powered apps',
    body: [hero('0-11-0-0'), h2('✨ Glaze AI'), p(46, { codes: ['glaze.ai'] }), p(38), p(32, { codes: ['AI'] }),
      h2('🏆 Glaze Awards'), p(41), p(35), p(29, { links: [{ text: 'Glaze Awards', href: 'https://glaze.app/awards' }] }),
      h2(NEW), ul(3, I), h2(IMP), ul(5, I), h2(FIX), ul(6, I)] },
  { version: '0.10.0.0', date: '2026-07-14', dateLabel: 'July 14, 2026', title: 'Invite friends, affiliate program and MCP servers in apps',
    body: [hero('0-10-0-0'), h2('🎁 Invite friends, earn rewards'), p(44), p(38), p(31, { links: [{ text: 'blog', href: 'https://www.glaze.app/blog/affiliate-program' }] }), p(26),
      h2(NEW), ul(2, I), h2(SDK), ul(1, I), h2(IMP), ul(3, I), h2(FIX), ul(2, I)] },
  { version: '0.9.0.0', date: '2026-07-08', dateLabel: 'July 8, 2026', title: 'App Feedback and Queue Editing',
    body: [hero('0-9-0-0', 1), h2('💬 Send & Receive Feedback'), p(40), p(34), p(28), hero('0-9-0-0', 2), ul(3, I),
      h2('✏️ Edit & Reorder Queue'), p(36), p(30), p(24), hero('0-9-0-0', 3), ul(4, I),
      h2('🔬 Inspector in Annotation'), p(33), p(27), p(22), ul(4, I),
      h2(NEW), ul(5, I), h2(IMP), ul(10, I), h2(FIX), ul(4, I)] },
  { version: '0.8.0.0', date: '2026-06-30', dateLabel: 'June 30, 2026', title: 'Bug Fixes and Improvements',
    body: [h2(IMP), ul(9, I), h2(FIX), ul(4, I)] },
  { version: '0.7.0.0', date: '2026-06-26', dateLabel: 'June 26, 2026', title: 'File Attachments & Team Store Trial',
    body: [hero('0-7-0-0'), h2('⚡ Attach anything in chat'), p(42), p(35),
      h2('👥 Team Store Trial'), p(38),
      h2(NEW), ul(4, I), h2(SDK), ul(4, I), h2(IMP), ul(3, I), h2(FIX), ul(4, I)] },
]
