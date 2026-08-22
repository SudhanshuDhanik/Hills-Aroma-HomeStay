import { useEffect, useState } from 'react'
import { getAdminRooms, updateRoomPricing } from '../api/roomApi'

/**
 * Deliberately narrow: the admin can only touch weekday/weekend/extra-guest rates and the
 * discount percentage — not the room's name, capacity, photos, or description (those are
 * static frontend content, maintained by the developer). This matches the client's request
 * for "a small/simple admin section" for pricing, not a full room editor.
 */
export default function AdminPricing() {
  const [rooms, setRooms] = useState([])
  const [saved, setSaved] = useState(null)
  const [error, setError] = useState(null)

  function load() {
    getAdminRooms().then(setRooms).catch(() => {})
  }

  useEffect(() => { load() }, [])

  function updateField(roomId, field, value) {
    setRooms((prev) => prev.map((r) => (r.id === roomId ? { ...r, [field]: value } : r)))
  }

  async function handleSave(room) {
    setSaved(null)
    setError(null)
    try {
      await updateRoomPricing(room.id, {
        weekdayPrice: Number(room.weekdayPrice),
        weekendPrice: Number(room.weekendPrice),
        extraGuestPrice: Number(room.extraGuestPrice),
        discountPercent: Number(room.discountPercent),
      })
      setSaved(room.id)
      setTimeout(() => setSaved(null), 2000)
    } catch (err) {
      setError(room.id)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-2">Pricing</h1>
      <p className="text-sm text-brand-500 mb-6">
        Set weekday/weekend nightly rates, the per-night extra-guest charge, and any discount.
        These are the only rates the booking system uses — room names/photos/descriptions are
        managed separately by your developer.
      </p>

      <div className="space-y-5 max-w-2xl">
        {rooms.map((room) => (
          <div key={room.id} className="bg-white border border-brand-100 rounded-2xl p-5">
            <h3 className="font-semibold mb-3">{room.name}</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-brand-600 mb-1">Weekday Rate (₹/night)</label>
                <input type="number" min="0" value={room.weekdayPrice}
                  onChange={(e) => updateField(room.id, 'weekdayPrice', e.target.value)}
                  className="w-full border border-brand-200 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-brand-600 mb-1">Weekend Rate (₹/night — Fri & Sat nights)</label>
                <input type="number" min="0" value={room.weekendPrice}
                  onChange={(e) => updateField(room.id, 'weekendPrice', e.target.value)}
                  className="w-full border border-brand-200 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-brand-600 mb-1">
                  Extra Guest Charge (₹/night, per guest above {room.baseOccupancy})
                </label>
                <input type="number" min="0" value={room.extraGuestPrice}
                  onChange={(e) => updateField(room.id, 'extraGuestPrice', e.target.value)}
                  className="w-full border border-brand-200 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-brand-600 mb-1">Discount (%, applied to whole stay)</label>
                <input type="number" min="0" max="100" value={room.discountPercent}
                  onChange={(e) => updateField(room.id, 'discountPercent', e.target.value)}
                  className="w-full border border-brand-200 rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <button onClick={() => handleSave(room)} className="bg-brand-700 hover:bg-brand-800 text-white font-medium px-5 py-2 rounded-lg text-sm">
                Save
              </button>
              {saved === room.id && <span className="text-green-600 text-sm">Saved!</span>}
              {error === room.id && <span className="text-red-600 text-sm">Could not save — try again.</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
