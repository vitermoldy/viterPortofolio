import * as React from 'react'
import { VoxelStage, type VoxelPicture } from '@/components/voxel/VoxelStage'
import { num } from '@/lib/format'
import { asset } from '@/lib/utils'

type Scene = VoxelPicture & { id: string; name: string; text: string }

// The three big pieces of the profile README, with the README's own descriptions.
const SCENES: Scene[] = [
  {
    id: 'room',
    name: 'The room',
    src: asset('pixel/room.svg'),
    w: 256,
    h: 144,
    text: 'At the desk at night: code on the main screen, a video edit on the second, a photo grid on the laptop, a camera on a tripod, a softbox, an event staff pass and a StudyCabin poster.',
    alt: 'Pixel art: Viter at the desk at night, coding on the main screen, a video edit on the second screen and a photo grid on the laptop, a camera on a tripod, a softbox, an event staff pass and a StudyCabin poster, under a neon sign.',
  },
  {
    id: 'cabin',
    name: 'StudyCabin at night',
    src: asset('pixel/banner.svg'),
    w: 240,
    h: 96,
    text: 'The profile banner: the glass cabin lit from inside, chimney smoke, an aurora and stars, a doe by the pond and fireflies.',
    alt: 'Pixel art: a StudyCabin at night with lit windows, chimney smoke, an aurora, stars, a doe by the pond and fireflies.',
  },
  {
    id: 'field',
    name: 'Sunset field',
    src: asset('pixel/character.svg'),
    w: 128,
    h: 96,
    text: 'From the About section: photographing the sunset in a flower field while the wind lifts the hair, the hood and the camera strap.',
    alt: 'Pixel art: Viter in a green hoodie, seen from behind, photographing the sunset in a flower field while the wind lifts the hair, the hood and the camera strap.',
  },
]

export function PixelArt() {
  const [id, setId] = React.useState(SCENES[0].id)
  const scene = SCENES.find((s) => s.id === id) ?? SCENES[0]

  return (
    <section id="pixel-art" aria-labelledby="pixel-title" className="border-t-2 border-forest bg-ink-2 py-20 md:py-28">
      <div className="wrap grid gap-10 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-4">
          <h2 id="pixel-title" className="h-pixel h-block text-[clamp(2rem,4.5vw,3.25rem)]">
            The pixel art, in blocks
          </h2>
          <p className="mt-5 mb-0 text-lg">
            The pictures from my README, read pixel by pixel. The brighter a pixel, the further its block stands out, so
            the lit screens, the windows and the sun come forward and the night stays at the wall.
          </p>

          <ul className="mt-8 mb-0 flex list-none flex-col gap-3 p-0" aria-label="Pictures">
            {SCENES.map((s) => {
              const on = s.id === scene.id
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    aria-pressed={on}
                    onClick={() => setId(s.id)}
                    className={
                      'scene-pick w-full border-2 p-4 text-left transition-colors duration-150 ' +
                      (on ? 'border-leaf bg-forest' : 'border-moss bg-transparent hover:bg-forest/60')
                    }
                  >
                    <span className="flex items-baseline justify-between gap-3">
                      <span className={'font-pixel text-xl ' + (on ? 'text-sun' : 'text-paper')}>{s.name}</span>
                      <span className="shrink-0 text-sm text-muted">
