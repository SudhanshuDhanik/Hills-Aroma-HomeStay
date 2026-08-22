export default function NearbyPlaceCard({ place }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-brand-100">
      <div className="aspect-[16/9] bg-brand-100">
        {place.image ? (
          <img src={place.image} alt={place.name} loading="lazy" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-brand-400 text-sm">No photo yet</div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-display font-semibold text-brand-900">{place.name}</h3>
        <p className="text-sm text-brand-600 mt-1">
          {place.distanceKm != null && `${place.distanceKm} km`}
          {place.travelTimeMinutes != null && ` · ~${place.travelTimeMinutes} min away`}
        </p>
        {place.description && <p className="text-sm text-brand-700 mt-2">{place.description}</p>}
        {place.activities && (
          <p className="text-xs text-brand-500 mt-2">Things to do: {place.activities}</p>
        )}
      </div>
    </div>
  )
}
