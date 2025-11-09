import apiClient, { API_BASE_URLS } from './config'

export interface Auction {
  id: string
  title: string
  description?: string
  vehicleId: string
  sellerId: string
  startingPrice: string | number
  currentPrice: string | number
  reservePrice?: string | number
  minBidIncrement: string | number
  startTime: string
  endTime: string
  extendedEndTime?: string
  status: 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'ENDED' | 'CANCELLED'
  isActive: boolean
  isFeatured: boolean
  totalBids: number
  highestBidderId?: string
  viewCount: number
  watchlistCount: number
  createdAt: string
  updatedAt: string
}

export interface AuctionListResponse {
  data: Auction[]
  meta?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface AuctionStats {
  total: number
  active: number
  ended: number
  scheduled: number
  totalBids: number
  totalValue: number
}

export interface CreateAuctionDto {
  title: string
  description?: string
  vehicleId: string
  sellerId: string
  startingPrice: number
  reservePrice?: number
  minBidIncrement?: number
  startTime: string
  endTime: string
  autoExtendMinutes?: number
  isFeatured?: boolean
}

export interface UpdateAuctionDto extends Partial<CreateAuctionDto> {}

export const auctionApi = {
  // Get all auctions
  getAll: async (params?: {
    page?: number
    limit?: number
    status?: string
    search?: string
  }): Promise<AuctionListResponse> => {
    const response = await apiClient.get(`${API_BASE_URLS.auction}/auctions`, {
      params,
    })
    // Backend returns: { data: [...], meta: {...} }
    return response.data
  },

  // Get auction by ID
  getById: async (id: string): Promise<Auction> => {
    const response = await apiClient.get(`${API_BASE_URLS.auction}/auctions/${id}`)
    // Backend returns: Auction object directly or wrapped
    return response.data.data || response.data
  },

  // Get auction statistics
  getStats: async (): Promise<AuctionStats> => {
    const response = await apiClient.get(`${API_BASE_URLS.auction}/auctions/stats`)
    return response.data.data || response.data
  },

  // Get bids for auction
  getBids: async (auctionId: string): Promise<any[]> => {
    const response = await apiClient.get(
      `${API_BASE_URLS.bid}/bids/auction/${auctionId}`
    )
    return response.data.data || response.data || []
  },

  // Get highest bid for auction
  getHighestBid: async (auctionId: string): Promise<any> => {
    const response = await apiClient.get(
      `${API_BASE_URLS.bid}/bids/auction/${auctionId}/highest`
    )
    return response.data.data || response.data
  },

  // Create auction
  create: async (data: CreateAuctionDto): Promise<Auction> => {
    const response = await apiClient.post(`${API_BASE_URLS.auction}/auctions`, data)
    return response.data.data || response.data
  },

  // Update auction
  update: async (id: string, data: UpdateAuctionDto): Promise<Auction> => {
    const response = await apiClient.patch(`${API_BASE_URLS.auction}/auctions/${id}`, data)
    return response.data.data || response.data
  },

  // Delete auction
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${API_BASE_URLS.auction}/auctions/${id}`)
  },

  // Add to watchlist
  addToWatchlist: async (auctionId: string, userId: string): Promise<void> => {
    await apiClient.post(`${API_BASE_URLS.auction}/auctions/${auctionId}/watchlist`, {
      userId,
    })
  },

  // Remove from watchlist
  removeFromWatchlist: async (auctionId: string, userId: string): Promise<void> => {
    await apiClient.delete(
      `${API_BASE_URLS.auction}/auctions/${auctionId}/watchlist/${userId}`
    )
  },
}

