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
