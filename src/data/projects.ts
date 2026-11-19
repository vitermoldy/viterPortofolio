import { asset } from '@/lib/utils'

// The project cards of the profile README (github.com/vitermoldy), in the README's order and in its
// words. A repository is linked only when GitHub lists it as public (profile.json); any other shows the
// README's note that it is private for now, so nothing leads to a page a visitor cannot open.

export type Project = {
  id: string
  name: string
  stack: string
  card: string
  text: string
  repos: { label: string; name: string }[]
}

export const PRIVATE_NOTE = 'Still in development, so the repository is private for now.'

export const CARD_SIZE = { w: 200, h: 136 }

const card = (file: string) => asset(`pixel/card-${file}.svg`)

export const PROJECTS: Project[] = [
  {
    id: 'evit',
    name: 'eVit',
    stack: 'React, WebGL and PyTorch',
    card: card('evit'),
    text: 'A layer-based photo editor in the browser: masks, blend modes, curves and levels, five kinds of selection, healing, clone stamp, text and export to PSD. Its AI picks objects, removes backgrounds and objects, and fills or extends a photo with SDXL, all on the laptop’s own GPU, so no photo leaves the machine.',
    repos: [{ label: 'Repository', name: 'Editing-Platform' }],
