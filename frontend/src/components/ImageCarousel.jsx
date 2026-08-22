import { useState } from 'react'

/**
 * Simple, dependency-free image carousel. Built with plain React state rather than adding
 * an npm carousel library, in line with keeping this project's dependency list minimal.
 */
export default function ImageCarousel({ images, aspectRatio = 'aspect-[4/3]' }) {
  const [index, setIndex] = useState(0)

  if (!images || images.length === 0) {
    return (
      <div className={`${aspectRatio} bg-brand-100 rounded-2xl flex items-center justify-center text-brand-400 text-sm`}>
        No photos yet
      </div>
    )
  }

  const current = images[index]

  function prev() {
    setIndex((i) => (i === 0 ? images.length - 1 : i - 1))
  }
  function next() {
    setIndex((i) => (i === images.length - 1 ? 0 : i + 1))
  }

  return (
    <div className="relative">
      <div className={`${aspectRatio} rounded-2xl overflow-hidden bg-brand-100`}>
        <img
          src={current.url}
          alt={current.alt || 'Room photo'}
          loading={index === 0 ? 'eager' : 'lazy'}
          className="w-full h-full object-cover"
        />
      </div>

      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Previous photo"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-brand-900 w-9 h-9 rounded-full flex items-center justify-center shadow"
          >
            ‹
          </button>
          <button
            onClick={next}
            aria-label="Next photo"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-brand-900 w-9 h-9 rounded-full flex items-center justify-center shadow"
          >
            ›
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Go to photo ${i + 1}`}
                className={`w-2 h-2 rounded-full ${i === index ? 'bg-white' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
