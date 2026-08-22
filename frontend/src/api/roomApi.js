import { publicApi, adminApi } from './axiosInstance'

export const checkAvailability = (roomId, checkIn, checkOut) =>
  publicApi.get(`/rooms/${roomId}/availability`, { params: { checkIn, checkOut } }).then(r => r.data)

// Room-picker dropdown for the admin (Bookings, Blocked Dates, Dashboard, Pricing pages).
export const getAdminRooms = () => adminApi.get('/admin/rooms').then(r => r.data)

// Admin -> Pricing screen only touches rates, not room identity/capacity.
export const updateRoomPricing = (id, data) => adminApi.patch(`/admin/rooms/${id}/pricing`, data).then(r => r.data)
