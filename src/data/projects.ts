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
