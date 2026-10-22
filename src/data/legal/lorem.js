// PLACEHOLDER CONTENT. Not the real legal text of any product.
// Every paragraph and list item in src/data/legal/{terms,privacy,aup}.js is neutral lorem-style
// filler generated here, deterministically, to match the per-block word counts in
// specs/SPEC_legal_persona.md B.6 so page heights stay close to the original. Headings, titles
// and link targets are the only real strings. Replace with real copy before shipping.

const WORDS = (
  'lorem ipsum dolor sit amet consectetur adipiscing elit sed eiusmod tempor incididunt labore ' +
  'dolore magna aliqua enim minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ' +
  'commodo consequat duis aute irure reprehenderit voluptate velit esse cillum fugiat nulla ' +
  'pariatur excepteur sint occaecat cupidatat proident sunt culpa officia deserunt mollit anim ' +
  'laborum perspiciatis unde omnis iste natus error voluptatem accusantium doloremque laudantium ' +
  'totam rem aperiam eaque ipsa quae illo inventore veritatis quasi architecto beatae vitae dicta ' +
  'explicabo nemo ipsam quia voluptas aspernatur aut odit fugit consequuntur magni dolores eos ' +
  'ratione sequi nesciunt neque porro quisquam dolorem adipisci numquam eius modi tempora incidunt ' +
  // short words keep the average word length close to ordinary English prose (~5.3 letters)
  'et ut ad in ea ex id est sed qui non dui eu at ac ab de eo sit vel per cum nam iam sic ita hic hoc ubi quo nec aut vero tum'
).split(' ')

const SENTENCE_LENGTHS = [11, 16, 9, 14, 19, 12, 8, 15, 13, 17]
const LABELS = ['Note', 'Scope', 'Example', 'Summary', 'Details']
const LETTERS = 'abcdefghijklmnopqrstuvwxyz'

// mulberry32: tiny seeded PRNG, so output is identical on every build and load.
function rng(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Auto-link rules from the spec (B.1): emails -> mailto:, www. -> https://.
export function linkFor(text) {
  if (/^https?:\/\//i.test(text)) return { text, href: text }
  if (/^www\./i.test(text)) return { text, href: `https://${text}` }
  if (/^[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}$/.test(text)) return { text, href: `mailto:${text}` }
  throw new Error(`unlinkable: ${text}`)
}

export function createBuilder(seed) {
  const rand = rng(seed)
  let labelIdx = 0
  let sentenceIdx = seed % SENTENCE_LENGTHS.length

  function words(n) {
    if (n <= 0) return ''
    const out = []
    let sentenceLeft = 0
    let first = true
    while (out.length < n) {
      if (sentenceLeft === 0) {
        sentenceLeft = Math.min(SENTENCE_LENGTHS[sentenceIdx++ % SENTENCE_LENGTHS.length], n - out.length)
        first = true
      }
      let w = WORDS[Math.floor(rand() * WORDS.length)]
      if (first) w = w[0].toUpperCase() + w.slice(1)
      first = false
      out.push(w)
      sentenceLeft--
      if (sentenceLeft === 0) out[out.length - 1] += '.'
    }
    return out.join(' ')
  }

  // Inline content = [bold "Label:"] + filler + links; the total is n words.
  function inline(n, { label = false, links = [] } = {}) {
    const lab = label ? LABELS[labelIdx++ % LABELS.length] : undefined
    const linkObjs = links.map(linkFor)
    const filler = Math.max(0, n - (label ? 1 : 0) - linkObjs.length)
    return { label: lab, text: words(filler), links: linkObjs }
  }

  const p = (n, opts) => ({ t: 'p', ...inline(n, opts) })
  const ps = (counts, opts) => counts.map((n) => p(n, opts))
  const h2 = (text) => ({ t: 'h2', text })
  const h3 = (text) => ({ t: 'h3', text })

  // Split `total` words across `count` items with deterministic +-40% variation (largest remainder).
  function split(total, count, min) {
    const weights = Array.from({ length: count }, () => 0.6 + rand() * 0.8)
    const sum = weights.reduce((a, b) => a + b, 0)
    const spare = Math.max(0, total - min * count)
    const raw = weights.map((w) => (w / sum) * spare)
    const out = raw.map((r) => min + Math.floor(r))
    let rest = total - out.reduce((a, b) => a + b, 0)
    raw
      .map((r, i) => [r - Math.floor(r), i])
      .sort((a, b) => b[0] - a[0])
      .forEach(([, i]) => {
        if (rest > 0) {
          out[i]++
          rest--
        }
      })
    return out
  }

  // ul(totalWords, topItems, { enumerate, labelled, nested: [[afterTopIndex, childCount], ...] })
  // totalWords covers every li including nested ones (matches the spec's "items, words").
  // enumerate = "(a) "-style items (rendered without bullets). labelled = first N items get a bold label.
  function ul(total, count, { enumerate = false, labelled = 0, nested = [] } = {}) {
    const nestedCount = nested.reduce((a, [, c]) => a + c, 0)
    const counts = split(total, count + nestedCount, enumerate ? 3 : labelled ? 3 : 1)
    const items = []
    let k = 0
    for (let i = 0; i < count; i++) {
      const lead = enumerate ? `(${LETTERS[i % 26]}) ` : ''
      const item = inline(counts[k++], { label: i < labelled })
      // The enumerator counts as one word of the item's budget.
      if (enumerate) item.text = `${lead}${words(Math.max(0, counts[k - 1] - 1))}`
      items.push(item)
    }
    // Nested items directly follow their parent's budget slot.
    nested.forEach(([at, c]) => {
      items[at].children = Array.from({ length: c }, () => inline(counts[k++], {}))
    })
    return { t: 'ul', items }
  }

  return { p, ps, h2, h3, ul }
}
