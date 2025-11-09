import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { auctionApi, type Auction } from '@/lib/api/auction'
import { format } from 'date-fns'
import { Link } from 'react-router-dom'

export default function Watchlist() {
  const { user, isAuthenticated } = useAuthStore()
  const [auctions, setAuctions] = useState<Auction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setError('Giriş yapmanız gerekiyor')
      setLoading(false)
      return
    }

    const fetchWatchlist = async () => {
      try {
        setLoading(true)
        setError('')
        console.log('[Watchlist] Fetching watchlist for user:', user.id)
        const watchlistAuctions = await auctionApi.getUserWatchlist(user.id)
        console.log('[Watchlist] Received auctions:', watchlistAuctions)
        setAuctions(Array.isArray(watchlistAuctions) ? watchlistAuctions : [])
      } catch (err: any) {
        console.error('[Watchlist] Error fetching watchlist:', err)
        const errorMessage = err.response?.data?.message || err.message || 'Watchlist yüklenemedi'
        setError(errorMessage)
        // If it's a 404 or network error, show a more helpful message
        if (err.response?.status === 404 || err.code === 'ERR_NETWORK') {
          setError('Watchlist endpoint bulunamadı. Lütfen backend servisinin çalıştığından emin olun.')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchWatchlist()
  }, [user, isAuthenticated])

  const handleRemoveFromWatchlist = async (auctionId: string) => {
    if (!user || !confirm('Bu açık artırmayı watchlist\'ten çıkarmak istediğinize emin misiniz?')) {
      return
    }

    try {
      await auctionApi.removeFromWatchlist(auctionId, user.id)
      setAuctions(auctions.filter((a) => a.id !== auctionId))
    } catch (err: any) {
      alert(err.response?.data?.message || 'Watchlist\'ten çıkarılamadı')
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
      <h1 className="text-3xl font-bold mb-6">İzlediğim Açık Artırmalar</h1>

      {auctions.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-600 mb-4">Henüz izlediğiniz açık artırma bulunmamaktadır.</p>
          <Link to="/auctions" className="btn btn-primary">
            Açık Artırmalara Git
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {auctions.map((auction) => (
            <div key={auction.id} className="card">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <Link
                    to={`/auctions/${auction.id}`}
                    className="text-xl font-semibold text-primary-600 hover:text-primary-700"
                  >
                    {auction.title}
                  </Link>
                  {auction.description && (
                    <p className="text-gray-600 mt-2">{auction.description}</p>
                  )}
                  <div className="mt-4 grid md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Mevcut Fiyat</div>
                      <div className="text-2xl font-bold text-primary-600">
                        ₺{Number(auction.currentPrice).toLocaleString('tr-TR')}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Toplam Teklif</div>
                      <div className="text-lg font-semibold">{auction.totalBids}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Başlangıç Zamanı</div>
                      <div className="font-medium">
                        {format(new Date(auction.startTime), 'dd MMM yyyy HH:mm')}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Bitiş Zamanı</div>
                      <div className="font-medium">
                        {format(new Date(auction.endTime), 'dd MMM yyyy HH:mm')}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        auction.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-800'
                          : auction.status === 'SCHEDULED'
                          ? 'bg-blue-100 text-blue-800'
                          : auction.status === 'ENDED'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {auction.status === 'ACTIVE'
                        ? 'Aktif'
                        : auction.status === 'SCHEDULED'
                        ? 'Zamanlanmış'
                        : auction.status === 'ENDED'
                        ? 'Bitti'
                        : auction.status}
                    </span>
                  </div>
                </div>
                <div className="ml-4 flex flex-col gap-2">
                  <Link
                    to={`/auctions/${auction.id}`}
                    className="btn btn-primary text-sm"
                  >
                    Detaylar
                  </Link>
                  <button
                    onClick={() => handleRemoveFromWatchlist(auction.id)}
                    className="btn btn-secondary text-sm"
                  >
                    Listeden Çıkar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

