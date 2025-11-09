import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import {
  vehicleApi,
  type UpdateVehicleDto,
  type Vehicle,
  type VehicleStatus,
} from '@/lib/api/vehicle'
import { categoryApi, type Category } from '@/lib/api/category'

export default function EditVehicle() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { user } = useAuthStore()
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState<UpdateVehicleDto>({})
  const [imageUrl, setImageUrl] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return

      try {
        setLoading(true)
        const [vehicleData, categoriesData] = await Promise.all([
          vehicleApi.getById(id),
          categoryApi.getActive(),
        ])

        setVehicle(vehicleData)
        setCategories(categoriesData)

        // Check if user owns the vehicle
        if (vehicleData.userId !== user?.id && vehicleData.sellerId !== user?.id && user?.role !== 'ADMIN') {
          setError('Bu aracı düzenleme yetkiniz yok')
          return
        }

        // Populate form with existing data
        setFormData({
          make: vehicleData.make,
          model: vehicleData.model,
          year: vehicleData.year,
          mileage: vehicleData.mileage,
          fuelType: vehicleData.fuelType,
          transmission: vehicleData.transmission,
          condition: vehicleData.condition,
          categoryId: vehicleData.categoryId,
          status: vehicleData.status,
          description: vehicleData.description || '',
          images: vehicleData.images || [],
          engineSize: vehicleData.engineSize,
          color: vehicleData.color || '',
          vin: vehicleData.vin || '',
          licensePlate: vehicleData.licensePlate || '',
          location: vehicleData.location || '',
        })
      } catch (err: any) {
        setError(err.response?.data?.message || 'Araç bilgileri yüklenemedi')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id, user])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'year' || name === 'mileage' || name === 'engineSize'
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
    if (!id) return

    setError('')
    setSuccess('')
    setSaving(true)

    try {
      // Validate VIN format if provided
      if (formData.vin && !/^[A-HJ-NPR-Z0-9]{17}$/.test(formData.vin)) {
        setError('VIN 17 karakter olmalı ve geçerli karakterler içermelidir')
        setSaving(false)
        return
      }

      await vehicleApi.update(id, formData)
      setSuccess('Araç başarıyla güncellendi!')
      setTimeout(() => {
        navigate('/dashboard/vehicles/my')
      }, 1500)
    } catch (err: any) {
      const errorData = err.response?.data
      if (errorData?.errors && Array.isArray(errorData.errors)) {
        setError(errorData.message + ': ' + errorData.errors.join(', '))
      } else {
        setError(errorData?.message || 'Araç güncellenemedi. Lütfen tekrar deneyin.')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!id || !confirm('Bu aracı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) {
      return
    }

    try {
      await vehicleApi.delete(id)
      navigate('/dashboard/vehicles/my')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Araç silinemedi')
    }
  }

  const handleStatusChange = async (status: VehicleStatus) => {
    if (!id) return

    try {
      await vehicleApi.updateStatus(id, status)
      setFormData((prev) => ({ ...prev, status }))
      setSuccess('Durum başarıyla güncellendi!')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Durum güncellenemedi')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg">Yükleniyor...</div>
      </div>
    )
  }

  if (error && !vehicle) {
    return (
      <div className="card">
        <div className="text-red-600">{error}</div>
        <button onClick={() => navigate('/dashboard/vehicles/my')} className="btn btn-secondary mt-4">
          Geri Dön
        </button>
      </div>
    )
  }

  if (!vehicle) {
    return (
      <div className="card">
        <div className="text-gray-600">Araç bulunamadı.</div>
        <button onClick={() => navigate('/dashboard/vehicles/my')} className="btn btn-secondary mt-4">
          Geri Dön
        </button>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Araç Düzenle</h1>
        <div className="flex gap-2">
          <select
            value={formData.status || vehicle.status}
            onChange={(e) => handleStatusChange(e.target.value as VehicleStatus)}
            className="input"
          >
            <option value="DRAFT">Taslak</option>
            <option value="ACTIVE">Aktif</option>
            <option value="SOLD">Satıldı</option>
            <option value="INACTIVE">Pasif</option>
          </select>
          <button onClick={handleDelete} className="btn btn-danger">
            Sil
          </button>
        </div>
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
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Marka</label>
              <input
                type="text"
                name="make"
                value={formData.make || ''}
                onChange={handleChange}
                maxLength={50}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
              <input
                type="text"
                name="model"
                value={formData.model || ''}
                onChange={handleChange}
                maxLength={50}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Yıl</label>
              <input
                type="number"
                name="year"
                value={formData.year || ''}
                onChange={handleChange}
                min={1900}
                max={2030}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kilometre</label>
              <input
                type="number"
                name="mileage"
                value={formData.mileage || ''}
                onChange={handleChange}
                min={0}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Yakıt Tipi</label>
              <select name="fuelType" value={formData.fuelType || ''} onChange={handleChange} className="input">
                <option value="GASOLINE">Benzin</option>
                <option value="DIESEL">Dizel</option>
                <option value="ELECTRIC">Elektrik</option>
                <option value="HYBRID">Hibrit</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vites Tipi</label>
              <select
                name="transmission"
                value={formData.transmission || ''}
                onChange={handleChange}
                className="input"
              >
                <option value="MANUAL">Manuel</option>
                <option value="AUTOMATIC">Otomatik</option>
                <option value="CVT">CVT</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Durum</label>
              <select
                name="condition"
                value={formData.condition || ''}
                onChange={handleChange}
                className="input"
              >
                <option value="EXCELLENT">Mükemmel</option>
                <option value="GOOD">İyi</option>
                <option value="FAIR">Orta</option>
                <option value="POOR">Kötü</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
              <select
                name="categoryId"
                value={formData.categoryId || ''}
                onChange={handleChange}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Renk</label>
              <input
                type="text"
                name="color"
                value={formData.color || ''}
                onChange={handleChange}
                maxLength={50}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Motor Hacmi (L)</label>
              <input
                type="number"
                name="engineSize"
                value={formData.engineSize || ''}
                onChange={handleChange}
                min={0.1}
                max={20}
                step={0.1}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">VIN (17 karakter)</label>
              <input
                type="text"
                name="vin"
                value={formData.vin || ''}
                onChange={handleChange}
                maxLength={17}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plaka</label>
              <input
                type="text"
                name="licensePlate"
                value={formData.licensePlate || ''}
                onChange={handleChange}
                maxLength={20}
                className="input"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Konum</label>
              <input
                type="text"
                name="location"
                value={formData.location || ''}
                onChange={handleChange}
                maxLength={200}
                className="input"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                maxLength={2000}
                rows={4}
                className="input"
              />
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
              <button type="button" onClick={handleAddImage} className="btn btn-secondary">
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
          <button type="submit" disabled={saving} className="btn btn-primary flex-1">
            {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
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

