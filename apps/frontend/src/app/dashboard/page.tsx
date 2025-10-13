'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Car, 
  Gavel, 
  TrendingUp, 
  Clock, 
  Plus, 
  Eye, 
  Heart,
  DollarSign,
  Users,
  Calendar,
  Bell,
  Settings,
  LogOut
} from 'lucide-react'

// Mock data - gerçek API'den gelecek
const mockStats = {
  totalVehicles: 12,
  activeAuctions: 5,
  wonAuctions: 3,
  totalBids: 47,
  watchlist: 8,
  totalSpent: 125000
}

const mockRecentAuctions = [
  {
    id: 1,
    title: '2020 BMW 3 Series',
    image: '/api/placeholder/300/200',
    currentBid: 45000,
    endTime: '2024-01-15T18:00:00Z',
    status: 'active',
    isWatching: true
  },
  {
    id: 2,
    title: '2019 Mercedes C-Class',
    image: '/api/placeholder/300/200',
    currentBid: 38000,
    endTime: '2024-01-16T20:00:00Z',
    status: 'active',
    isWatching: false
  },
  {
    id: 3,
    title: '2021 Audi A4',
    image: '/api/placeholder/300/200',
    currentBid: 52000,
    endTime: '2024-01-14T16:00:00Z',
    status: 'ended',
    isWatching: true,
    won: true
  }
]

const mockMyVehicles = [
  {
    id: 1,
    title: '2018 Toyota Camry',
    image: '/api/placeholder/300/200',
    status: 'active',
    currentBid: 28000,
    bidsCount: 12,
    endTime: '2024-01-17T19:00:00Z'
  },
  {
    id: 2,
    title: '2019 Honda Civic',
    image: '/api/placeholder/300/200',
    status: 'pending',
    startingBid: 22000,
    scheduledStart: '2024-01-20T10:00:00Z'
  }
]

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [timeLeft, setTimeLeft] = useState<{[key: number]: string}>({})

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft: {[key: number]: string} = {}
      mockRecentAuctions.forEach(auction => {
        if (auction.status === 'active') {
          const now = new Date().getTime()
          const end = new Date(auction.endTime).getTime()
          const difference = end - now
          
          if (difference > 0) {
            const hours = Math.floor(difference / (1000 * 60 * 60))
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
            newTimeLeft[auction.id] = `${hours}s ${minutes}d`
          } else {
            newTimeLeft[auction.id] = 'Sona erdi'
          }
        }
      })
      setTimeLeft(newTimeLeft)
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount)
  }

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
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
              <Avatar>
                <AvatarImage src={session.user?.image || ''} />
                <AvatarFallback>
                  {session.user?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Hoş geldiniz, {session.user?.name || 'Kullanıcı'}!
          </h1>
          <p className="text-gray-600 mt-2">
            Dashboard'unuzdan tüm aktivitelerinizi takip edebilirsiniz.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Araçlarım</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.totalVehicles}</div>
              <p className="text-xs text-muted-foreground">
                +2 bu ay
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aktif İhaleler</CardTitle>
              <Gavel className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.activeAuctions}</div>
              <p className="text-xs text-muted-foreground">
                3 tanesi bugün bitiyor
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Kazanılan İhaleler</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.wonAuctions}</div>
              <p className="text-xs text-muted-foreground">
                %75 başarı oranı
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">İzleme Listesi</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.watchlist}</div>
              <p className="text-xs text-muted-foreground">
                2 tanesi yakında bitiyor
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Hızlı İşlemler</CardTitle>
              <CardDescription>
                Sık kullanılan işlemlere hızlı erişim
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full justify-start">
                <Link href="/vehicles/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Yeni Araç Ekle
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/auctions">
                  <Eye className="mr-2 h-4 w-4" />
                  İhaleleri Görüntüle
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/profile">
                  <Settings className="mr-2 h-4 w-4" />
                  Profil Ayarları
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Son Aktiviteler</CardTitle>
              <CardDescription>
                Son 7 gündeki aktiviteleriniz
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="bg-green-100 p-2 rounded-full">
                    <Gavel className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">2021 Audi A4 ihalesi kazanıldı</p>
                    <p className="text-xs text-gray-500">2 saat önce</p>
                  </div>
                  <Badge variant="secondary">Kazanıldı</Badge>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Plus className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">2018 Toyota Camry eklendi</p>
                    <p className="text-xs text-gray-500">1 gün önce</p>
                  </div>
                  <Badge variant="outline">Yeni</Badge>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="bg-orange-100 p-2 rounded-full">
                    <DollarSign className="h-4 w-4 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">BMW 3 Series'e teklif verildi</p>
                    <p className="text-xs text-gray-500">2 gün önce</p>
                  </div>
                  <Badge variant="outline">Teklif</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Auctions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Takip Ettiğim İhaleler</CardTitle>
              <CardDescription>
                İzleme listenizdeki aktif ihaleler
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockRecentAuctions.filter(auction => auction.isWatching).map((auction) => (
                  <div key={auction.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                    <div className="w-16 h-12 bg-gray-200 rounded flex items-center justify-center">
                      <Car className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{auction.title}</h4>
                      <p className="text-sm text-gray-600">
                        Güncel: {formatCurrency(auction.currentBid)}
                      </p>
                      {auction.status === 'active' && (
                        <p className="text-xs text-orange-600 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {timeLeft[auction.id] || 'Hesaplanıyor...'}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      {auction.won && (
                        <Badge className="bg-green-100 text-green-800">Kazanıldı</Badge>
                      )}
                      {auction.status === 'active' && (
                        <Button size="sm" variant="outline">
                          Teklif Ver
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Araçlarım</CardTitle>
              <CardDescription>
                İhaleye çıkardığınız araçlar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockMyVehicles.map((vehicle) => (
                  <div key={vehicle.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                    <div className="w-16 h-12 bg-gray-200 rounded flex items-center justify-center">
                      <Car className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{vehicle.title}</h4>
                      {vehicle.status === 'active' ? (
                        <>
                          <p className="text-sm text-gray-600">
                            Güncel: {formatCurrency(vehicle.currentBid!)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {vehicle.bidsCount} teklif
                          </p>
                        </>
                      ) : (
                        <p className="text-sm text-gray-600">
                          Başlangıç: {formatCurrency(vehicle.startingBid!)}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant={vehicle.status === 'active' ? 'default' : 'secondary'}
                      >
                        {vehicle.status === 'active' ? 'Aktif' : 'Beklemede'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}