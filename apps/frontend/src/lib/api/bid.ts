import apiClient, { API_BASE_URLS } from './config'

export interface Bid {
  id: string
  auctionId: string
  bidderId: string
  amount: string | number
  isAutomatic: boolean
  maxAmount?: string | number
  status: 'PENDING' | 'PROCESSING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | 'OUTBID'
  placedAt: string
  processedAt?: string
  failureReason?: string
}

export interface AutoBid {
  id: string
  auctionId: string
  bidderId: string
  maxAmount: string | number
  increment: string | number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateBidRequest {
  auctionId: string
  bidderId: string
  amount: number
  notes?: string
}

export interface CreateAutoBidRequest {
  auctionId: string
  bidderId: string
  maxAmount: number
  increment: number
}

export const bidApi = {
  // Place a bid
  create: async (data: CreateBidRequest): Promise<Bid> => {
    const response = await apiClient.post(`${API_BASE_URLS.bid}/bids`, data)
    // Backend returns: Bid object directly
    return response.data.data || response.data
  },

  // Get all bids
  getAll: async (params?: {
    page?: number
    limit?: number
    auctionId?: string
    bidderId?: string
  }): Promise<{ data: Bid[]; meta?: any }> => {
    const response = await apiClient.get(`${API_BASE_URLS.bid}/bids`, { params })
    return response.data
  },

  // Get bid by ID
  getById: async (id: string): Promise<Bid> => {
    const response = await apiClient.get(`${API_BASE_URLS.bid}/bids/${id}`)
    return response.data.data || response.data
  },

  // Get user bids
  getUserBids: async (bidderId: string): Promise<Bid[]> => {
    const response = await apiClient.get(`${API_BASE_URLS.bid}/bids/user/${bidderId}`)
    return response.data.data || response.data || []
  },

  // Get auction bids
  getAuctionBids: async (auctionId: string): Promise<Bid[]> => {
    const response = await apiClient.get(
      `${API_BASE_URLS.bid}/bids/auction/${auctionId}`
    )
    return response.data.data || response.data || []
  },

  // Get highest bid
  getHighestBid: async (auctionId: string): Promise<Bid | null> => {
    const response = await apiClient.get(
      `${API_BASE_URLS.bid}/bids/auction/${auctionId}/highest`
    )
    return response.data.data || response.data || null
  },

  // Cancel bid
  cancel: async (bidId: string, bidderId: string): Promise<void> => {
    await apiClient.delete(
      `${API_BASE_URLS.bid}/bids/${bidId}/cancel/${bidderId}`
    )
  },

  // Auto Bid operations
  createAutoBid: async (data: CreateAutoBidRequest): Promise<AutoBid> => {
    const response = await apiClient.post(`${API_BASE_URLS.bid}/bids/auto`, data)
    return response.data.data || response.data
  },

  getUserAutoBids: async (bidderId: string): Promise<AutoBid[]> => {
    const response = await apiClient.get(
      `${API_BASE_URLS.bid}/bids/auto/user/${bidderId}`
    )
    return response.data.data || response.data || []
  },

  // Get statistics
  getStatistics: async (auctionId?: string): Promise<any> => {
    const params = auctionId ? { auctionId } : {}
    const response = await apiClient.get(`${API_BASE_URLS.bid}/bids/statistics`, {
      params,
    })
    return response.data.data || response.data
  },

  // Deactivate auto bid
  deactivateAutoBid: async (autoBidId: string, bidderId: string): Promise<void> => {
    await apiClient.delete(
      `${API_BASE_URLS.bid}/bids/auto/${autoBidId}/user/${bidderId}`
    )
  },
}

