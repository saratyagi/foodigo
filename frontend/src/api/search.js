import api from './axios'

export const searchAll = (params) => api.get('/search', { params })
