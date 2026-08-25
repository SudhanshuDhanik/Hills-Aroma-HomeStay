import { homestay } from '../content/homestay'

export default function SpecialAttraction() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <div className="grid md:grid-cols-2 gap-8 items-center">
        
        {/* Food Image */}
        <div className="flex justify-center">
          <div className="w-full max-w-md overflow-hidden rounded-2xl">
            <img
              src={homestay.kumaoniFoodImage}
              alt="Traditional Kumaoni pahadi food at Hills Aroma Homestay"
              className="w-full aspect-[4/3] object-cover"
              loading="lazy"
            />
          </div>
        </div>

        {/* Food Description */}
        <div>
          <p className="text-sm font-medium text-brand-600 uppercase tracking-wide">
            Special Attraction
          </p>

          <h2 className="mt-1 text-2xl md:text-3xl font-semibold text-brand-900">
            A Taste of Kumaon
          </h2>

         <p className="mt-4 text-brand-700 leading-relaxed"> At Hills Aroma Homestay, guests can enjoy authentic Kumaoni cuisine prepared with fresh local ingredients and traditional Pahadi recipes. </p> 
         <p className="mt-3 text-brand-700 leading-relaxed"> Our traditional Pahadi Thali includes nutritious Ragi (Mandua) Roti, Bhatt ki Dal, Gahat (Kulath) ki Dal, homemade Pahadi chutney, and the delicious Jhangore ki Kheer. </p> 
         <p className="mt-3 text-brand-600 leading-relaxed"> Prepared with care, our Kumaoni food offers guests an authentic taste of the hills and a chance to experience the rich culinary traditions of Kumaon during their stay. </p>
        </div>

      </div>
    </section>
  )
}