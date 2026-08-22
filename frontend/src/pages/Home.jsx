import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import WhatsAppButton from '../components/WhatsAppButton'
import RoomCard from '../components/RoomCard'
import { homestay } from '../content/homestay'
import { rooms } from '../content/rooms'
import Gallery from './Gallery'
import Location from './Location'
import Contact from './Contact'


export default function Home() {
  return (
    <>
      <SEO
        title="Serene Kumaon Homestay Near Jageshwar"
        description={`Book a stay at ${homestay.name} — a peaceful homestay in Kumaon, close to Jageshwar Temple, with authentic Kumaoni food.`}
        canonicalPath="/"
      />

      {/* Hero */}
      <section className="relative bg-brand-100">
        <div className="aspect-[16/9] md:aspect-[21/9] bg-brand-200 overflow-hidden">
          <img src={homestay.heroImage} alt={homestay.name} className="w-full h-full object-cover" />
        </div>
        <div className="max-w-6xl mx-auto px-4 py-10 text-center">
          <h1 className="text-3xl md:text-5xl font-semibold text-brand-900">{homestay.name}</h1>
          <p className="mt-3 max-w-2xl mx-auto text-brand-700">{homestay.description}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {!homestay.phone.startsWith('replace this text') && (
              <a href={`tel:${homestay.phone}`} className="bg-brand-700 hover:bg-brand-800 text-white font-medium px-5 py-3 rounded-full">
                📞 Call Now
              </a>
            )}
            <WhatsAppButton />
            <Link to="/rooms" className="border border-brand-700 text-brand-800 hover:bg-brand-50 font-medium px-5 py-3 rounded-full">
              View Rooms & Book
            </Link>
          </div>
        </div>
      </section>

      {/* Amenities */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-semibold mb-4">Amenities</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
          {homestay.amenities.map((a) => (
            <div key={a.name} className="bg-white border border-brand-100 rounded-xl p-4">
              <p className="font-medium text-brand-900">{a.name}</p>
              <p className="text-sm text-brand-600 mt-1">{a.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Rooms */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Our Rooms</h2>
          <Link to="/rooms" className="text-sm font-medium text-brand-700 hover:text-brand-900">See all →</Link>
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          {rooms.map((room) => <RoomCard key={room.id} room={room} />)}
        </div>
      </section>
      <Gallery></Gallery>
      <Location></Location>
      <Contact></Contact>
    </>
  )
}
