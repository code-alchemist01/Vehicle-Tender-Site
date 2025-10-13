import { useState, useEffect, useCallback } from 'react';

type SetValue<T> = T | ((val: T) => T);

interface UseLocalStorageReturn<T> {
  value: T;
  setValue: (value: SetValue<T>) => void;
  removeValue: () => void;
  loading: boolean;
  error: string | null;
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): UseLocalStorageReturn<T> {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get value from localStorage on mount
  useEffect(() => {
    try {
      setLoading(true);
      setError(null);

      if (typeof window === 'undefined') {
        setStoredValue(initialValue);
        setLoading(false);
        return;
      }

      const item = window.localStorage.getItem(key);
      
      if (item === null) {
        setStoredValue(initialValue);
      } else {
        try {
          const parsedItem = JSON.parse(item);
          setStoredValue(parsedItem);
        } catch (parseError) {
          console.warn(`Error parsing localStorage key "${key}":`, parseError);
          setStoredValue(initialValue);
          // Remove invalid item
          window.localStorage.removeItem(key);
        }
      }
    } catch (err) {
      console.error(`Error reading localStorage key "${key}":`, err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setStoredValue(initialValue);
    } finally {
      setLoading(false);
    }
  }, [key, initialValue]);

  // Set value to localStorage
  const setValue = useCallback(
    (value: SetValue<T>) => {
      try {
        setError(null);
        
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);

        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (err) {
        console.error(`Error setting localStorage key "${key}":`, err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    },
    [key, storedValue]
  );

  // Remove value from localStorage
  const removeValue = useCallback(() => {
    try {
      setError(null);
      setStoredValue(initialValue);

      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (err) {
      console.error(`Error removing localStorage key "${key}":`, err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, [key, initialValue]);

  return {
    value: storedValue,
    setValue,
    removeValue,
    loading,
    error,
  };
}

// Specialized hooks for common use cases
export function useSearchHistory() {
  return useLocalStorage<string[]>('search-history', []);
}

export function useRecentlyViewed() {
  return useLocalStorage<Array<{ id: string; title: string; image: string; viewedAt: string }>>('recently-viewed', []);
}

export function useUserPreferences() {
  return useLocalStorage<{
    theme: 'light' | 'dark' | 'system';
    language: 'tr' | 'en';
    currency: 'TRY' | 'USD' | 'EUR';
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    privacy: {
      showProfile: boolean;
      showBids: boolean;
      showWatchlist: boolean;
    };
  }>('user-preferences', {
    theme: 'system',
    language: 'tr',
    currency: 'TRY',
    notifications: {
      email: true,
      push: true,
      sms: false,
    },
    privacy: {
      showProfile: true,
      showBids: false,
      showWatchlist: false,
    },
  });
}

export function useFilterPreferences() {
  return useLocalStorage<{
    defaultSortBy: string;
    defaultFilters: {
      priceRange: [number, number];
      yearRange: [number, number];
      mileageRange: [number, number];
      fuelTypes: string[];
      transmissions: string[];
      conditions: string[];
    };
  }>('filter-preferences', {
    defaultSortBy: 'endTime',
    defaultFilters: {
      priceRange: [0, 1000000],
      yearRange: [2000, new Date().getFullYear()],
      mileageRange: [0, 500000],
      fuelTypes: [],
      transmissions: [],
      conditions: [],
    },
  });
}

export function useDraftAuction() {
  return useLocalStorage<{
    title: string;
    description: string;
    brand: string;
    model: string;
    year: number | null;
    mileage: number | null;
    fuelType: string;
    transmission: string;
    condition: string;
    location: string;
    startingBid: number | null;
    reservePrice: number | null;
    endTime: string;
    images: string[];
    lastSaved: string;
  } | null>('draft-auction', null);
}

export function useCompareList() {
  return useLocalStorage<Array<{
    id: string;
    title: string;
    brand: string;
    model: string;
    year: number;
    price: number;
    image: string;
  }>>('compare-list', []);
}

export function useViewMode() {
  return useLocalStorage<'grid' | 'list'>('view-mode', 'grid');
}

export function useItemsPerPage() {
  return useLocalStorage<number>('items-per-page', 12);
}

// Hook for managing multiple localStorage keys
export function useMultipleLocalStorage<T extends Record<string, any>>(
  keys: Array<keyof T>,
  initialValues: T
) {
  const [values, setValues] = useState<T>(initialValues);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    const loadedValues: Partial<T> = {};
    const loadErrors: Record<string, string> = {};

    keys.forEach((key) => {
      try {
        const item = window.localStorage.getItem(key as string);
        if (item !== null) {
          loadedValues[key] = JSON.parse(item);
        } else {
          loadedValues[key] = initialValues[key];
        }
      } catch (err) {
        console.error(`Error reading localStorage key "${String(key)}":`, err);
        loadErrors[key as string] = err instanceof Error ? err.message : 'Unknown error';
        loadedValues[key] = initialValues[key];
      }
    });

    setValues({ ...initialValues, ...loadedValues } as T);
    setErrors(loadErrors);
    setLoading(false);
  }, []);

  const updateValue = useCallback(
    <K extends keyof T>(key: K, value: T[K]) => {
      try {
        setValues((prev) => ({ ...prev, [key]: value }));
        
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key as string, JSON.stringify(value));
        }
        
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[key as string];
          return newErrors;
        });
      } catch (err) {
        console.error(`Error setting localStorage key "${String(key)}":`, err);
        setErrors((prev) => ({
          ...prev,
          [key as string]: err instanceof Error ? err.message : 'Unknown error',
        }));
      }
    },
    []
  );

  const removeValue = useCallback(
    <K extends keyof T>(key: K) => {
      try {
        setValues((prev) => ({ ...prev, [key]: initialValues[key] }));
        
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(key as string);
        }
        
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[key as string];
          return newErrors;
        });
      } catch (err) {
        console.error(`Error removing localStorage key "${String(key)}":`, err);
        setErrors((prev) => ({
          ...prev,
          [key as string]: err instanceof Error ? err.message : 'Unknown error',
        }));
      }
    },
    [initialValues]
  );

  return {
    values,
    updateValue,
    removeValue,
    loading,
    errors,
  };
}