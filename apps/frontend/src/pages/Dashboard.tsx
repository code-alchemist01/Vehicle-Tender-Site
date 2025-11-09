import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const { user, fetchProfile } = useAuthStore()

  useEffect(() => {
    if (!user) {
      fetchProfile()
    }
  }, [user, fetchProfile])

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Hoş Geldiniz</h2>
          <p className="text-gray-600 mb-4">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="text-sm text-gray-500">{user?.email}</p>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Hızlı İşlemler</h2>
          <div className="space-y-2">
            <Link
              to="/dashboard/vehicles/create"
              className="block text-primary-600 hover:text-primary-700"
            >
              → Araç Ekle
            </Link>
            <Link
              to="/dashboard/auctions/create"
              className="block text-primary-600 hover:text-primary-700"
            >
              → Açık Artırma Başlat
            </Link>
            <Link
              to="/dashboard/vehicles/my"
              className="block text-primary-600 hover:text-primary-700"
            >
              → Araçlarım
            </Link>
            <Link
              to="/auctions"
              className="block text-primary-600 hover:text-primary-700"
            >
              → Açık Artırmaları Görüntüle
            </Link>
            <Link
              to="/vehicles"
              className="block text-primary-600 hover:text-primary-700"
            >
              → Araçları Keşfet
            </Link>
            <Link
              to="/dashboard/profile"
              className="block text-primary-600 hover:text-primary-700"
            >
              → Profil Ayarları
            </Link>
            {user?.role === 'ADMIN' && (
              <Link
                to="/dashboard/categories"
                className="block text-primary-600 hover:text-primary-700"
              >
                → Kategori Yönetimi
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">İstatistikler</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <div className="text-2xl font-bold text-primary-600">0</div>
            <div className="text-gray-600">Aktif Tekliflerim</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary-600">0</div>
            <div className="text-gray-600">Kazandığım Açık Artırmalar</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary-600">0</div>
            <div className="text-gray-600">Toplam Harcama</div>
          </div>
        </div>
      </div>
    </div>
  )
}

