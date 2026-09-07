import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ShieldCheck,
  Building2,
  ChevronRight,
  Filter,
  FileCheck2,
  Pill,
  Sparkles,
  Leaf,
  Layers,
} from 'lucide-react';
import { getCategories, getSearchIndex } from '@/lib/data';
import { getCategoryBadgeClass } from '@/lib/utils';
import { AdUnitSlot } from '@/components/MonetizationSlots';

interface PageProps {
  params: { category: string };
  searchParams: { page?: string };
}

export const revalidate = 86400; // ISR 24h

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const categories = await getCategories();
  const cat = categories[params.category.toLowerCase()];
  if (!cat) {
    return {
      title: 'Category Not Found | NutriDive',
    };
  }

  const title = `${cat.name} (${cat.mal_prefix}) Registered Products in Malaysia`;
  const description = `Browse all ${cat.count.toLocaleString()} official NPRA-approved ${cat.name} products in Malaysia. Complete regulatory index, active ingredients, and MAL registration records.`;

  return {
    title,
    description,
    keywords: [
      cat.name,
      cat.mal_prefix,
      'NPRA Malaysia medicine',
      'KKM registration directory',
      'Semakan nombor MAL',
    ],
    openGraph: {
      title,
      description,
      url: `https://nutridive.net/category/${cat.slug}`,
      type: 'website',
    },
    alternates: {
      canonical: `https://nutridive.net/category/${cat.slug}`,
    },
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const categories = await getCategories();
  const cat = categories[params.category.toLowerCase()];

  if (!cat) {
    notFound();
  }

  // Get items matching category from search index
  const index = await getSearchIndex();
  const matchingItems = index.filter((item) => item[3] === cat.code);

  const currentPage = Math.max(parseInt(searchParams.page || '1', 10), 1);
  const pageSize = 30;
  const totalPages = Math.ceil(matchingItems.length / pageSize);
  const offset = (currentPage - 1) * pageSize;
  const paginatedItems = matchingItems.slice(offset, offset + pageSize);

  const badge = getCategoryBadgeClass(cat.code);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 mb-6">
        <Link href="/" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
        <span className="text-zinc-400">Classifications</span>
        <ChevronRight className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
        <span className="font-semibold text-zinc-800 dark:text-zinc-200">{cat.name}</span>
      </nav>

      {/* Category Hero Header */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 px-2.5 py-0.5 rounded tracking-wider">
                {cat.mal_prefix}
              </span>
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded border ${badge.bg} ${badge.text} ${badge.border}`}
              >
                Official NPRA Schedule
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              {cat.name} ({cat.mal_prefix})
            </h1>

            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-3xl leading-relaxed">
              {cat.definition}
            </p>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-center shrink-0 min-w-[150px]">
            <div className="text-3xl font-bold font-mono text-zinc-900 dark:text-zinc-100 tabular-nums">
              {cat.count.toLocaleString()}
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Verified Products
            </div>
          </div>
        </div>
      </div>

      {/* Ad Unit: Leaderboard Slot */}
      <AdUnitSlot slot="leaderboard" />

      {/* Directory Products Grid */}
      <div className="mt-8 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">
            Registered Formulations List
          </h2>
          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
            Page {currentPage} of {totalPages} ({cat.count.toLocaleString()} total)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedItems.map(([slug, reg_no, name, catCode, genericName, holder]) => (
            <Link
              key={slug}
              href={`/mal/${slug}`}
              className="group rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 transition-all hover:border-teal-500 hover:shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                    {reg_no}
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                    NPRA Verified
                  </span>
                </div>

                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 line-clamp-2 transition-colors">
                  {name}
                </h3>

                <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">
                  <span className="text-teal-700 dark:text-teal-400 font-medium">{genericName}</span>
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
                <div className="flex items-center gap-1 truncate max-w-[190px]" title={holder}>
                  <Building2 className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
                  <span className="truncate">{holder}</span>
                </div>
                <span className="text-teal-600 dark:text-teal-400 font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center">
                  Detail →
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4">
            {currentPage > 1 ? (
              <Link
                href={`/category/${cat.slug}?page=${currentPage - 1}`}
                className="px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
              >
                ← Previous Page
              </Link>
            ) : (
              <div />
            )}

            <div className="text-xs font-mono text-zinc-500">
              Page {currentPage} of {totalPages}
            </div>

            {currentPage < totalPages && (
              <Link
                href={`/category/${cat.slug}?page=${currentPage + 1}`}
                className="px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
              >
                Next Page →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
