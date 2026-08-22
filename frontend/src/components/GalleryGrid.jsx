export default function GalleryGrid({ images }) {
  if (!images || images.length === 0) {
    return <p className="text-brand-500">No gallery photos have been added yet.</p>
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {images.map((img, i) => (
        <div key={i} className="aspect-square rounded-xl overflow-hidden bg-brand-100">
          <img
            src={img.url}
            alt={img.alt || 'Homestay photo'}
            loading="lazy"
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      ))}
    </div>
  )
}
