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
