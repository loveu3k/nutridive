import React from 'react';
import Link from 'next/link';
import {
  Search,
  Pill,
  ArrowRight,
  Sparkles,
  Leaf,
  ShieldCheck,
} from 'lucide-react';
import { getStats, getCategories, getTopGenerics } from '@/lib/data';
import HomeSearchHero from '@/components/HomeSearchHero';
import FaqAccordion, { type FaqItem } from '@/components/FaqAccordion';

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

  const scheduleCategories = [
    {
      code: 'MAL...A',
      title: 'Prescription Medicines',
      description: 'Controlled ethical medications requiring a doctor\'s prescription.',
      count: categories.prescription?.count || 9032,
      href: '/category/prescription',
      icon: Pill,
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-900',
      accentColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      code: 'MAL...X',
      title: 'Over-the-Counter (OTC)',
      description: 'Non-scheduled medications authorized for self-care purchase.',
      count: categories.otc?.count || 693,
      href: '/category/otc',
      icon: ShieldCheck,
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-900',
      accentColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      code: 'MAL...N',
      title: 'Health Supplements',
      description: 'Vitamins, essential minerals, nutraceuticals, and probiotics.',
      count: categories.supplement?.count || 4362,
      href: '/category/supplement',
      icon: Sparkles,
      badgeClass: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-900',
      accentColor: 'text-purple-600 dark:text-purple-400',
    },
    {
      code: 'MAL...T',
      title: 'Traditional & Herbal',
      description: 'Herbal remedies, TCM formulas, Jamu, and Ayurvedic preparations.',
      count: categories.traditional?.count || 13122,
      href: '/category/traditional',
      icon: Leaf,
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900',
      accentColor: 'text-amber-600 dark:text-amber-400',
    },
  ];

  const homeFaqs: FaqItem[] = [
    {
      question: 'How do I check if a medicine is registered in Malaysia?',
      answer: (
        <span>
          Every authentic medicine, health supplement, or traditional remedy approved for sale in Malaysia is assigned a unique registration number by the National Pharmaceutical Regulatory Agency (NPRA). It starts with &quot;MAL&quot; followed by 8 digits and ends with an alphabetical category code (e.g., <code>MAL19900523AZ</code>). You can search any MAL code directly in the search bar above to verify its registration record.
        </span>
      ),
    },
    {
      question: 'What do the MAL letter codes mean (A, X, N, T)?',
      answer: (
        <span>
          The letter at the end of the registration number signifies the regulatory classification:
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>A:</strong> Controlled / Prescription Medicine (Poisons List)</li>
            <li><strong>X:</strong> Over-the-Counter (OTC) Non-Poison Medicine</li>
            <li><strong>N:</strong> Health Supplement (Vitamins, Minerals, Probiotics)</li>
            <li><strong>T:</strong> Traditional Medicine &amp; Herbal Remedies</li>
            <li><strong>V:</strong> Veterinary Medicine</li>
          </ul>
        </span>
      ),
    },
    {
      question: 'What is a generic alternative medicine?',
      answer: (
        <span>
          A generic medicine contains the identical active pharmaceutical ingredient (API), strength, and therapeutic intent as the original brand-name drug. In Malaysia, generic medications undergo rigorous bioequivalence testing to ensure they deliver equivalent efficacy and safety, often at a significantly lower cost.
        </span>
      ),
    },
    {
      question: 'Where does NutriDive get its data?',
      answer: (
        <span>
          NutriDive indexes the official open pharmaceutical dataset published under the Malaysia Open Data Initiative (<code>data.gov.my</code>) from the National Pharmaceutical Regulatory Agency (NPRA), Ministry of Health Malaysia (KKM). NutriDive is an independent consumer directory and is not affiliated with any government agency.
        </span>
      ),
    },
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

      {/* Product Categories Section: Clean, Scannable GoodRx-Style Cards */}
      <section className="py-12 md:py-14 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Browse by Schedule
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Explore medicines and health products categorized by official Malaysian registration class.
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {scheduleCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.href}
                href={cat.href}
                className="group relative rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 p-5 hover:border-teal-500/80 dark:hover:border-teal-500/80 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3.5">
                    <div className={`inline-flex items-center gap-1.5 font-mono text-xs font-semibold px-2 py-0.5 rounded-md border ${cat.badgeClass}`}>
                      <Icon className="w-3.5 h-3.5" />
                      <span>{cat.code}</span>
                    </div>
                    <span className="text-xs font-mono font-medium text-zinc-400 dark:text-zinc-500">
                      {cat.count.toLocaleString()} products
                    </span>
                  </div>
                  <h3 className="font-semibold text-base text-zinc-900 dark:text-zinc-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
                    {cat.description}
                  </p>
                </div>
                <div className="mt-5 flex items-center gap-1 text-xs font-semibold text-teal-600 dark:text-teal-400 group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors">
                  <span>Browse category</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Top Generic Molecules Directory: Clean, Concise GoodRx-Style Grid */}
      <section className="py-10 md:py-12 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full border-t border-zinc-100 dark:border-zinc-900">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Most Searched Active Molecules
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Compare registered brand names sharing identical active ingredients and generic equivalents.
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
              className="group flex items-center justify-between p-3.5 rounded-xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-teal-500/80 dark:hover:border-teal-500/80 hover:shadow-xs transition-all duration-150"
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

      {/* Frequently Asked Questions Section */}
      <section className="py-12 md:py-14 max-w-3xl mx-auto px-4 sm:px-6 w-full border-t border-zinc-100 dark:border-zinc-900">
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Key guidance on Malaysian medicine registration, NPRA codes, and generic equivalents.
          </p>
        </div>
        <FaqAccordion items={homeFaqs} />
      </section>
    </div>
  );
}
