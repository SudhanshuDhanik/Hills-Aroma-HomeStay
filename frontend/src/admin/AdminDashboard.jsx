import { useEffect, useState } from 'react'
import { getAllBookings } from '../api/bookingApi'
import { getAdminRooms } from '../api/roomApi'

export default function AdminDashboard() {
  const [bookings, setBookings] = useState([])
  const [rooms, setRooms] = useState([])

  useEffect(() => {
    getAllBookings().then(setBookings).catch(() => {})
    getAdminRooms().then(setRooms).catch(() => {})
  }, [])

  const pending = bookings.filter((b) => b.status === 'PENDING').length
  const confirmed = bookings.filter((b) => b.status === 'CONFIRMED').length

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white border border-brand-100 rounded-2xl p-5">
          <p className="text-sm text-brand-500">Total Rooms</p>
          <p className="text-3xl font-semibold mt-1">{rooms.length}</p>
        </div>
        <div className="bg-white border border-brand-100 rounded-2xl p-5">
          <p className="text-sm text-brand-500">Pending Enquiries</p>
          <p className="text-3xl font-semibold mt-1 text-amber-600">{pending}</p>
        </div>
        <div className="bg-white border border-brand-100 rounded-2xl p-5">
          <p className="text-sm text-brand-500">Confirmed Bookings</p>
          <p className="text-3xl font-semibold mt-1 text-green-600">{confirmed}</p>
        </div>
      </div>
    </div>
  )
}
