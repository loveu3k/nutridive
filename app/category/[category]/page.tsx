import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { getCategories, getCategoryProducts } from '@/lib/data';
import { getCategoryBadgeClass } from '@/lib/utils';
import { CategoryDirectoryView } from '@/components/CategoryDirectoryView';

interface PageProps {
  params: { category: string };
}

export const revalidate = 86400; // ISR 24h

export async function generateStaticParams() {
  const categories = await getCategories();
  return Object.keys(categories).map((category) => ({
    category,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const categories = await getCategories();
  const cat = categories[params.category.toLowerCase()];
  if (!cat) {
    return {
      title: 'Category Not Found | NutriDive',
    };
  }

  const title = `${cat.name} (${cat.mal_prefix}) Registered Products in Malaysia`;
  const description = `Browse ${cat.count.toLocaleString()} approved ${cat.name} products registered in Malaysia. Independent directory with active ingredients and MAL registration records based on open public data.`;

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

export default async function CategoryPage({ params }: PageProps) {
  const categories = await getCategories();
  const cat = categories[params.category.toLowerCase()];

  if (!cat) {
    notFound();
  }

  // Efficient pre-partitioned category products slice (zero 3.4MB overhead)
  const items = await getCategoryProducts(cat.slug);
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
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 md:p-8 shadow-xs mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 px-2.5 py-0.5 rounded tracking-wider">
                {cat.mal_prefix}
              </span>
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded border ${badge.bg} ${badge.text} ${badge.border}`}
              >
                Malaysian Regulatory Schedule
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

      {/* Interactive Pharmacist Directory View with Live Filters */}
      <CategoryDirectoryView
        initialItems={items}
        categoryCode={cat.code}
        categorySlug={cat.slug}
        categoryName={cat.name}
      />
    </div>
  );
}
