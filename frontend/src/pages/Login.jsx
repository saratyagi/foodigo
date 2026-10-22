import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { loginUser } = useAuth()
  const navigate = useNavigate()

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', form)
      loginUser(data.access_token, data.user)
      navigate('/home')
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-extrabold text-gray-800 dark:text-gray-100 text-center mb-6">
          Welcome back
        </h1>
        {error && (
          <p className="mb-4 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 rounded-lg px-3 py-2 text-center">
            {error}
          </p>
        )}
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Email</label>
            <input
              name="email" type="email" required
              value={form.email} onChange={handle}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-400"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Password</label>
            <input
              name="password" type="password" required
              value={form.password} onChange={handle}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-400"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white font-bold py-2.5 rounded-lg transition-colors"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
        <p className="mt-5 text-center text-sm text-gray-500 dark:text-gray-400">
          No account?{' '}
          <Link to="/signup" className="text-red-500 hover:underline font-medium">Sign up</Link>
        </p>
      </div>
    </div>
  )
}
