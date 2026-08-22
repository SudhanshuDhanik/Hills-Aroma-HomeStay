import { homestay } from '../content/homestay'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-brand-900 text-brand-50 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-10 grid gap-8 md:grid-cols-3">
        <div>
          <h3 className="font-display text-lg mb-2">{homestay.name}</h3>
          <p className="text-sm text-brand-100">
            A serene homestay retreat in Kumaon.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Quick Links</h4>
          <ul className="text-sm space-y-1 text-brand-100">
            <li><a href="/rooms" className="hover:text-white">Rooms</a></li>
            <li><a href="/gallery" className="hover:text-white">Gallery</a></li>
            <li><a href="/location" className="hover:text-white">Location & Nearby</a></li>
            <li><a href="/contact" className="hover:text-white">Contact</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Contact</h4>
          <p className="text-sm text-brand-100">{homestay.phone}</p>
          <p className="text-sm text-brand-100">{homestay.email}</p>
        </div>
      </div>
      <div className="border-t border-brand-800 text-center text-xs text-brand-200 py-4">
        © {year} {homestay.name}. All rights reserved.
      </div>
    </footer>
  )
}
