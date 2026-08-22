import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { homestay } from '../content/homestay'

const links = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/rooms', label: 'Rooms' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/location', label: 'Location & Nearby' },
  { to: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-sand-50/95 backdrop-blur border-b border-brand-100">
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 text-xl font-display font-semibold text-brand-800">
          {homestay.logo && <img src={homestay.logo} alt={homestay.name} className="h-8 w-8 object-contain" />}
          {homestay.name}
        </Link>

        <button
          className="md:hidden p-2 text-brand-800"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? '✕' : '☰'}
        </button>

        <ul className="hidden md:flex items-center gap-6">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  `text-sm font-medium hover:text-brand-600 transition-colors ${isActive ? 'text-brand-700' : 'text-brand-800'}`
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {open && (
        <ul className="md:hidden flex flex-col gap-1 px-4 pb-4">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                onClick={() => setOpen(false)}
                className="block py-2 text-brand-800 font-medium"
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </header>
  )
}
