import { useProfileData } from '@/data/profile'
import { Contact, Footer } from '@/sections/Contact'
import { Contributions } from '@/sections/Contributions'
import { Header } from '@/sections/Header'
import { Hero } from '@/sections/Hero'
import { PixelArt } from '@/sections/PixelArt'
import { Projects } from '@/sections/Projects'

export function App() {
  const state = useProfileData()
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to the profile
      </a>
      <Header />
      <main id="main" tabIndex={-1} className="outline-none">
        <Hero state={state} />
        <Contributions state={state} />
        <PixelArt />
        <Projects state={state} />
        <Contact />
      </main>
      <Footer state={state} />
    </>
  )
}
