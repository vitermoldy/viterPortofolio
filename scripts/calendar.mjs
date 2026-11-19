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
