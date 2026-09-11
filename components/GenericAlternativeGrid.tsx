'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
  Building2,
  Columns,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { ProductSummary } from '@/lib/types';
import { getCategoryBadgeClass, formatStrength } from '@/lib/utils';
import { useCompare } from '@/lib/compare-context';
import CompareButton from '@/components/CompareButton';

interface GenericAlternativeGridProps {
  currentSlug: string;
  genericName: string;
  genericSlug: string;
  alternatives: ProductSummary[];
  totalAvailable?: number;
  currentProduct?: {
    reg_no: string;
    product_name: string;
    category_code?: string;
    holder?: string;
    dosage?: string;
  };
}

const INITIAL_DISPLAY_COUNT = 9;
const EXPAND_STEP = 12;

export default function GenericAlternativeGrid({
  currentSlug,
  genericName,
  genericSlug,
  alternatives,
  totalAvailable,
  currentProduct,
}: GenericAlternativeGridProps) {
  const { addToCompare, compareList, openCompare } = useCompare();

  // Exclude current product from alternatives
  const filtered = alternatives.filter(
    (item) => item.slug.toLowerCase() !== currentSlug.toLowerCase()
  );

  const [visibleCount, setVisibleCount] = useState(INITIAL_DISPLAY_COUNT);
  const totalCount = totalAvailable ?? filtered.length;

  // Batch compare top alternatives
  const handleBatchCompare = () => {
    // Add current product if provided
    if (currentProduct) {
      addToCompare({
        slug: currentSlug,
        reg_no: currentProduct.reg_no,
        product_name: currentProduct.product_name,
        category_code: currentProduct.category_code,
        generic_name: genericName,
        holder: currentProduct.holder,
        dosage: currentProduct.dosage,
      });
    }

    // Add up to 3 alternatives
    const toAdd = filtered.slice(0, 3);
    toAdd.forEach((alt) => {
      addToCompare({
        slug: alt.slug,
        reg_no: alt.reg_no,
        product_name: alt.product_name,
        category_code: alt.category?.code,
        generic_name: genericName,
        holder: alt.holder,
        dosage: alt.dosage,
      });
    });

    openCompare();
  };

  if (filtered.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 p-8 text-center">
        <Sparkles className="w-7 h-7 text-teal-600 dark:text-teal-400 mx-auto mb-2" />
        <h4 className="font-semibold text-base text-zinc-900 dark:text-zinc-100">
          Sole Registered Brand Formulation
        </h4>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto mt-1 leading-relaxed">
          This product is currently the primary or innovator formulation registered in Malaysia under {genericName}. No other bioequivalent generic brands are currently registered in this category.
        </p>
      </div>
    );
  }

  const displayedAlternatives = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  return (
    <div className="space-y-4">
      {/* Header with Title & Quick Batch Compare */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-50/50 dark:bg-zinc-900/30 p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800">
        <div>
          <h3 className="font-bold text-base sm:text-lg text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <span>Equivalent Registered Brands in Malaysia</span>
            <span className="text-xs font-mono font-medium bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 px-2.5 py-0.5 rounded-full">
              {totalCount} Available
            </span>
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Products sharing identical active pharmaceutical ingredient ({genericName}) approved by NPRA.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
          {filtered.length >= 1 && (
            <button
              onClick={handleBatchCompare}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 hover:bg-teal-100 dark:hover:bg-teal-900 transition-colors shadow-2xs"
              title="Quickly compare this product with top 3 alternatives"
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Compare with Alternatives</span>
            </button>
          )}

          <Link
            href={`/generic/${genericSlug}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 group"
          >
            <span>Hub ({totalCount})</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>

      {/* Alternatives Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {displayedAlternatives.map((alt) => {
          const badge = getCategoryBadgeClass(alt.category?.code || 'X');
          const isApproved = (alt.status || '').toUpperCase().includes('APPROVED');

          return (
            <div
              key={alt.slug}
              className="group relative rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 transition-all hover:border-teal-500 dark:hover:border-teal-500 hover:shadow-md flex flex-col justify-between"
            >
              <div>
                {/* Top Badge & Compare Checkbox */}
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded border ${badge.bg} ${badge.text} ${badge.border}`}
                    >
                      {badge.label}
                    </span>
                    <span className="font-mono text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                      {alt.reg_no}
                    </span>
                  </div>

                  {/* Compare action */}
                  <CompareButton
                    item={{
                      slug: alt.slug,
                      reg_no: alt.reg_no,
                      product_name: alt.product_name,
                      category_code: alt.category?.code,
                      generic_name: genericName,
                      holder: alt.holder,
                      dosage: alt.dosage,
                    }}
                    variant="checkbox"
                  />
                </div>

                <Link
                  href={`/mal/${alt.slug}`}
                  className="block font-bold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 line-clamp-2 transition-colors"
                >
                  {alt.product_name}
                </Link>

                {alt.dosage && (
                  <div className="mt-2 text-xs font-mono text-zinc-600 dark:text-zinc-300">
                    <span className="text-zinc-400 text-[10px] uppercase font-sans">Strength: </span>
                    <span className="font-semibold bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                      {formatStrength(alt.dosage)}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-3.5 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
                <div className="flex items-center gap-1 truncate max-w-[170px]" title={alt.holder}>
                  <Building2 className="w-3 h-3 shrink-0 text-zinc-400" />
                  <span className="truncate">{alt.holder}</span>
                </div>

                <Link
                  href={`/mal/${alt.slug}`}
                  className="inline-flex items-center gap-1 text-teal-600 dark:text-teal-400 font-semibold hover:underline"
                >
                  <span>Verify</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Show More Alternatives or View Full Hub */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
        {hasMore ? (
          <button
            onClick={() => setVisibleCount((prev) => prev + EXPAND_STEP)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-2xs"
          >
            <span>Show More Alternatives ({filtered.length - visibleCount} remaining)</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        ) : filtered.length > INITIAL_DISPLAY_COUNT ? (
          <button
            onClick={() => setVisibleCount(INITIAL_DISPLAY_COUNT)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-2xs"
          >
            <span>Show Less</span>
            <ChevronUp className="w-4 h-4" />
          </button>
        ) : null}

        <Link
          href={`/generic/${genericSlug}`}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs"
        >
          <span>View All {totalCount} Brands in Generic Directory</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
