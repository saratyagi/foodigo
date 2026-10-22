import api from './axios'

export const getFavorites   = ()       => api.get('/favorites')
export const addFavorite    = (foodId) => api.post(`/favorites/${foodId}`)
export const removeFavorite = (foodId) => api.delete(`/favorites/${foodId}`)
