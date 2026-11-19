// Numbers as GitHub prints them (36,586); dates day-first, as the profile README writes them.
const nf = new Intl.NumberFormat('en-US')
const longDate = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
const monthYear = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' })

