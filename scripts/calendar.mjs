// Reads GitHub's public contribution calendar page into a Map of "YYYY-MM-DD" -> [count, level].
// Each day is a <td class="ContributionCalendar-day" data-date data-level id> and its count sits in the
// <tool-tip for="<id>"> that follows ("12 contributions on November 3rd." or "No contributions on ...").
