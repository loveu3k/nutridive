'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Pill, ExternalLink, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import { getCategoryBadgeClass } from '@/lib/utils';

interface SearchResultItem {
  slug: string;
  reg_no: string;
  product_name: string;
  category_code: string;
  generic_name: string;
  holder: string;
}

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const catParam = selectedCategory !== 'ALL' ? `&cat=${selectedCategory}` : '';
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=15${catParam}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
          setSelectedIndex(0);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [query, selectedCategory]);

  const handleSelect = useCallback(
    (item: SearchResultItem) => {
      onClose();
      router.push(`/mal/${item.slug}`);
    },
    [onClose, router]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      } else if (query.trim()) {
        onClose();
        router.push(`/search?q=${encodeURIComponent(query)}`);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[80vh] transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-zinc-200 dark:border-zinc-800 gap-3">
          <Search className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search MAL number (e.g. MAL19900523AZ), product name, or ingredient..."
            className="flex-1 bg-transparent text-sm sm:text-base outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 font-sans"
          />
          {isLoading ? (
            <Loader2 className="w-4 h-4 text-zinc-400 animate-spin shrink-0" />
          ) : query ? (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-block text-[10px] font-mono text-zinc-400 border border-zinc-200 dark:border-zinc-800 rounded px-1.5 py-0.5">
              ESC
            </kbd>
          )}
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/70 dark:bg-zinc-900/40 overflow-x-auto text-xs">
          {[
            { id: 'ALL', label: 'All Categories' },
            { id: 'A', label: 'Prescription (MAL-A)' },
            { id: 'X', label: 'OTC (MAL-X)' },
            { id: 'N', label: 'Supplement (MAL-N)' },
            { id: 'T', label: 'Traditional (MAL-T)' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-teal-600 text-white font-medium shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-zinc-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 divide-y divide-zinc-100 dark:divide-zinc-900">
          {query.trim() === '' ? (
            <div className="p-8 text-center">
              <Pill className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mx-auto mb-2" />
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Malaysian Pharmaceutical &amp; Health Product Search
              </p>
              <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                Search 28,170+ approved Malaysian medicines by MAL number, generic molecule, brand, or holder.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-1.5 text-xs text-zinc-500">
                <span className="text-zinc-400">Popular:</span>
                {['Paracetamol', 'Atenolol', 'Metformin', 'Amoxicillin', 'MAL19900523AZ'].map(
                  (sample) => (
                    <button
                      key={sample}
                      onClick={() => setQuery(sample)}
                      className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-teal-50 dark:hover:bg-teal-950/40 text-zinc-700 dark:text-zinc-300 font-mono text-[11px] transition-colors"
                    >
                      {sample}
                    </button>
                  )
                )}
              </div>
            </div>
          ) : results.length === 0 && !isLoading ? (
            <div className="p-8 text-center">
              <p className="text-sm text-zinc-700 dark:text-zinc-300 font-medium">
                No registered products found for &ldquo;{query}&rdquo;
              </p>
              <p className="text-xs text-zinc-400 mt-1">
                Check spelling, try the pure molecule name, or search without dosage numbers.
              </p>
            </div>
          ) : (
            results.map((item, idx) => {
              const badge = getCategoryBadgeClass(item.category_code);
              const isSelected = idx === selectedIndex;

              return (
                <div
                  key={item.slug}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`p-3 rounded-xl cursor-pointer transition-colors flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200/60 dark:border-teal-800/60'
                      : 'hover:bg-zinc-50 dark:hover:bg-zinc-900/60'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-semibold px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                        {item.reg_no}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${badge.bg} ${badge.text} ${badge.border}`}
                      >
                        {badge.label}
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                      {item.product_name}
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                      <span className="text-teal-700 dark:text-teal-400 font-medium">
                        {item.generic_name}
                      </span>{' '}
                      • {item.holder}
                    </p>
                  </div>

                  <ArrowRight
                    className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform ${
                      isSelected ? 'translate-x-1 text-teal-600 dark:text-teal-400' : 'opacity-0'
                    }`}
                  />
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900/60 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>Open Regulatory Records (data.gov.my) • 28,170+ Products</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 font-mono text-[10px]">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
        </div>
      </div>
    </div>
  );
}
