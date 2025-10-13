import { useState, useEffect, useRef, useCallback } from 'react';

// Debounce hook - delays execution until after delay has passed since last call
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Debounced callback hook
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const debouncedCallback = useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    }) as T,
    [delay]
  );

  return debouncedCallback;
}

// Throttle hook - limits execution to at most once per delay period
export function useThrottle<T>(value: T, delay: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastExecuted = useRef<number>(Date.now());

  useEffect(() => {
    const handler = setTimeout(() => {
      const now = Date.now();
      if (now >= lastExecuted.current + delay) {
        setThrottledValue(value);
        lastExecuted.current = now;
      }
    }, delay - (Date.now() - lastExecuted.current));

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return throttledValue;
}

// Throttled callback hook
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const callbackRef = useRef(callback);
  const lastExecuted = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const throttledCallback = useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now();

      if (now - lastExecuted.current >= delay) {
        callbackRef.current(...args);
        lastExecuted.current = now;
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          callbackRef.current(...args);
          lastExecuted.current = Date.now();
        }, delay - (now - lastExecuted.current));
      }
    }) as T,
    [delay]
  );

  return throttledCallback;
}

// Search hook with debouncing
export function useDebouncedSearch(
  searchFunction: (query: string) => Promise<any>,
  delay: number = 300
) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedQuery = useDebounce(query, delay);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    const performSearch = async () => {
      try {
        setLoading(true);
        setError(null);
        const searchResults = await searchFunction(debouncedQuery);
        setResults(searchResults);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed');
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [debouncedQuery, searchFunction]);

  return {
    query,
    setQuery,
    results,
    loading,
    error,
    clearResults: () => {
      setResults([]);
      setQuery('');
      setError(null);
    },
  };
}

// Auto-save hook with debouncing
export function useAutoSave<T>(
  data: T,
  saveFunction: (data: T) => Promise<void>,
  delay: number = 2000
) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const debouncedSave = useDebouncedCallback(
    async (dataToSave: T) => {
      try {
        setIsSaving(true);
        setError(null);
        await saveFunction(dataToSave);
        setLastSaved(new Date());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Save failed');
      } finally {
        setIsSaving(false);
      }
    },
    delay
  );

  useEffect(() => {
    if (data) {
      debouncedSave(data);
    }
  }, [data, debouncedSave]);

  const forceSave = useCallback(async () => {
    try {
      setIsSaving(true);
      setError(null);
      await saveFunction(data);
      setLastSaved(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setIsSaving(false);
    }
  }, [data, saveFunction]);

  return {
    isSaving,
    lastSaved,
    error,
    forceSave,
  };
}

// Scroll throttling hook
export function useThrottledScroll(
  callback: (scrollY: number) => void,
  delay: number = 100
) {
  const throttledCallback = useThrottledCallback(callback, delay);

  useEffect(() => {
    const handleScroll = () => {
      throttledCallback(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [throttledCallback]);
}

// Resize throttling hook
export function useThrottledResize(
  callback: (width: number, height: number) => void,
  delay: number = 250
) {
  const throttledCallback = useThrottledCallback(callback, delay);

  useEffect(() => {
    const handleResize = () => {
      throttledCallback(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    
    // Call immediately with current size
    throttledCallback(window.innerWidth, window.innerHeight);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [throttledCallback]);
}

// Input validation with debouncing
export function useDebouncedValidation<T>(
  value: T,
  validator: (value: T) => string | null,
  delay: number = 500
) {
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const debouncedValue = useDebounce(value, delay);

  useEffect(() => {
    if (value !== debouncedValue) {
      setIsValidating(true);
      return;
    }

    setIsValidating(false);
    const validationError = validator(debouncedValue);
    setError(validationError);
  }, [value, debouncedValue, validator]);

  return {
    error,
    isValidating,
    isValid: !error && !isValidating,
  };
}