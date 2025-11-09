import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { vehicleApi, type CreateVehicleDto, type FuelType, type TransmissionType, type VehicleCondition, type VehicleStatus } from '@/lib/api/vehicle'
import { categoryApi, type Category } from '@/lib/api/category'

export default function CreateVehicle() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState<CreateVehicleDto>({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    mileage: 0,
    fuelType: 'GASOLINE',
    transmission: 'AUTOMATIC',
    condition: 'GOOD',
    categoryId: '',
    status: 'DRAFT',
    description: '',
    images: [],
    engineSize: undefined,
    color: '',
    vin: '',
    licensePlate: '',
    location: '',
  })

  const [imageUrl, setImageUrl] = useState('')

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryApi.getActive()
        setCategories(response)
      } catch (err: any) {
        setError('Kategoriler yüklenemedi: ' + (err.response?.data?.message || err.message))
      }
    }
    fetchCategories()
  }, [])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'year' || name === 'mileage' || name === 'engineSize'
        ? Number(value) || 0
        : value,
    }))
  }

  const handleAddImage = () => {
    if (imageUrl.trim()) {
      setFormData((prev) => ({
        ...prev,
        images: [...(prev.images || []), imageUrl.trim()],
      }))
      setImageUrl('')
    }
  }

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index) || [],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      // Validate required fields
      if (!formData.make || !formData.model || !formData.categoryId) {
        setError('Lütfen tüm zorunlu alanları doldurun')
        setLoading(false)
        return
      }

      // Validate VIN format if provided
      if (formData.vin && !/^[A-HJ-NPR-Z0-9]{17}$/.test(formData.vin)) {
        setError('VIN 17 karakter olmalı ve geçerli karakterler içermelidir')
        setLoading(false)
        return
      }

      await vehicleApi.create(formData)
      setSuccess('Araç başarıyla oluşturuldu!')
      setTimeout(() => {
        navigate('/dashboard/vehicles/my')
      }, 1500)
    } catch (err: any) {
      console.error('Create vehicle error:', err)
      const errorData = err.response?.data
      if (errorData?.errors && Array.isArray(errorData.errors)) {
        setError(errorData.message + ': ' + errorData.errors.join(', '))
      } else {
        setError(errorData?.message || 'Araç oluşturulamadı. Lütfen tekrar deneyin.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Yeni Araç Ekle</h1>

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
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Marka <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="make"
                value={formData.make}
                onChange={handleChange}
                required
                maxLength={50}
                className="input"
                placeholder="Toyota"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Model <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                required
                maxLength={50}
                className="input"
                placeholder="Camry"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Yıl <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                required
                min={1900}
                max={2030}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kilometre <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="mileage"
                value={formData.mileage}
                onChange={handleChange}
                required
                min={0}
                className="input"
                placeholder="50000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Yakıt Tipi <span className="text-red-500">*</span>
              </label>
              <select
                name="fuelType"
                value={formData.fuelType}
                onChange={handleChange}
                required
                className="input"
              >
                <option value="GASOLINE">Benzin</option>
                <option value="DIESEL">Dizel</option>
                <option value="ELECTRIC">Elektrik</option>
                <option value="HYBRID">Hibrit</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vites Tipi <span className="text-red-500">*</span>
              </label>
              <select
                name="transmission"
                value={formData.transmission}
                onChange={handleChange}
                required
                className="input"
              >
                <option value="MANUAL">Manuel</option>
                <option value="AUTOMATIC">Otomatik</option>
                <option value="CVT">CVT</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Durum <span className="text-red-500">*</span>
              </label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                required
                className="input"
              >
                <option value="EXCELLENT">Mükemmel</option>
                <option value="GOOD">İyi</option>
                <option value="FAIR">Orta</option>
                <option value="POOR">Kötü</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kategori <span className="text-red-500">*</span>
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                required
                className="input"
              >
                <option value="">Kategori Seçin</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Ek Bilgiler</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Renk
              </label>
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleChange}
                maxLength={50}
                className="input"
                placeholder="Mavi"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Motor Hacmi (L)
              </label>
              <input
                type="number"
                name="engineSize"
                value={formData.engineSize || ''}
                onChange={handleChange}
                min={0.1}
                max={20}
                step={0.1}
                className="input"
                placeholder="2.5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                VIN (17 karakter)
              </label>
              <input
                type="text"
                name="vin"
                value={formData.vin}
                onChange={handleChange}
                maxLength={17}
                className="input"
                placeholder="1HGBH41JXMN109186"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plaka
              </label>
              <input
                type="text"
                name="licensePlate"
                value={formData.licensePlate}
                onChange={handleChange}
                maxLength={20}
                className="input"
                placeholder="ABC-123"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Konum
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                maxLength={200}
                className="input"
                placeholder="İstanbul, Türkiye"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Açıklama
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                maxLength={2000}
                rows={4}
                className="input"
                placeholder="Araç hakkında detaylı bilgi..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Durum
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="input"
              >
                <option value="DRAFT">Taslak</option>
                <option value="ACTIVE">Aktif</option>
                <option value="SOLD">Satıldı</option>
                <option value="INACTIVE">Pasif</option>
              </select>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Görseller</h2>
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Görsel URL'si ekleyin"
                className="input flex-1"
              />
              <button
                type="button"
                onClick={handleAddImage}
                className="btn btn-secondary"
              >
                Ekle
              </button>
            </div>

            {formData.images && formData.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {formData.images.map((url, index) => (
                  <div key={index} className="relative">
                    <img
                      src={url}
                      alt={`Görsel ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).src =
                          'https://via.placeholder.com/300x200?text=Invalid+URL'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary flex-1"
          >
            {loading ? 'Oluşturuluyor...' : 'Araç Oluştur'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard/vehicles/my')}
            className="btn btn-secondary"
          >
            İptal
          </button>
        </div>
      </form>
    </div>
  )
}

