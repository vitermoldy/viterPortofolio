/** Reads GitHub's public contribution calendar page into "YYYY-MM-DD" -> [count, level]. */
export function parseCalendar(html: string): Map<string, [number, number]>
