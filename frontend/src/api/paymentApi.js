import { publicApi } from './axiosInstance'

export const getPriceQuote = (roomId, checkIn, checkOut, guests) =>
  publicApi.get(`/rooms/${roomId}/price`, { params: { checkIn, checkOut, guests } }).then(r => r.data)

export const createPaymentOrder = (data) =>
  publicApi.post('/payments/create-order', data).then(r => r.data)

export const verifyPayment = (data) =>
  publicApi.post('/payments/verify', data).then(r => r.data)
