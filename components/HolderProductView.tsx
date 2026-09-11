'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Pill, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { HolderProductSummary } from '@/lib/types';
import { getCategoryBadgeClass } from '@/lib/utils';

interface HolderProductViewProps {
  products: HolderProductSummary[];
  companyName: string;
}

export default function HolderProductView({ products, companyName }: HolderProductViewProps) {
  const [query, setQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'APPROVED' | 'CANCELLED'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const filtered = useMemo(() => {
    return products.filter((p) => {
      // Query filter
      if (query.trim()) {
        const q = query.toLowerCase().trim();
        const matchName = p.product_name.toLowerCase().includes(q);
        const matchMal = p.reg_no.toLowerCase().includes(q);
        const matchGen = p.generic_name.toLowerCase().includes(q);
        if (!matchName && !matchMal && !matchGen) return false;
      }

      // Status filter
      if (selectedStatus === 'APPROVED' && p.status === 'CANCELLED') return false;
      if (selectedStatus === 'CANCELLED' && p.status !== 'CANCELLED') return false;

      // Category filter
      if (selectedCategory !== 'ALL' && p.category.code !== selectedCategory) return false;

      return true;
    });
  }, [products, query, selectedStatus, selectedCategory]);

  return (
    <div>
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${products.length} products by name or MAL...`}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-teal-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="text-xs py-2 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-teal-500"
          >
            <option value="ALL">All Status</option>
            <option value="APPROVED">Active Only</option>
            <option value="CANCELLED">Cancelled Only</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs py-2 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-teal-500"
          >
            <option value="ALL">All Categories</option>
            <option value="A">Prescription (MAL-A)</option>
            <option value="X">OTC (MAL-X)</option>
            <option value="N">Supplements (MAL-N)</option>
            <option value="T">Traditional (MAL-T)</option>
            <option value="V">Veterinary (MAL-V)</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/30">
          <Pill className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            No products match your filter
          </p>
          <button
            onClick={() => {
              setQuery('');
              setSelectedStatus('ALL');
              setSelectedCategory('ALL');
            }}
            className="mt-2 text-xs font-semibold text-teal-600 hover:underline"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden bg-white dark:bg-zinc-950 shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50/80 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4 font-mono">MAL Registration</th>
                <th className="py-3 px-4">Product Brand Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
              {filtered.map((p) => {
                const badge = getCategoryBadgeClass(p.category.code);
                const isCancelled = p.status === 'CANCELLED';

                return (
                  <tr
                    key={p.slug}
                    className="hover:bg-zinc-50/60 dark:hover:bg-zinc-900/40 transition-colors"
                  >
                    <td className="py-3 px-4 whitespace-nowrap">
                      <Link
                        href={`/mal/${p.slug}`}
                        className="font-mono font-semibold text-zinc-900 dark:text-zinc-100 hover:text-teal-600 dark:hover:text-teal-400"
                      >
                        {p.reg_no}
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      <Link
                        href={`/mal/${p.slug}`}
                        className="font-medium text-zinc-900 dark:text-zinc-100 hover:text-teal-600 dark:hover:text-teal-400 transition-colors line-clamp-1"
                      >
                        {p.product_name}
                      </Link>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${badge.bg} ${badge.text} ${badge.border}`}
                      >
                        {badge.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap font-medium">
                      {isCancelled ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 px-2 py-0.5 rounded">
                          <AlertTriangle className="w-3 h-3" />
                          <span>CANCELLED</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 px-2 py-0.5 rounded">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>ACTIVE</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="py-2.5 px-4 bg-zinc-50/60 dark:bg-zinc-900/40 text-[11px] text-zinc-400 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
            <span>Showing {filtered.length} of {products.length} registered products</span>
            <span>PRH: {companyName}</span>
          </div>
        </div>
      )}
    </div>
  );
}
