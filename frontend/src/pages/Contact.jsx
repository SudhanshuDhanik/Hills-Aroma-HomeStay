import EnquiryForm from '../components/EnquiryForm'
import SEO from '../components/SEO'
import WhatsAppButton from '../components/WhatsAppButton'
import { homestay } from '../content/homestay'
import { rooms } from '../content/rooms'

export default function Contact() {
  return (
    <>
      <SEO
        title="Contact Us"
        description={`Get in touch with ${homestay.name} via phone, WhatsApp, email, or our enquiry form.`}
        canonicalPath="/contact"
      />
      <section className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        <h1 className="text-3xl font-semibold">Contact Us</h1>

        <div className="flex flex-wrap gap-3">
          {!homestay.phone.startsWith('replace this text') && (
            <a href={`tel:${homestay.phone}`} className="bg-brand-700 hover:bg-brand-800 text-white font-medium px-5 py-3 rounded-full">
              📞 {homestay.phone}
            </a>
          )}
          <WhatsAppButton />
          {!homestay.email.startsWith('replace this text') && (
            <a href={`mailto:${homestay.email}`} className="border border-brand-700 text-brand-800 hover:bg-brand-50 font-medium px-5 py-3 rounded-full">
              ✉️ {homestay.email}
            </a>
          )}
        </div>

        {/* <EnquiryForm roomId={rooms[0]?.id} /> */}
      </section>
    </>
  )
}
