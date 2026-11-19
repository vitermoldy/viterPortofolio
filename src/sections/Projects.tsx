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
      <div className="wrap grid gap-10 lg:grid-cols-12 lg:gap-x-8 lg:gap-y-8">
        <div className="lg:col-span-5 lg:col-start-8 lg:row-start-1">
          <h2 id="projects-title" className="h-pixel h-block text-[clamp(2rem,4.5vw,3.25rem)]">
            Projects, card by card
          </h2>
          <p className="mt-5 mb-0 text-lg">
            The {num(PROJECTS.length)} project cards from my README. Pick another and the same blocks press themselves
            into the next card, in one wave from the corner.
          </p>
        </div>

        <div
