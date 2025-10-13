import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Car, Gavel, Shield, Zap } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="container">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Araç İhale Platformu
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Güvenli, hızlı ve şeffaf araç ihalelerine katılın. 
              Gerçek zamanlı teklif verme sistemi ile hayalinizdeki aracı bulun.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/register">
                <Button size="lg" className="px-8">
                  Hemen Başla
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/auctions">
                <Button variant="outline" size="lg" className="px-8">
                  İhaleleri Görüntüle
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 sm:py-32">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Neden Bizi Seçmelisiniz?
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Modern teknoloji ile güçlendirilmiş platform özellikleri
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-5xl">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Gerçek Zamanlı</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Anlık teklif güncellemeleri ve canlı ihale takibi
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Güvenli</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Gelişmiş güvenlik önlemleri ve doğrulanmış kullanıcılar
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Car className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Geniş Araç Yelpazesi</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Binlerce araç seçeneği ve detaylı araç bilgileri
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Gavel className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Şeffaf İhaleler</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Açık artırma süreci ve tüm tekliflerin görünürlüğü
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-16 sm:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Hemen Başlayın
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-blue-100">
              Ücretsiz hesap oluşturun ve ilk ihaleye katılmaya başlayın.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/register">
                <Button size="lg" variant="secondary" className="px-8">
                  Ücretsiz Kayıt Ol
                </Button>
              </Link>
              <Link href="/login" className="text-sm font-semibold leading-6 text-white">
                Zaten hesabınız var mı? Giriş yapın <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}