'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { loginAction } from '@/app/actions/auth'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const result = await loginAction(email, password, pin)

      if (result.error) {
        setError(result.error)
      } else {
        const from = searchParams.get('from') || '/admin'
        router.push(from)
        router.refresh()
      }
    } catch {
      setError('Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Admin Login</h1>
          <p className="text-slate-400 mt-2">PoolCalc Tournament Manager</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder:text-slate-500"
              placeholder="admin@example.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder:text-slate-500"
              placeholder="Enter password"
              autoComplete="current-password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              PIN
            </label>
            <input
              type="text"
              required
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder:text-slate-500 tracking-widest"
              placeholder="XXXX-XXXX"
              autoComplete="off"
            />
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  )
}
