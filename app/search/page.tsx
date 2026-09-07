'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search, Loader2, Pill, Building2, ArrowRight, ShieldCheck, X } from 'lucide-react';
import { getCategoryBadgeClass } from '@/lib/utils';
import { AdUnitSlot } from '@/components/MonetizationSlots';

interface SearchItem {
  slug: string;
  reg_no: string;
  product_name: string;
  category_code: string;
  generic_name: string;
  holder: string;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialCategory = searchParams.get('cat') || 'ALL';

  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [results, setResults] = useState<SearchItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const doSearch = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const catParam = selectedCategory !== 'ALL' ? `&cat=${selectedCategory}` : '';
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(query)}&limit=50${catParam}`
        );
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(doSearch, 150);
    return () => clearTimeout(timer);
  }, [query, selectedCategory]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="max-w-3xl mx-auto text-center space-y-3 mb-8">
        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          NPRA Pharmaceutical &amp; MAL Search
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Search over 28,170+ approved medicines, health supplements (MAL-N), and traditional herbal products (MAL-T) in Malaysia.
        </p>

        {/* Input */}
        <div className="mt-6 relative flex items-center shadow-sm rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 focus-within:border-teal-500 transition-all overflow-hidden">
          <div className="pl-4 text-zinc-400">
            <Search className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search MAL number (e.g. MAL19900523AZ), brand, or ingredient..."
            className="w-full py-3.5 pl-3 pr-12 text-sm sm:text-base bg-transparent text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 outline-none"
          />

          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 pt-3">
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
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-teal-600 text-white font-medium shadow-xs'
                  : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Ad Unit: Leaderboard Slot */}
      <AdUnitSlot slot="leaderboard" />

      {/* Status & Results */}
      <div className="mt-8 space-y-4">
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <div>
            {isLoading ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-600" />
                Searching NPRA database...
              </span>
            ) : query.trim() ? (
              <span>
                Found <strong className="text-zinc-800 dark:text-zinc-200">{results.length}</strong>{' '}
                matching products for &ldquo;{query}&rdquo;
              </span>
            ) : (
              <span>Enter a MAL code, product brand, or generic molecule name to search</span>
            )}
          </div>
        </div>

        {results.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((item) => {
              const badge = getCategoryBadgeClass(item.category_code);
              return (
                <Link
                  key={item.slug}
                  href={`/mal/${item.slug}`}
                  className="group rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 transition-all hover:border-teal-500 hover:shadow-md flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                        {item.reg_no}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${badge.bg} ${badge.text} ${badge.border}`}
                      >
                        {badge.label}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 line-clamp-2 transition-colors">
                      {item.product_name}
                    </h3>

                    <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">
                      <span className="text-teal-700 dark:text-teal-400 font-medium">
                        {item.generic_name}
                      </span>
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
                    <div className="flex items-center gap-1 truncate max-w-[190px]" title={item.holder}>
                      <Building2 className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
                      <span className="truncate">{item.holder}</span>
                    </div>
                    <span className="text-teal-600 dark:text-teal-400 font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center">
                      View MAL →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : query.trim() && !isLoading ? (
          <div className="p-12 text-center rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800">
            <Pill className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
            <p className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
              No registered products found
            </p>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
              Please double check the spelling, search by the active ingredient (e.g. Paracetamol), or remove dosage numbers.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
