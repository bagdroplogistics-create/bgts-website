'use client'
import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const router = useRouter()
  const [user, setUser]       = useState('')
  const [pass, setPass]       = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/bgts-auth', {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({ username: user, password: pass }),
      })
      if (res.ok) {
        router.push('/bgtsadmin1950/dashboard')
      } else {
        setError('Invalid username or password.')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo / brand */}
        <div className="text-center mb-8">
          <p className="text-gray-500 text-xs font-mono tracking-widest uppercase mb-1">Baroda Goods Transport Service</p>
          <h1 className="text-white font-black text-2xl tracking-tight">
            BGTS <span className="text-orange-400">Admin</span>
          </h1>
          <p className="text-gray-500 text-xs mt-1">Dispatch &amp; Operations Portal</p>
        </div>

        {/* Card */}
        <form onSubmit={handleSubmit}
          className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl space-y-5">

          <div>
            <label className="block text-gray-400 text-xs font-semibold mb-1.5 uppercase tracking-wider">
              Username
            </label>
            <input
              type="text"
              autoComplete="username"
              required
              value={user}
              onChange={e => setUser(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm
                         focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition"
              placeholder="Enter username"
            />
          </div>

          <div>
            <label className="block text-gray-400 text-xs font-semibold mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              autoComplete="current-password"
              required
              value={pass}
              onChange={e => setPass(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm
                         focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition"
              placeholder="Enter password"
            />
          </div>

          {error && (
            <p className="text-red-400 text-xs font-medium bg-red-950/40 border border-red-900 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-400 disabled:opacity-50 disabled:cursor-not-allowed
                       text-white font-bold py-3 rounded-lg text-sm tracking-wide transition-colors">
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-gray-600 text-xs mt-6">
          BGTS Dispatch Platform &mdash; Authorised personnel only
        </p>
      </div>
    </div>
  )
}
