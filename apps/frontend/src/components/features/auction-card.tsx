'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Clock, Eye, Gavel, MapPin } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AuctionCardProps {
  auction: {
    id: string;
    title: string;
    brand: string;
    model: string;
    year: number;
    mileage: number;
    location: string;
    currentBid: number;
    startingBid: number;
    endTime: string;
    imageUrl: string;
    images: string[];
    viewCount: number;
    bidCount: number;
    status: 'active' | 'ending_soon' | 'ended';
    condition: 'excellent' | 'good' | 'fair' | 'poor';
    fuelType: 'gasoline' | 'diesel' | 'hybrid' | 'electric';
    transmission: 'manual' | 'automatic';
  };
  className?: string;
}

export function AuctionCard({ auction, className }: AuctionCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatMileage = (mileage: number) => {
    return new Intl.NumberFormat('tr-TR').format(mileage) + ' km';
  };

  const getTimeRemaining = (endTime: string) => {
    const end = new Date(endTime);
    const now = new Date();
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return 'Sona erdi';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}g ${hours}s`;
    if (hours > 0) return `${hours}s ${minutes}d`;
    return `${minutes}d`;
  };

  const getStatusBadge = () => {
    switch (auction.status) {
      case 'ending_soon':
        return <Badge variant="destructive">Bitiyor</Badge>;
      case 'ended':
        return <Badge variant="secondary">Bitti</Badge>;
      default:
        return <Badge variant="default">Aktif</Badge>;
    }
  };

  const getConditionColor = () => {
    switch (auction.condition) {
      case 'excellent':
        return 'text-green-600';
      case 'good':
        return 'text-blue-600';
      case 'fair':
        return 'text-yellow-600';
      case 'poor':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getConditionText = () => {
    switch (auction.condition) {
      case 'excellent':
        return 'Mükemmel';
      case 'good':
        return 'İyi';
      case 'fair':
        return 'Orta';
      case 'poor':
        return 'Kötü';
      default:
        return 'Belirtilmemiş';
    }
  };

  return (
    <Card className={cn("group hover:shadow-lg transition-all duration-300", className)}>
      <div className="relative">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-t-lg">
          <Image
            src={auction.images[currentImageIndex] || auction.imageUrl}
            alt={auction.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Image Navigation Dots */}
          {auction.images.length > 1 && (
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
              {auction.images.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentImageIndex(index);
                  }}
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors",
                    index === currentImageIndex ? "bg-white" : "bg-white/50"
                  )}
                />
              ))}
            </div>
          )}

          {/* Status Badge */}
          <div className="absolute top-2 left-2">
            {getStatusBadge()}
          </div>

          {/* Wishlist Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-white/80 hover:bg-white"
            onClick={(e) => {
              e.preventDefault();
              setIsWishlisted(!isWishlisted);
            }}
          >
            <Heart 
              className={cn(
                "h-4 w-4",
                isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"
              )} 
            />
          </Button>

          {/* View and Bid Count */}
          <div className="absolute bottom-2 right-2 flex space-x-2">
            <div className="bg-black/50 text-white px-2 py-1 rounded text-xs flex items-center space-x-1">
              <Eye className="h-3 w-3" />
              <span>{auction.viewCount}</span>
            </div>
            <div className="bg-black/50 text-white px-2 py-1 rounded text-xs flex items-center space-x-1">
              <Gavel className="h-3 w-3" />
              <span>{auction.bidCount}</span>
            </div>
          </div>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="space-y-2">
          {/* Title */}
          <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
            {auction.title}
          </h3>

          {/* Vehicle Info */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{auction.year} • {formatMileage(auction.mileage)}</span>
            <span className={getConditionColor()}>{getConditionText()}</span>
          </div>

          {/* Location */}
          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span>{auction.location}</span>
          </div>

          {/* Price Info */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Güncel Teklif</span>
              <span className="font-bold text-lg text-primary">
                {formatPrice(auction.currentBid)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Başlangıç</span>
              <span className="text-muted-foreground">
                {formatPrice(auction.startingBid)}
              </span>
            </div>
          </div>

          {/* Time Remaining */}
          <div className="flex items-center space-x-1 text-sm">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className={cn(
              "font-medium",
              auction.status === 'ending_soon' ? "text-red-600" : "text-muted-foreground"
            )}>
              {getTimeRemaining(auction.endTime)}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <div className="w-full space-y-2">
          <Button asChild className="w-full">
            <Link href={`/auctions/${auction.id}`}>
              Detayları Gör
            </Link>
          </Button>
          
          {auction.status === 'active' && (
            <Button variant="outline" className="w-full">
              Teklif Ver
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}