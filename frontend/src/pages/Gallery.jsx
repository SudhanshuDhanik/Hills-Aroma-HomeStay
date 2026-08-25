import SEO from '../components/SEO'
import GalleryGrid from '../components/GalleryGrid'
import { homestay } from '../content/homestay'
import { Link } from 'react-router-dom'

export default function Gallery() {
  const images = [
      
    { url: '/images/gallery/TopView.jpeg', alt: 'replace this image with a Double Bed with View room photo' },
    { url: '/images/gallery/roomsInterior.jpeg', alt: 'replace this image with a Double Bed with View room photo' },
    { url: '/images/gallery/Room1.jpeg', alt: 'replace this image with a Double Bed room photo' },
    { url: '/images/gallery/LandscapeView.jpeg', alt: 'replace this image with a Double Bed with View room photo' },
    { url: '/images/gallery/front.jpeg', alt: 'replace this image with a Double Bed room photo' },
    { url: '/images/gallery/DeluxeRoom.jpeg', alt: 'replace this image with a Double Bed with View room photo' },
    { url: '/images/gallery/BathroomInterior.jpeg', alt: 'replace this image with a Double Bed room photo' },
    { url: '/images/gallery/Bathroom.jpeg', alt: 'replace this image with a Double Bed room photo' },
  ]

  return (
    <>
      <SEO
        title="Photo Gallery"
        description={`Photos of rooms and surroundings at ${homestay.name}.`}
        canonicalPath="/gallery"
      />
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-semibold mb-6">Gallery</h1>
        <GalleryGrid images={images} />
      </section>
      
    </>
  )
}
