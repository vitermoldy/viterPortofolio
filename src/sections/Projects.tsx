import * as React from 'react'
import { VoxelStage } from '@/components/voxel/VoxelStage'
import type { LoadState } from '@/data/profile'
import { CARD_SIZE, PRIVATE_NOTE, PROJECTS, publicLinks } from '@/data/projects'
import { num } from '@/lib/format'

export function Projects({ state }: { state: LoadState }) {
  const [id, setId] = React.useState(PROJECTS[0].id)
