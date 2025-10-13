'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { 
  Car, 
  Upload, 
  X, 
  Plus,
  Calendar,
  Gauge,
  Fuel,
  Settings,
  MapPin,
  DollarSign,
  Clock,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Camera
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface VehicleFormData {
  // Temel Bilgiler
  brand: string
  model: string
  year: string
  mileage: string
  fuelType: string
  transmission: string
  engineSize: string
  horsePower: string
  
  // Araç Durumu
  condition: string
  accidentHistory: boolean
  serviceHistory: boolean
  
  // Lokasyon
  city: string
  district: string
  
  // İhale Bilgileri
  startingBid: string
  reservePrice: string
  auctionDuration: string
  
  // Açıklama ve Özellikler
  description: string
  features: string[]
  
  // Dökümanlar
  hasTitle: boolean
  hasInspection: boolean
  hasInsurance: boolean
}

const initialFormData: VehicleFormData = {
  brand: '',
  model: '',
  year: '',
  mileage: '',
  fuelType: '',
  transmission: '',
  engineSize: '',
  horsePower: '',
  condition: '',
  accidentHistory: false,
  serviceHistory: false,
  city: '',
  district: '',
  startingBid: '',
  reservePrice: '',
  auctionDuration: '',
  description: '',
  features: [],
  hasTitle: false,
  hasInspection: false,
  hasInsurance: false
}

const carBrands = [
  'Audi', 'BMW', 'Mercedes-Benz', 'Volkswagen', 'Toyota', 'Honda', 'Nissan', 
  'Ford', 'Chevrolet', 'Hyundai', 'Kia', 'Mazda', 'Subaru', 'Volvo', 'Peugeot',
  'Renault', 'Fiat', 'Opel', 'Skoda', 'Seat', 'Citroen', 'Alfa Romeo'
]

const fuelTypes = [
  { value: 'benzin', label: 'Benzin' },
  { value: 'dizel', label: 'Dizel' },
  { value: 'hibrit', label: 'Hibrit' },
  { value: 'elektrik', label: 'Elektrik' },
  { value: 'lpg', label: 'LPG' },
  { value: 'cng', label: 'CNG' }
]

const transmissionTypes = [
  { value: 'manuel', label: 'Manuel' },
  { value: 'otomatik', label: 'Otomatik' },
  { value: 'yarimotomatik', label: 'Yarı Otomatik' },
  { value: 'cvt', label: 'CVT' }
]

const conditionTypes = [
  { value: 'excellent', label: 'Mükemmel' },
  { value: 'very-good', label: 'Çok İyi' },
  { value: 'good', label: 'İyi' },
  { value: 'fair', label: 'Orta' },
  { value: 'poor', label: 'Kötü' }
]

const cities = [
  'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Konya', 
  'Gaziantep', 'Mersin', 'Diyarbakır', 'Kayseri', 'Eskişehir', 'Urfa'
]

const commonFeatures = [
  'Klima', 'ABS', 'ESP', 'Airbag', 'Elektrikli Camlar', 'Merkezi Kilit',
  'Alarm', 'İmmobilizer', 'Navigasyon', 'Bluetooth', 'USB', 'Aux',
  'Cruise Control', 'Park Sensörü', 'Geri Görüş Kamerası', 'Xenon Far',
  'LED Far', 'Sunroof', 'Deri Döşeme', 'Isıtmalı Koltuk', 'Soğutmalı Koltuk',
  'Elektrikli Koltuk', 'Çok Fonksiyonlu Direksiyon', 'Paddle Shift',
  'Start/Stop', 'Keyless', 'Otomatik Park'
]

export default function CreateVehiclePage() {
  const router = useRouter()
  const [formData, setFormData] = useState<VehicleFormData>(initialFormData)
  const [images, setImages] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 4

  const handleInputChange = (field: keyof VehicleFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    // Hata varsa temizle
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const handleFeatureToggle = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (images.length + files.length > 10) {
      alert('Maksimum 10 fotoğraf yükleyebilirsiniz.')
      return
    }
    setImages(prev => [...prev, ...files])
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const validateStep = (step: number): boolean => {
    const newErrors: {[key: string]: string} = {}

    switch (step) {
      case 1:
        if (!formData.brand) newErrors.brand = 'Marka seçiniz'
        if (!formData.model) newErrors.model = 'Model giriniz'
        if (!formData.year) newErrors.year = 'Yıl giriniz'
        if (!formData.mileage) newErrors.mileage = 'Kilometre giriniz'
        if (!formData.fuelType) newErrors.fuelType = 'Yakıt türü seçiniz'
        if (!formData.transmission) newErrors.transmission = 'Vites türü seçiniz'
        break
      case 2:
        if (!formData.condition) newErrors.condition = 'Araç durumu seçiniz'
        if (!formData.city) newErrors.city = 'Şehir seçiniz'
        break
      case 3:
        if (!formData.startingBid) newErrors.startingBid = 'Başlangıç fiyatı giriniz'
        if (!formData.auctionDuration) newErrors.auctionDuration = 'İhale süresi seçiniz'
        break
      case 4:
        if (!formData.description) newErrors.description = 'Açıklama giriniz'
        if (images.length === 0) newErrors.images = 'En az 1 fotoğraf yükleyiniz'
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps))
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return

    setIsSubmitting(true)
    try {
      // API çağrısı simülasyonu
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Başarılı olursa dashboard'a yönlendir
      router.push('/dashboard?success=vehicle-created')
    } catch (error) {
      console.error('Araç ekleme hatası:', error)
      alert('Araç eklenirken bir hata oluştu. Lütfen tekrar deneyiniz.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1: return 'Araç Bilgileri'
      case 2: return 'Durum ve Konum'
      case 3: return 'İhale Ayarları'
      case 4: return 'Açıklama ve Fotoğraflar'
      default: return ''
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Geri
              </Button>
              <div className="flex items-center space-x-2">
                <Car className="h-6 w-6 text-blue-600" />
                <span className="text-xl font-bold">Yeni Araç Ekle</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button asChild variant="outline">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              {getStepTitle(currentStep)}
            </h2>
            <span className="text-sm text-gray-600">
              Adım {currentStep} / {totalSteps}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            {/* Step 1: Araç Bilgileri */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="brand">Marka *</Label>
                    <Select value={formData.brand} onValueChange={(value) => handleInputChange('brand', value)}>
                      <SelectTrigger className={errors.brand ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Marka seçiniz" />
                      </SelectTrigger>
                      <SelectContent>
                        {carBrands.map(brand => (
                          <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.brand && <p className="text-red-500 text-sm mt-1">{errors.brand}</p>}
                  </div>

                  <div>
                    <Label htmlFor="model">Model *</Label>
                    <Input
                      id="model"
                      value={formData.model}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('model', e.target.value)}
                      placeholder="Örn: 3 Series, C-Class"
                      className={errors.model ? 'border-red-500' : ''}
                    />
                    {errors.model && <p className="text-red-500 text-sm mt-1">{errors.model}</p>}
                  </div>

                  <div>
                    <Label htmlFor="year">Model Yılı *</Label>
                    <Select value={formData.year} onValueChange={(value) => handleInputChange('year', value)}>
                      <SelectTrigger className={errors.year ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Yıl seçiniz" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 30 }, (_, i) => 2024 - i).map(year => (
                          <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.year && <p className="text-red-500 text-sm mt-1">{errors.year}</p>}
                  </div>

                  <div>
                    <Label htmlFor="mileage">Kilometre *</Label>
                    <Input
                      id="mileage"
                      type="number"
                      value={formData.mileage}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('mileage', e.target.value)}
                      placeholder="Örn: 50000"
                      className={errors.mileage ? 'border-red-500' : ''}
                    />
                    {errors.mileage && <p className="text-red-500 text-sm mt-1">{errors.mileage}</p>}
                  </div>

                  <div>
                    <Label htmlFor="fuelType">Yakıt Türü *</Label>
                    <Select value={formData.fuelType} onValueChange={(value) => handleInputChange('fuelType', value)}>
                      <SelectTrigger className={errors.fuelType ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Yakıt türü seçiniz" />
                      </SelectTrigger>
                      <SelectContent>
                        {fuelTypes.map(fuel => (
                          <SelectItem key={fuel.value} value={fuel.value}>{fuel.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.fuelType && <p className="text-red-500 text-sm mt-1">{errors.fuelType}</p>}
                  </div>

                  <div>
                    <Label htmlFor="transmission">Vites Türü *</Label>
                    <Select value={formData.transmission} onValueChange={(value) => handleInputChange('transmission', value)}>
                      <SelectTrigger className={errors.transmission ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Vites türü seçiniz" />
                      </SelectTrigger>
                      <SelectContent>
                        {transmissionTypes.map(trans => (
                          <SelectItem key={trans.value} value={trans.value}>{trans.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.transmission && <p className="text-red-500 text-sm mt-1">{errors.transmission}</p>}
                  </div>

                  <div>
                    <Label htmlFor="engineSize">Motor Hacmi (cc)</Label>
                    <Input
                      id="engineSize"
                      value={formData.engineSize}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('engineSize', e.target.value)}
                      placeholder="Örn: 2000"
                    />
                  </div>

                  <div>
                    <Label htmlFor="horsePower">Beygir Gücü (hp)</Label>
                    <Input
                      id="horsePower"
                      value={formData.horsePower}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('horsePower', e.target.value)}
                      placeholder="Örn: 150"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Durum ve Konum */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="condition">Araç Durumu *</Label>
                    <Select value={formData.condition} onValueChange={(value) => handleInputChange('condition', value)}>
                      <SelectTrigger className={errors.condition ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Durum seçiniz" />
                      </SelectTrigger>
                      <SelectContent>
                        {conditionTypes.map(condition => (
                          <SelectItem key={condition.value} value={condition.value}>{condition.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.condition && <p className="text-red-500 text-sm mt-1">{errors.condition}</p>}
                  </div>

                  <div>
                    <Label htmlFor="city">Şehir *</Label>
                    <Select value={formData.city} onValueChange={(value) => handleInputChange('city', value)}>
                      <SelectTrigger className={errors.city ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Şehir seçiniz" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map(city => (
                          <SelectItem key={city} value={city}>{city}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                  </div>

                  <div>
                    <Label htmlFor="district">İlçe</Label>
                    <Input
                      id="district"
                      value={formData.district}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('district', e.target.value)}
                      placeholder="İlçe giriniz"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Araç Geçmişi</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="accidentHistory"
                        checked={formData.accidentHistory}
                        onCheckedChange={(checked) => handleInputChange('accidentHistory', checked as boolean)}
                      />
                      <Label htmlFor="accidentHistory">Kaza geçmişi var</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="serviceHistory"
                        checked={formData.serviceHistory}
                        onCheckedChange={(checked) => handleInputChange('serviceHistory', checked as boolean)}
                      />
                      <Label htmlFor="serviceHistory">Düzenli servis bakımı yapılmış</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Dökümanlar</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hasTitle"
                        checked={formData.hasTitle}
                        onCheckedChange={(checked) => handleInputChange('hasTitle', checked as boolean)}
                      />
                      <Label htmlFor="hasTitle">Ruhsat mevcut</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hasInspection"
                        checked={formData.hasInspection}
                        onCheckedChange={(checked) => handleInputChange('hasInspection', checked as boolean)}
                      />
                      <Label htmlFor="hasInspection">Muayene geçerli</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hasInsurance"
                        checked={formData.hasInsurance}
                        onCheckedChange={(checked) => handleInputChange('hasInsurance', checked as boolean)}
                      />
                      <Label htmlFor="hasInsurance">Sigorta mevcut</Label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: İhale Ayarları */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="startingBid">Başlangıç Fiyatı (TL) *</Label>
                    <Input
                      id="startingBid"
                      type="number"
                      value={formData.startingBid}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('startingBid', e.target.value)}
                      placeholder="Örn: 250000"
                      className={errors.startingBid ? 'border-red-500' : ''}
                    />
                    {errors.startingBid && <p className="text-red-500 text-sm mt-1">{errors.startingBid}</p>}
                  </div>

                  <div>
                    <Label htmlFor="reservePrice">Rezerv Fiyat (TL)</Label>
                    <Input
                      id="reservePrice"
                      type="number"
                      value={formData.reservePrice}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('reservePrice', e.target.value)}
                      placeholder="Örn: 300000"
                    />
                    <p className="text-sm text-gray-600 mt-1">
                      Bu fiyatın altında satış yapılmaz (opsiyonel)
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="auctionDuration">İhale Süresi *</Label>
                    <Select value={formData.auctionDuration} onValueChange={(value) => handleInputChange('auctionDuration', value)}>
                      <SelectTrigger className={errors.auctionDuration ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Süre seçiniz" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 Gün</SelectItem>
                        <SelectItem value="5">5 Gün</SelectItem>
                        <SelectItem value="7">7 Gün</SelectItem>
                        <SelectItem value="10">10 Gün</SelectItem>
                        <SelectItem value="14">14 Gün</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.auctionDuration && <p className="text-red-500 text-sm mt-1">{errors.auctionDuration}</p>}
                  </div>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    İhale başladıktan sonra bu ayarları değiştiremezsiniz. 
                    Başlangıç fiyatını piyasa değerinin altında belirleyerek daha fazla teklif alabilirsiniz.
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* Step 4: Açıklama ve Fotoğraflar */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="description">Araç Açıklaması *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('description', e.target.value)}
                    placeholder="Aracınız hakkında detaylı bilgi verin..."
                    rows={6}
                    className={errors.description ? 'border-red-500' : ''}
                  />
                  {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                </div>

                <div>
                  <Label>Araç Özellikleri</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-2">
                    {commonFeatures.map(feature => (
                      <div key={feature} className="flex items-center space-x-2">
                        <Checkbox
                          id={feature}
                          checked={formData.features.includes(feature)}
                          onCheckedChange={() => handleFeatureToggle(feature)}
                        />
                        <Label htmlFor={feature} className="text-sm">{feature}</Label>
                      </div>
                    ))}
                  </div>
                  {formData.features.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 mb-2">Seçilen özellikler:</p>
                      <div className="flex flex-wrap gap-2">
                        {formData.features.map(feature => (
                          <Badge key={feature} variant="secondary">
                            {feature}
                            <button
                              onClick={() => handleFeatureToggle(feature)}
                              className="ml-2 hover:text-red-500"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <Label>Araç Fotoğrafları *</Label>
                  <div className="mt-2">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <div className="space-y-2">
                        <p className="text-lg font-medium">Fotoğraf Yükle</p>
                        <p className="text-sm text-gray-600">
                          En az 1, en fazla 10 fotoğraf yükleyebilirsiniz
                        </p>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="image-upload"
                        />
                        <Button asChild variant="outline">
                          <label htmlFor="image-upload" className="cursor-pointer">
                            <Upload className="h-4 w-4 mr-2" />
                            Fotoğraf Seç
                          </label>
                        </Button>
                      </div>
                    </div>
                    {errors.images && <p className="text-red-500 text-sm mt-1">{errors.images}</p>}
                  </div>

                  {images.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2">
                        Yüklenen Fotoğraflar ({images.length}/10)
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {images.map((image, index) => (
                          <div key={index} className="relative">
                            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                              <img
                                src={URL.createObjectURL(image)}
                                alt={`Araç fotoğrafı ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <button
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <X className="h-4 w-4" />
                            </button>
                            {index === 0 && (
                              <Badge className="absolute bottom-2 left-2 bg-blue-500">
                                Ana Fotoğraf
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Önceki
              </Button>

              {currentStep < totalSteps ? (
                <Button onClick={nextStep}>
                  Sonraki
                  <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      İhale Oluşturuluyor...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      İhaleyi Başlat
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}