import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, ShieldAlert, Sparkles, Building2 } from 'lucide-react';
import type { ProductSummary } from '@/lib/types';
import { getCategoryBadgeClass } from '@/lib/utils';

interface GenericAlternativeGridProps {
  currentSlug: string;
  genericName: string;
  genericSlug: string;
  alternatives: ProductSummary[];
  totalAvailable?: number;
}

export default function GenericAlternativeGrid({
  currentSlug,
  genericName,
  genericSlug,
  alternatives,
  totalAvailable,
}: GenericAlternativeGridProps) {
  // Exclude current product from alternatives
  const filtered = alternatives.filter(
    (item) => item.slug.toLowerCase() !== currentSlug.toLowerCase()
  );

  const displayList = filtered.slice(0, 6);
  const totalCount = totalAvailable ?? filtered.length;

  if (filtered.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 p-6 text-center">
        <Sparkles className="w-6 h-6 text-teal-600 dark:text-teal-400 mx-auto mb-2" />
        <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
          Sole Registered Brand Formulation
        </h4>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mx-auto mt-1">
          This product is currently the primary or innovator formulation registered in Malaysia under {genericName}.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="font-semibold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <span>Equivalent Registered Brands in Malaysia</span>
            <span className="text-xs font-mono font-medium bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 px-2 py-0.5 rounded-full">
              {totalCount} Available
            </span>
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Products sharing identical active ingredient formulation ({genericName}) approved by NPRA.
          </p>
        </div>

        <Link
          href={`/generic/${genericSlug}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 group"
        >
          <span>View All {totalCount} Brands</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {displayList.map((alt) => {
          const badge = getCategoryBadgeClass(alt.category.code);
          const isApproved = alt.status.toUpperCase().includes('APPROVED');

          return (
            <Link
              key={alt.slug}
              href={`/mal/${alt.slug}`}
              className="group relative rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 transition-all hover:border-teal-500 dark:hover:border-teal-500 hover:shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span
                    className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded border ${badge.bg} ${badge.text} ${badge.border}`}
                  >
                    {badge.label}
                  </span>
                  <span className="font-mono text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                    {alt.reg_no}
                  </span>
                </div>

                <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 line-clamp-2 transition-colors">
                  {alt.product_name}
                </h4>

                {alt.dosage && (
                  <div className="mt-2 text-xs font-mono text-zinc-600 dark:text-zinc-300">
                    <span className="text-zinc-400 text-[10px] uppercase font-sans">Strength: </span>
                    <span className="font-semibold">{alt.dosage}</span>
                  </div>
                )}
              </div>

              <div className="mt-3.5 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
                <div className="flex items-center gap-1 truncate max-w-[170px]" title={alt.holder}>
                  <Building2 className="w-3 h-3 shrink-0 text-zinc-400" />
                  <span className="truncate">{alt.holder}</span>
                </div>

                {isApproved ? (
                  <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium text-[10px]">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>NPRA Valid</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium text-[10px]">
                    <ShieldAlert className="w-3 h-3" />
                    <span>{alt.status}</span>
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
