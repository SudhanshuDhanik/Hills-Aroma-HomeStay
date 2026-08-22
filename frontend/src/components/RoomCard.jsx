import { Link } from 'react-router-dom'

export default function RoomCard({ room }) {
  const image = room.images?.[0]

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-brand-100">
      <div className="aspect-[4/3] bg-brand-100 overflow-hidden">
        {image ? (
          <img
            src={image.url}
            alt={image.alt || room.name}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-brand-400 text-sm">No photo yet</div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-display text-lg font-semibold text-brand-900">{room.name}</h3>
        <p className="text-sm text-brand-600 mt-1">Up to {room.maxGuests} guests · {room.bedType}</p>
        <Link
          to={`/rooms/${room.id}`}
          className="mt-3 inline-block text-sm font-medium text-brand-700 hover:text-brand-900 underline underline-offset-2"
        >
          View details, pricing & availability →
        </Link>
      </div>
    </div>
  )
}
