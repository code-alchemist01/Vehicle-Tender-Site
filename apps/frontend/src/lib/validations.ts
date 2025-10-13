import { z } from 'zod';

// Auth validations
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email gereklidir')
    .email('Geçerli bir email adresi giriniz'),
  password: z
    .string()
    .min(1, 'Şifre gereklidir')
    .min(6, 'Şifre en az 6 karakter olmalıdır'),
});

export const registerSchema = z.object({
  firstName: z
    .string()
    .min(1, 'Ad gereklidir')
    .min(2, 'Ad en az 2 karakter olmalıdır')
    .max(50, 'Ad en fazla 50 karakter olabilir'),
  lastName: z
    .string()
    .min(1, 'Soyad gereklidir')
    .min(2, 'Soyad en az 2 karakter olmalıdır')
    .max(50, 'Soyad en fazla 50 karakter olabilir'),
  email: z
    .string()
    .min(1, 'Email gereklidir')
    .email('Geçerli bir email adresi giriniz'),
  phone: z
    .string()
    .min(1, 'Telefon numarası gereklidir')
    .regex(/^(\+90|0)?[5][0-9]{9}$/, 'Geçerli bir telefon numarası giriniz'),
  password: z
    .string()
    .min(1, 'Şifre gereklidir')
    .min(8, 'Şifre en az 8 karakter olmalıdır')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Şifre en az bir küçük harf, bir büyük harf ve bir rakam içermelidir'),
  confirmPassword: z
    .string()
    .min(1, 'Şifre tekrarı gereklidir'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Şifreler eşleşmiyor',
  path: ['confirmPassword'],
});

export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'Mevcut şifre gereklidir'),
  newPassword: z
    .string()
    .min(1, 'Yeni şifre gereklidir')
    .min(8, 'Şifre en az 8 karakter olmalıdır')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Şifre en az bir küçük harf, bir büyük harf ve bir rakam içermelidir'),
  confirmNewPassword: z
    .string()
    .min(1, 'Yeni şifre tekrarı gereklidir'),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: 'Yeni şifreler eşleşmiyor',
  path: ['confirmNewPassword'],
});

// Profile validations
export const profileSchema = z.object({
  firstName: z
    .string()
    .min(1, 'Ad gereklidir')
    .min(2, 'Ad en az 2 karakter olmalıdır')
    .max(50, 'Ad en fazla 50 karakter olabilir'),
  lastName: z
    .string()
    .min(1, 'Soyad gereklidir')
    .min(2, 'Soyad en az 2 karakter olmalıdır')
    .max(50, 'Soyad en fazla 50 karakter olabilir'),
  phone: z
    .string()
    .min(1, 'Telefon numarası gereklidir')
    .regex(/^(\+90|0)?[5][0-9]{9}$/, 'Geçerli bir telefon numarası giriniz'),
  avatar: z
    .string()
    .url('Geçerli bir URL giriniz')
    .optional()
    .or(z.literal('')),
});

// Auction validations
export const auctionSchema = z.object({
  title: z
    .string()
    .min(1, 'Başlık gereklidir')
    .min(10, 'Başlık en az 10 karakter olmalıdır')
    .max(100, 'Başlık en fazla 100 karakter olabilir'),
  description: z
    .string()
    .min(1, 'Açıklama gereklidir')
    .min(50, 'Açıklama en az 50 karakter olmalıdır')
    .max(2000, 'Açıklama en fazla 2000 karakter olabilir'),
  brand: z
    .string()
    .min(1, 'Marka gereklidir'),
  model: z
    .string()
    .min(1, 'Model gereklidir'),
  year: z
    .number()
    .min(1900, 'Geçerli bir yıl giriniz')
    .max(new Date().getFullYear() + 1, 'Gelecek yıldan fazla olamaz'),
  mileage: z
    .number()
    .min(0, 'Kilometre 0\'dan küçük olamaz')
    .max(1000000, 'Kilometre çok yüksek'),
  fuelType: z
    .string()
    .min(1, 'Yakıt türü gereklidir'),
  transmission: z
    .string()
    .min(1, 'Vites türü gereklidir'),
  condition: z
    .string()
    .min(1, 'Durum gereklidir'),
  location: z
    .string()
    .min(1, 'Konum gereklidir'),
  startingBid: z
    .number()
    .min(1, 'Başlangıç teklifi en az 1 TL olmalıdır')
    .max(10000000, 'Başlangıç teklifi çok yüksek'),
  reservePrice: z
    .number()
    .min(0, 'Reserve fiyat 0\'dan küçük olamaz')
    .max(10000000, 'Reserve fiyat çok yüksek')
    .optional(),
  endTime: z
    .string()
    .min(1, 'Bitiş tarihi gereklidir')
    .refine((date) => new Date(date) > new Date(), {
      message: 'Bitiş tarihi gelecekte olmalıdır',
    }),
  images: z
    .array(z.string().url('Geçerli bir resim URL\'si giriniz'))
    .min(1, 'En az bir resim gereklidir')
    .max(10, 'En fazla 10 resim yükleyebilirsiniz'),
}).refine((data) => {
  if (data.reservePrice && data.reservePrice <= data.startingBid) {
    return false;
  }
  return true;
}, {
  message: 'Reserve fiyat başlangıç teklifinden yüksek olmalıdır',
  path: ['reservePrice'],
});

// Bid validation
export const bidSchema = z.object({
  amount: z
    .number()
    .min(1, 'Teklif miktarı en az 1 TL olmalıdır')
    .max(10000000, 'Teklif miktarı çok yüksek'),
});

// Search and filter validations
export const searchFiltersSchema = z.object({
  search: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  yearFrom: z
    .number()
    .min(1900, 'Geçerli bir yıl giriniz')
    .max(new Date().getFullYear() + 1, 'Gelecek yıldan fazla olamaz')
    .optional(),
  yearTo: z
    .number()
    .min(1900, 'Geçerli bir yıl giriniz')
    .max(new Date().getFullYear() + 1, 'Gelecek yıldan fazla olamaz')
    .optional(),
  priceFrom: z
    .number()
    .min(0, 'Fiyat 0\'dan küçük olamaz')
    .optional(),
  priceTo: z
    .number()
    .min(0, 'Fiyat 0\'dan küçük olamaz')
    .optional(),
  mileageFrom: z
    .number()
    .min(0, 'Kilometre 0\'dan küçük olamaz')
    .optional(),
  mileageTo: z
    .number()
    .min(0, 'Kilometre 0\'dan küçük olamaz')
    .optional(),
  fuelType: z.array(z.string()).optional(),
  transmission: z.array(z.string()).optional(),
  condition: z.array(z.string()).optional(),
  location: z.string().optional(),
  status: z.string().optional(),
  sortBy: z.string().optional(),
}).refine((data) => {
  if (data.yearFrom && data.yearTo && data.yearFrom > data.yearTo) {
    return false;
  }
  return true;
}, {
  message: 'Başlangıç yılı bitiş yılından büyük olamaz',
  path: ['yearFrom'],
}).refine((data) => {
  if (data.priceFrom && data.priceTo && data.priceFrom > data.priceTo) {
    return false;
  }
  return true;
}, {
  message: 'Minimum fiyat maksimum fiyattan büyük olamaz',
  path: ['priceFrom'],
}).refine((data) => {
  if (data.mileageFrom && data.mileageTo && data.mileageFrom > data.mileageTo) {
    return false;
  }
  return true;
}, {
  message: 'Minimum kilometre maksimum kilometreden büyük olamaz',
  path: ['mileageFrom'],
});

// Contact form validation
export const contactSchema = z.object({
  name: z
    .string()
    .min(1, 'Ad gereklidir')
    .min(2, 'Ad en az 2 karakter olmalıdır')
    .max(100, 'Ad en fazla 100 karakter olabilir'),
  email: z
    .string()
    .min(1, 'Email gereklidir')
    .email('Geçerli bir email adresi giriniz'),
  subject: z
    .string()
    .min(1, 'Konu gereklidir')
    .min(5, 'Konu en az 5 karakter olmalıdır')
    .max(200, 'Konu en fazla 200 karakter olabilir'),
  message: z
    .string()
    .min(1, 'Mesaj gereklidir')
    .min(20, 'Mesaj en az 20 karakter olmalıdır')
    .max(1000, 'Mesaj en fazla 1000 karakter olabilir'),
});

// Newsletter subscription validation
export const newsletterSchema = z.object({
  email: z
    .string()
    .min(1, 'Email gereklidir')
    .email('Geçerli bir email adresi giriniz'),
});

// File upload validation
export const imageUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, 'Dosya boyutu 5MB\'dan küçük olmalıdır')
    .refine(
      (file) => ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type),
      'Sadece JPEG, PNG ve WebP formatları desteklenir'
    ),
});

export const multipleImageUploadSchema = z.object({
  files: z
    .array(
      z
        .instanceof(File)
        .refine((file) => file.size <= 5 * 1024 * 1024, 'Her dosya 5MB\'dan küçük olmalıdır')
        .refine(
          (file) => ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type),
          'Sadece JPEG, PNG ve WebP formatları desteklenir'
        )
    )
    .min(1, 'En az bir resim seçiniz')
    .max(10, 'En fazla 10 resim yükleyebilirsiniz'),
});

// Type exports
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
export type AuctionFormData = z.infer<typeof auctionSchema>;
export type BidFormData = z.infer<typeof bidSchema>;
export type SearchFiltersData = z.infer<typeof searchFiltersSchema>;
export type ContactFormData = z.infer<typeof contactSchema>;
export type NewsletterFormData = z.infer<typeof newsletterSchema>;
export type ImageUploadData = z.infer<typeof imageUploadSchema>;
export type MultipleImageUploadData = z.infer<typeof multipleImageUploadSchema>;