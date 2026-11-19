// Numbers as GitHub prints them (36,586); dates day-first, as the profile README writes them.
const nf = new Intl.NumberFormat('en-US')
const longDate = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
const monthYear = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' })

const toMs = (iso: string) => Date.parse(iso.length === 10 ? iso + 'T00:00:00Z' : iso)

export const num = (n: number) => nf.format(n)
export const day = (iso: string) => longDate.format(toMs(iso))
export const month = (iso: string) => monthYear.format(toMs(iso))
