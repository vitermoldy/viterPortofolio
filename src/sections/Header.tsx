import * as React from 'react'
import { asset, cn } from '@/lib/utils'

const NAV = [
  { href: '#contributions', label: 'Contributions' },
  { href: '#pixel-art', label: 'Pixel art' },
  { href: '#projects', label: 'Projects' },
  { href: '#contact', label: 'Contact' },
]

export function Header() {
  const [open, setOpen] = React.useState(false)
  const toggleRef = React.useRef<HTMLButtonElement>(null)

  React.useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        toggleRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header className="sticky top-0 z-40 border-b-2 border-moss bg-ink/95">
      <div className="wrap flex h-16 items-center justify-between gap-4">
        <a href="#top" className="flex min-h-11 items-center gap-3 text-paper no-underline" onClick={() => setOpen(false)}>
          <img src={asset('pixel/avatar.png')} width={32} height={32} alt="" className="pixelated h-8 w-8" />
          <span className="font-pixel text-xl leading-none">vitermoldy</span>
        </a>

        <nav aria-label="Sections" className="hidden md:block">
          <ul className="m-0 flex list-none items-center gap-1 p-0">
            {NAV.map((n) => (
              <li key={n.href}>
                <a href={n.href} className="nav-link">
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <button
          ref={toggleRef}
          type="button"
          className="btn btn-quiet md:hidden"
          aria-expanded={open}
          aria-controls="menu"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? 'Close menu' : 'Menu'}
        </button>
      </div>

      <div
        id="menu"
        hidden={!open}
        className={cn('fixed inset-x-0 top-16 bottom-0 z-40 bg-ink md:hidden')}
      >
        <nav aria-label="Sections, menu" className="wrap pt-6">
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {NAV.map((n) => (
