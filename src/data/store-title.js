// App page <title>, derived from 70 live titles: "{name} for Mac — {tagline} | Glaze".
// " for Mac" is dropped when the name or tagline already mentions Mac (macOS, MacBook, macHealth...).
// If "{name}{forMac} — {tagline}" is longer than 62 chars it is cut to 60 chars at a word boundary,
// trailing punctuation is stripped and "…" appended.
export function appTitle(name, tagline) {
  const t = String(tagline || '').replace(/\s+/g, ' ').trim()
  const head = /\bmac/i.test(`${name} ${t}`) ? `${name} — ` : `${name} for Mac — `
  let full = head + t
  if (full.length > 62) {
    const limit = 60
    let cut = full.slice(0, limit)
    if (full[limit] !== ' ') cut = cut.slice(0, cut.lastIndexOf(' '))
    full = cut.replace(/[\s,.;:!?-]+$/, '') + '…'
  }
  return `${full} | Glaze`
}
