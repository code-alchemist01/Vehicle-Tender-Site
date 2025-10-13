'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  Car, 
  Clock, 
  Eye, 
  Heart,
  MapPin,
  Fuel,
  Calendar,
  Gauge
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function AuctionsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('ending-soon');
  const [filterBy, setFilterBy] = useState('all');

  // Mock data - gerçek uygulamada API'den gelecek
  const auctions = [
    {
      id: 1,
      title: '2020 BMW 3 Series 320i',
      brand: 'BMW',
      model: '3 Series',
      year: 2020,
      mileage: 45000,
      fuelType: 'Benzin',
      transmission: 'Otomatik',
      location: 'İstanbul',
      currentBid: 285000,
      startingBid: 250000,
      bidCount: 12,
      timeLeft: '2 saat 15 dakika',
      endTime: new Date(Date.now() + 2 * 60 * 60 * 1000 + 15 * 60 * 1000),
      image: '/placeholder-car.jpg',
      status: 'active',
      isWatched: false,
      seller: {
        name: 'AutoDealer Pro',
        rating: 4.8,
        verified: true,
      },
    },
    {
      id: 2,
      title: '2019 Mercedes-Benz C-Class C200',
      brand: 'Mercedes-Benz',
      model: 'C-Class',
      year: 2019,
      mileage: 52000,
      fuelType: 'Benzin',
      transmission: 'Otomatik',
      location: 'Ankara',
      currentBid: 320000,
      startingBid: 280000,
      bidCount: 8,
      timeLeft: '1 gün 5 saat',
      endTime: new Date(Date.now() + 29 * 60 * 60 * 1000),
      image: '/placeholder-car.jpg',
      status: 'active',
      isWatched: true,
      seller: {
        name: 'Premium Motors',
        rating: 4.9,
        verified: true,
      },
    },
    {
      id: 3,
      title: '2021 Audi A4 2.0 TFSI',
      brand: 'Audi',
      model: 'A4',
      year: 2021,
      mileage: 28000,
      fuelType: 'Benzin',
      transmission: 'Otomatik',
      location: 'İzmir',
      currentBid: 380000,
      startingBid: 350000,
      bidCount: 15,
      timeLeft: '3 gün 12 saat',
      endTime: new Date(Date.now() + 84 * 60 * 60 * 1000),
      image: '/placeholder-car.jpg',
      status: 'active',
      isWatched: false,
      seller: {
        name: 'Elite Auto',
        rating: 4.7,
        verified: true,
      },
    },
    {
      id: 4,
      title: '2022 Tesla Model 3 Long Range',
      brand: 'Tesla',
      model: 'Model 3',
      year: 2022,
      mileage: 15000,
      fuelType: 'Elektrik',
      transmission: 'Otomatik',
      location: 'İstanbul',
      currentBid: 450000,
      startingBid: 420000,
      bidCount: 22,
      timeLeft: '5 gün 8 saat',
      endTime: new Date(Date.now() + 128 * 60 * 60 * 1000),
      image: '/placeholder-car.jpg',
      status: 'active',
      isWatched: true,
      seller: {
        name: 'EV Specialists',
        rating: 4.9,
        verified: true,
      },
    },
    {
      id: 5,
      title: '2020 Volkswagen Golf 1.5 TSI',
      brand: 'Volkswagen',
      model: 'Golf',
      year: 2020,
      mileage: 38000,
      fuelType: 'Benzin',
      transmission: 'Manuel',
      location: 'Bursa',
      currentBid: 185000,
      startingBid: 160000,
      bidCount: 6,
      timeLeft: '1 hafta 2 gün',
      endTime: new Date(Date.now() + 218 * 60 * 60 * 1000),
      image: '/placeholder-car.jpg',
      status: 'active',
      isWatched: false,
      seller: {
        name: 'City Motors',
        rating: 4.6,
        verified: true,
      },
    },
  ];

  const formatTimeLeft = (timeLeft: string) => {
    if (timeLeft.includes('saat') && !timeLeft.includes('gün')) {
      return 'text-red-600';
    } else if (timeLeft.includes('dakika')) {
      return 'text-red-600 font-semibold';
    }
    return 'text-muted-foreground';
  };

  const filteredAuctions = auctions.filter(auction => {
    const matchesSearch = auction.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         auction.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         auction.model.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterBy === 'all') return matchesSearch;
    if (filterBy === 'watched') return matchesSearch && auction.isWatched;
    if (filterBy === 'ending-soon') {
      const hoursLeft = (auction.endTime.getTime() - Date.now()) / (1000 * 60 * 60);
      return matchesSearch && hoursLeft <= 24;
    }
    
    return matchesSearch;
  });

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Aktif İhaleler</h1>
            <p className="text-muted-foreground mt-2">
              {filteredAuctions.length} ihale bulundu
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Marka, model veya anahtar kelime ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={filterBy} onValueChange={setFilterBy}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filtrele" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm İhaleler</SelectItem>
                <SelectItem value="watched">İzlediğim</SelectItem>
                <SelectItem value="ending-soon">Yakında Bitenler</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sırala" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ending-soon">Yakında Bitenler</SelectItem>
                <SelectItem value="newest">En Yeni</SelectItem>
                <SelectItem value="price-low">Fiyat (Düşük)</SelectItem>
                <SelectItem value="price-high">Fiyat (Yüksek)</SelectItem>
                <SelectItem value="most-bids">En Çok Teklif</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Auctions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAuctions.map((auction) => (
          <Card key={auction.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative">
              <div className="aspect-video bg-gray-200 flex items-center justify-center">
                <Car className="h-12 w-12 text-gray-400" />
              </div>
              <div className="absolute top-2 right-2 flex gap-2">
                <Badge variant="secondary" className="bg-white/90">
                  {auction.bidCount} teklif
                </Badge>
                {auction.isWatched && (
                  <Badge variant="default" className="bg-red-500">
                    <Heart className="h-3 w-3 mr-1 fill-current" />
                  </Badge>
                )}
              </div>
              <div className="absolute bottom-2 left-2">
                <Badge 
                  variant="default" 
                  className={`${formatTimeLeft(auction.timeLeft)} bg-white text-black`}
                >
                  <Clock className="h-3 w-3 mr-1" />
                  {auction.timeLeft}
                </Badge>
              </div>
            </div>

            <CardHeader className="pb-3">
              <CardTitle className="text-lg line-clamp-1">
                {auction.title}
              </CardTitle>
              <CardDescription className="flex items-center text-sm">
                <MapPin className="h-3 w-3 mr-1" />
                {auction.location}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Vehicle Details */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                  {auction.year}
                </div>
                <div className="flex items-center">
                  <Gauge className="h-3 w-3 mr-1 text-muted-foreground" />
                  {auction.mileage.toLocaleString()} km
                </div>
                <div className="flex items-center">
                  <Fuel className="h-3 w-3 mr-1 text-muted-foreground" />
                  {auction.fuelType}
                </div>
                <div className="text-muted-foreground">
                  {auction.transmission}
                </div>
              </div>

              {/* Price Info */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Güncel Teklif</span>
                  <span className="text-lg font-bold text-green-600">
                    ₺{auction.currentBid.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Başlangıç</span>
                  <span>₺{auction.startingBid.toLocaleString()}</span>
                </div>
              </div>

              {/* Seller Info */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs">
                    {auction.seller.name.charAt(0)}
                  </div>
                  <span className="ml-2 text-muted-foreground">{auction.seller.name}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-yellow-500">★</span>
                  <span className="ml-1">{auction.seller.rating}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button asChild className="flex-1">
                  <Link href={`/auctions/${auction.id}`}>
                    <Eye className="h-4 w-4 mr-2" />
                    Detaylar
                  </Link>
                </Button>
                <Button variant="outline" size="icon">
                  <Heart className={`h-4 w-4 ${auction.isWatched ? 'fill-current text-red-500' : ''}`} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredAuctions.length === 0 && (
        <div className="text-center py-12">
          <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">İhale bulunamadı</h3>
          <p className="text-muted-foreground mb-4">
            Arama kriterlerinize uygun ihale bulunmuyor.
          </p>
          <Button onClick={() => {
            setSearchTerm('');
            setFilterBy('all');
          }}>
            Filtreleri Temizle
          </Button>
        </div>
      )}

      {/* Load More */}
      {filteredAuctions.length > 0 && (
        <div className="text-center">
          <Button variant="outline" size="lg">
            Daha Fazla Yükle
          </Button>
        </div>
      )}
    </div>
  );
}