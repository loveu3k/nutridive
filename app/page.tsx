import React from 'react';
import Link from 'next/link';
import {
  Pill,
  ArrowRight,
  ShieldCheck,
  Building2,
  Sparkles,
  Leaf,
  FlaskConical,
} from 'lucide-react';
import { getStats, getCategories, getTopGenerics } from '@/lib/data';
import HomeSearchHero from '@/components/HomeSearchHero';

export const dynamic = 'force-static';

export default async function HomePage() {
  const stats = await getStats();
  const categories = await getCategories();
  const topGenerics = await getTopGenerics(12);

  const quickPills = [
    { label: 'Paracetamol', href: '/generic/paracetamol' },
    { label: 'Metformin', href: '/generic/metformin' },
    { label: 'Amlodipine', href: '/generic/amlodipine' },
    { label: 'Atorvastatin', href: '/generic/atorvastatin' },
    { label: 'Amoxicillin', href: '/generic/amoxicillin' },
    { label: 'Omeprazole', href: '/generic/omeprazole' },
    { label: 'Supplements (MAL-N)', href: '/category/supplement' },
    { label: 'Traditional (MAL-T)', href: '/category/traditional' },
  ];

  // Clean, unified schedule categories without visual clutter
  const scheduleCategories = [
    {
      code: 'MAL-A',
      title: 'Prescription Medicines',
      count: categories.prescription?.count || 9032,
      href: '/category/prescription',
    },
    {
      code: 'MAL-X',
      title: 'Over-the-Counter (OTC)',
      count: categories.otc?.count || 693,
      href: '/category/otc',
    },
    {
      code: 'MAL-N',
      title: 'Health Supplements',
      count: categories.supplement?.count || 4362,
      href: '/category/supplement',
    },
    {
      code: 'MAL-T',
      title: 'Traditional & Herbal',
      count: categories.traditional?.count || 13122,
      href: '/category/traditional',
    },
  ];

  // Common household brand names that Malaysian consumers search for
  const popularBrands = [
    { name: 'Panadol', generic: 'Paracetamol', use: 'Pain & Fever Relief', href: '/search?q=panadol' },
    { name: 'Augmentin', generic: 'Amoxicillin + Clavulanate', use: 'Antibiotic', href: '/search?q=augmentin' },
    { name: 'Lipitor', generic: 'Atorvastatin', use: 'Cholesterol Lowering', href: '/search?q=lipitor' },
    { name: 'Glucophage', generic: 'Metformin', use: 'Type 2 Diabetes', href: '/search?q=glucophage' },
    { name: 'Norvasc', generic: 'Amlodipine', use: 'Blood Pressure', href: '/search?q=norvasc' },
    { name: 'Ventolin', generic: 'Salbutamol', use: 'Asthma Inhaler', href: '/search?q=ventolin' },
    { name: 'Zyrtec', generic: 'Cetirizine', use: 'Allergy & Rhinitis', href: '/search?q=zyrtec' },
    { name: 'Nexium', generic: 'Esomeprazole', use: 'GERD & Acid Reflux', href: '/search?q=nexium' },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section: Centered, Search-First, Classic GoodRx Clean Aesthetic */}
      <section className="relative pt-12 pb-14 md:pt-16 md:pb-18 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-gradient-to-b from-teal-50/40 via-white to-white dark:from-teal-950/10 dark:via-zinc-950 dark:to-zinc-950">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Accessible H1 for SEO without visual clutter */}
          <h1 className="sr-only">NutriDive - Malaysian Medicine & Generic Drugs Directory</h1>

          {/* Search Box - Front and Center */}
          <div className="w-full">
            <HomeSearchHero />
          </div>

          {/* Quick Search Suggestions */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
            <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium mr-1">
              Popular:
            </span>
            {quickPills.map((pill) => (
              <Link
                key={pill.label}
                href={pill.href}
                className="inline-flex items-center px-3 py-1 rounded-full bg-zinc-100/90 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 hover:bg-teal-50 hover:border-teal-300 hover:text-teal-700 dark:hover:bg-teal-950/50 dark:hover:text-teal-300 text-xs font-medium text-zinc-600 dark:text-zinc-300 transition-all shadow-2xs"
              >
                {pill.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Browse by Schedule: Clean Minimal Uniform Tiles */}
      <section className="py-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Browse by Schedule
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Official NPRA regulatory classification classes.
            </p>
          </div>
          <Link
            href="/search"
            className="text-xs sm:text-sm font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 inline-flex items-center gap-1 shrink-0"
          >
            <span>All products</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {scheduleCategories.map((cat) => (
            <Link
              key={cat.href}
              href={cat.href}
              className="group p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-teal-500/80 dark:hover:border-teal-500/80 hover:shadow-xs transition-all flex flex-col justify-between"
            >
              <div>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                  {cat.code}
                </span>
                <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 mt-2.5 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors truncate">
                  {cat.title}
                </h3>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-zinc-400 dark:text-zinc-500 font-mono">
                <span>{cat.count.toLocaleString()} products</span>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-600 group-hover:text-teal-600 dark:group-hover:text-teal-400 group-hover:translate-x-0.5 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular Brand-Name Medicines (Familiar consumer medicines) */}
      <section className="py-8 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full border-t border-zinc-100 dark:border-zinc-900">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-4 gap-1">
          <div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Popular Brand Medicines
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Widely recognized brand names and their active generic substances.
            </p>
          </div>
          <Link
            href="/search"
            className="text-xs sm:text-sm font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 inline-flex items-center gap-1 shrink-0"
          >
            <span>Search all brands</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {popularBrands.map((brand) => (
            <Link
              key={brand.name}
              href={brand.href}
              className="group flex items-center justify-between p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-teal-500/80 dark:hover:border-teal-500/80 hover:shadow-xs transition-all"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 truncate transition-colors">
                    {brand.name}
                  </h4>
                  <span className="text-[10px] font-medium text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-1.5 py-0.5 rounded">
                    {brand.use}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 font-mono mt-1 truncate">
                  Generic: {brand.generic}
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-300 dark:text-zinc-600 group-hover:text-teal-600 dark:group-hover:text-teal-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
            </Link>
          ))}
        </div>
      </section>

      {/* Most Searched Active Molecules */}
      <section className="py-8 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full border-t border-zinc-100 dark:border-zinc-900">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-4 gap-1">
          <div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Most Searched Active Molecules
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Compare registered brand names sharing identical active substances and generic alternatives.
            </p>
          </div>
          <Link
            href="/search"
            className="text-xs sm:text-sm font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 inline-flex items-center gap-1 shrink-0"
          >
            <span>Browse all {stats.total_generics.toLocaleString()}+ generics</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {topGenerics.map((gen) => (
            <Link
              key={gen.slug}
              href={`/generic/${gen.slug}`}
              className="group flex items-center justify-between p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-teal-500/80 dark:hover:border-teal-500/80 hover:shadow-xs transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 group-hover:bg-teal-100 dark:group-hover:bg-teal-900/60 transition-colors">
                  <Pill className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 truncate transition-colors">
                    {gen.name}
                  </h4>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 font-mono mt-0.5">
                    {gen.total_products} registered brand{gen.total_products !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-300 dark:text-zinc-600 group-hover:text-teal-600 dark:group-hover:text-teal-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
