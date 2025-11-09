import apiClient, { API_BASE_URLS } from './config'

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateCategoryDto {
  name: string
  slug: string
  description?: string
  isActive?: boolean
}

export interface UpdateCategoryDto extends Partial<CreateCategoryDto> {}

export const categoryApi = {
  // Get all categories
  getAll: async (params?: {
    page?: number
    limit?: number
  }): Promise<{ data: Category[]; meta?: any }> => {
    const response = await apiClient.get(`${API_BASE_URLS.vehicle}/categories`, { params })
    return response.data.data || { data: response.data || [], meta: {} }
  },

  // Get active categories only
  getActive: async (): Promise<Category[]> => {
    const response = await apiClient.get(`${API_BASE_URLS.vehicle}/categories/active`)
    return response.data.data || response.data || []
  },

  // Get category by ID
  getById: async (id: string): Promise<Category> => {
    const response = await apiClient.get(`${API_BASE_URLS.vehicle}/categories/${id}`)
    return response.data.data || response.data
  },

  // Create category (Admin only)
  create: async (data: CreateCategoryDto): Promise<Category> => {
    const response = await apiClient.post(`${API_BASE_URLS.vehicle}/categories`, data)
    return response.data.data || response.data
  },

  // Update category (Admin only)
  update: async (id: string, data: UpdateCategoryDto): Promise<Category> => {
    const response = await apiClient.patch(`${API_BASE_URLS.vehicle}/categories/${id}`, data)
    return response.data.data || response.data
  },

  // Delete category (Admin only)
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${API_BASE_URLS.vehicle}/categories/${id}`)
  },
}

