'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  LayoutGrid,
  List,
  Building2,
  Filter,
  ArrowUpDown,
  X,
  Pill,
  ShieldCheck,
} from 'lucide-react';
import { getCategoryBadgeClass } from '@/lib/utils';
import type { ProductSummary } from '@/lib/types';

interface GenericHubProductViewProps {
  products: ProductSummary[];
  moleculeName: string;
}

export function GenericHubProductView({
  products,
  moleculeName,
}: GenericHubProductViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selectedDosage, setSelectedDosage] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [sortOrder, setSortOrder] = useState<'name' | 'dosage' | 'holder'>('name');

  // Extract unique dosages
  const availableDosages = useMemo(() => {
    const dosages = new Set<string>();
    products.forEach((p) => {
      if (p.dosage && p.dosage.trim()) {
        dosages.add(p.dosage.trim());
      }
    });
    return Array.from(dosages).sort();
  }, [products]);

  // Extract unique categories present in this molecule
  const availableCategories = useMemo(() => {
    const cats = new Map<string, string>();
    products.forEach((p) => {
      if (p.category && p.category.code) {
        cats.set(p.category.code, p.category.short || p.category.name);
      }
    });
    return Array.from(cats.entries());
  }, [products]);

  // Filter & Sort
  const filteredProducts = useMemo(() => {
    let result = products;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.product_name.toLowerCase().includes(q) ||
          p.reg_no.toLowerCase().includes(q) ||
          p.holder.toLowerCase().includes(q) ||
          (p.dosage && p.dosage.toLowerCase().includes(q))
      );
    }

    // Dosage filter
    if (selectedDosage !== 'ALL') {
      result = result.filter((p) => p.dosage && p.dosage.trim() === selectedDosage);
    }

    // Category filter
    if (selectedCategory !== 'ALL') {
      result = result.filter((p) => p.category.code === selectedCategory);
    }

    // Sorting
    const sorted = [...result];
    if (sortOrder === 'name') {
      sorted.sort((a, b) => a.product_name.localeCompare(b.product_name));
    } else if (sortOrder === 'dosage') {
      sorted.sort((a, b) => (a.dosage || '').localeCompare(b.dosage || ''));
    } else if (sortOrder === 'holder') {
      sorted.sort((a, b) => a.holder.localeCompare(b.holder));
    }

    return sorted;
  }, [products, searchQuery, selectedDosage, selectedCategory, sortOrder]);

  return (
    <div className="space-y-6">
      {/* Interactive Controls Toolbar */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Brand / Holder */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${moleculeName} brands or holders...`}
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-teal-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filters: Dosage, Category, Sort, View */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Dosage Strength Dropdown */}
            {availableDosages.length > 1 && (
              <select
                value={selectedDosage}
                onChange={(e) => setSelectedDosage(e.target.value)}
                aria-label="Filter by dosage strength"
                className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs rounded-lg px-2.5 py-1.5 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-teal-500"
              >
                <option value="ALL">All Strengths ({availableDosages.length})</option>
                {availableDosages.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            )}

            {/* Category Filter */}
            {availableCategories.length > 1 && (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                aria-label="Filter by category"
                className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs rounded-lg px-2.5 py-1.5 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-teal-500"
              >
                <option value="ALL">All Schedules</option>
                {availableCategories.map(([code, name]) => (
                  <option key={code} value={code}>
                    {name}
                  </option>
                ))}
              </select>
            )}

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                aria-label="Sort products by"
                className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs rounded-lg px-2.5 py-1.5 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-teal-500"
              >
                <option value="name">Brand (A-Z)</option>
                <option value="dosage">Strength / Dosage</option>
                <option value="holder">Registration Holder</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 rounded-lg p-0.5 border border-zinc-200 dark:border-zinc-800 ml-auto lg:ml-0">
              <button
                onClick={() => setViewMode('table')}
                title="Clinical Table View"
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
                title="Cards View"
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

        {/* Results Feedback */}
        <div className="mt-2.5 pt-2.5 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
          <div>
            Showing <strong className="text-zinc-800 dark:text-zinc-200">{filteredProducts.length}</strong> of {products.length} registered brands
            {selectedDosage !== 'ALL' && ` • Strength: ${selectedDosage}`}
          </div>
          {(searchQuery || selectedDosage !== 'ALL' || selectedCategory !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedDosage('ALL');
                setSelectedCategory('ALL');
              }}
              className="text-teal-600 dark:text-teal-400 hover:underline font-medium"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Content Rendering: Table or Grid */}
      {filteredProducts.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <Pill className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            No matching brand formulations found
          </p>
          <p className="text-xs text-zinc-500 mt-1">
            Try resetting your strength or search criteria.
          </p>
        </div>
      ) : viewMode === 'table' ? (
        /* Clinical Pharmacist Comparison Table */
        <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4 font-mono">MAL Reg No</th>
                <th className="py-3 px-4">Brand Formulation Name</th>
                <th className="py-3 px-4">Strength / Dosage</th>
                <th className="py-3 px-4">Classification</th>
                <th className="py-3 px-4">Registration Holder</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
              {filteredProducts.map((p) => {
                const badge = getCategoryBadgeClass(p.category.code);
                return (
                  <tr
                    key={p.slug}
                    className="hover:bg-teal-50/40 dark:hover:bg-zinc-900/60 transition-colors group"
                  >
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-[11px]">
                        {p.reg_no}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold">
                      <Link
                        href={`/mal/${p.slug}`}
                        className="text-zinc-900 dark:text-zinc-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors"
                      >
                        {p.product_name}
                      </Link>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-mono text-zinc-700 dark:text-zinc-300">
                      {p.dosage ? (
                        <span className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-[11px] font-semibold">
                          {p.dosage}
                        </span>
                      ) : (
                        <span className="text-zinc-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${badge.bg} ${badge.text} ${badge.border}`}
                      >
                        {badge.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-zinc-500 dark:text-zinc-400 max-w-[200px] truncate" title={p.holder}>
                      {p.holder}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <Link
                        href={`/mal/${p.slug}`}
                        className="inline-flex items-center text-teal-600 dark:text-teal-400 font-semibold hover:underline"
                      >
                        Compare →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Rich Card Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((p) => {
            const badge = getCategoryBadgeClass(p.category.code);
            return (
              <Link
                key={p.slug}
                href={`/mal/${p.slug}`}
                className="group rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 transition-all hover:border-teal-500 hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${badge.bg} ${badge.text} ${badge.border}`}
                    >
                      {badge.label}
                    </span>
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                      {p.reg_no}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors line-clamp-2">
                    {p.product_name}
                  </h3>

                  {p.dosage && (
                    <div className="mt-2 text-xs font-mono text-zinc-600 dark:text-zinc-300">
                      <span className="text-zinc-400 text-[10px] uppercase font-sans">Strength: </span>
                      <span className="font-semibold bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                        {p.dosage}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3.5 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
                  <div className="flex items-center gap-1 truncate max-w-[190px]" title={p.holder}>
                    <Building2 className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
                    <span className="truncate">{p.holder}</span>
                  </div>

                  <span className="text-teal-600 dark:text-teal-400 font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center gap-0.5">
                    Detail →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
