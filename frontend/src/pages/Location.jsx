import SEO from '../components/SEO'
import LocationSection from '../components/LocationSection'
import NearbyPlaceCard from '../components/NearbyPlaceCard'
import { homestay } from '../content/homestay'
import { nearbyPlaces } from '../content/nearbyPlaces'
import { Link } from 'react-router-dom'

export default function Location() {
  return (
    <>
      <SEO
        title="Location & Nearby Attractions"
        description={`Find ${homestay.name}'s location on the Almora–Pithoragarh Road, and nearby attractions including Jageshwar Temple.`}
        canonicalPath="/location"
      />
      <section className="max-w-6xl mx-auto px-4 py-12 space-y-12">
        <div>
          <h1 className="text-3xl font-semibold mb-6">Location</h1>
          <LocationSection homestay={homestay} />
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Nearby Attractions</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {nearbyPlaces.map((place, i) => <NearbyPlaceCard key={i} place={place} />)}
          </div>
        </div>
      </section>
      
    </>
  )
}
