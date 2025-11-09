import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { bidApi, type Bid, type AutoBid } from '@/lib/api/bid'
import { auctionApi, type Auction } from '@/lib/api/auction'
import { format } from 'date-fns'
import { Link } from 'react-router-dom'

export default function MyBids() {
  const { user, isAuthenticated } = useAuthStore()
  const [bids, setBids] = useState<Bid[]>([])
  const [autoBids, setAutoBids] = useState<AutoBid[]>([])
  const [auctions, setAuctions] = useState<Record<string, Auction>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'bids' | 'auto'>('bids')

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setError('Giriş yapmanız gerekiyor')
      setLoading(false)
      return
    }

    const fetchData = async () => {
      try {
        setLoading(true)
        const [bidsData, autoBidsData] = await Promise.all([
          bidApi.getUserBids(user.id),
          bidApi.getUserAutoBids(user.id),
        ])

        setBids(bidsData)
        setAutoBids(autoBidsData)

        // Fetch auction details for all bids
        const auctionIds = [
          ...new Set([
            ...bidsData.map((b) => b.auctionId),
            ...autoBidsData.map((ab) => ab.auctionId),
          ]),
        ]

        const auctionPromises = auctionIds.map(async (id) => {
          try {
            const auction = await auctionApi.getById(id)
            return [id, auction] as [string, Auction]
          } catch {
            return null
          }
        })

        const auctionResults = await Promise.all(auctionPromises)
        const auctionMap: Record<string, Auction> = {}
        auctionResults.forEach((result) => {
          if (result) {
            auctionMap[result[0]] = result[1]
          }
        })
        setAuctions(auctionMap)
      } catch (err: any) {
        setError(err.response?.data?.message || 'Teklifler yüklenemedi')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, isAuthenticated])

  const handleCancelBid = async (bidId: string) => {
    if (!user || !confirm('Bu teklifi iptal etmek istediğinize emin misiniz?')) {
      return
    }

    try {
      await bidApi.cancel(bidId, user.id)
      setBids(bids.filter((b) => b.id !== bidId))
      alert('Teklif başarıyla iptal edildi')
    } catch (err: any) {
      alert(err.response?.data?.message || 'Teklif iptal edilemedi')
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
      <h1 className="text-3xl font-bold mb-6">Tekliflerim</h1>

      {/* Tabs */}
      <div className="border-b mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('bids')}
            className={`pb-2 px-4 font-medium ${
              activeTab === 'bids'
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Tekliflerim ({bids.length})
          </button>
          <button
            onClick={() => setActiveTab('auto')}
            className={`pb-2 px-4 font-medium ${
              activeTab === 'auto'
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Otomatik Teklifler ({autoBids.length})
          </button>
        </div>
      </div>

      {/* Bids Tab */}
      {activeTab === 'bids' && (
        <div>
          {bids.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-gray-600 mb-4">Henüz teklif vermediniz.</p>
              <Link to="/auctions" className="btn btn-primary">
                Açık Artırmalara Git
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bids.map((bid) => {
                const auction = auctions[bid.auctionId]
                return (
                  <div key={bid.id} className="card">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        {auction ? (
                          <Link
                            to={`/auctions/${auction.id}`}
                            className="text-xl font-semibold text-primary-600 hover:text-primary-700"
                          >
                            {auction.title}
                          </Link>
                        ) : (
                          <div className="text-xl font-semibold">
                            Açık Artırma #{bid.auctionId}
                          </div>
                        )}
                        <div className="mt-2 space-y-1">
                          <div className="text-2xl font-bold text-primary-600">
                            ₺{Number(bid.amount).toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-600">
                            Verilme: {format(new Date(bid.placedAt), 'dd MMM yyyy HH:mm')}
                          </div>
                          {bid.processedAt && (
                            <div className="text-sm text-gray-600">
                              İşlenme: {format(new Date(bid.processedAt), 'dd MMM yyyy HH:mm')}
                            </div>
                          )}
                          {bid.failureReason && (
                            <div className="text-sm text-red-600">
                              Hata: {bid.failureReason}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            bid.status === 'ACCEPTED'
                              ? 'bg-green-100 text-green-800'
                              : bid.status === 'PENDING' || bid.status === 'PROCESSING'
                              ? 'bg-yellow-100 text-yellow-800'
                              : bid.status === 'REJECTED' || bid.status === 'OUTBID'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {bid.status}
                        </span>
                        {(bid.status === 'PENDING' || bid.status === 'PROCESSING') && (
                          <button
                            onClick={() => handleCancelBid(bid.id)}
                            className="btn btn-secondary text-sm"
                          >
                            İptal Et
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Auto Bids Tab */}
      {activeTab === 'auto' && (
        <div>
          {autoBids.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-gray-600 mb-4">Henüz otomatik teklif oluşturmadınız.</p>
              <Link to="/auctions" className="btn btn-primary">
                Açık Artırmalara Git
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {autoBids.map((autoBid) => {
                const auction = auctions[autoBid.auctionId]
                return (
                  <div key={autoBid.id} className="card">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        {auction ? (
                          <Link
                            to={`/auctions/${auction.id}`}
                            className="text-xl font-semibold text-primary-600 hover:text-primary-700"
                          >
                            {auction.title}
                          </Link>
                        ) : (
                          <div className="text-xl font-semibold">
                            Açık Artırma #{autoBid.auctionId}
                          </div>
                        )}
                        <div className="mt-2 space-y-1">
                          <div className="text-lg font-semibold">
                            Maksimum: ₺{Number(autoBid.maxAmount).toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-600">
                            Artış: ₺{Number(autoBid.increment).toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-600">
                            Oluşturulma: {format(new Date(autoBid.createdAt), 'dd MMM yyyy HH:mm')}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            autoBid.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {autoBid.isActive ? 'Aktif' : 'Pasif'}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

