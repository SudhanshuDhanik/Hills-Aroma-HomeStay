import { publicApi, adminApi } from './axiosInstance'

export const getBlockedDates = (roomId) => publicApi.get(`/rooms/${roomId}/blocked-dates`).then(r => r.data)
export const createBlockedDate = (data) => adminApi.post('/admin/blocked-dates', data).then(r => r.data)
export const deleteBlockedDate = (id) => adminApi.delete(`/admin/blocked-dates/${id}`)
