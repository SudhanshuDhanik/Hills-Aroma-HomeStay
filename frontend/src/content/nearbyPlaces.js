// Static nearby-attractions content. The client's only confirmed nearby-place fact so far is
// the distance to Jageshwar (used on the Location page via homestay.js, not listed here as a
// separate "attraction card" to avoid duplicating the same figure two different ways).
// Add real nearby places here as the client provides them — do not invent distances or names.

export const nearbyPlaces = [
  {
    name: 'Jageshwar Dham',
    description:
      'One of the most important Shiva temple complexes in Kumaon, surrounded by ancient deodar forests and peaceful Himalayan scenery.',
    image: '/images/nearby/Jageshwar.jpg',
    distanceKm: 11, // approximate road distance from Hills Aroma
    travelTimeMinutes: 25, // approximate; verify in Google Maps
    activities:
      'Temple darshan, explore the ancient temples, photography, peaceful walks and enjoy the deodar forest'
  },

  {
    name: 'Dandeshwar Temple',
    description:
      'An ancient Shiva temple situated on the approach to Jageshwar Dham and part of the historic temple landscape of the region.',
    image: '/images/nearby/Dandeshwar.jpeg',
    distanceKm: 10, // approximate road distance from Hills Aroma
    travelTimeMinutes: 22, // approximate; verify in Google Maps
    activities:
      'Temple visit, photography, explore the historic architecture and enjoy the surrounding forest'
  },

  {
    name: 'Vriddha Jageshwar Temple',
    description:
      'An ancient Shiva temple located on a peaceful ridge above Jageshwar, offering a quieter spiritual experience and beautiful mountain surroundings.',
    image: '/images/nearby/VridhaJageshwar.jpeg',
    distanceKm: 12, // approximate road distance from Hills Aroma
    travelTimeMinutes: 30, // approximate; verify in Google Maps
    activities:
      'Temple darshan, short mountain drive, nature walks, photography and enjoying Himalayan views'
  },

  {
    name: 'Chitai Golu Devta Temple',
    description:
      'A famous Kumaoni temple dedicated to Golu Devta, known for its thousands of bells and its strong connection with local traditions.',
    image: '/images/nearby/chitai.jpeg',
    distanceKm: 10, // approximate road distance from Hills Aroma
    travelTimeMinutes: 25, // approximate; verify in Google Maps
    activities:
      'Temple visit, experience Kumaoni traditions, see the famous bells and enjoy the surrounding hills'
  },

  {
    name: 'Kasar Devi Temple',
    description:
      'A peaceful hilltop temple near Almora known for its spiritual atmosphere, scenic surroundings and panoramic Himalayan views.',
    image: '/images/nearby/kasar.jpeg',
    distanceKm: 20, // approximate road distance from Hills Aroma
    travelTimeMinutes: 42, // approximate; verify in Google Maps
    activities:
      'Temple visit, meditation, photography, mountain views and exploring the surrounding cafes and trails'
  },

  {
    name: 'Almora City',
    description:
      'The cultural heart of Kumaon, known for its historic markets, ancient temples, traditional Kumaoni culture, local handicrafts and beautiful Himalayan views.',
    image: '/images/nearby/almora-city.jpeg',
    distanceKm: 25, // approximate road distance from Hills Aroma
    travelTimeMinutes: 50, // approximate; verify in Google Maps
    activities:
      'Explore Lala Bazaar, visit Nanda Devi Temple, enjoy local Kumaoni food, shop for handicrafts and explore the old town'
  },

  {
    name: 'Almora Zoo',
    description:
      'A high-altitude zoo in Almora offering visitors an opportunity to see Himalayan wildlife and enjoy a peaceful outing surrounded by the hills.',
    image: '/images/nearby/zoo.jpeg',
    distanceKm: 24, // approximate road distance from Hills Aroma
    travelTimeMinutes: 48, // approximate; verify in Google Maps
    activities:
      'Explore the zoo, observe Himalayan wildlife, photography and enjoy a family-friendly nature outing'
  },

  {
    name: 'Dol Ashram',
    description:
      'A peaceful spiritual retreat in Kanra surrounded by dense forests, known for yoga, meditation, Vedic learning and a calm Himalayan atmosphere.',
    image: '/images/nearby/dolashram.jpg',
    distanceKm: 30, // approximate road distance from Hills Aroma
    travelTimeMinutes: 65, // approximate; verify in Google Maps
    activities:
      'Yoga, meditation, spiritual learning, quiet nature walks, reading and enjoying the peaceful forest surroundings'
  },

 
];
