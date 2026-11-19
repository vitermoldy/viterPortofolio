// Reads GitHub's public contribution calendar page into a Map of "YYYY-MM-DD" -> [count, level].
// Each day is a <td class="ContributionCalendar-day" data-date data-level id> and its count sits in the
// <tool-tip for="<id>"> that follows ("12 contributions on November 3rd." or "No contributions on ...").
// The level (0 to 4) is GitHub's own shade for that day, so the site can colour days exactly as the
// profile page does.
const DAY = /<td\b[^>]*\bContributionCalendar-day\b[^>]*>/g
const TIP = /<tool-tip\b[^>]*\bfor="([^"]+)"[^>]*>([^<]*)<\/tool-tip>/g

const attr = (tag, name) => {
  const m = new RegExp(`\\b${name}="([^"]*)"`).exec(tag)
  return m ? m[1] : null
}

/** @param {string} html @returns {Map<string, [number, number]>} */
export function parseCalendar(html) {
  const tips = new Map()
  for (const [, id, text] of html.matchAll(TIP)) {
    const m = /([\d,]+)\s+contribution/.exec(text)
    tips.set(id, m ? Number(m[1].replace(/,/g, '')) : 0)
  }
  const days = new Map()
  for (const [tag] of html.matchAll(DAY)) {
    const date = attr(tag, 'data-date')
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) continue
    const level = Math.max(0, Math.min(4, Number(attr(tag, 'data-level') ?? 0) || 0))
    days.set(date, [tips.get(attr(tag, 'id') ?? '') ?? 0, level])
  }
