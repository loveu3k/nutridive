'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCompare } from '@/lib/compare-context';
import type { Product } from '@/lib/types';
import { formatDate, getCategoryBadgeClass } from '@/lib/utils';
import {
  X,
  Loader2,
  CheckCircle2,
  ShieldAlert,
  Building2,
  Factory,
  Calendar,
  Pill,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Plus,
} from 'lucide-react';

export default function CompareModal() {
  const {
    compareList,
    isCompareOpen,
    closeCompare,
    removeFromCompare,
  } = useCompare();

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!isCompareOpen || compareList.length === 0) {
      return;
    }

    const fetchDetails = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const slugs = compareList.map((p) => p.slug).join(',');
        const res = await fetch(`/api/products?slugs=${encodeURIComponent(slugs)}`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products || []);
        } else {
          setLoadError('Failed to fetch product details.');
        }
      } catch (err) {
        setLoadError('Network error while loading comparison.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [isCompareOpen, compareList]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCompareOpen) {
        closeCompare();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCompareOpen, closeCompare]);

  if (!isCompareOpen) {
    return null;
  }

  // Find if dosages or molecules differ
  const allMolecules = products.map((p) => p.primary_molecule.toLowerCase());
  const isCrossMolecule = new Set(allMolecules).size > 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-zinc-950/70 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl max-h-[92vh] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/70">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                NPRA Head-to-Head Analysis
              </span>
              {isCrossMolecule && (
                <span className="text-[10px] font-medium bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-full">
                  Cross-Molecule Comparison
                </span>
              )}
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-50">
              Comparing {products.length || compareList.length} Approved Formulations
            </h2>
          </div>

          <button
            onClick={closeCompare}
            className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 rounded-xl transition-colors"
            title="Close modal (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {isLoading ? (
            <div className="py-24 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-teal-600 animate-spin mx-auto" />
              <p className="text-sm text-zinc-500">Loading verified NPRA formulations...</p>
            </div>
          ) : loadError ? (
            <div className="py-16 text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{loadError}</p>
            </div>
          ) : products.length === 0 ? (
            <div className="py-16 text-center text-zinc-500">
              No products found to compare.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs sm:text-sm">
                <thead>
                  <tr>
                    <th className="p-3 w-40 text-xs font-semibold uppercase tracking-wider text-zinc-400 bg-zinc-50/50 dark:bg-zinc-900/50 sticky left-0 z-10">
                      Product Name
                    </th>
                    {products.map((p) => {
                      const badge = getCategoryBadgeClass(p.category.code);
                      return (
                        <th
                          key={p.slug}
                          className="p-3 min-w-[220px] max-w-[280px] align-top bg-zinc-50/30 dark:bg-zinc-900/30 border-l border-zinc-200 dark:border-zinc-800"
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${badge.bg} ${badge.text} ${badge.border}`}
                            >
                              {badge.label}
                            </span>
                            <button
                              onClick={() => removeFromCompare(p.slug)}
                              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                              title="Remove from compare"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <Link
                            href={`/mal/${p.slug}`}
                            onClick={closeCompare}
                            className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-50 hover:text-teal-600 dark:hover:text-teal-400 transition-colors line-clamp-2"
                          >
                            {p.product_name}
                          </Link>

                          <div className="mt-1.5 font-mono text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                            {p.reg_no}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>

                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/80">
                  {/* Status & NPRA Approval */}
                  <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
                    <td className="p-3 font-semibold text-zinc-500 text-xs uppercase tracking-wider sticky left-0 bg-white dark:bg-zinc-950 z-10">
                      NPRA Status
                    </td>
                    {products.map((p) => {
                      const isApproved = p.status.toUpperCase().includes('APPROVED');
                      return (
                        <td
                          key={p.slug}
                          className="p-3 border-l border-zinc-200 dark:border-zinc-800"
                        >
                          <div className="inline-flex items-center gap-1.5 font-medium text-xs">
                            {isApproved ? (
                              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>{p.status}</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                                <ShieldAlert className="w-4 h-4" />
                                <span>{p.status}</span>
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Active Ingredients & Dosage */}
                  <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 bg-teal-50/20 dark:bg-teal-950/10">
                    <td className="p-3 font-semibold text-zinc-500 text-xs uppercase tracking-wider sticky left-0 bg-white dark:bg-zinc-950 z-10">
                      Active Ingredients &amp; Strength
                    </td>
                    {products.map((p) => (
                      <td
                        key={p.slug}
                        className="p-3 border-l border-zinc-200 dark:border-zinc-800"
                      >
                        <div className="space-y-2">
                          {p.active_ingredients.length === 0 ? (
                            <span className="text-zinc-400 italic text-xs">
                              {p.primary_molecule || 'Proprietary formula'}
                            </span>
                          ) : (
                            p.active_ingredients.map((ing, idx) => (
                              <div
                                key={idx}
                                className="rounded-lg border border-teal-200/60 dark:border-teal-900/60 bg-white dark:bg-zinc-900 p-2 text-xs"
                              >
                                <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                                  {ing.name}
                                </div>
                                {ing.dosage && (
                                  <div className="mt-1 font-mono font-bold text-teal-700 dark:text-teal-300">
                                    {ing.dosage}
                                  </div>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Primary Molecule / Generic Hub */}
                  <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
                    <td className="p-3 font-semibold text-zinc-500 text-xs uppercase tracking-wider sticky left-0 bg-white dark:bg-zinc-950 z-10">
                      Primary Molecule
                    </td>
                    {products.map((p) => (
                      <td
                        key={p.slug}
                        className="p-3 border-l border-zinc-200 dark:border-zinc-800"
                      >
                        <Link
                          href={`/generic/${p.generic_slug}`}
                          onClick={closeCompare}
                          className="font-medium text-teal-600 dark:text-teal-400 hover:underline inline-flex items-center gap-1"
                        >
                          <span>{p.generic_name || p.primary_molecule}</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    ))}
                  </tr>

                  {/* Holder (PRH) */}
                  <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
                    <td className="p-3 font-semibold text-zinc-500 text-xs uppercase tracking-wider sticky left-0 bg-white dark:bg-zinc-950 z-10">
                      Registration Holder (PRH)
                    </td>
                    {products.map((p) => (
                      <td
                        key={p.slug}
                        className="p-3 border-l border-zinc-200 dark:border-zinc-800"
                      >
                        <div className="flex items-start gap-1.5 text-zinc-800 dark:text-zinc-200">
                          <Building2 className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                          <span className="font-medium">{p.holder || 'Not Disclosed'}</span>
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Manufacturer */}
                  <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
                    <td className="p-3 font-semibold text-zinc-500 text-xs uppercase tracking-wider sticky left-0 bg-white dark:bg-zinc-950 z-10">
                      Manufacturer
                    </td>
                    {products.map((p) => (
                      <td
                        key={p.slug}
                        className="p-3 border-l border-zinc-200 dark:border-zinc-800"
                      >
                        <div className="flex items-start gap-1.5 text-zinc-800 dark:text-zinc-200">
                          <Factory className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                          <span>{p.manufacturer || 'Not Disclosed'}</span>
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Validity Period */}
                  <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
                    <td className="p-3 font-semibold text-zinc-500 text-xs uppercase tracking-wider sticky left-0 bg-white dark:bg-zinc-950 z-10">
                      Validity Expiry
                    </td>
                    {products.map((p) => (
                      <td
                        key={p.slug}
                        className="p-3 border-l border-zinc-200 dark:border-zinc-800 font-mono text-xs"
                      >
                        <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
                          <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                          <span>{formatDate(p.date_end)}</span>
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Physical Hologram Requirement */}
                  <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
                    <td className="p-3 font-semibold text-zinc-500 text-xs uppercase tracking-wider sticky left-0 bg-white dark:bg-zinc-950 z-10">
                      Meditag Hologram
                    </td>
                    {products.map((p) => (
                      <td
                        key={p.slug}
                        className="p-3 border-l border-zinc-200 dark:border-zinc-800"
                      >
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 dark:text-teal-400">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Mandatory KKM Sticker</span>
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* Actions Row */}
                  <tr>
                    <td className="p-3 sticky left-0 bg-white dark:bg-zinc-950 z-10"></td>
                    {products.map((p) => (
                      <td
                        key={p.slug}
                        className="p-3 border-l border-zinc-200 dark:border-zinc-800"
                      >
                        <Link
                          href={`/mal/${p.slug}`}
                          onClick={closeCompare}
                          className="inline-flex items-center justify-center w-full py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition-colors shadow-xs"
                        >
                          <span>View Product Page</span>
                          <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                        </Link>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/70 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-zinc-500">
          <div>
            Data sourced from official KKM &amp; NPRA Malaysia open pharmaceutical registry.
          </div>
          <button
            onClick={closeCompare}
            className="px-4 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-medium transition-colors"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
}
