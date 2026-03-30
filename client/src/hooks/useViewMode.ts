import { useState, useEffect } from "react";

export type ViewMode = "grid" | "list";

interface UseViewModeOptions {
  defaultMode?: ViewMode;
  storageKey?: string;
}

export function useViewMode(options: UseViewModeOptions = {}) {
  const { defaultMode = "grid", storageKey = "viewMode" } = options;

  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    // Try to load from localStorage
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(storageKey);
      if (stored === "grid" || stored === "list") {
        return stored;
      }
    }
    return defaultMode;
  });

  useEffect(() => {
    // Persist to localStorage whenever it changes
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, viewMode);
    }
  }, [viewMode, storageKey]);

  return [viewMode, setViewMode] as const;
}
