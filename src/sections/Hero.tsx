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
