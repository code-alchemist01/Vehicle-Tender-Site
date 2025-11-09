import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white rounded-lg p-12 mb-8">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-bold mb-4">
            Araç Müzayede Platformu
          </h1>
          <p className="text-xl mb-8 text-primary-100">
            En iyi fiyatlarla araç alın ve satın. Güvenli, hızlı ve kolay.
          </p>
          <div className="flex space-x-4">
            <Link to="/auctions" className="btn bg-white text-primary-600 hover:bg-gray-100">
              Açık Artırmaları Gör
            </Link>
            <Link to="/vehicles" className="btn bg-primary-500 text-white hover:bg-primary-400">
              Araçları Keşfet
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <h3 className="text-xl font-semibold mb-2">Güvenli Ödeme</h3>
          <p className="text-gray-600">
            Stripe entegrasyonu ile güvenli ödeme işlemleri
          </p>
        </div>
        <div className="card">
          <h3 className="text-xl font-semibold mb-2">Gerçek Zamanlı Teklif</h3>
          <p className="text-gray-600">
            Canlı açık artırmalar ve anlık teklif sistemi
          </p>
        </div>
        <div className="card">
          <h3 className="text-xl font-semibold mb-2">Otomatik Teklif</h3>
          <p className="text-gray-600">
            Maksimum fiyat belirleyip otomatik teklif verin
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="card">
        <h2 className="text-2xl font-bold mb-6">Platform İstatistikleri</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <div>
            <div className="text-3xl font-bold text-primary-600">100+</div>
            <div className="text-gray-600">Aktif Açık Artırma</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary-600">500+</div>
            <div className="text-gray-600">Kayıtlı Araç</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary-600">1000+</div>
            <div className="text-gray-600">Kullanıcı</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary-600">50K+</div>
            <div className="text-gray-600">Toplam Teklif</div>
          </div>
        </div>
      </section>
    </div>
  )
}

