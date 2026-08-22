import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { submitEnquiry } from '../api/bookingApi'
import { rooms } from '../content/rooms'

export default function EnquiryForm({ roomId, roomName, prefillDates }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      checkIn: prefillDates?.checkIn || '',
      checkOut: prefillDates?.checkOut || '',
      roomId: roomId || '',
    }
  })
  const [status, setStatus] = useState('idle') // idle | submitting | success | error

  async function onSubmit(data) {
    setStatus('submitting')
    try {
      await submitEnquiry({
        roomId: roomId || Number(data.roomId),
        guestName: data.guestName,
        phone: data.phone,
        whatsapp: data.whatsapp || data.phone,
        email: data.email || undefined,
        checkIn: data.checkIn,
        checkOut: data.checkOut,
        guests: Number(data.guests),
        message: data.message,
      })
      setStatus('success')
      reset()
    } catch (err) {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl p-5 text-sm">
        Your enquiry has been received. Please contact us on WhatsApp or phone to confirm availability and booking.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-brand-100 rounded-2xl p-5 space-y-4">
      <h3 className="font-display font-semibold text-lg">
        {roomName ? `Enquire about ${roomName}` : 'Send an Enquiry'}
      </h3>

      <div className="grid sm:grid-cols-2 gap-4">
        {!roomId && (
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-brand-600 mb-1">Room *</label>
            <select {...register('roomId', { required: true })} className="w-full border border-brand-200 rounded-lg px-3 py-2 text-sm">
              <option value="">Select a room</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
            {errors.roomId && <p className="text-red-600 text-xs mt-1">Please select a room</p>}
          </div>
        )}
        <div>
          <label className="block text-xs font-medium text-brand-600 mb-1">Full Name *</label>
          <input {...register('guestName', { required: true })} className="w-full border border-brand-200 rounded-lg px-3 py-2 text-sm" />
          {errors.guestName && <p className="text-red-600 text-xs mt-1">Name is required</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-brand-600 mb-1">Phone Number *</label>
          <input {...register('phone', { required: true })} className="w-full border border-brand-200 rounded-lg px-3 py-2 text-sm" />
          {errors.phone && <p className="text-red-600 text-xs mt-1">Phone is required</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-brand-600 mb-1">WhatsApp Number</label>
          <input {...register('whatsapp')} className="w-full border border-brand-200 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-brand-600 mb-1">Email (optional)</label>
          <input type="email" {...register('email')} className="w-full border border-brand-200 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-brand-600 mb-1">Check-in *</label>
          <input type="date" {...register('checkIn', { required: true })} className="w-full border border-brand-200 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-brand-600 mb-1">Check-out *</label>
          <input type="date" {...register('checkOut', { required: true })} className="w-full border border-brand-200 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-brand-600 mb-1">Number of Guests *</label>
          <input type="number" min="1" {...register('guests', { required: true })} className="w-full border border-brand-200 rounded-lg px-3 py-2 text-sm" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-brand-600 mb-1">Message</label>
        <textarea {...register('message')} rows={3} className="w-full border border-brand-200 rounded-lg px-3 py-2 text-sm" />
      </div>

      {status === 'error' && (
        <p className="text-red-600 text-sm">Something went wrong. Please try again or contact us via WhatsApp.</p>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="bg-brand-700 hover:bg-brand-800 text-white font-medium px-6 py-2.5 rounded-lg text-sm disabled:opacity-60"
      >
        {status === 'submitting' ? 'Sending…' : 'Send Enquiry'}
      </button>
      <p className="text-xs text-brand-500">
        This is an enquiry, not a confirmed booking. The owner will confirm availability with you directly.
      </p>
    </form>
  )
}
