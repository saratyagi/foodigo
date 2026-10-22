import api from './axios'

export const getFoods = (params = {}) => api.get('/foods', { params })
export const getFood  = (id)          => api.get(`/foods/${id}`)
