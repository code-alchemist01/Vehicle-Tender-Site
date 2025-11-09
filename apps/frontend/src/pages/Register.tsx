import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

export default function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
  })
  const [error, setError] = useState('')
  const { register, isLoading } = useAuthStore()
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone || undefined,
      })
      navigate('/dashboard')
    } catch (err: any) {
      console.error('Register error:', err)
      
      // Network error handling
      if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error') || !err.response) {
        setError('Bağlantı hatası: Backend servisine ulaşılamıyor. Lütfen backend servislerinin çalıştığından emin olun.')
        return
      }
      
      const errorData = err.response?.data
      let errorMessage = 'Kayıt başarısız. Lütfen tekrar deneyin.'
      
      if (errorData) {
        if (errorData.errors && Array.isArray(errorData.errors)) {
          // Backend validation errors
          errorMessage = errorData.message 
            ? `${errorData.message}: ${errorData.errors.join(', ')}`
            : errorData.errors.join(', ')
        } else if (errorData.message) {
          errorMessage = errorData.message
        } else if (typeof errorData === 'string') {
          errorMessage = errorData
        }
      } else if (err.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
    }
  }

  return (
    <div className="card">
      <h1 className="text-3xl font-bold mb-2">Kayıt Ol</h1>
      <p className="text-gray-600 mb-6">
        Yeni hesap oluşturarak başlayın
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
              Ad
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="input"
              placeholder="Adınız"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
              Soyad
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="input"
              placeholder="Soyadınız"
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            E-posta
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="input"
            placeholder="ornek@email.com"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Telefon (Opsiyonel)
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            className="input"
            placeholder="+90 555 123 4567"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Şifre
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={8}
            className="input"
            placeholder="En az 8 karakter, büyük/küçük harf, rakam ve özel karakter"
          />
          <p className="mt-1 text-xs text-gray-500">
            Şifre en az 8 karakter olmalı, büyük harf, küçük harf, rakam ve özel karakter (!@#$%^&*) içermelidir.
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary w-full"
        >
          {isLoading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Zaten hesabınız var mı?{' '}
        <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
          Giriş yapın
        </Link>
      </p>
    </div>
  )
}

