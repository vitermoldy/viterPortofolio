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
    id: 'songplaylist',
  {
    id: 'foodrolling',
    name: 'FoodRolling',
    stack: 'React, canvas and Zustand',
    card: card('foodrolling'),
    text: 'An idle restaurant game on a conveyor belt: chefs cook in the middle, plates roll past the stools and customers pay for every plate they empty. Raise income, speed, chefs and seats, then buy the next restaurant, six in all from a Japanese kaiten bar to a Paris bistro, each room drawn in its country’s style.',
    repos: [{ label: 'Repository', name: 'FoodRolling' }],
  },
  {
    id: 'viterportofolio',
    name: 'viterPortofolio',
    stack: 'three.js and React',
    card: card('viterportofolio'),
    text: 'This profile in 3D: the pixel-art portrait stands up as 4,096 blocks, every contribution rises into a skyline in GitHub’s own shades, and each project card turns into a relief you can turn and press.',
    repos: [{ label: 'Repository', name: 'viterPortofolio' }],
  },
  {
    id: 'evit',
    name: 'eVit',
    stack: 'React, WebGL and PyTorch',
    card: card('evit'),
    text: 'A layer-based photo editor in the browser: masks, blend modes, curves and levels, five kinds of selection, healing, clone stamp, text and export to PSD. Its AI picks objects, removes backgrounds and objects, and fills or extends a photo with SDXL, all on the laptop’s own GPU, so no photo leaves the machine.',
    repos: [{ label: 'Repository', name: 'Editing-Platform' }],
  },
  {
    id: 'convertion',
    name: 'Convertion',
    stack: 'React, Python and PyMuPDF',
    card: card('convertion'),
    text: 'A PDF toolkit that runs on my own laptop, with 34 tools: merge, split, compress, OCR, sign, redact, compare, Word, Excel and PowerPoint to PDF and back, plus summaries and layout-keeping translation from a local Qwen model and a background remover for photos.',
    repos: [{ label: 'Repository', name: 'Convertion-Web' }],
  },
  {
    id: 'mixer',
    name: 'Mixer Simulation',
    stack: 'Web Audio and PyTorch',
    card: card('mixer'),
    text: 'A mixing desk to learn on, with four consoles that work like a Midas M32, a Yamaha TF, an Allen & Heath SQ and an analog board. Load stems or split any song into vocals, drums, bass and the rest with Demucs, then set gain, EQ, gate, compressor, sends and faders while nine lessons read your meters.',
    repos: [{ label: 'Repository', name: 'Mixer-Simulation' }],
  },
  {
    id: 'netsim',
    name: 'Network Simulation',
    stack: 'three.js and MySQL',
    card: card('netsim'),
    text: 'A 3D network lab in the spirit of Packet Tracer: follow one web request from a laptop through a switch, routers and a DNS server, plug and pull cables, switch a router off and watch the others find a new path, with an IOS-style CLI and runs kept in MySQL.',
    repos: [{ label: 'Repository', name: 'Network-Simulation' }],
  },
  {
    id: 'nyxborne',
    name: 'Nyxborne v2',
    stack: 'React, canvas and MySQL',
    card: card('nyxborne'),
    text: 'A dark-fantasy summoner RPG in pixel art. The hunter wears whatever you equip, 36 monsters walk and strike, and every sprite is painted by code. Beaten monsters rise as Nyxborne and stack into colonies hundreds strong, across 124 sub-gates from rank E to Monarch, with match results kept in MySQL.',
    repos: [
      { label: 'v1 repository', name: 'Nyxborn' },
      { label: 'v2 repository', name: 'Nyxborn-v2' },
    ],
  },
  {
    id: 'agentic-factory',
    name: 'Agentic Factory',
    stack: 'three.js and React',
    card: card('agentic-factory'),
    text: 'An idle game on a 3D machine: five production lines run by agents, from a video studio to an e-book publisher. Every product you add builds its own plate beside the others, and the slowest station sets the pace.',
    repos: [{ label: 'Repository', name: 'idle-Agent-factory' }],
  },
  {
    id: 'studycabin',
    name: 'StudyCabin',
    stack: 'three.js and Vite',
    card: card('studycabin'),
    text: 'A study room in a live 3D cabin. A day lasts 24 minutes, with weather, five seasons, animals and your own YouTube music.',
    repos: [
      { label: 'v1 repository', name: 'StudyCabin-v1' },
      { label: 'v2 repository', name: 'StudyCabin-v2' },
    ],
  },
  {
    id: 'songplay',
    name: 'SongPlay',
    stack: 'three.js and YouTube',
    card: card('songplay'),
    text: 'A glowing CRT TV in a 3D forest clearing that plays your YouTube queue, under the time of day and season you pick.',
    repos: [
      { label: 'v1 repository', name: 'SongPlay-v1' },
      { label: 'v2 repository', name: 'SongPlay-v2' },
    ],
  },
  {
    id: 'pixelfolio',
    name: 'PixelFolio',
    stack: 'Astro and TypeScript',
    card: card('pixelfolio'),
    text: 'A portfolio template where the cursor leaves a trail of pixels that cool from lime to navy.',
    repos: [
      { label: 'v1 repository', name: 'PixelFolio' },
      { label: 'v2 repository', name: 'PixelFoliov2' },
    ],
  },
  {
    id: 'viygo',
    name: 'Viygo',
    stack: 'Laravel 12 and MySQL',
    card: card('viygo'),
    text: 'A salon search and booking site: search, salon pages with a Leaflet map and a three-step booking flow.',
    repos: [{ label: 'Repository', name: 'Viygo-Salon-Web' }],
  },
  {
    id: 'lanskara',
    name: 'Lanskara',
    stack: 'HTML, CSS and JavaScript',
    card: card('lanskara'),
    text: 'A landing page for a web studio: a design-canvas hero with labelled cursors, a statement that lights up word by word as you scroll, and a block that turns the whole page dark.',
    repos: [{ label: 'Repository', name: 'LandingPage-sitev1' }],
  },
  {
    id: 'cloudstead',
    name: 'CloudStead',
    stack: 'three.js and TypeScript',
    card: card('cloudstead'),
    text: 'A study island above the clouds: while your focus timer runs, VMK hauls up new cells, plants and builds, from 9 cells to 37 over 23 hours of focus, with your own YouTube music.',
    repos: [{ label: 'Repository', name: 'CloudStead' }],
  },
]

/** The repositories of a project that GitHub lists as public, with their real URLs. */
export function publicLinks(p: Project, repos: { name: string; url: string }[]) {
  const byName = new Map(repos.map((r) => [r.name.toLowerCase(), r.url]))
  return p.repos.flatMap((r) => {
    const url = byName.get(r.name.toLowerCase())
    return url ? [{ label: r.label, url }] : []
  })
}
