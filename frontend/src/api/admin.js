import api from './axios'

export const getStats            = ()          => api.get('/admin/stats')
export const getAdminFoods       = ()          => api.get('/admin/foods')
export const createFood          = (data)      => api.post('/admin/foods', data)
export const updateFood          = (id, data)  => api.put(`/admin/foods/${id}`, data)
export const deleteFood          = (id)        => api.delete(`/admin/foods/${id}`)
export const getAdminCategories  = ()          => api.get('/admin/categories')
export const createCategory      = (data)      => api.post('/admin/categories', data)
export const updateCategory      = (id, data)  => api.put(`/admin/categories/${id}`, data)
export const deleteCategory      = (id)        => api.delete(`/admin/categories/${id}`)
export const getAdminOrders      = ()          => api.get('/admin/orders')
export const updateOrderStatus   = (id, status) => api.patch(`/admin/orders/${id}/status`, { status })
export const getAdminUsers       = ()          => api.get('/admin/users')
