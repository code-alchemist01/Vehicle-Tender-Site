import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { auctionApi, type Auction } from '@/lib/api/auction'


export default function Auctions() {
  const [auctions, setAuctions] = useState<Auction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        setLoading(true)
        const response = await auctionApi.getAll()
        setAuctions(response.data || [])
      } catch (err: any) {
        setError(err.response?.data?.message || 'Açık artırmalar yüklenemedi')
      } finally {
        setLoading(false)
      }
    }

    fetchAuctions()
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
      <h1 className="text-3xl font-bold mb-6">Açık Artırmalar</h1>

      {auctions.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-600">Henüz açık artırma bulunmamaktadır.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {auctions.map((auction) => (
            <Link
              key={auction.id}
              to={`/auctions/${auction.id}`}
              className="card hover:shadow-lg transition-shadow block"
            >
              <h3 className="text-xl font-semibold mb-2">{auction.title}</h3>
              {auction.description && (
                <p className="text-gray-600 text-sm mb-2">{auction.description}</p>
              )}
              <div className="space-y-2 mb-4">
                <p className="text-gray-600">
                  Başlangıç: ₺{Number(auction.startingPrice).toLocaleString()}
                </p>
                <p className="text-2xl font-bold text-primary-600">
                  Güncel: ₺{Number(auction.currentPrice).toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">
                  Bitiş: {new Date(auction.endTime).toLocaleDateString('tr-TR')}
                </p>
                <p className="text-sm text-gray-500">
                  Teklif: {auction.totalBids}
                </p>
              </div>
              <div className="flex justify-between items-center">
                <span className={`px-3 py-1 rounded-full text-sm ${
                  auction.status === 'ACTIVE' 
                    ? 'bg-green-100 text-green-800' 
                    : auction.status === 'SCHEDULED'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {auction.status}
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

