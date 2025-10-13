'use client';

import { useState } from 'react';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FilterState {
  search: string;
  brand: string;
  model: string;
  yearFrom: string;
  yearTo: string;
  priceFrom: string;
  priceTo: string;
  mileageFrom: string;
  mileageTo: string;
  fuelType: string[];
  transmission: string[];
  condition: string[];
  location: string;
  status: string;
  sortBy: string;
}

interface SearchFiltersProps {
  onFiltersChange: (filters: FilterState) => void;
  className?: string;
}

export function SearchFilters({ onFiltersChange, className }: SearchFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    brand: '',
    model: '',
    yearFrom: '',
    yearTo: '',
    priceFrom: '',
    priceTo: '',
    mileageFrom: '',
    mileageTo: '',
    fuelType: [],
    transmission: [],
    condition: [],
    location: '',
    status: 'active',
    sortBy: 'ending_soon',
  });

  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const brands = [
    'Audi', 'BMW', 'Mercedes-Benz', 'Volkswagen', 'Toyota', 'Honda', 
    'Ford', 'Renault', 'Peugeot', 'Hyundai', 'Kia', 'Nissan'
  ];

  const fuelTypes = [
    { id: 'gasoline', label: 'Benzin' },
    { id: 'diesel', label: 'Dizel' },
    { id: 'hybrid', label: 'Hibrit' },
    { id: 'electric', label: 'Elektrik' },
  ];

  const transmissionTypes = [
    { id: 'manual', label: 'Manuel' },
    { id: 'automatic', label: 'Otomatik' },
  ];

  const conditionTypes = [
    { id: 'excellent', label: 'Mükemmel' },
    { id: 'good', label: 'İyi' },
    { id: 'fair', label: 'Orta' },
    { id: 'poor', label: 'Kötü' },
  ];

  const cities = [
    'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 
    'Konya', 'Gaziantep', 'Mersin', 'Diyarbakır'
  ];

  const sortOptions = [
    { value: 'ending_soon', label: 'Bitiş Zamanına Göre' },
    { value: 'price_low', label: 'Fiyat (Düşükten Yükseğe)' },
    { value: 'price_high', label: 'Fiyat (Yüksekten Düşüğe)' },
    { value: 'newest', label: 'En Yeni' },
    { value: 'oldest', label: 'En Eski' },
    { value: 'mileage_low', label: 'Km (Düşükten Yükseğe)' },
    { value: 'mileage_high', label: 'Km (Yüksekten Düşüğe)' },
  ];

  const updateFilter = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const updateArrayFilter = (key: keyof FilterState, value: string, checked: boolean) => {
    const currentArray = filters[key] as string[];
    const newArray = checked 
      ? [...currentArray, value]
      : currentArray.filter(item => item !== value);
    
    updateFilter(key, newArray);
  };

  const clearFilters = () => {
    const clearedFilters: FilterState = {
      search: '',
      brand: '',
      model: '',
      yearFrom: '',
      yearTo: '',
      priceFrom: '',
      priceTo: '',
      mileageFrom: '',
      mileageTo: '',
      fuelType: [],
      transmission: [],
      condition: [],
      location: '',
      status: 'active',
      sortBy: 'ending_soon',
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.brand) count++;
    if (filters.model) count++;
    if (filters.yearFrom || filters.yearTo) count++;
    if (filters.priceFrom || filters.priceTo) count++;
    if (filters.mileageFrom || filters.mileageTo) count++;
    if (filters.fuelType.length > 0) count++;
    if (filters.transmission.length > 0) count++;
    if (filters.condition.length > 0) count++;
    if (filters.location) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filtreler</span>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary">{activeFiltersCount}</Badge>
            )}
          </CardTitle>
          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Temizle
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search">Arama</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              id="search"
              placeholder="Marka, model, açıklama ara..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Sort */}
        <div className="space-y-2">
          <Label>Sıralama</Label>
          <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label>Durum</Label>
          <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tümü</SelectItem>
              <SelectItem value="active">Aktif</SelectItem>
              <SelectItem value="ending_soon">Bitiyor</SelectItem>
              <SelectItem value="ended">Biten</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Advanced Filters */}
        <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0">
              <span>Gelişmiş Filtreler</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${isAdvancedOpen ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-6 mt-4">
            {/* Brand & Model */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Marka</Label>
                <Select value={filters.brand} onValueChange={(value) => updateFilter('brand', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Marka seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tümü</SelectItem>
                    {brands.map((brand) => (
                      <SelectItem key={brand} value={brand}>
                        {brand}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Model</Label>
                <Input
                  placeholder="Model"
                  value={filters.model}
                  onChange={(e) => updateFilter('model', e.target.value)}
                />
              </div>
            </div>

            {/* Year Range */}
            <div className="space-y-2">
              <Label>Model Yılı</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Min"
                  type="number"
                  value={filters.yearFrom}
                  onChange={(e) => updateFilter('yearFrom', e.target.value)}
                />
                <Input
                  placeholder="Max"
                  type="number"
                  value={filters.yearTo}
                  onChange={(e) => updateFilter('yearTo', e.target.value)}
                />
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-2">
              <Label>Fiyat Aralığı (₺)</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Min fiyat"
                  type="number"
                  value={filters.priceFrom}
                  onChange={(e) => updateFilter('priceFrom', e.target.value)}
                />
                <Input
                  placeholder="Max fiyat"
                  type="number"
                  value={filters.priceTo}
                  onChange={(e) => updateFilter('priceTo', e.target.value)}
                />
              </div>
            </div>

            {/* Mileage Range */}
            <div className="space-y-2">
              <Label>Kilometre Aralığı</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Min km"
                  type="number"
                  value={filters.mileageFrom}
                  onChange={(e) => updateFilter('mileageFrom', e.target.value)}
                />
                <Input
                  placeholder="Max km"
                  type="number"
                  value={filters.mileageTo}
                  onChange={(e) => updateFilter('mileageTo', e.target.value)}
                />
              </div>
            </div>

            {/* Fuel Type */}
            <div className="space-y-2">
              <Label>Yakıt Türü</Label>
              <div className="space-y-2">
                {fuelTypes.map((fuel) => (
                  <div key={fuel.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={fuel.id}
                      checked={filters.fuelType.includes(fuel.id)}
                      onCheckedChange={(checked) => 
                        updateArrayFilter('fuelType', fuel.id, checked as boolean)
                      }
                    />
                    <Label htmlFor={fuel.id} className="text-sm font-normal">
                      {fuel.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Transmission */}
            <div className="space-y-2">
              <Label>Vites</Label>
              <div className="space-y-2">
                {transmissionTypes.map((transmission) => (
                  <div key={transmission.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={transmission.id}
                      checked={filters.transmission.includes(transmission.id)}
                      onCheckedChange={(checked) => 
                        updateArrayFilter('transmission', transmission.id, checked as boolean)
                      }
                    />
                    <Label htmlFor={transmission.id} className="text-sm font-normal">
                      {transmission.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Condition */}
            <div className="space-y-2">
              <Label>Durum</Label>
              <div className="space-y-2">
                {conditionTypes.map((condition) => (
                  <div key={condition.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={condition.id}
                      checked={filters.condition.includes(condition.id)}
                      onCheckedChange={(checked) => 
                        updateArrayFilter('condition', condition.id, checked as boolean)
                      }
                    />
                    <Label htmlFor={condition.id} className="text-sm font-normal">
                      {condition.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label>Şehir</Label>
              <Select value={filters.location} onValueChange={(value) => updateFilter('location', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Şehir seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tümü</SelectItem>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}