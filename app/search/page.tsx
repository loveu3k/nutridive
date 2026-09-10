'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  Loader2,
  Pill,
  Building2,
  LayoutGrid,
  List,
  ArrowUpDown,
  X,
  ArrowRight,
} from 'lucide-react';
import { getCategoryBadgeClass } from '@/lib/utils';
import CompareButton from '@/components/CompareButton';

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
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [sortOrder, setSortOrder] = useState<'relevance' | 'name' | 'mal'>('relevance');
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
          `/api/search?q=${encodeURIComponent(query)}&limit=60${catParam}`
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

    const timer = setTimeout(doSearch, 200);
    return () => clearTimeout(timer);
  }, [query, selectedCategory]);

  const sortedResults = useMemo(() => {
    if (sortOrder === 'relevance') return results;
    const sorted = [...results];
    if (sortOrder === 'name') {
      sorted.sort((a, b) => a.product_name.localeCompare(b.product_name));
    } else if (sortOrder === 'mal') {
      sorted.sort((a, b) => a.reg_no.localeCompare(b.reg_no));
    }
    return sorted;
  }, [results, sortOrder]);

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
        <div className="mt-6 relative flex items-center shadow-xs rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 focus-within:border-teal-500 transition-all overflow-hidden">
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

      {/* Toolbar & View Controls */}
      <div className="mt-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-zinc-500">
          <div>
            {isLoading ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-600" />
                Searching NPRA database...
              </span>
            ) : query.trim() ? (
              <span>
                Found <strong className="text-zinc-800 dark:text-zinc-200">{sortedResults.length}</strong>{' '}
                matching products for &ldquo;{query}&rdquo;
              </span>
            ) : (
              <span>Enter a MAL code, product brand, or generic molecule name to search</span>
            )}
          </div>

          {sortedResults.length > 0 && (
            <div className="flex items-center gap-3 self-end sm:self-auto">
              {/* Sort */}
              <div className="flex items-center gap-1.5">
                <ArrowUpDown className="w-3.5 h-3.5" />
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as any)}
                  aria-label="Sort search results"
                  className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs rounded-lg px-2 py-1 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-teal-500"
                >
                  <option value="relevance">Relevance</option>
                  <option value="name">Name (A-Z)</option>
                  <option value="mal">MAL Number</option>
                </select>
              </div>

              {/* View Switcher */}
              <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 rounded-lg p-0.5 border border-zinc-200 dark:border-zinc-800">
                <button
                  onClick={() => setViewMode('table')}
                  title="Table View (Pharmacist)"
                  className={`p-1.5 rounded-md text-xs transition-colors flex items-center gap-1 ${
                    viewMode === 'table'
                      ? 'bg-white dark:bg-zinc-800 text-teal-600 dark:text-teal-400 shadow-xs font-semibold'
                      : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Table</span>
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  title="Card View"
                  className={`p-1.5 rounded-md text-xs transition-colors flex items-center gap-1 ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-zinc-800 text-teal-600 dark:text-teal-400 shadow-xs font-semibold'
                      : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Cards</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {sortedResults.length > 0 ? (
          viewMode === 'table' ? (
            <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50/80 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center">Compare</th>
                    <th className="py-3 px-4 font-mono">MAL Registration</th>
                    <th className="py-3 px-4">Product Brand Name</th>
                    <th className="py-3 px-4">Active Molecule / Generic</th>
                    <th className="py-3 px-4">Classification</th>
                    <th className="py-3 px-4">Registration Holder</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {sortedResults.map((item) => {
                    const badge = getCategoryBadgeClass(item.category_code);
                    return (
                      <tr
                        key={item.slug}
                        className="even:bg-zinc-50/40 dark:even:bg-zinc-900/20 hover:bg-teal-50/30 dark:hover:bg-zinc-900/60 transition-colors group"
                      >
                        <td className="py-3 px-4 text-center">
                          <CompareButton
                            item={{
                              slug: item.slug,
                              reg_no: item.reg_no,
                              product_name: item.product_name,
                              category_code: item.category_code,
                              generic_name: item.generic_name,
                              holder: item.holder,
                            }}
                            variant="checkbox"
                          />
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-[11px]">
                            {item.reg_no}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Link
                            href={`/mal/${item.slug}`}
                            className="font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors line-clamp-1"
                          >
                            {item.product_name}
                          </Link>
                        </td>
                        <td className="py-3 px-4 text-teal-700 dark:text-teal-400 font-medium">
                          {item.generic_name}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${badge.bg} ${badge.text} ${badge.border}`}
                          >
                            {badge.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-zinc-500 dark:text-zinc-400 max-w-[200px] truncate" title={item.holder}>
                          {item.holder}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <Link
                            href={`/mal/${item.slug}`}
                            className="inline-flex items-center gap-1 text-teal-600 dark:text-teal-400 font-semibold hover:underline"
                          >
                            <span>Verify</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedResults.map((item) => {
                const badge = getCategoryBadgeClass(item.category_code);
                return (
                  <div
                    key={item.slug}
                    className="group rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 sm:p-5 transition-all hover:border-teal-500 hover:shadow-md flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                            {item.reg_no}
                          </span>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${badge.bg} ${badge.text} ${badge.border}`}
                          >
                            {badge.label}
                          </span>
                        </div>

                        <CompareButton
                          item={{
                            slug: item.slug,
                            reg_no: item.reg_no,
                            product_name: item.product_name,
                            category_code: item.category_code,
                            generic_name: item.generic_name,
                            holder: item.holder,
                          }}
                          variant="checkbox"
                        />
                      </div>

                      <Link
                        href={`/mal/${item.slug}`}
                        className="block font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 line-clamp-2 transition-colors"
                      >
                        {item.product_name}
                      </Link>

                      <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">
                        <span className="text-teal-700 dark:text-teal-400 font-medium">
                          {item.generic_name}
                        </span>
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
                      <div className="flex items-center gap-1 truncate max-w-[180px]" title={item.holder}>
                        <Building2 className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
                        <span className="truncate">{item.holder}</span>
                      </div>
                      <Link
                        href={`/mal/${item.slug}`}
                        className="text-teal-600 dark:text-teal-400 font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center gap-0.5"
                      >
                        <span>View MAL</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : query.trim() && !isLoading ? (
          <div className="p-12 text-center rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950">
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

