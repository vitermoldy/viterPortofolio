import * as React from 'react'
import { VoxelStage, type VoxelPicture } from '@/components/voxel/VoxelStage'
import { lastYearTotal, type LoadState } from '@/data/profile'
import { month, num } from '@/lib/format'
import { asset } from '@/lib/utils'

const AVATARS: Record<'moon' | 'sunset', VoxelPicture> = {
  moon: {
    src: asset('pixel/avatar.png'),
    w: 64,
    h: 64,
    alt: 'Pixel-art portrait of Viter in a green hoodie with headphones round the neck, in front of a big moon over the forest at night.',
  },
  sunset: {
    src: asset('pixel/avatar-sunset.png'),
    w: 64,
    h: 64,
    alt: 'Pixel-art portrait of Viter in a green hoodie with headphones round the neck, in front of the sun setting over the forest.',
  },
}

export function Hero({ state }: { state: LoadState }) {
  const [sky, setSky] = React.useState<'moon' | 'sunset'>('moon')
  const ready = state.status === 'ready' ? state.data : null
  const profile = ready?.profile

  return (
    <section id="top" aria-labelledby="hero-title" className="relative">
      <div className="wrap grid items-center gap-10 pt-10 pb-16 md:min-h-[calc(100svh-4rem)] md:grid-cols-12 md:gap-8 md:py-12">
        <div className="md:col-span-6 lg:col-span-5" data-enter>
          <h1 id="hero-title" className="h-pixel text-[clamp(2.75rem,7vw,4.75rem)]">
            Viter Moldy Kesuma
          </h1>
          <p className="mt-6 mb-0 max-w-[34rem] text-lg text-paper">
            My GitHub profile, built in blocks. The pixel art from my README stands up as voxels, every contribution
            rises into a skyline, and each project card turns into a relief you can turn and press.
          </p>

          <dl className="mt-8 mb-0 grid max-w-[34rem] grid-cols-3 gap-4 border-y-2 border-forest py-5" aria-busy={state.status === 'loading'}>
            <Fact label="Contributions, last 12 months" value={ready ? num(lastYearTotal(ready.contributions)) : null} state={state.status} />
            <Fact label="Public repositories" value={profile ? num(profile.publicRepos) : null} state={state.status} />
            <Fact label="On GitHub since" value={profile ? month(profile.createdAt) : null} state={state.status} small />
          </dl>
          {state.status === 'error' && (
            <p className="mt-3 mb-0 text-sm text-muted" role="alert">
              The GitHub numbers did not load.{' '}
              <button type="button" className="link border-0 bg-transparent p-0 text-sm" onClick={state.retry}>
                Load them again
              </button>
            </p>
          )}

          <div className="mt-8 flex flex-wrap gap-4">
            <a className="btn btn-main" href={profile?.url ?? 'https://github.com/vitermoldy'} rel="noopener">
              Open my GitHub profile
            </a>
            <a className="btn btn-quiet" href="#contributions">
              See the commit skyline
            </a>
          </div>
        </div>

        <div className="md:col-span-6 lg:col-span-7" data-enter>
          <div className="stage-frame mx-auto w-full max-w-[600px]">
            <VoxelStage picture={AVATARS[sky]} options={{ relief: 0.09 }} wave="centre" />
          </div>
          <div className="mx-auto mt-4 flex w-full max-w-[600px] flex-wrap items-center justify-between gap-3">
            <div className="seg" role="group" aria-label="Sky behind the portrait">
              <button type="button" aria-pressed={sky === 'moon'} onClick={() => setSky('moon')}>
                Moon
              </button>
              <button type="button" aria-pressed={sky === 'sunset'} onClick={() => setSky('sunset')}>
                Sunset
              </button>
            </div>
            <p className="m-0 text-sm text-muted">Drag to turn it. Move across it to press the pins.</p>
          </div>
        </div>
      </div>
    </section>
  )
}

function Fact({ label, value, state, small }: { label: string; value: string | null; state: LoadState['status']; small?: boolean }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs leading-snug text-muted sm:text-sm">{label}</dt>
      <dd className={'m-0 mt-1 font-pixel leading-none text-sun ' + (small ? 'text-lg sm:text-xl' : 'text-2xl sm:text-3xl')}>
        {value ?? <span className="text-base text-muted">{state === 'loading' ? 'Loading' : 'Not loaded'}</span>}
