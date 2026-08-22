import { homestay } from '../content/homestay'

/**
 * Builds a WhatsApp click-to-chat URL: https://wa.me/<number>?text=<url-encoded message>
 * homestay.whatsapp must be in full international format with no + or spaces (e.g. 919999999999).
 */
function buildWhatsAppUrl({ roomName, checkIn, checkOut, guests } = {}) {
  let message = `Hello, I would like to enquire about ${homestay.name}.`
  if (roomName) message += `\n\nRoom: ${roomName}`
  if (checkIn) message += `\nCheck-in: ${checkIn}`
  if (checkOut) message += `\nCheck-out: ${checkOut}`
  if (guests) message += `\nGuests: ${guests}`
  message += `\n\nPlease let me know the availability and booking details.`

  return `https://wa.me/${homestay.whatsapp}?text=${encodeURIComponent(message)}`
}

export default function WhatsAppButton({ roomName, checkIn, checkOut, guests, className = '', children }) {
  const url = buildWhatsAppUrl({ roomName, checkIn, checkOut, guests })

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebe57] text-white font-medium px-5 py-3 rounded-full transition-colors ${className}`}
    >
      {children || 'Chat on WhatsApp'}
    </a>
  )
}
