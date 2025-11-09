import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { auctionApi, type UpdateAuctionDto, type Auction } from '@/lib/api/auction'
import { vehicleApi, type Vehicle } from '@/lib/api/vehicle'

export default function EditAuction() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { user } = useAuthStore()
  const [auction, setAuction] = useState<Auction | null>(null)
  const [userVehicles, setUserVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState<UpdateAuctionDto>({})

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return

      try {
        setLoading(true)
        const [auctionData, vehiclesData] = await Promise.all([
          auctionApi.getById(id),
          vehicleApi.getMyVehicles(),
        ])

        setAuction(auctionData)
        setUserVehicles(vehiclesData.data || [])

        // Check if user owns the auction
        if (auctionData.sellerId !== user?.id && user?.role !== 'ADMIN') {
          setError('Bu açık artırmayı düzenleme yetkiniz yok')
          return
        }

        // Check if auction can be edited (only DRAFT or SCHEDULED)
        if (
          auctionData.status !== 'DRAFT' &&
          auctionData.status !== 'SCHEDULED'
        ) {
          setError('Sadece taslak veya zamanlanmış açık artırmalar düzenlenebilir')
          return
        }

        // Populate form with existing data
        setFormData({
          title: auctionData.title,
          description: auctionData.description || '',
          vehicleId: auctionData.vehicleId,
          startingPrice: Number(auctionData.startingPrice),
          reservePrice: auctionData.reservePrice
            ? Number(auctionData.reservePrice)
            : undefined,
          minBidIncrement: Number(auctionData.minBidIncrement),
          startTime: new Date(auctionData.startTime).toISOString().slice(0, 16),
          endTime: new Date(auctionData.endTime).toISOString().slice(0, 16),
          autoExtendMinutes: auctionData.autoExtendMinutes || 5,
          isFeatured: auctionData.isFeatured || false,
        })
      } catch (err: any) {
        setError(err.response?.data?.message || 'Açık artırma bilgileri yüklenemedi')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id, user])

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
          : type === 'number' ||
            name === 'startingPrice' ||
            name === 'reservePrice' ||
            name === 'minBidIncrement' ||
            name === 'autoExtendMinutes'
          ? Number(value) || 0
          : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return

    setError('')
    setSuccess('')
    setSaving(true)

    try {
      // Validate dates
      if (formData.startTime && formData.endTime) {
        const startTime = new Date(formData.startTime)
        const endTime = new Date(formData.endTime)
        const now = new Date()

        if (startTime <= now && auction?.status === 'SCHEDULED') {
          setError('Başlangıç zamanı gelecekte olmalıdır')
          setSaving(false)
          return
        }

        if (endTime <= startTime) {
          setError('Bitiş zamanı başlangıç zamanından sonra olmalıdır')
          setSaving(false)
          return
        }
      }

      // Validate prices
      if (formData.startingPrice && formData.startingPrice <= 0) {
        setError('Başlangıç fiyatı 0\'dan büyük olmalıdır')
        setSaving(false)
        return
      }

      if (
        formData.reservePrice &&
        formData.startingPrice &&
        formData.reservePrice <= formData.startingPrice
      ) {
        setError('Rezerv fiyatı başlangıç fiyatından büyük olmalıdır')
        setSaving(false)
        return
      }

      await auctionApi.update(id, formData)
      setSuccess('Açık artırma başarıyla güncellendi!')
      setTimeout(() => {
        navigate(`/auctions/${id}`)
      }, 1500)
    } catch (err: any) {
      const errorData = err.response?.data
      if (errorData?.errors && Array.isArray(errorData.errors)) {
        setError(errorData.message + ': ' + errorData.errors.join(', '))
      } else {
        setError(errorData?.message || 'Açık artırma güncellenemedi. Lütfen tekrar deneyin.')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (
      !id ||
      !confirm(
        'Bu açık artırmayı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.'
      )
    ) {
      return
    }

    try {
      await auctionApi.delete(id)
      navigate('/auctions')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Açık artırma silinemedi')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg">Yükleniyor...</div>
      </div>
    )
  }

  if (error && !auction) {
    return (
      <div className="card">
        <div className="text-red-600">{error}</div>
        <button onClick={() => navigate('/auctions')} className="btn btn-secondary mt-4">
          Geri Dön
        </button>
      </div>
    )
  }

  if (!auction) {
    return (
      <div className="card">
        <div className="text-gray-600">Açık artırma bulunamadı.</div>
        <button onClick={() => navigate('/auctions')} className="btn btn-secondary mt-4">
          Geri Dön
        </button>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Açık Artırma Düzenle</h1>
        <button onClick={handleDelete} className="btn btn-danger">
          Sil
        </button>
      </div>

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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Temel Bilgiler</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Başlık</label>
              <input
                type="text"
                name="title"
                value={formData.title || ''}
                onChange={handleChange}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                rows={4}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Araç</label>
              <select
                name="vehicleId"
                value={formData.vehicleId || ''}
                onChange={handleChange}
                className="input"
              >
                <option value="">Araç Seçin</option>
                {userVehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.make} {vehicle.model} ({vehicle.year})
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
                Başlangıç Fiyatı (₺)
              </label>
              <input
                type="number"
                name="startingPrice"
                value={formData.startingPrice || ''}
                onChange={handleChange}
                min={0}
                step={0.01}
                className="input"
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
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Teklif Artışı (₺)
              </label>
              <input
                type="number"
                name="minBidIncrement"
                value={formData.minBidIncrement || ''}
                onChange={handleChange}
                min={1}
                step={0.01}
                className="input"
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
                Başlangıç Zamanı
              </label>
              <input
                type="datetime-local"
                name="startTime"
                value={formData.startTime || ''}
                onChange={handleChange}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bitiş Zamanı
              </label>
              <input
                type="datetime-local"
                name="endTime"
                value={formData.endTime || ''}
                onChange={handleChange}
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
                value={formData.autoExtendMinutes || ''}
                onChange={handleChange}
                min={0}
                className="input"
              />
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
              checked={formData.isFeatured || false}
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
          <button type="submit" disabled={saving} className="btn btn-primary flex-1">
            {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/auctions/${id}`)}
            className="btn btn-secondary"
          >
            İptal
          </button>
        </div>
      </form>
    </div>
  )
}

