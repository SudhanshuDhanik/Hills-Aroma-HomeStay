import { useEffect, useState } from 'react'
import { getBlockedDates, createBlockedDate, deleteBlockedDate } from '../api/blockedDateApi'
import { getAdminRooms } from '../api/roomApi'

export default function AdminBlockedDates() {
  const [rooms, setRooms] = useState([])
  const [selectedRoom, setSelectedRoom] = useState('')
  const [blockedDates, setBlockedDates] = useState([])
  const [form, setForm] = useState({ startDate: '', endDate: '', reason: '' })

  useEffect(() => {
    getAdminRooms().then((r) => {
      setRooms(r)
      if (r.length > 0) setSelectedRoom(r[0].id)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (selectedRoom) {
      getBlockedDates(selectedRoom).then(setBlockedDates).catch(() => {})
    }
  }, [selectedRoom])

  async function handleAdd(e) {
    e.preventDefault()
    await createBlockedDate({ roomId: Number(selectedRoom), ...form })
    setForm({ startDate: '', endDate: '', reason: '' })
    getBlockedDates(selectedRoom).then(setBlockedDates)
  }

  async function handleDelete(id) {
    await deleteBlockedDate(id)
    getBlockedDates(selectedRoom).then(setBlockedDates)
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Blocked Dates</h1>

      <select value={selectedRoom} onChange={(e) => setSelectedRoom(e.target.value)} className="border border-brand-200 rounded-lg px-3 py-2 text-sm mb-6">
        {rooms.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
      </select>

      <form onSubmit={handleAdd} className="bg-white border border-brand-100 rounded-2xl p-5 mb-6 flex flex-wrap gap-3 items-end max-w-2xl">
        <div>
          <label className="block text-xs text-brand-600 mb-1">Start Date</label>
          <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="border border-brand-200 rounded-lg px-3 py-2 text-sm" required />
        </div>
        <div>
          <label className="block text-xs text-brand-600 mb-1">End Date</label>
          <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="border border-brand-200 rounded-lg px-3 py-2 text-sm" required />
        </div>
        <div>
          <label className="block text-xs text-brand-600 mb-1">Reason</label>
          <input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="e.g. maintenance" className="border border-brand-200 rounded-lg px-3 py-2 text-sm" />
        </div>
        <button type="submit" className="bg-brand-700 hover:bg-brand-800 text-white font-medium px-5 py-2 rounded-lg text-sm">Block Dates</button>
      </form>

      <div className="bg-white border border-brand-100 rounded-2xl overflow-hidden max-w-2xl">
        <table className="w-full text-sm">
          <thead className="bg-brand-50 text-brand-600 text-left">
            <tr><th className="px-4 py-3">Start</th><th className="px-4 py-3">End</th><th className="px-4 py-3">Reason</th><th className="px-4 py-3"></th></tr>
          </thead>
          <tbody>
            {blockedDates.map((b) => (
              <tr key={b.id} className="border-t border-brand-50">
                <td className="px-4 py-3">{b.startDate}</td>
                <td className="px-4 py-3">{b.endDate}</td>
                <td className="px-4 py-3">{b.reason}</td>
                <td className="px-4 py-3"><button onClick={() => handleDelete(b.id)} className="text-red-600 underline text-xs">Remove</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
