// PLACEHOLDER TEXT ONLY. Article/changelog body prose in this clone is deterministic filler
// sized to the original word counts; it is not the original copy.
const LONG = (
  'lantern garden window signal harbor meadow copper pocket velvet timber canvas ribbon summit marble thread anchor beacon cedar'
  + ' glimmer hollow island jasper kindle lumen maple nimbus pebble quartz ripple saffron tundra willow bridge candle lagoon'
).split(' ')
const WORDS = (
  'amber river lamp quiet yard glass sign paper port moss iron orbit tab silk oak wave rope peak '
  + 'tide arc fern bay dune ember fog glow hill isle jade kite lime map nest oasis pine quill reef '
  + 'sand tile urn vale wind yarn zinc bolt cove dawn edge flax gate hush ink'
).split(' ')

let seed = 3
const word = (i) => {
  const k = seed * 7 + i * 13 + ((i * i) % 11)
  return (k + i) % 5 < 2 ? LONG[k % LONG.length] : WORDS[k % WORDS.length]
}

// n words of filler, with periods every 9-14 words, ending in a period.
export function lorem(n) {
  if (n <= 0) return ''
  seed += 1
  const out = []
  let sentenceLen = 0
  let target = 9 + (seed % 6)
  for (let i = 0; i < n; i++) {
    let w = word(i)
    if (sentenceLen === 0) w = w[0].toUpperCase() + w.slice(1)
    sentenceLen += 1
    if (sentenceLen >= target || i === n - 1) {
      w += '.'
      sentenceLen = 0
      target = 9 + ((seed + i) % 6)
    }
    out.push(w)
  }
  return out.join(' ')
}

// Inline segments: {k:'t'|'strong'|'em'|'a'|'code', text, href}
// p(words, { lead, quote, links:[{text,href}], codes:[text] })
export function p(n, opts = {}) {
  const { lead, quote, links = [], codes = [], strongMid } = opts
  const extra = [lead, ...links.map((l) => l.text), ...codes, strongMid].filter(Boolean).join(' ').split(/\s+/).length
  const rest = Math.max(4, n - (extra || 0))
  const segs = []
  if (quote) {
    segs.push({ k: 'em', text: lorem(n) })
    return { type: 'p', segs }
  }
  if (lead) segs.push({ k: 'strong', text: lead })
  const inserts = [
    ...links.map((l) => ({ k: 'a', text: l.text, href: l.href })),
    ...codes.map((c) => ({ k: 'code', text: c })),
    ...(strongMid ? [{ k: 'strong', text: strongMid }] : []),
  ]
  const parts = inserts.length + 1
  const chunk = Math.floor(rest / parts)
  for (let i = 0; i < parts; i++) {
    const cnt = i === parts - 1 ? rest - chunk * (parts - 1) : chunk
    segs.push({ k: 't', text: (lead || i > 0 ? ' ' : '') + lorem(cnt) + ' ' })
    if (inserts[i]) segs.push(inserts[i])
  }
  // trailing space after last text segment is harmless; trim it
  const last = segs[segs.length - 1]
  if (last.k === 't') last.text = last.text.trimEnd()
  else segs.push({ k: 't', text: '.' })
  return { type: 'p', segs }
}
export const h2 = (text) => ({ type: 'h2', text })
export const h3 = (text) => ({ type: 'h3', text })
export const hr = () => ({ type: 'hr' })
export const img = (src, alt, width, height, full) => ({ type: 'img', src, alt, width, height, full: full || src })
// ul(items, wordsPerItem): each item = bold lead-in ending with a colon + sentence
export function ul(count, words = 20, leads) {
  const items = []
  for (let i = 0; i < count; i++) {
    const lead = leads ? leads[i] : lorem(2).replace('.', '') + ':'
    items.push({ segs: [{ k: 'strong', text: lead }, { k: 't', text: ' ' + lorem(words) }] })
  }
  return { type: 'ul', items }
}
