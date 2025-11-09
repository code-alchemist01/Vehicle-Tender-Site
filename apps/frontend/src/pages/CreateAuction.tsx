import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { auctionApi, type CreateAuctionDto } from '@/lib/api/auction'
import { vehicleApi, type Vehicle } from '@/lib/api/vehicle'

export default function CreateAuction() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [userVehicles, setUserVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingVehicles, setLoadingVehicles] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState<CreateAuctionDto>({
    title: '',
    description: '',
    vehicleId: '',
    sellerId: user?.id || '',
    startingPrice: 0,
    reservePrice: undefined,
    minBidIncrement: 100,
    startTime: '',
    endTime: '',
    autoExtendMinutes: 5,
    isFeatured: false,
  })

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoadingVehicles(true)
        const response = await vehicleApi.getMyVehicles()
        // Filter only ACTIVE vehicles
        const activeVehicles = (response.data || []).filter(
          (v) => v.status === 'ACTIVE' || v.status === 'DRAFT'
        )
        setUserVehicles(activeVehicles)
      } catch (err: any) {
        setError('Araçlar yüklenemedi: ' + (err.response?.data?.message || err.message))
      } finally {
        setLoadingVehicles(false)
      }
    }

    if (user) {
      fetchVehicles()
    }
  }, [user])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? checked
          : type === 'number' || name === 'startingPrice' || name === 'reservePrice' || name === 'minBidIncrement' || name === 'autoExtendMinutes'
          ? Number(value) || 0
          : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      setError('Giriş yapmanız gerekiyor')
      return
    }

    setError('')
    setSuccess('')
    setLoading(true)

    try {
      // Validate required fields
      if (!formData.title || !formData.vehicleId || !formData.startTime || !formData.endTime) {
        setError('Lütfen tüm zorunlu alanları doldurun')
        setLoading(false)
        return
      }

      // Validate dates
      const startTime = new Date(formData.startTime)
      const endTime = new Date(formData.endTime)
      const now = new Date()

      if (startTime <= now) {
        setError('Başlangıç zamanı gelecekte olmalıdır')
        setLoading(false)
        return
      }

      if (endTime <= startTime) {
        setError('Bitiş zamanı başlangıç zamanından sonra olmalıdır')
        setLoading(false)
        return
      }

      // Validate prices
      if (formData.startingPrice <= 0) {
        setError('Başlangıç fiyatı 0\'dan büyük olmalıdır')
        setLoading(false)
        return
      }

      if (formData.reservePrice && formData.reservePrice <= formData.startingPrice) {
        setError('Rezerv fiyatı başlangıç fiyatından büyük olmalıdır')
        setLoading(false)
        return
      }

      if (formData.minBidIncrement && formData.minBidIncrement <= 0) {
        setError('Minimum teklif artışı 0\'dan büyük olmalıdır')
        setLoading(false)
        return
      }

      const auctionData = {
        ...formData,
        sellerId: user.id,
      }

      await auctionApi.create(auctionData)
      setSuccess('Açık artırma başarıyla oluşturuldu!')
      setTimeout(() => {
        navigate('/auctions')
      }, 1500)
    } catch (err: any) {
      console.error('Create auction error:', err)
      const errorData = err.response?.data
      if (errorData?.errors && Array.isArray(errorData.errors)) {
        setError(errorData.message + ': ' + errorData.errors.join(', '))
      } else {
        setError(
          errorData?.message ||
            'Açık artırma oluşturulamadı. Lütfen tekrar deneyin.'
        )
      }
    } finally {
      setLoading(false)
    }
  }

  // Calculate default start time (1 hour from now)
  const getDefaultStartTime = () => {
    const date = new Date()
    date.setHours(date.getHours() + 1)
    return date.toISOString().slice(0, 16)
  }

  // Calculate default end time (7 days from start)
  const getDefaultEndTime = () => {
    const date = new Date()
    date.setDate(date.getDate() + 7)
    return date.toISOString().slice(0, 16)
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Yeni Açık Artırma Başlat</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          {success}
        </div>
      )}

      {loadingVehicles ? (
        <div className="card text-center py-12">
          <div className="text-lg">Araçlar yükleniyor...</div>
        </div>
      ) : userVehicles.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-600 mb-4">
            Açık artırma başlatmak için önce bir araç eklemeniz gerekiyor.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/dashboard/vehicles/create" className="btn btn-primary">
              Araç Ekle
            </Link>
            <button onClick={() => navigate('/dashboard/vehicles/my')} className="btn btn-secondary">
              Araçlarım
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Temel Bilgiler</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Başlık <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="input"
                  placeholder="Örn: 2021 Mercedes C200 Müzayedesi"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Açıklama
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="input"
                  placeholder="Açık artırma hakkında detaylı bilgi..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Araç <span className="text-red-500">*</span>
                </label>
                <select
                  name="vehicleId"
                  value={formData.vehicleId}
                  onChange={handleChange}
                  required
                  className="input"
                >
                  <option value="">Araç Seçin</option>
                  {userVehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.make} {vehicle.model} ({vehicle.year}) -{' '}
                      {vehicle.status === 'ACTIVE' ? 'Aktif' : 'Taslak'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Fiyatlandırma</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Başlangıç Fiyatı (₺) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="startingPrice"
                  value={formData.startingPrice}
                  onChange={handleChange}
                  required
                  min={0}
                  step={0.01}
                  className="input"
                  placeholder="10000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rezerv Fiyatı (₺)
                </label>
                <input
                  type="number"
                  name="reservePrice"
                  value={formData.reservePrice || ''}
                  onChange={handleChange}
                  min={0}
                  step={0.01}
                  className="input"
                  placeholder="15000"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Rezerv fiyat başlangıç fiyatından yüksek olmalıdır
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Teklif Artışı (₺)
                </label>
                <input
                  type="number"
                  name="minBidIncrement"
                  value={formData.minBidIncrement}
                  onChange={handleChange}
                  min={1}
                  step={0.01}
                  className="input"
                  placeholder="100"
                />
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Zamanlama</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Başlangıç Zamanı <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="startTime"
                  value={formData.startTime || getDefaultStartTime()}
                  onChange={handleChange}
                  required
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bitiş Zamanı <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="endTime"
                  value={formData.endTime || getDefaultEndTime()}
                  onChange={handleChange}
                  required
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Otomatik Uzatma (Dakika)
                </label>
                <input
                  type="number"
                  name="autoExtendMinutes"
                  value={formData.autoExtendMinutes}
                  onChange={handleChange}
                  min={0}
                  className="input"
                  placeholder="5"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Son dakika tekliflerinde açık artırma otomatik uzatılır
                </p>
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Seçenekler</h2>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleChange}
                className="mr-2"
                id="isFeatured"
              />
              <label htmlFor="isFeatured" className="text-sm font-medium text-gray-700">
                Öne çıkan açık artırma olarak işaretle
              </label>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <button type="submit" disabled={loading} className="btn btn-primary flex-1">
              {loading ? 'Oluşturuluyor...' : 'Açık Artırma Başlat'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/auctions')}
              className="btn btn-secondary"
            >
              İptal
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

