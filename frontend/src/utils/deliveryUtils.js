export const STATUS_COLORS = {
  Confirmed:        'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
  Preparing:        'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20',
  Cooking:          'text-orange-600 bg-orange-50 dark:bg-orange-900/20',
  'Out for Delivery': 'text-purple-600 bg-purple-50 dark:bg-purple-900/20',
  Delivered:        'text-green-600 bg-green-50 dark:bg-green-900/20',
  Cancelled:        'text-red-600 bg-red-50 dark:bg-red-900/20',
}

export const getStatusColor = (status) => STATUS_COLORS[status] || 'text-gray-600 bg-gray-50'

export const calcDeliveryFee = (subtotal, restaurantFee = 40) =>
  subtotal >= 500 ? 0 : restaurantFee
