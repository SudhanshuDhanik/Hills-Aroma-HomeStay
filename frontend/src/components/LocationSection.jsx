export default function LocationSection({ homestay }) {
  const hasRealMap = homestay.mapEmbedUrl && !homestay.mapEmbedUrl.startsWith('replace this text')

  return (
    <div className="grid md:grid-cols-2 gap-6 items-start">
      <div>
        <h3 className="font-display text-xl font-semibold mb-2">Our Location</h3>
        <p className="text-brand-700">{homestay.address}</p>

        <ul className="mt-3 text-sm text-brand-700 space-y-1">
          <li>{homestay.distanceFromAlmoraKm} km from Almora city</li>
          <li>{homestay.distanceFromJageshwarKm} km from Jageshwar</li>
        </ul>

        <div className="mt-4 flex flex-col gap-2">
          {homestay.phone && !homestay.phone.startsWith('replace this text') && (
            <a href={`tel:${homestay.phone}`} className="text-brand-700 hover:text-brand-900">📞 {homestay.phone}</a>
          )}
          {homestay.email && !homestay.email.startsWith('replace this text') && (
            <a href={`mailto:${homestay.email}`} className="text-brand-700 hover:text-brand-900">✉️ {homestay.email}</a>
          )}
        </div>
      </div>

      <div className="aspect-video rounded-2xl overflow-hidden border border-brand-100">
        {hasRealMap ? (
          <iframe
            src={homestay.mapEmbedUrl}
            title="Homestay location map"
            className="w-full h-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-brand-50 text-brand-400 text-sm text-center px-4">
            Google Maps embed will appear here — add the real embed URL in src/content/homestay.js
          </div>
        )}
      </div>
    </div>
  )
}
