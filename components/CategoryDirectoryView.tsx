'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  LayoutGrid,
  List,
  Building2,
  ArrowUpDown,
  X,
  Pill,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import { getCategoryBadgeClass, slugify } from '@/lib/utils';
import type { SearchIndexItem } from '@/lib/types';
import CompareButton from '@/components/CompareButton';

interface CategoryDirectoryViewProps {
  initialItems: SearchIndexItem[];
  categoryCode: string;
  categorySlug: string;
  categoryName: string;
}

export function CategoryDirectoryView({
  initialItems,
  categoryCode,
  categorySlug,
  categoryName,
}: CategoryDirectoryViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [sortOrder, setSortOrder] = useState<'az' | 'za' | 'mal'>('az');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 30;

  const badge = getCategoryBadgeClass(categoryCode);

  // Filter & Sort
  const filteredItems = useMemo(() => {
    let items = initialItems;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      items = items.filter((item) => {
        // [slug, reg_no, name, catCode, genericName, holder]
        return (
          item[1].toLowerCase().includes(q) ||
          item[2].toLowerCase().includes(q) ||
          item[4].toLowerCase().includes(q) ||
          item[5].toLowerCase().includes(q)
        );
      });
    }

    const sorted = [...items];
    if (sortOrder === 'az') {
      sorted.sort((a, b) => a[2].localeCompare(b[2]));
    } else if (sortOrder === 'za') {
      sorted.sort((a, b) => b[2].localeCompare(a[2]));
    } else if (sortOrder === 'mal') {
      sorted.sort((a, b) => a[1].localeCompare(b[1]));
    }

    return sorted;
  }, [initialItems, searchQuery, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const offset = (validCurrentPage - 1) * pageSize;
  const paginatedItems = filteredItems.slice(offset, offset + pageSize);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const getBorderAccent = (code: string) => {
    switch (code) {
      case 'A':
        return 'border-l-blue-500';
      case 'X':
        return 'border-l-emerald-500';
      case 'N':
        return 'border-l-purple-500';
      case 'T':
        return 'border-l-amber-500';
      default:
        return 'border-l-teal-500';
    }
  };

  return (
    <div className="space-y-5">
      {/* Controls Bar: Filter, Sort, View Toggle */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-3.5 sm:p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search within Category */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={`Filter in ${categoryName} (name, MAL, ingredient)...`}
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-teal-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => handleSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Right Tools: Sort & View Mode Toggle */}
          <div className="flex items-center gap-2.5 self-end md:self-auto">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                aria-label="Sort products by"
                className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs rounded-lg px-2.5 py-1.5 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-teal-500"
              >
                <option value="az">Name: A to Z</option>
                <option value="za">Name: Z to A</option>
                <option value="mal">MAL Number</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 rounded-lg p-0.5 border border-zinc-200 dark:border-zinc-800">
              <button
                onClick={() => setViewMode('table')}
                title="Table View (Pharmacist Optimized)"
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
                title="Grid Card View"
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
        </div>

        {/* Count feedback */}
        <div className="mt-2.5 pt-2.5 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
          <div>
            Showing <strong className="text-zinc-800 dark:text-zinc-200">{filteredItems.length.toLocaleString()}</strong> verified products
            {searchQuery && ` matching "${searchQuery}"`}
          </div>
          <div>
            Page {validCurrentPage} of {totalPages}
          </div>
        </div>
      </div>

      {/* Results View */}
      {paginatedItems.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <Pill className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            No matching registered products found
          </p>
          <p className="text-xs text-zinc-500 mt-1">
            Try adjusting your search query or clear the filter.
          </p>
          <button
            onClick={() => handleSearchChange('')}
            className="mt-3 px-3 py-1.5 text-xs font-medium rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors"
          >
            Clear Filter
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* Pharmacist Clinical Table View with Zebra Striping */
        <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50/80 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4 font-mono">MAL Registration</th>
                <th className="py-3 px-4">Product Brand Name</th>
                <th className="py-3 px-4">Active Molecule / Generic</th>
                <th className="py-3 px-4">Product Registration Holder</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {paginatedItems.map(([slug, reg_no, name, catCode, genericName, holder]) => {
                const genSlug = slugify(genericName);
                const hSlug = slugify(holder);
                return (
                  <tr
                    key={slug}
                    className="even:bg-zinc-50/40 dark:even:bg-zinc-900/20 hover:bg-teal-50/30 dark:hover:bg-zinc-900/60 transition-colors group"
                  >
                    <td className="py-3 px-4 whitespace-nowrap">
                      <Link
                        href={`/mal/${slug}`}
                        className="font-mono font-semibold text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 px-2 py-0.5 rounded text-[11px] transition-colors inline-block"
                      >
                        {reg_no}
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      <Link
                        href={`/mal/${slug}`}
                        className="font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors line-clamp-1"
                      >
                        {name}
                      </Link>
                    </td>
                    <td className="py-3 px-4 font-medium">
                      <Link
                        href={`/generic/${genSlug}`}
                        className="text-teal-600 dark:text-teal-400 hover:underline inline-block"
                      >
                        {genericName}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400 max-w-[240px] truncate" title={holder}>
                      {holder ? (
                        <Link
                          href={`/holder/${hSlug}`}
                          className="hover:underline hover:text-teal-600 dark:hover:text-teal-400"
                        >
                          {holder}
                        </Link>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Card Grid View with Category Border Accent */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedItems.map(([slug, reg_no, name, catCode, genericName, holder]) => {
            const borderAccent = getBorderAccent(catCode);
            return (
              <div
                key={slug}
                className={`group rounded-2xl border border-zinc-200 dark:border-zinc-800 border-l-4 ${borderAccent} bg-white dark:bg-zinc-950 p-4 sm:p-5 transition-all hover:shadow-md flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                      {reg_no}
                    </span>
                    <CompareButton
                      item={{
                        slug,
                        reg_no,
                        product_name: name,
                        category_code: catCode,
                        generic_name: genericName,
                        holder,
                      }}
                      variant="checkbox"
                    />
                  </div>

                  <Link
                    href={`/mal/${slug}`}
                    className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 line-clamp-2 transition-colors"
                  >
                    {name}
                  </Link>

                  <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">
                    <span className="text-teal-700 dark:text-teal-400 font-medium">{genericName}</span>
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
                  <div className="flex items-center gap-1 truncate max-w-[170px]" title={holder}>
                    <Building2 className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
                    <span className="truncate">{holder}</span>
                  </div>
                  <Link
                    href={`/mal/${slug}`}
                    className="text-teal-600 dark:text-teal-400 font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center gap-0.5"
                  >
                    <span>Detail</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4">
          <button
            onClick={() => {
              setCurrentPage((p) => Math.max(1, p - 1));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            disabled={validCurrentPage === 1}
            className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Previous
          </button>

          <div className="text-xs font-mono text-zinc-500">
            Page {validCurrentPage} of {totalPages}
          </div>

          <button
            onClick={() => {
              setCurrentPage((p) => Math.min(totalPages, p + 1));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            disabled={validCurrentPage >= totalPages}
            className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            Next
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
