import { useLocation, Navigate, Link } from 'react-router-dom'
import SEO from '../components/SEO'
import { homestay } from '../content/homestay'

export default function BookingConfirmation() {
  const location = useLocation()
  const booking = location.state?.booking

  // Only reachable right after a successful payment verification (booking passed via router
  // state) — if someone lands here directly (e.g. refresh, bookmarked URL), there's nothing
  // to show, so send them home rather than displaying a blank/fake confirmation.
  if (!booking) {
    return <Navigate to="/" replace />
  }

  const isPaid = booking.paymentStatus === 'PAID'
  const isConfirmed = booking.status === 'CONFIRMED'

  return (
    <>
      <SEO title="Booking Confirmation" description="Your booking confirmation." canonicalPath="/booking-confirmation" />
      <section className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white border border-brand-100 rounded-2xl p-8 print:border-0 print:shadow-none">
          <div className="text-center mb-6">
            <div className={`inline-flex w-14 h-14 rounded-full items-center justify-center text-2xl mb-3 ${isConfirmed ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
              {isConfirmed ? '✓' : '!'}
            </div>
            <h1 className="text-2xl font-display font-semibold">
              {isConfirmed ? 'Booking Confirmed' : 'Payment Received — Booking Pending Review'}
            </h1>
            {!isConfirmed && isPaid && (
              <p className="text-amber-700 text-sm mt-2">
                Your payment was successful, but this room was just booked by someone else for an
                overlapping date. We will contact you shortly to arrange alternate dates or a refund.
              </p>
            )}
          </div>

          <div className="border-t border-brand-100 pt-5 space-y-3 text-sm">
            <Row label="Homestay" value={homestay.name} />
            <Row label="Booking Reference" value={`#${booking.id}`} />
            <Row label="Guest Name" value={booking.guestName} />
            <Row label="Room" value={booking.roomName} />
            <Row label="Check-in" value={booking.checkIn} />
            <Row label="Check-out" value={booking.checkOut} />
            <Row label="Guests" value={booking.guests} />
            <Row label="Amount Paid" value={booking.totalAmount != null ? `₹${booking.totalAmount}` : '—'} />
            <Row label="Payment Status" value={booking.paymentStatus} />
            <Row label="Booking Status" value={booking.status} />
          </div>

          <div className="border-t border-brand-100 mt-5 pt-5 text-sm text-brand-600">
            <p>Questions about your stay? Contact us:</p>
            <p className="mt-1">
              {homestay.phone !== 'replace this text with your phone number' && <>📞 {homestay.phone} · </>}
              {homestay.email !== 'replace this text with your email address' && <>✉️ {homestay.email}</>}
            </p>
          </div>

          <div className="flex gap-3 mt-6 print:hidden">
            <button
              onClick={() => window.print()}
              className="border border-brand-700 text-brand-800 hover:bg-brand-50 font-medium px-5 py-2.5 rounded-lg text-sm"
            >
              Print / Save as PDF
            </button>
            <Link to="/" className="text-brand-700 hover:text-brand-900 text-sm font-medium underline underline-offset-2 self-center">
              Back to Home
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-brand-500">{label}</span>
      <span className="font-medium text-brand-900">{value}</span>
    </div>
  )
}
