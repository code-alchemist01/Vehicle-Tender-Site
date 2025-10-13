'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Car, 
  Search, 
  Filter, 
  Clock, 
  Heart,
  Eye,
  Gavel,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  ArrowUpDown
} from 'lucide-react'

// Mock data - gerçek API'den gelecek
const mockAuctions = [
  {
    id: 1,
    title: '2020 BMW 3 Series 320i',
    brand: 'BMW',
    model: '3 Series',
    year: 2020,
    mileage: 45000,
    location: 'İstanbul',
    currentBid: 450000,
    startingBid: 400000,
    bidCount: 12,
    endTime: '2024-01-15T18:00:00Z',
    images: ['/api/placeholder/400/300'],
    status: 'active',
    isWatching: false,
    condition: 'excellent',
    fuelType: 'benzin',
    transmission: 'otomatik'
  },
  {
    id: 2,
    title: '2019 Mercedes C-Class C200',
    brand: 'Mercedes',
    model: 'C-Class',
    year: 2019,
    mileage: 38000,
    location: 'Ankara',
    currentBid: 380000,
    startingBid: 350000,
    bidCount: 8,
    endTime: '2024-01-16T20:00:00Z',
    images: ['/api/placeholder/400/300'],
    status: 'active',
    isWatching: true,
    condition: 'very-good',
    fuelType: 'benzin',
    transmission: 'otomatik'
  },
  {
    id: 3,
    title: '2021 Audi A4 2.0 TFSI',
    brand: 'Audi',
    model: 'A4',
    year: 2021,
    mileage: 25000,
    location: 'İzmir',
    currentBid: 520000,
    startingBid: 480000,
    bidCount: 15,
    endTime: '2024-01-14T16:00:00Z',
    images: ['/api/placeholder/400/300'],
    status: 'ending-soon',
    isWatching: false,
    condition: 'excellent',
    fuelType: 'benzin',
    transmission: 'otomatik'
  },
  {
    id: 4,
    title: '2018 Toyota Camry Hybrid',
    brand: 'Toyota',
    model: 'Camry',
    year: 2018,
    mileage: 65000,
    location: 'Bursa',
    currentBid: 280000,
    startingBid: 250000,
    bidCount: 6,
    endTime: '2024-01-17T19:00:00Z',
    images: ['/api/placeholder/400/300'],
    status: 'active',
    isWatching: false,
    condition: 'good',
    fuelType: 'hibrit',
    transmission: 'otomatik'
  },
  {
    id: 5,
    title: '2020 Volkswagen Golf GTI',
    brand: 'Volkswagen',
    model: 'Golf',
    year: 2020,
    mileage: 32000,
    location: 'Antalya',
    currentBid: 420000,
    startingBid: 380000,
    bidCount: 18,
    endTime: '2024-01-18T15:00:00Z',
    images: ['/api/placeholder/400/300'],
    status: 'hot',
    isWatching: true,
    condition: 'excellent',
    fuelType: 'benzin',
    transmission: 'manuel'
  },
  {
    id: 6,
    title: '2017 Honda Civic 1.6 i-DTEC',
    brand: 'Honda',
    model: 'Civic',
    year: 2017,
    mileage: 78000,
    location: 'Adana',
    currentBid: 220000,
    startingBid: 200000,
    bidCount: 4,
    endTime: '2024-01-19T14:00:00Z',
    images: ['/api/placeholder/400/300'],
    status: 'active',
    isWatching: false,
    condition: 'good',
    fuelType: 'dizel',
    transmission: 'manuel'
  }
]

export default function AuctionsPage() {
  const [auctions, setAuctions] = useState(mockAuctions)
  const [filteredAuctions, setFilteredAuctions] = useState(mockAuctions)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBrand, setSelectedBrand] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [sortBy, setSortBy] = useState('ending-soon')
  const [timeLeft, setTimeLeft] = useState<{[key: number]: string}>({})

  // Zaman sayacı
  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft: {[key: number]: string} = {}
      auctions.forEach(auction => {
        if (auction.status === 'active' || auction.status === 'ending-soon' || auction.status === 'hot') {
          const now = new Date().getTime()
          const end = new Date(auction.endTime).getTime()
          const difference = end - now
          
          if (difference > 0) {
            const days = Math.floor(difference / (1000 * 60 * 60 * 24))
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
            
            if (days > 0) {
              newTimeLeft[auction.id] = `${days}g ${hours}s`
            } else if (hours > 0) {
              newTimeLeft[auction.id] = `${hours}s ${minutes}d`
            } else {
              newTimeLeft[auction.id] = `${minutes}d`
            }
          } else {
            newTimeLeft[auction.id] = 'Sona erdi'
          }
        }
      })
      setTimeLeft(newTimeLeft)
    }, 1000)

    return () => clearInterval(timer)
  }, [auctions])

  // Filtreleme ve arama
  useEffect(() => {
    let filtered = auctions

    // Arama
    if (searchTerm) {
      filtered = filtered.filter(auction =>
        auction.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        auction.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        auction.model.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Marka filtresi
    if (selectedBrand !== 'all') {
      filtered = filtered.filter(auction => auction.brand === selectedBrand)
    }

    // Durum filtresi
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(auction => auction.status === selectedStatus)
    }

    // Sıralama
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'ending-soon':
          return new Date(a.endTime).getTime() - new Date(b.endTime).getTime()
        case 'highest-bid':
          return b.currentBid - a.currentBid
        case 'lowest-bid':
          return a.currentBid - b.currentBid
        case 'most-bids':
          return b.bidCount - a.bidCount
        case 'newest':
          return b.year - a.year
        default:
          return 0
      }
    })

    setFilteredAuctions(filtered)
  }, [searchTerm, selectedBrand, selectedStatus, sortBy, auctions])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ending-soon':
        return <Badge variant="destructive">Yakında Bitiyor</Badge>
      case 'hot':
        return <Badge className="bg-orange-500">Popüler</Badge>
      case 'active':
        return <Badge variant="default">Aktif</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getConditionText = (condition: string) => {
    switch (condition) {
      case 'excellent': return 'Mükemmel'
      case 'very-good': return 'Çok İyi'
      case 'good': return 'İyi'
      case 'fair': return 'Orta'
      default: return condition
    }
  }

  const toggleWatchlist = (auctionId: number) => {
    setAuctions(prev => prev.map(auction => 
      auction.id === auctionId 
        ? { ...auction, isWatching: !auction.isWatching }
        : auction
    ))
  }

  const uniqueBrands = [...new Set(auctions.map(auction => auction.brand))]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <Car className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold">Araç İhale</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Button asChild variant="outline">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <Button asChild>
                <Link href="/vehicles/create">Araç Ekle</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Başlık ve İstatistikler */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Aktif İhaleler</h1>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Gavel className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Toplam İhale</p>
                    <p className="text-2xl font-bold">{auctions.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-sm text-gray-600">Yakında Bitiyor</p>
                    <p className="text-2xl font-bold">
                      {auctions.filter(a => a.status === 'ending-soon').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Toplam Teklif</p>
                    <p className="text-2xl font-bold">
                      {auctions.reduce((sum, a) => sum + a.bidCount, 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Ortalama Teklif</p>
                    <p className="text-lg font-bold">
                      {formatCurrency(auctions.reduce((sum, a) => sum + a.currentBid, 0) / auctions.length)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Filtreler */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filtreler ve Arama</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Arama */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Araç ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Marka */}
              <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                <SelectTrigger>
                  <SelectValue placeholder="Marka seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Markalar</SelectItem>
                  {uniqueBrands.map(brand => (
                    <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Durum */}
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Durum seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Durumlar</SelectItem>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="ending-soon">Yakında Bitiyor</SelectItem>
                  <SelectItem value="hot">Popüler</SelectItem>
                </SelectContent>
              </Select>

              {/* Sıralama */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sırala" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ending-soon">Bitiş Zamanı</SelectItem>
                  <SelectItem value="highest-bid">En Yüksek Teklif</SelectItem>
                  <SelectItem value="lowest-bid">En Düşük Teklif</SelectItem>
                  <SelectItem value="most-bids">En Çok Teklif</SelectItem>
                  <SelectItem value="newest">En Yeni Model</SelectItem>
                </SelectContent>
              </Select>

              {/* Sonuç sayısı */}
              <div className="flex items-center text-sm text-gray-600">
                <span>{filteredAuctions.length} sonuç bulundu</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* İhale Listesi */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAuctions.map((auction) => (
            <Card key={auction.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                  <Car className="h-16 w-16 text-gray-400" />
                </div>
                <div className="absolute top-2 left-2">
                  {getStatusBadge(auction.status)}
                </div>
                <div className="absolute top-2 right-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleWatchlist(auction.id)}
                    className="bg-white/80 hover:bg-white"
                  >
                    <Heart 
                      className={`h-4 w-4 ${auction.isWatching ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
                    />
                  </Button>
                </div>
              </div>

              <CardContent className="p-4">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg line-clamp-1">{auction.title}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                      <span>{auction.year}</span>
                      <span>•</span>
                      <span>{auction.mileage.toLocaleString()} km</span>
                      <span>•</span>
                      <span className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {auction.location}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">Güncel Teklif</p>
                      <p className="text-xl font-bold text-green-600">
                        {formatCurrency(auction.currentBid)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">{auction.bidCount} teklif</p>
                      <p className="text-sm font-medium">
                        Durum: {getConditionText(auction.condition)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-orange-600">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{timeLeft[auction.id] || 'Hesaplanıyor...'}</span>
                    </div>
                    <div className="text-gray-600">
                      {auction.fuelType} • {auction.transmission}
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <Button asChild className="flex-1">
                      <Link href={`/auctions/${auction.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        Detay
                      </Link>
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Gavel className="h-4 w-4 mr-2" />
                      Teklif Ver
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Sonuç bulunamadı */}
        {filteredAuctions.length === 0 && (
          <div className="text-center py-12">
            <Car className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aradığınız kriterlere uygun ihale bulunamadı
            </h3>
            <p className="text-gray-600 mb-4">
              Farklı filtreler deneyebilir veya arama teriminizi değiştirebilirsiniz.
            </p>
            <Button onClick={() => {
              setSearchTerm('')
              setSelectedBrand('all')
              setSelectedStatus('all')
            }}>
              Filtreleri Temizle
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}