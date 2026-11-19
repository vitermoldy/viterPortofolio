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
