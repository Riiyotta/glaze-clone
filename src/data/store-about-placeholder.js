// PLACEHOLDER COPY. The snapshot stores only `fullDescription.length` and `.paragraphs`, not the
// original text (SPEC_store 6.8). This builds deterministic filler prose of similar length and
// paragraph count per app. It is not the source's description.

const SENTENCES = [
  'Keeps everything you need within reach, right on your desktop.',
  'Designed to feel quick and native, with no setup before you can start.',
  'Built with Glaze, so you can remix it and shape it around how you work.',
  'Everything stays local on your Mac, and your data is yours.',
  'A small, focused tool that does one job and does it well.',
  'Simple controls, clear feedback, and sensible defaults throughout.',
  'Works alongside the apps you already use without getting in the way.',
  'Updated regularly with fixes and small improvements from the author.',
]
const DEFAULT = { length: 480, paragraphs: 2 }

function hash(s) {
  let h = 7
  for (const c of s) h = (Math.imul(h, 31) + c.charCodeAt(0)) >>> 0
  return h
}

export function placeholderAbout(app) {
  const { length, paragraphs } = app.fullDescription?.length ? app.fullDescription : DEFAULT
  const n = Math.max(1, paragraphs)
  const per = Math.max(40, Math.floor((length - (n - 1)) / n))
  let seed = hash(app.slug)
  const out = []
  for (let p = 0; p < n; p++) {
    let text = ''
    while (text.length < per) text += `${SENTENCES[seed++ % SENTENCES.length]} `
    let t = text.trim().slice(0, per)
    if (!t.endsWith('.')) {
      const dot = t.lastIndexOf('. ')
      t = dot > per * 0.5 ? t.slice(0, dot + 1) : `${t.replace(/\s+\S*$/, '').replace(/[,;:]$/, '')}.`
    }
    out.push(t)
  }
  return out.join('\n\n')
}
