// Single source of truth for homestay identity/contact info.
// Every component (Navbar, Footer, Contact page, WhatsApp button, SEO tags) reads from here —
// change a phone number or address ONCE, here, not in multiple components.

export const homestay = {
  name: 'Hills Aroma Homestay', // your homestay's name, e.g. "HillsAroma Homestay"

  // Polished version of the client-provided About text (facts unchanged, wording lightly
  // tightened for the website — see docs/CONTENT_SOURCES.md for the original client wording).
  description:
    "Nestled amidst the peaceful beauty of Kumaon, our homestay offers a serene escape for " +
    "those looking to relax and reconnect with nature. Located just 14 km from the revered " +
    "Jageshwar Temple, the property features comfortable, well-ventilated rooms with attached " +
    "bathrooms, along with the option of separate kitchen facilities for added convenience. " +
    "Guests can also enjoy a variety of authentic Kumaoni delicacies, bringing together the " +
    "comfort of a relaxing stay with the warmth and flavors of local culture.",

  // Client provided the road/route and distances, not a precise street address — do not invent one.
  address: 'Almora–Pithoragarh Road, Kumaon, Uttarakhand',

  // Separate location-section distances (client provided these distinctly from the About text's
  // "14 km from Jageshwar Temple" — the two figures are intentionally different, see
  // docs/CONTENT_SOURCES.md). Used on the Location page, not the About page.
  distanceFromAlmoraKm: 25,
  distanceFromJageshwarKm: 11,

  phone: '8439244255',       // e.g. '+919999999999'
  whatsapp: '8439244255',  // digits only, no +, e.g. '919999999999'
  email: 'hillsaromahomestay@gmail.com',

  // Paste the real Google Maps "Embed a map" iframe src URL here once available.
  mapEmbedUrl:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14203507.743027288!2d60.255593750000024!3d29.642812500000005!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39a0c9000c5f47d5%3A0x4283941bf04f3bee!2sHills%20Aroma%20homestay!5e0!3m2!1sen!2sin!4v1787203745522!5m2!1sen!2sin',

  heroImage: '/images/hero/Hero.jpeg',
  // heroImage2: '/images/hero/Hero2.jpeg',
  logo: '/images/logo/logo.jpeg',


  kumaoniFoodImage: '/images/food/KumaoniFood.jpeg',

  amenities: [
    { name: 'Parking', detail: 'Available on-site' },
    {
      name: 'Pets',
      detail: "Allowed with the owner's approval — please contact us first",
    },
    { name: 'Attached Bathrooms', detail: 'In every room' },
    {
      name: 'Kitchen Facilities',
      detail: 'Separate kitchen available @200₹/day, please contact us first to confirm availability',
    },
    { name: 'Kumaoni Food', detail: 'Authentic local meals available at genuine prices' },
  ],
};