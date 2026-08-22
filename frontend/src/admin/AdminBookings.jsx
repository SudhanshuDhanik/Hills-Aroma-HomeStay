import { useEffect, useState } from 'react'
import { getAllBookings, updateBookingStatus, createManualBooking } from '../api/bookingApi'
import { getAdminRooms } from '../api/roomApi'

const statusColors = {
  PENDING: 'bg-amber-100 text-amber-800',
  CONFIRMED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-700',
}

const paymentColors = {
  UNPAID: 'bg-gray-100 text-gray-600',
  PAID: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-700',
}

const emptyForm = { roomId: '', guestName: '', phone: '', checkIn: '', checkOut: '', guests: 1, status: 'CONFIRMED' }

export default function AdminBookings() {
  const [bookings, setBookings] = useState([])
  const [rooms, setRooms] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)

  function load() {
    getAllBookings().then(setBookings).catch(() => {})
  }

  useEffect(() => {
    load()
    getAdminRooms().then(setRooms).catch(() => {})
  }, [])

  async function handleStatusChange(id, status) {
    try {
      await updateBookingStatus(id, status)
      load()
    } catch (err) {
      alert(err.response?.data?.error || 'Could not update booking status.')
    }
  }

  async function handleCreate(e) {
    e.preventDefault()
    setError('')
    try {
      await createManualBooking({ ...form, roomId: Number(form.roomId), guests: Number(form.guests) })
      setForm(emptyForm)
      setShowForm(false)
      load()
    } catch (err) {
      setError(err.response?.data?.error || 'Could not create booking. Check the dates for conflicts.')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Bookings & Enquiries</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-brand-700 hover:bg-brand-800 text-white text-sm font-medium px-4 py-2 rounded-lg">
          {showForm ? 'Cancel' : '+ Create Manual Booking'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white border border-brand-100 rounded-2xl p-5 mb-6 space-y-4 max-w-2xl">
          <div className="grid sm:grid-cols-2 gap-4">
            <select value={form.roomId} onChange={(e) => setForm({ ...form, roomId: e.target.value })} className="border border-brand-200 rounded-lg px-3 py-2 text-sm" required>
              <option value="">Select room</option>
              {rooms.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="border border-brand-200 rounded-lg px-3 py-2 text-sm">
              <option value="CONFIRMED">Confirmed</option>
              <option value="PENDING">Pending</option>
            </select>
            <input placeholder="Guest name" value={form.guestName} onChange={(e) => setForm({ ...form, guestName: e.target.value })} className="border border-brand-200 rounded-lg px-3 py-2 text-sm" required />
            <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="border border-brand-200 rounded-lg px-3 py-2 text-sm" required />
            <input type="date" value={form.checkIn} onChange={(e) => setForm({ ...form, checkIn: e.target.value })} className="border border-brand-200 rounded-lg px-3 py-2 text-sm" required />
            <input type="date" value={form.checkOut} onChange={(e) => setForm({ ...form, checkOut: e.target.value })} className="border border-brand-200 rounded-lg px-3 py-2 text-sm" required />
            <input type="number" min="1" placeholder="Guests" value={form.guests} onChange={(e) => setForm({ ...form, guests: e.target.value })} className="border border-brand-200 rounded-lg px-3 py-2 text-sm" required />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button type="submit" className="bg-brand-700 hover:bg-brand-800 text-white font-medium px-5 py-2 rounded-lg text-sm">Save Booking</button>
        </form>
      )}

      <div className="bg-white border border-brand-100 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-brand-50 text-brand-600 text-left">
            <tr>
              <th className="px-4 py-3">Guest</th>
              <th className="px-4 py-3">Room</th>
              <th className="px-4 py-3">Dates</th>
              <th className="px-4 py-3">Guests</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="border-t border-brand-50">
                <td className="px-4 py-3">{b.guestName}</td>
                <td className="px-4 py-3">{b.roomName}</td>
                <td className="px-4 py-3">{b.checkIn} → {b.checkOut}</td>
                <td className="px-4 py-3">{b.guests}</td>
                <td className="px-4 py-3">{b.totalAmount != null ? `₹${b.totalAmount}` : '—'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${paymentColors[b.paymentStatus]}`}>{b.paymentStatus}</span>
                </td>
                <td className="px-4 py-3">{b.phone}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[b.status]}`}>{b.status}</span>
                </td>
                <td className="px-4 py-3 space-x-2">
                  {b.status !== 'CONFIRMED' && (
                    <button onClick={() => handleStatusChange(b.id, 'CONFIRMED')} className="text-green-700 underline text-xs">Confirm</button>
                  )}
                  {b.status !== 'CANCELLED' && (
                    <button onClick={() => handleStatusChange(b.id, 'CANCELLED')} className="text-red-600 underline text-xs">Cancel</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
