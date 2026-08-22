import { publicApi } from './axiosInstance'

export const login = (username, password) =>
  publicApi.post('/admin/auth/login', { username, password }).then(r => r.data)
