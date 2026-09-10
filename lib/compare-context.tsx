'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface CompareItem {
  slug: string;
  reg_no: string;
  product_name: string;
  category_code?: string;
  generic_name?: string;
  holder?: string;
  dosage?: string;
}

interface CompareContextType {
  compareList: CompareItem[];
  addToCompare: (item: CompareItem) => boolean;
  removeFromCompare: (slug: string) => void;
  toggleCompare: (item: CompareItem) => void;
  clearCompare: () => void;
  isInCompare: (slug: string) => boolean;
  isCompareOpen: boolean;
  openCompare: () => void;
  closeCompare: () => void;
  toastMessage: string | null;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

const STORAGE_KEY = 'nutridive_compare_items';
const MAX_COMPARE_ITEMS = 4;

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [compareList, setCompareList] = useState<CompareItem[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Restore from sessionStorage on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setCompareList(parsed.slice(0, MAX_COMPARE_ITEMS));
        }
      }
    } catch {
      // Ignore sessionStorage errors (e.g. incognito)
    }
  }, []);

  // Save to sessionStorage on changes
  const saveToStorage = useCallback((items: CompareItem[]) => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore
    }
  }, []);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3000);
  }, []);

  const addToCompare = useCallback(
    (item: CompareItem): boolean => {
      if (compareList.some((p) => p.slug.toLowerCase() === item.slug.toLowerCase())) {
        return false;
      }
      if (compareList.length >= MAX_COMPARE_ITEMS) {
        showToast(`Comparison limited to maximum ${MAX_COMPARE_ITEMS} products.`);
        return false;
      }
      const updated = [...compareList, item];
      setCompareList(updated);
      saveToStorage(updated);
      showToast(`Added "${item.product_name}" to comparison (${updated.length}/${MAX_COMPARE_ITEMS}).`);
      return true;
    },
    [compareList, saveToStorage, showToast]
  );

  const removeFromCompare = useCallback(
    (slug: string) => {
      const updated = compareList.filter((p) => p.slug.toLowerCase() !== slug.toLowerCase());
      setCompareList(updated);
      saveToStorage(updated);
      if (updated.length === 0) {
        setIsCompareOpen(false);
      }
    },
    [compareList, saveToStorage]
  );

  const toggleCompare = useCallback(
    (item: CompareItem) => {
      const exists = compareList.some((p) => p.slug.toLowerCase() === item.slug.toLowerCase());
      if (exists) {
        removeFromCompare(item.slug);
      } else {
        addToCompare(item);
      }
    },
    [compareList, addToCompare, removeFromCompare]
  );

  const clearCompare = useCallback(() => {
    setCompareList([]);
    saveToStorage([]);
    setIsCompareOpen(false);
  }, [saveToStorage]);

  const isInCompare = useCallback(
    (slug: string) => {
      return compareList.some((p) => p.slug.toLowerCase() === slug.toLowerCase());
    },
    [compareList]
  );

  const openCompare = useCallback(() => {
    if (compareList.length >= 2) {
      setIsCompareOpen(true);
    } else {
      showToast('Please select at least 2 products to compare.');
    }
  }, [compareList.length, showToast]);

  const closeCompare = useCallback(() => {
    setIsCompareOpen(false);
  }, []);

  return (
    <CompareContext.Provider
      value={{
        compareList,
        addToCompare,
        removeFromCompare,
        toggleCompare,
        clearCompare,
        isInCompare,
        isCompareOpen,
        openCompare,
        closeCompare,
        toastMessage,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
}
