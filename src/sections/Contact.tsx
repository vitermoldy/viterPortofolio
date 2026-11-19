import { VoxelStage } from '@/components/voxel/VoxelStage'
import type { LoadState } from '@/data/profile'
import { day } from '@/lib/format'
import { asset } from '@/lib/utils'

// The same links as the "Connect with me" row of the profile README.
const LINKS = [
  { label: 'GitHub', value: 'github.com/vitermoldy', href: 'https://github.com/vitermoldy' },
  { label: 'Portfolio', value: 'vitermoldy.github.io/MyPortofolio', href: 'https://vitermoldy.github.io/MyPortofolio/' },
  { label: 'LinkedIn', value: 'Viter M.', href: 'https://www.linkedin.com/in/viter-m-6bb859303/' },
  { label: 'Instagram', value: '@vitermk_', href: 'https://www.instagram.com/vitermk_/' },
]
const EMAIL = 'vitermoldy@gmail.com'

const FOOTER_ART = {
  src: asset('pixel/footer.svg'),
  w: 240,
  h: 24,
  alt: 'Pixel grass with fireflies: thanks for stopping by.',
}

export function Contact() {
  return (
      <section id="contact" aria-labelledby="contact-title" className="border-t-2 border-forest pt-20 md:pt-28">
        <div className="wrap">
          <h2 id="contact-title" className="h-pixel h-block text-[clamp(2rem,4.5vw,3.25rem)]">
            Write to me
          </h2>
          <p className="mt-5 mb-0 max-w-[36rem] text-lg">
            For a project, an internship or a question about three.js, Laravel, PHP or MySQL, email reaches me first.
          </p>
          <a
            href={`mailto:${EMAIL}`}
            className="mail-big mt-8 inline-flex min-h-11 items-center font-pixel text-[clamp(1.6rem,6.2vw,4.5rem)] leading-none break-all text-sun no-underline"
          >
            {EMAIL}
          </a>

          <ul className="mt-12 mb-0 grid list-none gap-0 border-t-2 border-forest p-0 sm:grid-cols-2 lg:grid-cols-4">
            {LINKS.map((l) => (
              <li key={l.label} className="border-b-2 border-forest">
                <a href={l.href} rel="noopener" className="contact-link flex min-h-16 flex-col justify-center gap-1 py-4 pr-4 no-underline">
                  <span className="font-pixel text-xl text-paper">{l.label}</span>
                  <span className="text-sm break-all text-muted">{l.value}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-16">
          <VoxelStage picture={FOOTER_ART} options={{ relief: 0.05, base: 0.4 }} view={{ yaw: 0, pitch: 0.3 }} />
        </div>
      </section>
  )
}

export function Footer({ state }: { state: LoadState }) {
  const fetchedAt = state.status === 'ready' ? state.data.profile.fetchedAt : null
  return (
      <footer className="border-t-2 border-moss">
        <div className="wrap flex flex-col gap-2 py-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
