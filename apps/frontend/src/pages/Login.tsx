import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login, isLoading } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err: any) {
      console.error('Login error:', err)
      
      // Network error handling
      if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error') || !err.response) {
        setError('Bağlantı hatası: Backend servisine ulaşılamıyor. Lütfen backend servislerinin çalıştığından emin olun.')
        return
      }
      
      const errorData = err.response?.data
      setError(
        errorData?.message || 'Giriş başarısız. Lütfen tekrar deneyin.'
      )
    }
  }

  return (
    <div className="card">
      <h1 className="text-3xl font-bold mb-2">Giriş Yap</h1>
      <p className="text-gray-600 mb-6">
        Hesabınıza giriş yaparak devam edin
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            E-posta
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input"
            placeholder="ornek@email.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Şifre
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary w-full"
        >
          {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Hesabınız yok mu?{' '}
        <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
          Kayıt olun
        </Link>
      </p>
    </div>
  )
}

