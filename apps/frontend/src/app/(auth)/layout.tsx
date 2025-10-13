import Link from 'next/link';
import { Car } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:px-8 bg-gradient-to-br from-primary to-primary/80">
        <div className="mx-auto max-w-md text-center">
          <Link href="/" className="flex items-center justify-center space-x-2 text-white">
            <Car className="h-8 w-8" />
            <span className="text-2xl font-bold">Vehicle Auction</span>
          </Link>
          <h2 className="mt-8 text-3xl font-bold text-white">
            Araç İhale Platformuna Hoş Geldiniz
          </h2>
          <p className="mt-4 text-lg text-blue-100">
            Güvenli ve şeffaf araç ihalelerine katılın. 
            Gerçek zamanlı teklif verme sistemi ile hayalinizdeki aracı bulun.
          </p>
          <div className="mt-8 space-y-4 text-blue-100">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-2 h-2 bg-blue-200 rounded-full"></div>
              <span>Gerçek zamanlı ihale takibi</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-2 h-2 bg-blue-200 rounded-full"></div>
              <span>Güvenli ödeme sistemi</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-2 h-2 bg-blue-200 rounded-full"></div>
              <span>Doğrulanmış araç bilgileri</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-2 h-2 bg-blue-200 rounded-full"></div>
              <span>7/24 müşteri desteği</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Auth forms */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="flex items-center justify-center space-x-2 text-primary">
              <Car className="h-8 w-8" />
              <span className="text-2xl font-bold">Vehicle Auction</span>
            </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}