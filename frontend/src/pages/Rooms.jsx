import SEO from '../components/SEO'
import RoomCard from '../components/RoomCard'
import { rooms } from '../content/rooms'
import { Link } from 'react-router-dom'

export default function Rooms() {
  return (
    <>
      <SEO
        title="Rooms & Pricing"
        description="Browse our rooms with photos, facilities, and live pricing based on your dates and guest count."
        canonicalPath="/rooms"
      />
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-semibold mb-6">Rooms</h1>
        <div className="grid sm:grid-cols-2 gap-5">
          {rooms.map((room) => <RoomCard key={room.id} room={room} />)}
        </div>
      </section>
    
    </>
  )
}
