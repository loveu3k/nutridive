'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2, X, ArrowRight, ShieldCheck } from 'lucide-react';
import { getCategoryBadgeClass } from '@/lib/utils';

interface SearchResultItem {
  slug: string;
  reg_no: string;
  product_name: string;
  category_code: string;
  generic_name: string;
  holder: string;
}

export default function HomeSearchHero() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=8`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
          setIsOpen(true);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      if (results.length > 0 && results[0]) {
        router.push(`/mal/${results[0].slug}`);
      } else {
        router.push(`/search?q=${encodeURIComponent(query)}`);
      }
    }
  };

  return (
    <div ref={containerRef} className="relative w-full text-left">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center shadow-lg rounded-2xl bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 focus-within:border-teal-500 dark:focus-within:border-teal-500 transition-all overflow-hidden">
          <div className="pl-4 sm:pl-5 text-zinc-400">
            <Search className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => {
              if (results.length > 0) setIsOpen(true);
            }}
            placeholder="Search MAL number (e.g. MAL19900523AZ), medicine, or ingredient..."
            className="w-full py-4 pl-3 pr-24 sm:pr-32 text-sm sm:text-base bg-transparent text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 outline-none"
          />

          <div className="absolute right-2.5 flex items-center gap-1.5">
            {isLoading && <Loader2 className="w-4 h-4 text-zinc-400 animate-spin mr-1" />}
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1"
            >
              <span>Search</span>
              <ArrowRight className="w-3.5 h-3.5 hidden sm:inline" />
            </button>
          </div>
        </div>
      </form>

      {/* Autocomplete Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl overflow-hidden z-50 divide-y divide-zinc-100 dark:divide-zinc-900 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="p-2 space-y-1">
            {results.map((item) => {
              const badge = getCategoryBadgeClass(item.category_code);
              return (
                <div
                  key={item.slug}
                  onClick={() => {
                    setIsOpen(false);
                    router.push(`/mal/${item.slug}`);
                  }}
                  className="p-3 rounded-xl hover:bg-teal-50/70 dark:hover:bg-teal-950/40 cursor-pointer transition-colors flex items-center justify-between gap-3 group"
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
                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-teal-600 dark:group-hover:text-teal-400">
                      {item.product_name}
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                      <span className="text-teal-700 dark:text-teal-400 font-medium">
                        {item.generic_name}
                      </span>{' '}
                      • {item.holder}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 group-hover:translate-x-1 transition-all shrink-0" />
                </div>
              );
            })}
          </div>

          <div className="px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900/60 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              Direktori Bebas • Rekod Data Terbuka (data.gov.my)
            </span>
            <button
              onClick={() => {
                setIsOpen(false);
                router.push(`/search?q=${encodeURIComponent(query)}`);
              }}
              className="text-teal-600 dark:text-teal-400 font-semibold hover:underline"
            >
              View all results →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
