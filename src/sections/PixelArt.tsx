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
