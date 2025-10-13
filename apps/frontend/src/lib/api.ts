import { getSession } from 'next-auth/react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const session = await getSession();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (session?.accessToken) {
      headers.Authorization = `Bearer ${session.accessToken}`;
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = await this.getAuthHeaders();

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
  }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async refreshToken(refreshToken: string) {
    return this.request('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  // User endpoints
  async getProfile() {
    return this.request('/users/profile');
  }

  async updateProfile(userData: Partial<{
    firstName: string;
    lastName: string;
    phone: string;
    avatar: string;
  }>) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return this.request('/users/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  // Auction endpoints
  async getAuctions(params?: {
    page?: number;
    limit?: number;
    search?: string;
    brand?: string;
    model?: string;
    yearFrom?: number;
    yearTo?: number;
    priceFrom?: number;
    priceTo?: number;
    mileageFrom?: number;
    mileageTo?: number;
    fuelType?: string[];
    transmission?: string[];
    condition?: string[];
    location?: string;
    status?: string;
    sortBy?: string;
  }) {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && (typeof value !== 'string' || value !== '')) {
          if (Array.isArray(value)) {
            value.forEach(v => queryParams.append(key, v));
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });
    }

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/auctions?${queryString}` : '/auctions';
    
    return this.request(endpoint);
  }

  async getAuction(id: string) {
    return this.request(`/auctions/${id}`);
  }

  async createAuction(auctionData: {
    title: string;
    description: string;
    brand: string;
    model: string;
    year: number;
    mileage: number;
    fuelType: string;
    transmission: string;
    condition: string;
    location: string;
    startingBid: number;
    reservePrice?: number;
    endTime: string;
    images: string[];
  }) {
    return this.request('/auctions', {
      method: 'POST',
      body: JSON.stringify(auctionData),
    });
  }

  async updateAuction(id: string, auctionData: Partial<{
    title: string;
    description: string;
    endTime: string;
  }>) {
    return this.request(`/auctions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(auctionData),
    });
  }

  async deleteAuction(id: string) {
    return this.request(`/auctions/${id}`, {
      method: 'DELETE',
    });
  }

  // Bid endpoints
  async getBids(auctionId: string) {
    return this.request(`/auctions/${auctionId}/bids`);
  }

  async placeBid(auctionId: string, amount: number) {
    return this.request(`/auctions/${auctionId}/bids`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  }

  async getUserBids(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && (typeof value !== 'string' || value !== '')) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/bids/user?${queryString}` : '/bids/user';
    
    return this.request(endpoint);
  }

  // Watchlist endpoints
  async getWatchlist() {
    return this.request('/watchlist');
  }

  async addToWatchlist(auctionId: string) {
    return this.request('/watchlist', {
      method: 'POST',
      body: JSON.stringify({ auctionId }),
    });
  }

  async removeFromWatchlist(auctionId: string) {
    return this.request(`/watchlist/${auctionId}`, {
      method: 'DELETE',
    });
  }

  // Notification endpoints
  async getNotifications(params?: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
  }) {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && (typeof value !== 'string' || value !== '')) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/notifications?${queryString}` : '/notifications';
    
    return this.request(endpoint);
  }

  async markNotificationAsRead(id: string) {
    return this.request(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  }

  async markAllNotificationsAsRead() {
    return this.request('/notifications/read-all', {
      method: 'PUT',
    });
  }

  // File upload endpoints
  async uploadImage(file: File): Promise<ApiResponse<{ url: string }>> {
    const formData = new FormData();
    formData.append('image', file);

    const session = await getSession();
    const headers: Record<string, string> = {};

    if (session?.accessToken) {
      headers.Authorization = `Bearer ${session.accessToken}`;
    }

    try {
      const response = await fetch(`${this.baseURL}/upload/image`, {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Image upload failed:', error);
      throw error;
    }
  }

  async uploadImages(files: File[]): Promise<ApiResponse<{ urls: string[] }>> {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`images`, file);
    });

    const session = await getSession();
    const headers: Record<string, string> = {};

    if (session?.accessToken) {
      headers.Authorization = `Bearer ${session.accessToken}`;
    }

    try {
      const response = await fetch(`${this.baseURL}/upload/images`, {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Images upload failed:', error);
      throw error;
    }
  }

  // Analytics endpoints
  async getDashboardStats() {
    return this.request('/analytics/dashboard');
  }

  async getAuctionStats(auctionId: string) {
    return this.request(`/analytics/auctions/${auctionId}`);
  }
}

export const apiClient = new ApiClient();
export default apiClient;