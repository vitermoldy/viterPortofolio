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
