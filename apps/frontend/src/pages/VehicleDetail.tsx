import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { vehicleApi, type Vehicle, type VehicleStatus } from '@/lib/api/vehicle'
import { auctionApi } from '@/lib/api/auction'

export default function VehicleDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [auctions, setAuctions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusUpdating, setStatusUpdating] = useState(false)

  useEffect(() => {
    if (!id) return

    const fetchData = async () => {
      try {
        setLoading(true)
        const vehicleData = await vehicleApi.getById(id)
        setVehicle(vehicleData)

        // Fetch auctions for this vehicle
        try {
          const auctionsData = await auctionApi.getAll({ vehicleId: id })
          setAuctions(auctionsData.data || [])
        } catch {
          // No auctions found, that's okay
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Araç yüklenemedi')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg">Yükleniyor...</div>
      </div>
    )
  }

  if (error || !vehicle) {
    return (
      <div className="card">
        <div className="text-red-600">{error || 'Araç bulunamadı'}</div>
        <button onClick={() => navigate('/vehicles')} className="btn btn-secondary mt-4">
          Araçlara Dön
        </button>
      </div>
    )
  }

  const isOwner = user && (vehicle?.userId === user.id || vehicle?.sellerId === user.id)
  const isAdmin = user?.role === 'ADMIN'

  const handleDelete = async () => {
    if (!id || !confirm('Bu aracı silmek istediğinize emin misiniz?')) {
      return
    }

    try {
      await vehicleApi.delete(id)
      navigate('/dashboard/vehicles/my')
    } catch (err: any) {
      alert(err.response?.data?.message || 'Araç silinemedi')
    }
  }

  const handleStatusChange = async (status: VehicleStatus) => {
    if (!id) return

    try {
      setStatusUpdating(true)
      await vehicleApi.updateStatus(id, status)
      setVehicle((prev) => (prev ? { ...prev, status } : null))
    } catch (err: any) {
      alert(err.response?.data?.message || 'Durum güncellenemedi')
    } finally {
      setStatusUpdating(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate('/vehicles')}
          className="text-primary-600 hover:text-primary-700"
        >
          ← Araçlara Dön
        </button>
        {(isOwner || isAdmin) && (
          <div className="flex gap-2">
            <Link
              to={`/dashboard/vehicles/edit/${id}`}
              className="btn btn-secondary text-sm"
            >
              Düzenle
            </Link>
            <button onClick={handleDelete} className="btn btn-danger text-sm">
              Sil
            </button>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Vehicle Info */}
        <div className="card">
          <h1 className="text-3xl font-bold mb-4">
            {vehicle.make} {vehicle.model}
          </h1>
          
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-600">Yıl</div>
              <div className="text-lg font-semibold">{vehicle.year}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Kilometre</div>
              <div className="text-lg font-semibold">
                {vehicle.mileage?.toLocaleString()} km
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Fiyat</div>
              <div className="text-2xl font-bold text-primary-600">
                ₺{vehicle.price?.toLocaleString()}
              </div>
            </div>
            {vehicle.description && (
              <div>
                <div className="text-sm text-gray-600">Açıklama</div>
                <div className="text-gray-800">{vehicle.description}</div>
              </div>
            )}
            <div>
              <div className="text-sm text-gray-600 mb-2">Durum</div>
              {(isOwner || isAdmin) ? (
                <select
                  value={vehicle.status}
                  onChange={(e) => handleStatusChange(e.target.value as VehicleStatus)}
                  disabled={statusUpdating}
                  className="input"
                >
                  <option value="DRAFT">Taslak</option>
                  <option value="ACTIVE">Aktif</option>
                  <option value="SOLD">Satıldı</option>
                  <option value="INACTIVE">Pasif</option>
                </select>
              ) : (
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
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
              )}
            </div>
          </div>
        </div>

        {/* Auctions */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Açık Artırmalar</h2>
          {auctions.length === 0 ? (
            <p className="text-gray-600">Bu araç için aktif açık artırma bulunmamaktadır.</p>
          ) : (
            <div className="space-y-4">
              {auctions.map((auction) => (
                <Link
                  key={auction.id}
                  to={`/auctions/${auction.id}`}
                  className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="font-semibold">{auction.title}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Güncel Fiyat: ₺{Number(auction.currentPrice).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">
                    Teklif: {auction.totalBids}
                  </div>
                  <span
                    className={`inline-block mt-2 px-2 py-1 rounded text-xs ${
                      auction.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {auction.status}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

