const { PrismaClient } = require('@prisma/client');

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
      fuelType: 'GASOLINE',
      transmission: 'AUTOMATIC',
      engineSize: 2.0,
      color: 'Beyaz',
      condition: 'EXCELLENT',
      status: 'ACTIVE',
      description: 'Temiz, bakımlı BMW 3 Serisi. Tek elden, hasarsız.',
      categoryId: createdCategories.find(c => c.name === 'Otomobil').id,
      userId: 'user-1',
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
      fuelType: 'GASOLINE',
      transmission: 'AUTOMATIC',
      engineSize: 1.5,
      color: 'Siyah',
      condition: 'GOOD',
      status: 'ACTIVE',
      description: 'Mercedes C200 AMG Line. Garaj çıkışlı, bakımlı.',
      categoryId: createdCategories.find(c => c.name === 'Otomobil').id,
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
      fuelType: 'GASOLINE',
      transmission: 'MANUAL',
      engineSize: 0.689,
      color: 'Mavi',
      condition: 'EXCELLENT',
      status: 'ACTIVE',
      description: 'Yamaha MT-07 naked bike. Az kullanılmış, temiz.',
      categoryId: createdCategories.find(c => c.name === 'Motosiklet').id,
      userId: 'user-3',
      images: [
        'https://example.com/yamaha-1.jpg',
        'https://example.com/yamaha-2.jpg',
      ],
      estimatedValue: 85000,
      location: 'İzmir',
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

  console.log('🎉 Vehicle veritabanı seed işlemi tamamlandı!');
  console.log(`📊 Oluşturulan veriler:`);
  console.log(`   - ${createdCategories.length} kategori`);
  console.log(`   - ${createdVehicles.length} araç`);
}

main()
  .catch((e) => {
    console.error('❌ Seed işlemi başarısız:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });