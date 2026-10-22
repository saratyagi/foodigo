import api from './axios'

export const getReviews   = (restaurantId) => api.get(`/reviews/${restaurantId}`)
export const createReview = (data)         => api.post('/reviews', data)
