import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Auth veritabanı seed işlemi başlıyor...');

  // Şifreleri hash'le
  const hashedPassword = await bcrypt.hash('123456', 10);

  // Test kullanıcıları
  const users = [
    {
      email: 'admin@test.com',
      firstName: 'Admin',
      lastName: 'User',
      phone: '+90 555 123 4567',
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true,
      isEmailVerified: true,
    },
    {
      email: 'john@test.com',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+90 555 234 5678',
      password: hashedPassword,
      role: 'USER',
      isActive: true,
      isEmailVerified: true,
    },
    {
      email: 'jane@test.com',
      firstName: 'Jane',
      lastName: 'Smith',
      phone: '+90 555 345 6789',
      password: hashedPassword,
      role: 'USER',
      isActive: true,
      isEmailVerified: true,
    },
    {
      email: 'moderator@test.com',
      firstName: 'Moderator',
      lastName: 'User',
      phone: '+90 555 456 7890',
      password: hashedPassword,
      role: 'MODERATOR',
      isActive: true,
      isEmailVerified: true,
    },
    {
      email: 'seller@test.com',
      firstName: 'Seller',
      lastName: 'User',
      phone: '+90 555 567 8901',
      password: hashedPassword,
      role: 'USER',
      isActive: true,
      isEmailVerified: true,
    },
  ];

  // Kullanıcıları oluştur
  for (const userData of users) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: userData,
    });
    console.log(`✅ Kullanıcı oluşturuldu: ${user.email} (${user.role})`);

    // Her kullanıcı için login geçmişi ekle
    await prisma.loginHistory.create({
      data: {
        userId: user.id,
        ipAddress: '127.0.0.1',
        userAgent: 'Test Browser',
        success: true,
        action: 'REGISTER',
      },
    });
  }

  console.log('🎉 Auth veritabanı seed işlemi tamamlandı!');
  console.log('📧 Test kullanıcıları:');
  console.log('   - admin@test.com (ADMIN) - Şifre: 123456');
  console.log('   - john@test.com (USER) - Şifre: 123456');
  console.log('   - jane@test.com (USER) - Şifre: 123456');
  console.log('   - moderator@test.com (MODERATOR) - Şifre: 123456');
  console.log('   - seller@test.com (USER) - Şifre: 123456');
}

main()
  .catch((e) => {
    console.error('❌ Seed işlemi başarısız:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });