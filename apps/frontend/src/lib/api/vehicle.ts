import apiClient, { API_BASE_URLS } from './config'

export type FuelType = 'GASOLINE' | 'DIESEL' | 'ELECTRIC' | 'HYBRID'
export type TransmissionType = 'MANUAL' | 'AUTOMATIC' | 'CVT'
export type VehicleCondition = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR'
export type VehicleStatus = 'DRAFT' | 'ACTIVE' | 'SOLD' | 'INACTIVE'

export interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  mileage: number
  fuelType: FuelType
  transmission: TransmissionType
  condition: VehicleCondition
  status: VehicleStatus
  categoryId: string
  userId?: string
  sellerId?: string
  description?: string
  images?: string[]
  engineSize?: number
  color?: string
  vin?: string
  licensePlate?: string
  location?: string
  price?: number
  createdAt?: string
  updatedAt?: string
  category?: {
    id: string
    name: string
    slug: string
  }
}

export interface CreateVehicleDto {
  make: string
  model: string
  year: number
  mileage: number
  fuelType: FuelType
  transmission: TransmissionType
  condition: VehicleCondition
  categoryId: string
  status?: VehicleStatus
  description?: string
  images?: string[]
  engineSize?: number
  color?: string
  vin?: string
  licensePlate?: string
  location?: string
}

export interface UpdateVehicleDto extends Partial<CreateVehicleDto> {}

export interface VehicleListResponse {
  data: Vehicle[]
  meta?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export const vehicleApi = {
  // Get all vehicles
  getAll: async (params?: {
    page?: number
    limit?: number
    search?: string
    categoryId?: string
  }): Promise<VehicleListResponse> => {
    const response = await apiClient.get(`${API_BASE_URLS.vehicle}/vehicles`, {
      params,
    })
    // Backend returns: { success: true, data: { data: [...], meta: {...} } }
    // Extract the nested data structure
    if (response.data?.success && response.data?.data) {
      return response.data.data
    }
    // Fallback for direct data format
    return response.data
  },

  // Get vehicle by ID
  getById: async (id: string): Promise<Vehicle> => {
    const response = await apiClient.get(`${API_BASE_URLS.vehicle}/vehicles/${id}`)
    return response.data.data || response.data
  },

  // Search vehicles
  search: async (query: string): Promise<Vehicle[]> => {
    const response = await apiClient.get(`${API_BASE_URLS.vehicle}/vehicles/search`, {
      params: { q: query },
    })
    return response.data.data || response.data || []
  },

  // Get user vehicles
  getMyVehicles: async (params?: {
    page?: number
    limit?: number
  }): Promise<{ data: Vehicle[]; meta?: any }> => {
    const response = await apiClient.get(`${API_BASE_URLS.vehicle}/vehicles/my-vehicles`, {
      params,
    })
    return response.data.data || { data: response.data || [], meta: {} }
  },

  // Create vehicle
  create: async (data: CreateVehicleDto): Promise<Vehicle> => {
    const response = await apiClient.post(`${API_BASE_URLS.vehicle}/vehicles`, data)
    return response.data.data || response.data
  },

  // Update vehicle
  update: async (id: string, data: UpdateVehicleDto): Promise<Vehicle> => {
    const response = await apiClient.patch(`${API_BASE_URLS.vehicle}/vehicles/${id}`, data)
    return response.data.data || response.data
  },

  // Delete vehicle
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${API_BASE_URLS.vehicle}/vehicles/${id}`)
  },

  // Update vehicle status
  updateStatus: async (id: string, status: VehicleStatus): Promise<Vehicle> => {
    const response = await apiClient.patch(`${API_BASE_URLS.vehicle}/vehicles/${id}/status`, {
      status,
    })
    return response.data.data || response.data
  },
}

