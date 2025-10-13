'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Car, 
  Gavel, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Trophy,
  Eye,
  Heart
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    redirect('/login');
  }

  // Mock data - gerçek uygulamada API'den gelecek
  const stats = {
    activeAuctions: 12,
    myBids: 5,
    wonAuctions: 2,
    totalSpent: 45000,
  };

  const recentAuctions = [
    {
      id: 1,
      title: '2020 BMW 3 Series',
      currentBid: 25000,
      timeLeft: '2 saat 15 dakika',
      image: '/placeholder-car.jpg',
      status: 'active',
      myBid: 24000,
    },
    {
      id: 2,
      title: '2019 Mercedes C-Class',
      currentBid: 32000,
      timeLeft: '1 gün 5 saat',
      image: '/placeholder-car.jpg',
      status: 'active',
      myBid: null,
    },
    {
      id: 3,
      title: '2021 Audi A4',
      currentBid: 28000,
      timeLeft: 'Bitti',
      image: '/placeholder-car.jpg',
      status: 'ended',
      myBid: 27500,
      won: false,
    },
  ];

  const watchlist = [
    {
      id: 4,
      title: '2022 Tesla Model 3',
      currentBid: 35000,
      timeLeft: '3 gün 12 saat',
      image: '/placeholder-car.jpg',
    },
    {
      id: 5,
      title: '2020 Volkswagen Golf',
      currentBid: 18000,
      timeLeft: '5 gün 8 saat',
      image: '/placeholder-car.jpg',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Hoş geldiniz, {session?.user?.name || 'Kullanıcı'}!
          </h1>
          <p className="text-muted-foreground mt-2">
            İhale durumunuzu ve aktivitelerinizi buradan takip edebilirsiniz.
          </p>
        </div>
        <Button asChild>
          <Link href="/auctions">
            <Gavel className="mr-2 h-4 w-4" />
            İhaleleri Görüntüle
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif İhaleler</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeAuctions}</div>
            <p className="text-xs text-muted-foreground">
              +2 geçen haftaya göre
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tekliflerim</CardTitle>
            <Gavel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.myBids}</div>
            <p className="text-xs text-muted-foreground">
              3 aktif teklif
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kazanılan İhaleler</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.wonAuctions}</div>
            <p className="text-xs text-muted-foreground">
              Bu ay
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Harcama</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₺{stats.totalSpent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +12% geçen aya göre
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Auctions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              Son İhaleler
            </CardTitle>
            <CardDescription>
              Katıldığınız ve takip ettiğiniz ihaleler
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentAuctions.map((auction) => (
              <div key={auction.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Car className="h-8 w-8 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{auction.title}</h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-sm text-muted-foreground">
                      Güncel: ₺{auction.currentBid.toLocaleString()}
                    </span>
                    {auction.myBid && (
                      <Badge variant="outline" className="text-xs">
                        Teklifim: ₺{auction.myBid.toLocaleString()}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">
                      {auction.timeLeft}
                    </span>
                    <Badge 
                      variant={auction.status === 'active' ? 'default' : 'secondary'}
                    >
                      {auction.status === 'active' ? 'Aktif' : 'Bitti'}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full" asChild>
              <Link href="/my-bids">Tüm Tekliflerimi Görüntüle</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Watchlist */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Heart className="mr-2 h-5 w-5" />
              İzleme Listesi
            </CardTitle>
            <CardDescription>
              Takip ettiğiniz araçlar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {watchlist.map((item) => (
              <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Car className="h-8 w-8 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{item.title}</h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-sm text-muted-foreground">
                      ₺{item.currentBid.toLocaleString()}
                    </span>
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {item.timeLeft}
                  </span>
                </div>
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/auctions/${item.id}`}>
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ))}
            <Button variant="outline" className="w-full" asChild>
              <Link href="/watchlist">Tüm İzleme Listesi</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Hızlı İşlemler</CardTitle>
          <CardDescription>
            Sık kullanılan işlemlere hızlı erişim
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button asChild className="h-20 flex-col">
              <Link href="/auctions">
                <Gavel className="h-6 w-6 mb-2" />
                İhaleleri Görüntüle
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col">
              <Link href="/profile">
                <Car className="h-6 w-6 mb-2" />
                Profilimi Düzenle
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col">
              <Link href="/help">
                <Clock className="h-6 w-6 mb-2" />
                Yardım & Destek
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}