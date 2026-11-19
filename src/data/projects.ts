import { asset } from '@/lib/utils'

// The project cards of the profile README (github.com/vitermoldy), in the README's order and in its
// words. A repository is linked only when GitHub lists it as public (profile.json); any other shows the
// README's note that it is private for now, so nothing leads to a page a visitor cannot open.

export type Project = {
  id: string
  name: string
  stack: string
  card: string
