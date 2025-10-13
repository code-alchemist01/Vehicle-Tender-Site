import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successMessage?: string;
  errorMessage?: string;
}

interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: any;
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
}

export function useApi<T = any>(
  apiFunction: (...args: any[]) => Promise<any>,
  options: UseApiOptions = {}
): UseApiReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const {
    onSuccess,
    onError,
    showSuccessToast = false,
    showErrorToast = true,
    successMessage = 'İşlem başarılı',
    errorMessage = 'Bir hata oluştu',
  } = options;

  const execute = useCallback(
    async (...args: any[]): Promise<T | null> => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiFunction(...args);
        
        if (response.success) {
          setData(response.data);
          
          if (showSuccessToast) {
            toast.success(successMessage);
          }
          
          if (onSuccess) {
            onSuccess(response.data);
          }
          
          return response.data;
        } else {
          throw new Error(response.message || errorMessage);
        }
      } catch (err: any) {
        setError(err);
        
        if (showErrorToast) {
          toast.error(errorMessage, {
            description: err.message || 'Lütfen tekrar deneyin.',
          });
        }
        
        if (onError) {
          onError(err);
        }
        
        return null;
      } finally {
        setLoading(false);
      }
    },
    [apiFunction, onSuccess, onError, showSuccessToast, showErrorToast, successMessage, errorMessage]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
}

// Hook for automatic API calls on mount
export function useApiQuery<T = any>(
  apiFunction: (...args: any[]) => Promise<any>,
  args: any[] = [],
  options: UseApiOptions & { enabled?: boolean } = {}
): UseApiReturn<T> {
  const { enabled = true, ...apiOptions } = options;
  const api = useApi<T>(apiFunction, apiOptions);

  useEffect(() => {
    if (enabled) {
      api.execute(...args);
    }
  }, [enabled, ...args]);

  return api;
}

// Hook for mutations (POST, PUT, DELETE operations)
export function useApiMutation<T = any>(
  apiFunction: (...args: any[]) => Promise<any>,
  options: UseApiOptions = {}
): UseApiReturn<T> {
  return useApi<T>(apiFunction, {
    showSuccessToast: true,
    ...options,
  });
}

// Specialized hooks for common operations
export function useAuctions(filters?: any) {
  return useApiQuery(
    async (filters) => {
      const { apiClient } = await import('@/lib/api');
      return apiClient.getAuctions(filters);
    },
    [filters],
    {
      showErrorToast: true,
      errorMessage: 'Açık artırmalar yüklenirken hata oluştu',
    }
  );
}

export function useAuction(id: string) {
  return useApiQuery(
    async (id) => {
      const { apiClient } = await import('@/lib/api');
      return apiClient.getAuction(id);
    },
    [id],
    {
      enabled: !!id,
      showErrorToast: true,
      errorMessage: 'Açık artırma detayları yüklenirken hata oluştu',
    }
  );
}

export function useUserBids() {
  return useApiQuery(
    async () => {
      const { apiClient } = await import('@/lib/api');
      return apiClient.getUserBids();
    },
    [],
    {
      showErrorToast: true,
      errorMessage: 'Teklifleriniz yüklenirken hata oluştu',
    }
  );
}

export function useWatchlist() {
  return useApiQuery(
    async () => {
      const { apiClient } = await import('@/lib/api');
      return apiClient.getWatchlist();
    },
    [],
    {
      showErrorToast: true,
      errorMessage: 'İzleme listesi yüklenirken hata oluştu',
    }
  );
}

export function useNotifications() {
  return useApiQuery(
    async () => {
      const { apiClient } = await import('@/lib/api');
      return apiClient.getNotifications();
    },
    [],
    {
      showErrorToast: true,
      errorMessage: 'Bildirimler yüklenirken hata oluştu',
    }
  );
}

export function useDashboardStats() {
  return useApiQuery(
    async () => {
      const { apiClient } = await import('@/lib/api');
      return apiClient.getDashboardStats();
    },
    [],
    {
      showErrorToast: true,
      errorMessage: 'Dashboard verileri yüklenirken hata oluştu',
    }
  );
}

// Mutation hooks
export function useCreateAuction() {
  return useApiMutation(
    async (auctionData) => {
      const { apiClient } = await import('@/lib/api');
      return apiClient.createAuction(auctionData);
    },
    {
      successMessage: 'Açık artırma başarıyla oluşturuldu',
      errorMessage: 'Açık artırma oluşturulurken hata oluştu',
    }
  );
}

export function usePlaceBid() {
  return useApiMutation(
    async ({ auctionId, amount }: { auctionId: string; amount: number }) => {
      const { apiClient } = await import('@/lib/api');
      return apiClient.placeBid(auctionId, amount);
    },
    {
      successMessage: 'Teklif başarıyla verildi',
      errorMessage: 'Teklif verilirken hata oluştu',
    }
  );
}

export function useAddToWatchlist() {
  return useApiMutation(
    async (auctionId: string) => {
      const { apiClient } = await import('@/lib/api');
      return apiClient.addToWatchlist(auctionId);
    },
    {
      successMessage: 'İzleme listesine eklendi',
      errorMessage: 'İzleme listesine eklenirken hata oluştu',
    }
  );
}

export function useRemoveFromWatchlist() {
  return useApiMutation(
    async (auctionId: string) => {
      const { apiClient } = await import('@/lib/api');
      return apiClient.removeFromWatchlist(auctionId);
    },
    {
      successMessage: 'İzleme listesinden kaldırıldı',
      errorMessage: 'İzleme listesinden kaldırılırken hata oluştu',
    }
  );
}

export function useUpdateProfile() {
  return useApiMutation(
    async (profileData: any) => {
      const { apiClient } = await import('@/lib/api');
      return apiClient.updateProfile(profileData);
    },
    {
      successMessage: 'Profil başarıyla güncellendi',
      errorMessage: 'Profil güncellenirken hata oluştu',
    }
  );
}

export function useChangePassword() {
  return useApiMutation(
    async ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) => {
      const { apiClient } = await import('@/lib/api');
      return apiClient.changePassword(currentPassword, newPassword);
    },
    {
      successMessage: 'Şifre başarıyla değiştirildi',
      errorMessage: 'Şifre değiştirilirken hata oluştu',
    }
  );
}

export function useUploadImage() {
  return useApiMutation(
    async (file: File) => {
      const { apiClient } = await import('@/lib/api');
      return apiClient.uploadImage(file);
    },
    {
      successMessage: 'Resim başarıyla yüklendi',
      errorMessage: 'Resim yüklenirken hata oluştu',
    }
  );
}

export function useUploadImages() {
  return useApiMutation(
    async (files: File[]) => {
      const { apiClient } = await import('@/lib/api');
      return apiClient.uploadImages(files);
    },
    {
      successMessage: 'Resimler başarıyla yüklendi',
      errorMessage: 'Resimler yüklenirken hata oluştu',
    }
  );
}