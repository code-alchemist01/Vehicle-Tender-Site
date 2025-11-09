import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { vehicleApi, type Vehicle } from '@/lib/api/vehicle'


export default function Vehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true)
        const response = await vehicleApi.getAll()
        setVehicles(response.data || [])
      } catch (err: any) {
        setError(err.response?.data?.message || 'Araçlar yüklenemedi')
      } finally {
        setLoading(false)
      }
    }

    fetchVehicles()
  }, [])

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
      <h1 className="text-3xl font-bold mb-6">Araçlar</h1>

      {vehicles.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-600">Henüz araç bulunmamaktadır.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
            <Link
              key={vehicle.id}
              to={`/vehicles/${vehicle.id}`}
              className="card hover:shadow-lg transition-shadow block"
            >
              <h3 className="text-xl font-semibold mb-2">
                {vehicle.make} {vehicle.model}
              </h3>
              <p className="text-gray-600 mb-2">Yıl: {vehicle.year}</p>
              <p className="text-gray-600 mb-2">
                Kilometre: {vehicle.mileage?.toLocaleString()} km
              </p>
              <p className="text-2xl font-bold text-primary-600 mb-4">
                ₺{vehicle.price?.toLocaleString()}
              </p>
              <div className="flex justify-between items-center">
                <span className={`px-3 py-1 rounded-full text-sm ${
                  vehicle.status === 'ACTIVE' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {vehicle.status}
                </span>
                <span className="text-primary-600 text-sm font-medium">
                  Detaylar →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

