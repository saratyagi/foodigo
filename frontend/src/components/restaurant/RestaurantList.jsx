import RestaurantCard from './RestaurantCard'

export default function RestaurantList({ restaurants }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {restaurants.map(r => <RestaurantCard key={r.id} restaurant={r} />)}
    </div>
  )
}
