import { publicApi, adminApi } from './axiosInstance'

export const submitEnquiry = (data) => publicApi.post('/enquiries', data).then(r => r.data)

export const getAllBookings = () => adminApi.get('/admin/bookings').then(r => r.data)
export const getRoomBookings = (roomId) => adminApi.get(`/admin/rooms/${roomId}/bookings`).then(r => r.data)
export const createManualBooking = (data) => adminApi.post('/admin/bookings', data).then(r => r.data)
export const updateBookingStatus = (id, status) =>
  adminApi.patch(`/admin/bookings/${id}/status`, { status }).then(r => r.data)
