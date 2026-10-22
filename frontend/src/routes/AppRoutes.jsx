import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from '../components/common/ProtectedRoute'

import Landing          from '../pages/Landing'
import Login            from '../pages/Login'
import Signup           from '../pages/Signup'
import Home             from '../pages/Home'
import Categories       from '../pages/Categories'
import Restaurants      from '../pages/Restaurants'
import RestaurantDetails from '../pages/RestaurantDetails'
import Search           from '../pages/Search'
import Cart             from '../pages/Cart'
import Checkout         from '../pages/Checkout'
import OrderSuccess     from '../pages/OrderSuccess'
import TrackOrder       from '../pages/TrackOrder'
import Orders           from '../pages/Orders'
import Favorites        from '../pages/Favorites'
import Profile          from '../pages/Profile'
import MealBuilder      from '../pages/MealBuilder'
import NotFound         from '../pages/NotFound'

import AdminLogin       from '../pages/admin/AdminLogin'
import Dashboard        from '../pages/admin/Dashboard'
import ManageFoods      from '../pages/admin/ManageFoods'
import ManageCategories from '../pages/admin/ManageCategories'
import ManageOrders     from '../pages/admin/ManageOrders'
import ManageUsers      from '../pages/admin/ManageUsers'

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"               element={<Landing />} />
      <Route path="/login"          element={<Login />} />
      <Route path="/signup"         element={<Signup />} />
      <Route path="/home"           element={<Home />} />
      <Route path="/categories"     element={<Categories />} />
      <Route path="/restaurants"    element={<Restaurants />} />
      <Route path="/restaurants/:id" element={<RestaurantDetails />} />
      <Route path="/search"         element={<Search />} />
      <Route path="/meal-builder"   element={<MealBuilder />} />

      {/* Protected — must be logged in */}
      <Route path="/cart"           element={<ProtectedRoute><Cart /></ProtectedRoute>} />
      <Route path="/checkout"       element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
      <Route path="/order-success/:id" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
      <Route path="/track/:id"      element={<ProtectedRoute><TrackOrder /></ProtectedRoute>} />
      <Route path="/orders"         element={<ProtectedRoute><Orders /></ProtectedRoute>} />
      <Route path="/favorites"      element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
      <Route path="/profile"        element={<ProtectedRoute><Profile /></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin/login"      element={<AdminLogin />} />
      <Route path="/admin"            element={<ProtectedRoute adminOnly><Dashboard /></ProtectedRoute>} />
      <Route path="/admin/dashboard"  element={<ProtectedRoute adminOnly><Dashboard /></ProtectedRoute>} />
      <Route path="/admin/foods"      element={<ProtectedRoute adminOnly><ManageFoods /></ProtectedRoute>} />
      <Route path="/admin/categories" element={<ProtectedRoute adminOnly><ManageCategories /></ProtectedRoute>} />
      <Route path="/admin/orders"     element={<ProtectedRoute adminOnly><ManageOrders /></ProtectedRoute>} />
      <Route path="/admin/users"      element={<ProtectedRoute adminOnly><ManageUsers /></ProtectedRoute>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
