import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { vehicleApi, type Vehicle } from '@/lib/api/vehicle'

export default function MyVehicles() {
  const { user } = useAuthStore()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true)
        const response = await vehicleApi.getMyVehicles()
        setVehicles(response.data || [])
      } catch (err: any) {
        setError(err.response?.data?.message || 'Araçlar yüklenemedi')
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchVehicles()
    }
  }, [user])

  const handleDelete = async (id: string, make: string, model: string) => {
    if (!confirm(`${make} ${model} aracını silmek istediğinize emin misiniz?`)) {
      return
    }

    try {
      await vehicleApi.delete(id)
      setVehicles(vehicles.filter((v) => v.id !== id))
    } catch (err: any) {
      alert(err.response?.data?.message || 'Araç silinemedi')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg">Yükleniyor...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card">
        <div className="text-red-600">{error}</div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Araçlarım</h1>
        <Link to="/dashboard/vehicles/create" className="btn btn-primary">
          + Yeni Araç Ekle
        </Link>
      </div>

      {vehicles.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-600 mb-4">Henüz araç eklemediniz.</p>
          <Link to="/dashboard/vehicles/create" className="btn btn-primary">
            İlk Aracınızı Ekleyin
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
            <div key={vehicle.id} className="card">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold">
                    {vehicle.make} {vehicle.model}
                  </h3>
                  <p className="text-gray-600 text-sm">{vehicle.year}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    vehicle.status === 'ACTIVE'
                      ? 'bg-green-100 text-green-800'
                      : vehicle.status === 'DRAFT'
                      ? 'bg-yellow-100 text-yellow-800'
                      : vehicle.status === 'SOLD'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {vehicle.status === 'ACTIVE'
                    ? 'Aktif'
                    : vehicle.status === 'DRAFT'
                    ? 'Taslak'
                    : vehicle.status === 'SOLD'
                    ? 'Satıldı'
                    : 'Pasif'}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Kilometre:</span> {vehicle.mileage?.toLocaleString()} km
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Yakıt:</span>{' '}
                  {vehicle.fuelType === 'GASOLINE'
                    ? 'Benzin'
                    : vehicle.fuelType === 'DIESEL'
                    ? 'Dizel'
                    : vehicle.fuelType === 'ELECTRIC'
                    ? 'Elektrik'
                    : 'Hibrit'}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Vites:</span>{' '}
                  {vehicle.transmission === 'MANUAL'
                    ? 'Manuel'
                    : vehicle.transmission === 'AUTOMATIC'
                    ? 'Otomatik'
                    : 'CVT'}
                </p>
                {vehicle.category && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Kategori:</span> {vehicle.category.name}
                  </p>
                )}
              </div>

              {vehicle.images && vehicle.images.length > 0 && (
                <div className="mb-4">
                  <img
                    src={vehicle.images[0]}
                    alt={vehicle.make + ' ' + vehicle.model}
                    className="w-full h-48 object-cover rounded-lg"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).src =
                        'https://via.placeholder.com/400x300?text=No+Image'
                    }}
                  />
                </div>
              )}

              <div className="flex gap-2">
                <Link
                  to={`/dashboard/vehicles/edit/${vehicle.id}`}
                  className="btn btn-secondary flex-1 text-sm"
                >
                  Düzenle
                </Link>
                <Link
                  to={`/vehicles/${vehicle.id}`}
                  className="btn btn-secondary flex-1 text-sm"
                >
                  Görüntüle
                </Link>
                <button
                  onClick={() => handleDelete(vehicle.id, vehicle.make, vehicle.model)}
                  className="btn btn-danger text-sm"
                >
                  Sil
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

