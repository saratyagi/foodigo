import api from './axios'

export const placeOrder = (data) => api.post('/orders', data)
export const getOrders  = ()     => api.get('/orders')
export const getOrder   = (id)   => api.get(`/orders/${id}`)
