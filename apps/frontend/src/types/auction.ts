import { User } from './user';
import { Bid } from './bid';

export interface Auction {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  
  // Vehicle specific fields
  vehicle: VehicleDetails;
  
  // Auction details
  startingBid: number;
  currentBid: number;
  reservePrice?: number;
  buyNowPrice?: number;
  bidIncrement: number;
  
  // Timing
  startTime: string;
  endTime: string;
  duration: number; // in hours
  
  // Status
  status: AuctionStatus;
  featured: boolean;
  verified: boolean;
  
  // Media
  images: AuctionImage[];
  videos?: AuctionVideo[];
  documents?: AuctionDocument[];
  
  // Seller
  seller: User;
  sellerNotes?: string;
  
  // Bidding
  bids?: Bid[];
  bidCount: number;
  watchers: number;
  
  // Location
  location: AuctionLocation;
  
  // Metadata
  views: number;
  createdAt: string;
  updatedAt: string;
  
  // Additional features
  tags?: string[];
  condition: VehicleCondition;
  inspectionReport?: InspectionReport;
  warranty?: WarrantyInfo;
  financing?: FinancingOptions;
}

export interface VehicleDetails {
  make: string;
  model: string;
  year: number;
  vin?: string;
  mileage: number;
  fuelType: FuelType;
  transmission: TransmissionType;
  drivetrain: DrivetrainType;
  bodyType: BodyType;
  color: string;
  interiorColor?: string;
  engine: EngineDetails;
  features: string[];
  modifications?: string[];
  accidents?: AccidentHistory[];
  serviceHistory?: ServiceRecord[];
}

export interface EngineDetails {
  type: string;
  displacement: number; // in liters
  cylinders: number;
  horsepower: number;
  torque: number;
  fuelEconomy?: {
    city: number;
    highway: number;
    combined: number;
  };
}

export interface AccidentHistory {
  date: string;
  description: string;
  severity: 'minor' | 'moderate' | 'major';
  repaired: boolean;
  cost?: number;
}

export interface ServiceRecord {
  date: string;
  mileage: number;
  type: string;
  description: string;
  cost?: number;
  provider?: string;
}

export interface AuctionImage {
  id: string;
  url: string;
  thumbnail: string;
  caption?: string;
  order: number;
  isPrimary: boolean;
}

export interface AuctionVideo {
  id: string;
  url: string;
  thumbnail: string;
  title?: string;
  duration: number;
  order: number;
}

export interface AuctionDocument {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: string;
}

export interface AuctionLocation {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  timezone: string;
}

export interface InspectionReport {
  id: string;
  inspector: string;
  date: string;
  overallRating: number; // 1-10
  categories: {
    exterior: number;
    interior: number;
    engine: number;
    transmission: number;
    brakes: number;
    suspension: number;
    electrical: number;
  };
  notes: string;
  images?: string[];
  certified: boolean;
}

export interface WarrantyInfo {
  type: 'manufacturer' | 'extended' | 'dealer' | 'none';
  provider?: string;
  expirationDate?: string;
  mileageLimit?: number;
  coverage: string[];
  transferable: boolean;
}

export interface FinancingOptions {
  available: boolean;
  providers?: string[];
  minDownPayment?: number;
  maxTermMonths?: number;
  estimatedPayment?: number;
  apr?: number;
}

export interface CreateAuctionRequest {
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  vehicle: Omit<VehicleDetails, 'accidents' | 'serviceHistory'>;
  startingBid: number;
  reservePrice?: number;
  buyNowPrice?: number;
  duration: number;
  startTime?: string;
  location: AuctionLocation;
  images: File[];
  videos?: File[];
  documents?: File[];
  sellerNotes?: string;
  tags?: string[];
  condition: VehicleCondition;
  warranty?: WarrantyInfo;
  financing?: FinancingOptions;
}

export interface UpdateAuctionRequest {
  title?: string;
  description?: string;
  sellerNotes?: string;
  tags?: string[];
  buyNowPrice?: number;
  reservePrice?: number;
}

export interface AuctionFilters {
  brand?: string;
  model?: string;
  yearFrom?: number;
  yearTo?: number;
  priceFrom?: number;
  priceTo?: number;
  mileageFrom?: number;
  mileageTo?: number;
  fuelType?: string;
  transmission?: string;
  condition?: string;
  location?: string;
  status?: AuctionStatus;
  featured?: boolean;
  verified?: boolean;
  hasReserve?: boolean;
  hasBuyNow?: boolean;
  endingSoon?: boolean; // within 24 hours
}

export interface AuctionSearchParams {
  query?: string;
  filters?: AuctionFilters;
  sortBy?: 'endTime' | 'price' | 'created' | 'bids' | 'views';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface AuctionSearchResponse {
  auctions: Auction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export type AuctionStatus = 
  | 'draft'
  | 'scheduled'
  | 'active'
  | 'ending_soon'
  | 'ended'
  | 'sold'
  | 'unsold'
  | 'cancelled'
  | 'suspended';

export type VehicleCondition = 
  | 'new'
  | 'like_new'
  | 'excellent'
  | 'good'
  | 'fair'
  | 'poor'
  | 'salvage'
  | 'parts_only';

export type FuelType = 
  | 'gasoline'
  | 'diesel'
  | 'hybrid'
  | 'electric'
  | 'plug_in_hybrid'
  | 'hydrogen'
  | 'natural_gas'
  | 'other';

export type TransmissionType = 
  | 'manual'
  | 'automatic'
  | 'cvt'
  | 'semi_automatic'
  | 'dual_clutch';

export type DrivetrainType = 
  | 'fwd'
  | 'rwd'
  | 'awd'
  | '4wd';

export type BodyType = 
  | 'sedan'
  | 'coupe'
  | 'hatchback'
  | 'wagon'
  | 'suv'
  | 'crossover'
  | 'pickup'
  | 'van'
  | 'convertible'
  | 'roadster'
  | 'truck'
  | 'motorcycle'
  | 'other';

export interface AuctionStats {
  totalAuctions: number;
  activeAuctions: number;
  endedAuctions: number;
  totalValue: number;
  averagePrice: number;
  topCategories: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  recentActivity: Array<{
    type: 'bid' | 'auction_created' | 'auction_ended';
    timestamp: string;
    data: any;
  }>;
}