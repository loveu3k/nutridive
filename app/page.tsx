import React from 'react';
import Link from 'next/link';
import {
  Search,
  Pill,
  ArrowRight,
  Sparkles,
  FileCheck2,
  Leaf,
  Layers,
  HelpCircle,
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
      {/* Hero Section: Centered, Search-First, Ultra Clean */}
      <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-gradient-to-b from-teal-50/40 via-white to-white dark:from-teal-950/10 dark:via-zinc-950 dark:to-zinc-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Subtle Trust Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 text-xs font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0" />
            <span>Independent Malaysian Medicine Directory • Open Data (data.gov.my)</span>
          </div>

          {/* Hero Heading */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 leading-tight">
            Find Any Registered Medicine in Malaysia
          </h1>

          <p className="mt-4 text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Search 27,000+ approved pharmaceuticals, health supplements, active ingredients, and affordable generic alternatives.
          </p>

          {/* Search Box */}
          <div className="mt-8 max-w-2xl mx-auto">
            <HomeSearchHero />
          </div>

          {/* Quick Search Suggestions */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto">
            <span className="text-xs text-zinc-400 font-medium mr-1">
              Popular:
            </span>
            {quickPills.map((pill) => (
              <Link
                key={pill.label}
                href={pill.href}
                className="inline-flex items-center px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 transition-colors"
              >
                {pill.label}
              </Link>
            ))}
          </div>

          {/* Stats Bar */}
          <div className="mt-12 pt-8 border-t border-zinc-100 dark:border-zinc-800/80 grid grid-cols-3 gap-4 max-w-2xl mx-auto text-center">
            <div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100 tabular-nums">
                {stats.total_products.toLocaleString()}+
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Registered Products
              </div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-teal-600 dark:text-teal-400 tabular-nums">
                {stats.total_generics.toLocaleString()}+
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Generic Molecules
              </div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100 tabular-nums">
                100%
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Public Open Data
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Categories Section */}
      <section className="py-14 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Browse by Schedule
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Explore products categorized by official Malaysian registration classification.
            </p>
          </div>
          <Link
            href="/search"
            className="text-xs font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 inline-flex items-center gap-1"
          >
            <span>All products</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Prescription */}
          <Link
            href="/category/prescription"
            className="group rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 transition-all hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 px-2 py-0.5 rounded">
                  MAL...A
                </span>
                <span className="text-[11px] font-mono text-zinc-400">
                  {(categories.prescription?.count || 9032).toLocaleString()}
                </span>
              </div>
              <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                Prescription Medicines
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
                Ethical medications requiring a doctor&apos;s prescription.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-900 text-xs text-zinc-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
              Explore →
            </div>
          </Link>

          {/* OTC */}
          <Link
            href="/category/otc"
            className="group rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 transition-all hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900 px-2 py-0.5 rounded">
                  MAL...X
                </span>
                <span className="text-[11px] font-mono text-zinc-400">
                  {(categories.otc?.count || 693).toLocaleString()}
                </span>
              </div>
              <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                Over-the-Counter (OTC)
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
                Non-scheduled medications available for self-care.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-900 text-xs text-zinc-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
              Explore →
            </div>
          </Link>

          {/* Supplements */}
          <Link
            href="/category/supplement"
            className="group rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 transition-all hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-[11px] font-semibold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900 px-2 py-0.5 rounded">
                  MAL...N
                </span>
                <span className="text-[11px] font-mono text-zinc-400">
                  {(categories.supplement?.count || 4362).toLocaleString()}
                </span>
              </div>
              <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                Health Supplements
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
                Vitamins, minerals, and dietary supplements.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-900 text-xs text-zinc-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
              Explore →
            </div>
          </Link>

          {/* Traditional */}
          <Link
            href="/category/traditional"
            className="group rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 transition-all hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900 px-2 py-0.5 rounded">
                  MAL...T
                </span>
                <span className="text-[11px] font-mono text-zinc-400">
                  {(categories.traditional?.count || 13122).toLocaleString()}
                </span>
              </div>
              <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                Traditional &amp; Herbal
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
                Herbal formulas, TCM, Jamu, and Ayurvedic products.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-900 text-xs text-zinc-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
              Explore →
            </div>
          </Link>
        </div>
      </section>

      {/* Top Generic Molecules Directory */}
      <section className="py-12 bg-zinc-50/50 dark:bg-zinc-900/30 border-y border-zinc-200/80 dark:border-zinc-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                Most Searched Active Molecules
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Compare registered brands sharing identical therapeutic active substances.
              </p>
            </div>
            <Link
              href="/search"
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400"
            >
              Browse all 5,100+ generic hubs →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {topGenerics.map((gen) => (
              <Link
                key={gen.slug}
                href={`/generic/${gen.slug}`}
                className="group rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-3 transition-all hover:border-teal-500 hover:shadow-xs flex flex-col justify-between"
              >
                <div>
                  <h4 className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 line-clamp-1 transition-colors">
                    {gen.name}
                  </h4>
                  <div className="mt-1 text-[11px] font-mono text-zinc-400">
                    {gen.total_products} brands
                  </div>
                </div>
                <div className="mt-3 text-[10px] text-teal-600 dark:text-teal-400 font-semibold inline-flex items-center gap-0.5">
                  <span>View</span>
                  <span>→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions Section (Essential for SEO & User Help) */}
      <section className="py-14 max-w-3xl mx-auto px-4 sm:px-6 w-full">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Key information on Malaysian medicine registration and generic alternatives.
          </p>
        </div>
        <FaqAccordion items={homeFaqs} />
      </section>
    </div>
  );
}
