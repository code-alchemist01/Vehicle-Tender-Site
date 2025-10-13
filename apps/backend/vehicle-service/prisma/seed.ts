import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Vehicle veritabanı seed işlemi başlıyor...');

  // Kategoriler
  const categories = [
    {
      name: 'Otomobil',
      description: 'Binek araçlar ve otomobiller',
      isActive: true,
    },
    {
      name: 'Motosiklet',
      description: 'Motosikletler ve scooterlar',
      isActive: true,
    },
    {
      name: 'Ticari Araç',
      description: 'Kamyonet, kamyon ve ticari araçlar',
      isActive: true,
    },
    {
      name: 'SUV',
      description: 'Sport Utility Vehicle araçlar',
      isActive: true,
    },
    {
      name: 'Klasik Araç',
      description: 'Klasik ve koleksiyon araçları',
      isActive: true,
    },
  ];

  // Kategorileri oluştur
  const createdCategories = [];
  for (const categoryData of categories) {
    const category = await prisma.category.upsert({
      where: { name: categoryData.name },
      update: {},
      create: categoryData,
    });
    createdCategories.push(category);
    console.log(`✅ Kategori oluşturuldu: ${category.name}`);
  }

  // Test araçları
  const vehicles = [
    {
      make: 'BMW',
      model: '3 Serisi 320i',
      year: 2020,
      mileage: 45000,
      fuelType: 'GASOLINE' as const,
      transmission: 'AUTOMATIC' as const,
      engineSize: 2.0,
      color: 'Beyaz',
      condition: 'EXCELLENT' as const,
      status: 'ACTIVE' as const,
      description: 'Temiz, bakımlı BMW 3 Serisi. Tek elden, hasarsız.',
      categoryId: createdCategories.find(c => c.name === 'Otomobil')!.id,
      userId: 'user-1', // Bu gerçek user ID'si olacak
      images: [
        'https://example.com/bmw-1.jpg',
        'https://example.com/bmw-2.jpg',
      ],
      estimatedValue: 450000,
      location: 'İstanbul',
    },
    {
      make: 'Mercedes',
      model: 'C200',
      year: 2019,
      mileage: 52000,
      fuelType: 'GASOLINE' as const,
      transmission: 'AUTOMATIC' as const,
      engineSize: 1.5,
      color: 'Siyah',
      condition: 'GOOD' as const,
      status: 'ACTIVE' as const,
      description: 'Mercedes C200 AMG Line. Garaj çıkışlı, bakımlı.',
      categoryId: createdCategories.find(c => c.name === 'Otomobil')!.id,
      userId: 'user-2',
      images: [
        'https://example.com/mercedes-1.jpg',
        'https://example.com/mercedes-2.jpg',
      ],
      estimatedValue: 520000,
      location: 'Ankara',
    },
    {
      make: 'Yamaha',
      model: 'MT-07',
      year: 2021,
      mileage: 8500,
      fuelType: 'GASOLINE' as const,
      transmission: 'MANUAL' as const,
      engineSize: 0.689,
      color: 'Mavi',
      condition: 'EXCELLENT' as const,
      status: 'ACTIVE' as const,
      description: 'Yamaha MT-07 naked bike. Az kullanılmış, temiz.',
      categoryId: createdCategories.find(c => c.name === 'Motosiklet')!.id,
      userId: 'user-3',
      images: [
        'https://example.com/yamaha-1.jpg',
        'https://example.com/yamaha-2.jpg',
      ],
      estimatedValue: 85000,
      location: 'İzmir',
    },
    {
      make: 'Ford',
      model: 'Transit',
      year: 2018,
      mileage: 120000,
      fuelType: 'DIESEL' as const,
      transmission: 'MANUAL' as const,
      engineSize: 2.2,
      color: 'Beyaz',
      condition: 'GOOD' as const,
      status: 'ACTIVE' as const,
      description: 'Ford Transit ticari araç. İş için ideal.',
      categoryId: createdCategories.find(c => c.name === 'Ticari Araç')!.id,
      userId: 'user-4',
      images: [
        'https://example.com/ford-1.jpg',
      ],
      estimatedValue: 280000,
      location: 'Bursa',
    },
    {
      make: 'Toyota',
      model: 'RAV4',
      year: 2022,
      mileage: 25000,
      fuelType: 'HYBRID' as const,
      transmission: 'AUTOMATIC' as const,
      engineSize: 2.5,
      color: 'Gri',
      condition: 'EXCELLENT' as const,
      status: 'ACTIVE' as const,
      description: 'Toyota RAV4 Hybrid. Ekonomik ve güvenilir SUV.',
      categoryId: createdCategories.find(c => c.name === 'SUV')!.id,
      userId: 'user-5',
      images: [
        'https://example.com/toyota-1.jpg',
        'https://example.com/toyota-2.jpg',
        'https://example.com/toyota-3.jpg',
      ],
      estimatedValue: 680000,
      location: 'Antalya',
    },
  ];

  // Araçları oluştur
  const createdVehicles = [];
  for (const vehicleData of vehicles) {
    const vehicle = await prisma.vehicle.create({
      data: vehicleData,
    });
    createdVehicles.push(vehicle);
    console.log(`✅ Araç oluşturuldu: ${vehicle.make} ${vehicle.model}`);
  }

  // Test müzayedeleri
  const auctions = [
    {
      title: `${createdVehicles[0].make} ${createdVehicles[0].model} Müzayedesi`,
      description: 'BMW 3 Serisi için müzayede. Temiz araç, tek elden.',
      startPrice: 400000,
      reservePrice: 420000,
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 gün sonra
      endTime: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), // 8 gün sonra
      status: 'DRAFT' as const,
      vehicleId: createdVehicles[0].id,
      userId: createdVehicles[0].userId,
    },
    {
      title: `${createdVehicles[1].make} ${createdVehicles[1].model} Müzayedesi`,
      description: 'Mercedes C200 için müzayede. AMG Line, garaj çıkışlı.',
      startPrice: 480000,
      reservePrice: 500000,
      startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 gün sonra
      endTime: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000), // 9 gün sonra
      status: 'DRAFT' as const,
      vehicleId: createdVehicles[1].id,
      userId: createdVehicles[1].userId,
    },
    {
      title: `${createdVehicles[2].make} ${createdVehicles[2].model} Müzayedesi`,
      description: 'Yamaha MT-07 motosiklet müzayedesi. Az kullanılmış.',
      startPrice: 75000,
      reservePrice: 80000,
      startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 gün önce başladı
      endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 gün sonra biter
      status: 'ACTIVE' as const,
      currentBid: 78000,
      vehicleId: createdVehicles[2].id,
      userId: createdVehicles[2].userId,
    },
  ];

  // Müzayedeleri oluştur
  const createdAuctions = [];
  for (const auctionData of auctions) {
    const auction = await prisma.auction.create({
      data: auctionData,
    });
    createdAuctions.push(auction);
    console.log(`✅ Müzayede oluşturuldu: ${auction.title}`);
  }

  // Test teklifleri (sadece aktif müzayede için)
  const activeAuction = createdAuctions.find(a => a.status === 'ACTIVE');
  if (activeAuction) {
    const bids = [
      {
        amount: 76000,
        auctionId: activeAuction.id,
        userId: 'user-1',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 gün önce
      },
      {
        amount: 77000,
        auctionId: activeAuction.id,
        userId: 'user-2',
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 saat önce
      },
      {
        amount: 78000,
        auctionId: activeAuction.id,
        userId: 'user-4',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 saat önce
      },
    ];

    for (const bidData of bids) {
      const bid = await prisma.bid.create({
        data: bidData,
      });
      console.log(`✅ Teklif oluşturuldu: ${bid.amount} TL`);
    }
  }

  console.log('🎉 Vehicle veritabanı seed işlemi tamamlandı!');
  console.log(`📊 Oluşturulan veriler:`);
  console.log(`   - ${createdCategories.length} kategori`);
  console.log(`   - ${createdVehicles.length} araç`);
  console.log(`   - ${createdAuctions.length} müzayede`);
  console.log(`   - 3 teklif (aktif müzayede için)`);
}

main()
  .catch((e) => {
    console.error('❌ Seed işlemi başarısız:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });