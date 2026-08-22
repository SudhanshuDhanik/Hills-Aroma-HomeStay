import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPriceQuote, createPaymentOrder, verifyPayment } from '../api/paymentApi'
import { checkAvailability } from '../api/roomApi'

/**
 * Handles the full "book & pay online" flow for a room:
 *   1. Customer picks dates + guest count
 *   2. Backend computes the price (PricingService) — this is always shown, never guessed client-side
 *   3. Customer enters contact details
 *   4. "Pay Now" -> backend creates a Razorpay order for the exact backend-computed amount
 *   5. Razorpay Checkout.js widget opens (loaded via <script> in index.html)
 *   6. On success, backend verifies the payment signature and confirms the booking
 *   7. Customer is sent to /booking-confirmation with the confirmed booking's ID
 *
 * The backend, not this component, is the source of truth for price and payment status —
 * this component only ever displays what the backend returns and reacts to it.
 */
export default function BookingWidget({ room }) {
  const navigate = useNavigate()
  const today = new Date().toISOString().split('T')[0]

  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState(room.maxGuests >= 2 ? 2 : 1)
  const [quote, setQuote] = useState(null)
  const [availability, setAvailability] = useState(null)
  const [quoteError, setQuoteError] = useState('')
  const [quoteLoading, setQuoteLoading] = useState(false)

  const [guestName, setGuestName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [payError, setPayError] = useState('')
  const [payLoading, setPayLoading] = useState(false)

  async function handleGetPrice(e) {
    e.preventDefault()
    setQuoteError('')
    setQuote(null)
    setAvailability(null)

    if (!checkIn || !checkOut) {
      setQuoteError('Please select both check-in and check-out dates.')
      return
    }
    if (checkOut <= checkIn) {
      setQuoteError('Check-out date must be after check-in date.')
      return
    }

    setQuoteLoading(true)
    try {
      const [avail, priceQuote] = await Promise.all([
        checkAvailability(room.id, checkIn, checkOut),
        getPriceQuote(room.id, checkIn, checkOut, guests),
      ])
      setAvailability(avail)
      setQuote(priceQuote)
    } catch (err) {
      setQuoteError(err.response?.data?.error || 'Could not calculate price. Please try again.')
    } finally {
      setQuoteLoading(false)
    }
  }

  function loadRazorpayScript() {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true)
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  async function handlePay(e) {
    e.preventDefault()
    setPayError('')

    if (!guestName || !phone) {
      setPayError('Please enter your name and phone number.')
      return
    }

    setPayLoading(true)
    try {
      const order = await createPaymentOrder({
        roomId: room.id,
        guestName,
        phone,
        whatsapp: phone,
        email: email || undefined,
        checkIn,
        checkOut,
        guests: Number(guests),
      })

      const scriptLoaded = await loadRazorpayScript()
      if (!scriptLoaded) {
        setPayError('Could not load the payment gateway. Check your connection and try again.')
        setPayLoading(false)
        return
      }

      const rzp = new window.Razorpay({
        key: order.razorpayKeyId,
        amount: order.amountInPaise,
        currency: order.currency,
        name: order.homestayName,
        description: `${room.name} — ${checkIn} to ${checkOut}`,
        order_id: order.razorpayOrderId,
        prefill: { name: guestName, contact: phone, email: email || undefined },
        handler: async function (response) {
          try {
            const booking = await verifyPayment({
              bookingId: order.bookingId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            })
            navigate('/booking-confirmation', { state: { booking } })
          } catch (err) {
            setPayError(err.response?.data?.error || 'Payment verification failed. Please contact us if money was deducted.')
            setPayLoading(false)
          }
        },
        modal: {
          ondismiss: function () {
            setPayLoading(false)
          },
        },
      })

      rzp.on('payment.failed', function () {
        setPayError('Payment failed. Please try again or contact us to book via WhatsApp instead.')
        setPayLoading(false)
      })

      rzp.open()
    } catch (err) {
      setPayError(err.response?.data?.error || 'Could not start payment. Please try again.')
      setPayLoading(false)
    }
  }

  return (
    <div className="bg-white border border-brand-100 rounded-2xl p-5 space-y-5">
      <h3 className="font-display font-semibold text-lg">Book & Pay Online</h3>

      <form onSubmit={handleGetPrice} className="space-y-3">
        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-brand-600 mb-1">Check-in</label>
            <input type="date" min={today} value={checkIn} onChange={(e) => setCheckIn(e.target.value)}
              className="w-full border border-brand-200 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-brand-600 mb-1">Check-out</label>
            <input type="date" min={checkIn || today} value={checkOut} onChange={(e) => setCheckOut(e.target.value)}
              className="w-full border border-brand-200 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-brand-600 mb-1">Guests</label>
            <select value={guests} onChange={(e) => setGuests(Number(e.target.value))}
              className="w-full border border-brand-200 rounded-lg px-3 py-2 text-sm">
              {Array.from({ length: room.maxGuests }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>{n} guest{n > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>
        </div>
        <button type="submit" disabled={quoteLoading}
          className="bg-brand-600 hover:bg-brand-700 text-white font-medium px-5 py-2 rounded-lg text-sm disabled:opacity-60">
          {quoteLoading ? 'Checking…' : 'Check Price & Availability'}
        </button>
      </form>

      {quoteError && <p className="text-red-600 text-sm">{quoteError}</p>}

      {availability && !availability.available && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-4 py-3 text-sm">
          This room isn't available for those exact dates. Try different dates, or message us on WhatsApp — we may have options.
        </div>
      )}

      {quote && availability?.available && (
        <div className="border-t border-brand-100 pt-4 space-y-3">
          <div className="text-sm space-y-1 text-brand-700">
            <div className="flex justify-between"><span>{quote.nights} night{quote.nights > 1 ? 's' : ''} ({quote.weekdayNights} weekday, {quote.weekendNights} weekend)</span><span>₹{quote.roomTotal}</span></div>
            {Number(quote.extraGuestTotal) > 0 && (
              <div className="flex justify-between"><span>Extra guest charges</span><span>₹{quote.extraGuestTotal}</span></div>
            )}
            {Number(quote.discountAmount) > 0 && (
              <div className="flex justify-between text-green-700"><span>Discount</span><span>−₹{quote.discountAmount}</span></div>
            )}
            <div className="flex justify-between font-semibold text-brand-900 text-base pt-1 border-t border-brand-100">
              <span>Total</span><span>₹{quote.totalAmount}</span>
            </div>
          </div>

          <form onSubmit={handlePay} className="space-y-3 pt-2">
            <div className="grid sm:grid-cols-2 gap-3">
              <input placeholder="Full name" value={guestName} onChange={(e) => setGuestName(e.target.value)}
                className="border border-brand-200 rounded-lg px-3 py-2 text-sm" required />
              <input placeholder="Phone number" value={phone} onChange={(e) => setPhone(e.target.value)}
                className="border border-brand-200 rounded-lg px-3 py-2 text-sm" required />
              <input type="email" placeholder="Email (optional)" value={email} onChange={(e) => setEmail(e.target.value)}
                className="sm:col-span-2 border border-brand-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            {payError && <p className="text-red-600 text-sm">{payError}</p>}
            <button type="submit" disabled={payLoading}
              className="w-full bg-brand-700 hover:bg-brand-800 text-white font-semibold px-5 py-3 rounded-lg text-sm disabled:opacity-60">
              {payLoading ? 'Opening payment…' : `Pay ₹${quote.totalAmount} & Confirm Booking`}
            </button>
            <p className="text-xs text-brand-500">
              You'll be redirected to Razorpay's secure checkout. We never see or store your card details.
            </p>
          </form>
        </div>
      )}
    </div>
  )
}
