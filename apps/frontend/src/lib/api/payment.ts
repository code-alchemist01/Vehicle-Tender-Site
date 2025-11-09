import apiClient, { API_BASE_URLS } from './config'

export interface Payment {
  id: string
  auctionId: string
  bidderId: string
  amount: number // Amount in cents
  currency: string
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REFUNDED' | 'PARTIALLY_REFUNDED'
  paymentMethod: 'CREDIT_CARD' | 'DEBIT_CARD' | 'BANK_TRANSFER' | 'DIGITAL_WALLET'
  stripePaymentId?: string
  stripeCustomerId?: string
  metadata?: any
  createdAt: string
  updatedAt: string
  processedAt?: string
}

export interface PaymentStatistics {
  totalPayments: number
  completedPayments: number
  pendingPayments: number
  failedPayments: number
  totalAmount: number // Amount in cents
}

export interface CreatePaymentDto {
  auctionId: string
  bidderId: string
  amount: number
  currency?: string
  paymentMethod: 'CREDIT_CARD' | 'DEBIT_CARD' | 'BANK_TRANSFER' | 'DIGITAL_WALLET'
  stripePaymentMethodId?: string
  metadata?: any
}

export const paymentApi = {
  // Get payment statistics
  getStatistics: async (bidderId?: string, auctionId?: string): Promise<PaymentStatistics> => {
    const params: any = {}
    if (bidderId) params.bidderId = bidderId
    if (auctionId) params.auctionId = auctionId
    
    const response = await apiClient.get(`${API_BASE_URLS.payment}/payments/statistics`, {
      params,
    })
    return response.data.data || response.data
  },

  // Get payments by bidder
  getPaymentsByBidder: async (bidderId: string): Promise<Payment[]> => {
    const response = await apiClient.get(`${API_BASE_URLS.payment}/payments/bidder/${bidderId}`)
    return response.data.data || response.data || []
  },

  // Get payment by ID
  getById: async (id: string): Promise<Payment> => {
    const response = await apiClient.get(`${API_BASE_URLS.payment}/payments/${id}`)
    return response.data.data || response.data
  },

  // Create payment
  create: async (data: CreatePaymentDto): Promise<Payment> => {
    const response = await apiClient.post(`${API_BASE_URLS.payment}/payments`, data)
    return response.data.data || response.data
  },

  // Process payment
  process: async (paymentId: string, stripePaymentMethodId: string): Promise<Payment> => {
    const response = await apiClient.post(`${API_BASE_URLS.payment}/payments/${paymentId}/process`, {
      stripePaymentMethodId,
    })
    return response.data.data || response.data
  },

  // Cancel payment
  cancel: async (paymentId: string): Promise<Payment> => {
    const response = await apiClient.patch(`${API_BASE_URLS.payment}/payments/${paymentId}/cancel`)
    return response.data.data || response.data
  },
}

