// Static room content (photos, description, facilities). Pricing is intentionally NOT here —
// weekday/weekend/extra-guest rates and discounts are dynamic and live in the backend database,
// managed from Admin -> Pricing, because the client wants to change rates without a redeploy.
//
// IMPORTANT: `id` below MUST match the real `id` column in the backend's `room` table (see
// docs/schema.sql). These two rooms correspond to the two rows seeded there. If you add a
// third room in the database via the admin panel, add a matching object here with the same id.

export const rooms = [
  {
    id: 1,
    name: 'Double Bed',
    bedType: 'Double Bed',
    maxGuests: 4,
    images: [
      { url: '/images/rooms/Double-Bed.jpeg', alt: 'replace this image with a Double Bed room photo' },
      { url: '/images/rooms/Bathroom.jpeg', alt: 'replace this image with a Double Bed room photo' },
      { url: '/images/rooms/roomsInterior.jpeg', alt: 'replace this image with a Double Bed with View room photo' },
    ],
    facilities: [
      'Attached bathroom/toilet',
      '24×7 hot & cold water facility',
      'Separate kitchen available',
      'Comfortable and well-maintained accommodation',
      'Extra Mattress Available',
    ],
    description: 'Additional mattress can be provided for extra guests. Availability and charges may vary. Please contact the property first to confirm.',
    pricing: {
      weekday: 1800,
      sat_sun: 2000,
      extraGuest: 'Mattress available, please contact the property first to confirm availability and charges'
    },
  },
  {
    id: 2,
    name: 'Double Bed with View',
    bedType: 'Double Bed',
    maxGuests: 4,
    images: [
      { url: '/images/rooms/Deluxe-Double-Bed.jpeg', alt: 'replace this image with a Double Bed with View room photo' },
      { url: '/images/rooms/BathroomInterior.jpeg', alt: 'replace this image with a Double Bed with View room photo' },
      { url: '/images/rooms/roomsInterior.jpeg', alt: 'replace this image with a Double Bed with View room photo' },
    ],
    facilities: [
      'Well-Ventilated Room',
      'Beautiful View',
      'Attached bathroom/toilet',
      '24×7 hot & cold water facility',
      'Separate kitchen available',
      'Comfortable and well-maintained accommodation',
      'Extra Mattress Available',
      'Additional mattress can be provided for extra guests. Availability and charges may vary. Please contact the property first to confirm.'
    ],
    description: 'Additional mattress can be provided for extra guests. Availability and charges may vary. Please contact the property first to confirm.',
       pricing: {
     weekday: 2000,
      sat_sun: 2500,
    },
  },

]
