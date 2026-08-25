import { useParams, Navigate } from 'react-router-dom'
import SEO from '../components/SEO'
import ImageCarousel from '../components/ImageCarousel'
import BookingWidget from '../components/BookingWidget'
import EnquiryForm from '../components/EnquiryForm'
import WhatsAppButton from '../components/WhatsAppButton'
import { rooms } from '../content/rooms'

export default function RoomDetail() {
  const { id } = useParams()
  const room = rooms.find((r) => r.id === Number(id))

  if (!room) return <Navigate to="/rooms" replace />

  return (
    <>
      <SEO
        title={room.name}
        description={room.description}
        canonicalPath={`/rooms/${room.id}`}
      />
      <section className="max-w-4xl mx-auto px-4 py-10 space-y-8">
        <ImageCarousel images={room.images} aspectRatio="aspect-[16/10]" />

        <div>
          <h1 className="text-3xl font-semibold">{room.name}</h1>
          <p className="text-brand-600 mt-1">Up to {room.maxGuests} guests · {room.bedType}</p>
          <p className="mt-4 text-brand-700 leading-relaxed whitespace-pre-line">{room.description}</p>
          <div className="mt-4 text-brand-700">
            <p>Pricing:</p>
            <ul className="list-disc list-inside">
              <li>Weekday: ₹{room.pricing.weekday}(2 guests)</li>
              <li>Sat & Sun: ₹{room.pricing.sat_sun}(2 guests)</li>
            </ul>
          </div>
          {room.facilities?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {room.facilities.map((f) => (
                <span key={f} className="inline-flex items-center gap-1.5 bg-brand-50 text-brand-800 text-sm px-3 py-1.5 rounded-full border border-brand-100">
                  {f}
                </span>
              ))}
            </div>
          )}

          <div className="mt-4">
            <WhatsAppButton roomName={room.name} />
          </div>
        </div>

        {/* <BookingWidget room={room} /> */}

        {/* <div>
          <p className="text-sm text-brand-500 mb-3">Prefer to arrange payment directly with us instead? Send an enquiry:</p>
          <EnquiryForm roomId={room.id} roomName={room.name} />
        </div> */}
      </section>
    </>
  )
}
