import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { auctionApi, type Auction } from '@/lib/api/auction'
import { bidApi, type Bid } from '@/lib/api/bid'
import { format } from 'date-fns'

export default function AuctionDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuthStore()
  
  const [auction, setAuction] = useState<Auction | null>(null)
  const [bids, setBids] = useState<Bid[]>([])
  const [highestBid, setHighestBid] = useState<Bid | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  const [bidAmount, setBidAmount] = useState('')
  const [bidError, setBidError] = useState('')
  const [bidLoading, setBidLoading] = useState(false)
  
  const [autoBidMax, setAutoBidMax] = useState('')
  const [autoBidIncrement, setAutoBidIncrement] = useState('')
  const [autoBidError, setAutoBidError] = useState('')
  const [autoBidLoading, setAutoBidLoading] = useState(false)
  
  const [isInWatchlist, setIsInWatchlist] = useState(false)
  const [watchlistLoading, setWatchlistLoading] = useState(false)

  useEffect(() => {
    if (!id) return
    
    const fetchData = async () => {
      try {
        setLoading(true)
        const [auctionData, bidsData, highestBidData] = await Promise.all([
          auctionApi.getById(id),
          auctionApi.getBids(id),
          auctionApi.getHighestBid(id).catch(() => null),
        ])
        
        setAuction(auctionData)
        setBids(bidsData)
        setHighestBid(highestBidData)
      } catch (err: any) {
        setError(err.response?.data?.message || 'Açık artırma yüklenemedi')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    
    // Refresh every 5 seconds for active auctions
    const interval = setInterval(() => {
      if (auction?.status === 'ACTIVE') {
        fetchData()
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [id, auction?.status])

  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthenticated || !user || !auction) return

    setBidError('')
    setBidLoading(true)

    try {
      const amount = parseFloat(bidAmount)
      if (isNaN(amount) || amount <= 0) {
        setBidError('Geçerli bir miktar girin')
        return
      }

      await bidApi.create({
        auctionId: auction.id,
        bidderId: user.id,
        amount,
      })

      // Refresh data
      const [bidsData, highestBidData] = await Promise.all([
        auctionApi.getBids(auction.id),
        auctionApi.getHighestBid(auction.id).catch(() => null),
      ])
      setBids(bidsData)
      setHighestBid(highestBidData)
      setBidAmount('')
    } catch (err: any) {
      setBidError(
        err.response?.data?.message || 'Teklif verilemedi. Lütfen tekrar deneyin.'
      )
    } finally {
      setBidLoading(false)
    }
  }

  const handleCreateAutoBid = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthenticated || !user || !auction) return

    setAutoBidError('')
    setAutoBidLoading(true)

    try {
      const maxAmount = parseFloat(autoBidMax)
      const increment = parseFloat(autoBidIncrement)
      
      if (isNaN(maxAmount) || maxAmount <= 0) {
        setAutoBidError('Geçerli bir maksimum miktar girin')
        return
      }
      
      if (isNaN(increment) || increment <= 0) {
        setAutoBidError('Geçerli bir artış miktarı girin')
        return
      }

      await bidApi.createAutoBid({
        auctionId: auction.id,
        bidderId: user.id,
        maxAmount,
        increment,
      })

      setAutoBidMax('')
      setAutoBidIncrement('')
      alert('Otomatik teklif başarıyla oluşturuldu!')
    } catch (err: any) {
      setAutoBidError(
        err.response?.data?.message || 'Otomatik teklif oluşturulamadı. Lütfen tekrar deneyin.'
      )
    } finally {
      setAutoBidLoading(false)
    }
  }

  const isOwner = user && auction?.sellerId === user.id
  const isAdmin = user?.role === 'ADMIN'

  const handleDelete = async () => {
    if (!id || !confirm('Bu açık artırmayı silmek istediğinize emin misiniz?')) {
      return
    }

    try {
      await auctionApi.delete(id)
      navigate('/auctions')
    } catch (err: any) {
      alert(err.response?.data?.message || 'Açık artırma silinemedi')
    }
  }

  const handleWatchlistToggle = async () => {
    if (!id || !user || !isAuthenticated) return

    setWatchlistLoading(true)
    try {
      if (isInWatchlist) {
        await auctionApi.removeFromWatchlist(id, user.id)
        setIsInWatchlist(false)
      } else {
        await auctionApi.addToWatchlist(id, user.id)
        setIsInWatchlist(true)
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Watchlist işlemi başarısız')
    } finally {
      setWatchlistLoading(false)
    }
  }

  // Check watchlist status when auction loads
  useEffect(() => {
    if (auction && user && isAuthenticated) {
      // Note: Backend doesn't have a direct endpoint to check watchlist status
      // This is a simplified check - in production, you'd want a proper endpoint
      setIsInWatchlist(false) // Default to false, will be updated when user interacts
    }
  }, [auction, user, isAuthenticated])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg">Yükleniyor...</div>
      </div>
    )
  }

  if (error || !auction) {
    return (
      <div className="card">
        <div className="text-red-600">{error || 'Açık artırma bulunamadı'}</div>
        <button onClick={() => navigate('/auctions')} className="btn btn-secondary mt-4">
          Açık Artırmalara Dön
        </button>
      </div>
    )
  }

  const minBid = Number(auction.currentPrice) + Number(auction.minBidIncrement)
  const isActive = auction.status === 'ACTIVE'
  const timeRemaining = new Date(auction.endTime).getTime() - Date.now()

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <button
            onClick={() => navigate('/auctions')}
            className="text-primary-600 hover:text-primary-700"
          >
            ← Açık Artırmalara Dön
          </button>
          <div className="flex gap-2">
            {isAuthenticated && !isOwner && (
              <button
                onClick={handleWatchlistToggle}
                disabled={watchlistLoading}
                className={`btn btn-secondary text-sm ${
                  isInWatchlist ? 'bg-green-100 text-green-800' : ''
                }`}
              >
                {watchlistLoading
                  ? '...'
                  : isInWatchlist
                  ? '✓ İzleme Listesinde'
                  : '+ İzleme Listesine Ekle'}
              </button>
            )}
            {(isOwner || isAdmin) && (
              <>
                {(auction.status === 'DRAFT' || auction.status === 'SCHEDULED') && (
                  <Link
                    to={`/dashboard/auctions/edit/${id}`}
                    className="btn btn-secondary text-sm"
                  >
                    Düzenle
                  </Link>
                )}
                <button onClick={handleDelete} className="btn btn-danger text-sm">
                  Sil
                </button>
              </>
            )}
          </div>
        </div>
        <h1 className="text-3xl font-bold">{auction.title}</h1>
        {auction.description && (
          <p className="text-gray-600 mt-2">{auction.description}</p>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Auction Info */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Açık Artırma Bilgileri</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">Başlangıç Fiyatı</div>
                <div className="text-2xl font-bold text-primary-600">
                  ₺{Number(auction.startingPrice).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Güncel Fiyat</div>
                <div className="text-2xl font-bold text-green-600">
                  ₺{Number(auction.currentPrice).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Minimum Artış</div>
                <div className="text-lg font-semibold">
                  ₺{Number(auction.minBidIncrement).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Toplam Teklif</div>
                <div className="text-lg font-semibold">{auction.totalBids}</div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-gray-600">Durum</div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      isActive
                        ? 'bg-green-100 text-green-800'
                        : auction.status === 'SCHEDULED'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {auction.status}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Bitiş Zamanı</div>
                  <div className="font-semibold">
                    {format(new Date(auction.endTime), 'dd MMM yyyy HH:mm')}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bid Form */}
          {isActive && isAuthenticated && (
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Teklif Ver</h2>
              {bidError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                  {bidError}
                </div>
              )}
              <form onSubmit={handlePlaceBid} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teklif Miktarı (Min: ₺{minBid.toLocaleString()})
                  </label>
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    min={minBid}
                    step={Number(auction.minBidIncrement)}
                    required
                    className="input"
                    placeholder={`₺${minBid.toLocaleString()}`}
                  />
                </div>
                <button
                  type="submit"
                  disabled={bidLoading}
                  className="btn btn-primary w-full"
                >
                  {bidLoading ? 'Teklif veriliyor...' : 'Teklif Ver'}
                </button>
              </form>
            </div>
          )}

          {/* Auto Bid Form */}
          {isActive && isAuthenticated && (
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Otomatik Teklif</h2>
              {autoBidError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                  {autoBidError}
                </div>
              )}
              <form onSubmit={handleCreateAutoBid} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maksimum Teklif Miktarı
                  </label>
                  <input
                    type="number"
                    value={autoBidMax}
                    onChange={(e) => setAutoBidMax(e.target.value)}
                    min={minBid}
                    required
                    className="input"
                    placeholder="₺0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Artış Miktarı
                  </label>
                  <input
                    type="number"
                    value={autoBidIncrement}
                    onChange={(e) => setAutoBidIncrement(e.target.value)}
                    min={Number(auction.minBidIncrement)}
                    required
                    className="input"
                    placeholder={`₺${Number(auction.minBidIncrement).toLocaleString()}`}
                  />
                </div>
                <button
                  type="submit"
                  disabled={autoBidLoading}
                  className="btn btn-secondary w-full"
                >
                  {autoBidLoading ? 'Oluşturuluyor...' : 'Otomatik Teklif Oluştur'}
                </button>
              </form>
            </div>
          )}

          {/* Bids History */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Teklif Geçmişi</h2>
            {bids.length === 0 ? (
              <p className="text-gray-600">Henüz teklif verilmemiş.</p>
            ) : (
              <div className="space-y-2">
                {bids.map((bid) => (
                  <div
                    key={bid.id}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <div className="font-semibold">
                        ₺{Number(bid.amount).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">
                        {format(new Date(bid.placedAt), 'dd MMM yyyy HH:mm')}
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        bid.status === 'ACCEPTED'
                          ? 'bg-green-100 text-green-800'
                          : bid.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {bid.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Highest Bid */}
          {highestBid && (
            <div className="card">
              <h3 className="font-semibold mb-2">En Yüksek Teklif</h3>
              <div className="text-2xl font-bold text-primary-600">
                ₺{Number(highestBid.amount).toLocaleString()}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="card">
            <h3 className="font-semibold mb-4">İstatistikler</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Toplam Teklif:</span>
                <span className="font-semibold">{auction.totalBids}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Görüntülenme:</span>
                <span className="font-semibold">{auction.viewCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Takipçi:</span>
                <span className="font-semibold">{auction.watchlistCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

