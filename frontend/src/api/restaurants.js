import api from './axios'

export const getRestaurants = ()   => api.get('/restaurants')
export const getRestaurant  = (id) => api.get(`/restaurants/${id}`)
