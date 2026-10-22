import { createContext, useContext, useState, useEffect } from 'react'
import { getFavorites, addFavorite, removeFavorite } from '../api/favorites'
import { useAuth } from './AuthContext'

const FavoritesContext = createContext()

export function FavoritesProvider({ children }) {
  const { user } = useAuth()
  const [favoriteIds, setFavoriteIds] = useState(new Set())

  useEffect(() => {
    if (user) {
      getFavorites()
        .then(res => setFavoriteIds(new Set(res.data.map(f => f.food_id))))
        .catch(() => {})
    } else {
      setFavoriteIds(new Set())
    }
  }, [user])

  const toggle = async (foodId) => {
    if (favoriteIds.has(foodId)) {
      await removeFavorite(foodId)
      setFavoriteIds(prev => { const next = new Set(prev); next.delete(foodId); return next })
    } else {
      await addFavorite(foodId)
      setFavoriteIds(prev => new Set([...prev, foodId]))
    }
  }

  return (
    <FavoritesContext.Provider value={{ favoriteIds, toggle }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export const useFavorites = () => useContext(FavoritesContext)
