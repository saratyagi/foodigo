import api from './axios'

export const getAddresses     = ()       => api.get('/addresses')
export const createAddress    = (data)   => api.post('/addresses', data)
export const updateAddress    = (id, data) => api.put(`/addresses/${id}`, data)
export const deleteAddress    = (id)     => api.delete(`/addresses/${id}`)
export const getDeliveryQuote = (data)   => api.post('/delivery/quote', data)
export const trackOrder       = (id)     => api.get(`/delivery/track/${id}`)
