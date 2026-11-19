import * as React from 'react'
import { VoxelStage } from '@/components/voxel/VoxelStage'
import type { LoadState } from '@/data/profile'
import { CARD_SIZE, PRIVATE_NOTE, PROJECTS, publicLinks } from '@/data/projects'
import { num } from '@/lib/format'

export function Projects({ state }: { state: LoadState }) {
  const [id, setId] = React.useState(PROJECTS[0].id)
  const project = PROJECTS.find((p) => p.id === id) ?? PROJECTS[0]
  const repos = state.status === 'ready' ? state.data.profile.repos : null
  const links = repos ? publicLinks(project, repos) : []
  const picture = React.useMemo(
    () => ({ src: project.card, ...CARD_SIZE, alt: `Pixel card: ${project.name}, ${project.stack}.` }),
    [project],
  )

  return (
    <section id="projects" aria-labelledby="projects-title" className="border-t-2 border-forest py-20 md:py-28">
