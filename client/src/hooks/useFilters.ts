import { useState, useEffect, useCallback } from "react";
import { useLocation, useSearch } from "wouter";

interface UseFiltersOptions<T extends Record<string, string>> {
  defaultFilters: T;
  syncWithUrl?: boolean;
}

export function useFilters<T extends Record<string, string>>(
  options: UseFiltersOptions<T>
) {
  const { defaultFilters, syncWithUrl = false } = options;
  const [, setLocation] = useLocation();
  const searchParams = useSearch();

  // Initialize filters from URL if syncWithUrl is enabled
  const [filters, setFilters] = useState<T>(() => {
    if (syncWithUrl && searchParams) {
      const params = new URLSearchParams(searchParams);
      const urlFilters = { ...defaultFilters };
      Object.keys(defaultFilters).forEach((key) => {
        const value = params.get(key);
        if (value) {
          urlFilters[key as keyof T] = value as T[keyof T];
        }
      });
      return urlFilters;
    }
    return defaultFilters;
  });

  // Sync filters to URL when they change
  useEffect(() => {
    if (syncWithUrl) {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== defaultFilters[key as keyof T]) {
          params.set(key, value);
        }
      });
      const search = params.toString();
      setLocation(`?${search}`, { replace: true });
    }
  }, [filters, syncWithUrl, defaultFilters, setLocation]);

  const setFilter = useCallback(
    <K extends keyof T>(key: K, value: T[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, [defaultFilters]);

  return {
    filters,
    setFilter,
    setFilters,
    resetFilters,
  };
}
