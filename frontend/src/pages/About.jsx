import SEO from '../components/SEO'
import { homestay } from '../content/homestay'

export default function About() {
  return (
    <>
      <SEO
        title="About Us"
        description={`Learn about ${homestay.name} — our story and what makes a stay here special.`}
        canonicalPath="/about"
      />
      <section className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-semibold mb-4">About {homestay.name}</h1>
        <p className="text-brand-700 whitespace-pre-line leading-relaxed">{homestay.description}</p>
      </section>
    </>
  )
}
