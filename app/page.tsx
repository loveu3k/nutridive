import React from 'react';
import Link from 'next/link';
import {
  Search,
  ShieldCheck,
  Pill,
  ArrowRight,
  Sparkles,
  Heart,
  Activity,
  CheckCircle2,
  FileCheck2,
  Leaf,
  Layers,
} from 'lucide-react';
import { getStats, getCategories, getTopGenerics } from '@/lib/data';
import HomeSearchHero from '@/components/HomeSearchHero';

export const revalidate = 86400; // ISR 24h

export default async function HomePage() {
  const stats = await getStats();
  const categories = await getCategories();
  const topGenerics = await getTopGenerics(12);

  const quickPills = [
    { label: 'Paracetamol', href: '/generic/paracetamol', category: 'Fever & Pain' },
    { label: 'Atenolol', href: '/generic/atenolol', category: 'Blood Pressure' },
    { label: 'Metformin', href: '/generic/metformin', category: 'Diabetes' },
    { label: 'Atorvastatin', href: '/generic/atorvastatin', category: 'Cholesterol' },
    { label: 'Amoxicillin', href: '/generic/amoxicillin', category: 'Antibiotics' },
    { label: 'Omeprazole', href: '/generic/omeprazole', category: 'Gastric & Acid' },
    { label: 'Supplements (MAL-N)', href: '/category/supplement', category: 'Vitamins' },
    { label: 'Traditional (MAL-T)', href: '/category/traditional', category: 'Herbal' },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section with Search */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-gradient-to-b from-teal-50/50 via-white to-white dark:from-teal-950/20 dark:via-zinc-950 dark:to-zinc-950 swiss-grid">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 dark:bg-teal-950/80 border border-teal-200/80 dark:border-teal-800 text-teal-800 dark:text-teal-300 text-xs font-semibold mb-6 shadow-xs">
            <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Official KKM & NPRA Malaysia Open Regulatory Data</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 max-w-4xl mx-auto leading-tight sm:leading-tight">
            Malaysia NPRA Pharmaceutical &amp; Supplement{' '}
            <span className="text-teal-600 dark:text-teal-400">Verification Engine</span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Semakan status pendaftaran ubat KKM. Instant verification of MAL registration numbers, active ingredients, and registered generic alternatives across Malaysia.
          </p>

          {/* Interactive Search Bar Component */}
          <div className="mt-8 max-w-2xl mx-auto">
            <HomeSearchHero />
          </div>

          {/* Quick Navigation Pills */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto">
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider mr-1">
              Quick Semakan:
            </span>
            {quickPills.map((pill) => (
              <Link
                key={pill.label}
                href={pill.href}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 hover:border-teal-500 hover:text-teal-600 dark:hover:border-teal-400 dark:hover:text-teal-400 shadow-2xs transition-all"
              >
                <span>{pill.label}</span>
                <span className="text-[10px] text-zinc-400 font-mono">({pill.category})</span>
              </Link>
            ))}
          </div>

          {/* Stats Bar */}
          <div className="mt-12 pt-8 border-t border-zinc-200/60 dark:border-zinc-800/60 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center">
            <div className="p-4 rounded-2xl bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs">
              <div className="text-2xl sm:text-3xl font-bold font-mono text-zinc-900 dark:text-zinc-100 tabular-nums">
                {stats.total_products.toLocaleString()}+
              </div>
              <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-1">
                KKM Registered Products
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 shadow-xs">
              <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                {stats.approved_count.toLocaleString()}
              </div>
              <div className="text-xs font-medium text-emerald-700 dark:text-emerald-400 mt-1">
                Approved &amp; Active
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200/60 dark:border-teal-900/40 shadow-xs">
              <div className="text-2xl sm:text-3xl font-bold font-mono text-teal-600 dark:text-teal-400 tabular-nums">
                {stats.total_generics.toLocaleString()}+
              </div>
              <div className="text-xs font-medium text-teal-700 dark:text-teal-400 mt-1">
                Generic Molecule Maps
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs">
              <div className="text-2xl sm:text-3xl font-bold font-mono text-zinc-900 dark:text-zinc-100 tabular-nums">
                100%
              </div>
              <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-1">
                NPRA Official Records
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NPRA Product Classification Categories */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-1">
              Regulatory Framework
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              NPRA Drug Classifications in Malaysia
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl">
              Understand the legal classification of your medication or health supplement according to Ministry of Health (KKM) poison schedules.
            </p>
          </div>
          <Link
            href="/search"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 transition-colors"
          >
            <span>Explore Complete Directory</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Prescription Card */}
          <Link
            href="/category/prescription"
            className="group rounded-2xl border border-zinc-200 dark:border-zinc-800 border-t-4 border-t-blue-500 bg-white dark:bg-zinc-950 p-6 transition-all hover:border-blue-500 hover:shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 border border-blue-200 dark:border-blue-900">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <span className="font-mono text-xs font-semibold bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded">
                MAL...A
              </span>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-2.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Prescription Medicine
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">
                Ethical medicines requiring a registered doctor&apos;s prescription under Poison Act 1952.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
              <span className="font-mono tabular-nums font-semibold text-zinc-700 dark:text-zinc-300">
                {(categories.prescription?.count || 9032).toLocaleString()} Indexed
              </span>
              <span className="text-blue-600 dark:text-blue-400 font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center">
                Browse →
              </span>
            </div>
          </Link>

          {/* OTC Card */}
          <Link
            href="/category/otc"
            className="group rounded-2xl border border-zinc-200 dark:border-zinc-800 border-t-4 border-t-emerald-500 bg-white dark:bg-zinc-950 p-6 transition-all hover:border-emerald-500 hover:shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 border border-emerald-200 dark:border-emerald-900">
                <Pill className="w-5 h-5" />
              </div>
              <span className="font-mono text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded">
                MAL...X
              </span>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-2.5 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                Over-the-Counter (OTC)
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">
                Non-scheduled medications available over-the-counter for self-treatment of common ailments.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
              <span className="font-mono tabular-nums font-semibold text-zinc-700 dark:text-zinc-300">
                {(categories.otc?.count || 693).toLocaleString()} Indexed
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center">
                Browse →
              </span>
            </div>
          </Link>

          {/* Health Supplement Card */}
          <Link
            href="/category/supplement"
            className="group rounded-2xl border border-zinc-200 dark:border-zinc-800 border-t-4 border-t-purple-500 bg-white dark:bg-zinc-950 p-6 transition-all hover:border-purple-500 hover:shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4 border border-purple-200 dark:border-purple-900">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="font-mono text-xs font-semibold bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300 px-2 py-0.5 rounded">
                MAL...N
              </span>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-2.5 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                Health Supplements
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">
                Vitamins, minerals, amino acids, and dietary supplements evaluated for purity and safety.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
              <span className="font-mono tabular-nums font-semibold text-zinc-700 dark:text-zinc-300">
                {(categories.supplement?.count || 4362).toLocaleString()} Indexed
              </span>
              <span className="text-purple-600 dark:text-purple-400 font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center">
                Browse →
              </span>
            </div>
          </Link>

          {/* Traditional Medicine Card */}
          <Link
            href="/category/traditional"
            className="group rounded-2xl border border-zinc-200 dark:border-zinc-800 border-t-4 border-t-amber-500 bg-white dark:bg-zinc-950 p-6 transition-all hover:border-amber-500 hover:shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4 border border-amber-200 dark:border-amber-900">
                <Leaf className="w-5 h-5" />
              </div>
              <span className="font-mono text-xs font-semibold bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded">
                MAL...T
              </span>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-2.5 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                Traditional &amp; Herbal
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">
                Herbal formulas, Traditional Chinese Medicine (TCM), Jamu, and Ayurvedic remedies.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
              <span className="font-mono tabular-nums font-semibold text-zinc-700 dark:text-zinc-300">
                {(categories.traditional?.count || 13122).toLocaleString()} Indexed
              </span>
              <span className="text-amber-600 dark:text-amber-400 font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center">
                Browse →
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* Top Generic Molecules Directory */}
      <section className="py-12 bg-zinc-50/60 dark:bg-zinc-900/30 border-y border-zinc-200/80 dark:border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-2">
            <div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                Most Searched Generic Molecules in Malaysia
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Find lower-cost approved generic alternatives with identical active substances and therapeutic efficacy.
              </p>
            </div>
            <Link
              href="/search"
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400"
            >
              View 5,100+ Generic Hubs →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {topGenerics.map((gen) => (
              <Link
                key={gen.slug}
                href={`/generic/${gen.slug}`}
                className="group rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-3.5 transition-all hover:border-teal-500 hover:shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0" />
                    <span className="text-[10px] font-mono text-zinc-400">NPRA</span>
                  </div>
                  <h4 className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 line-clamp-1 transition-colors">
                    {gen.name}
                  </h4>
                  <div className="mt-2 text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                    <strong className="text-zinc-800 dark:text-zinc-200 tabular-nums">
                      {gen.total_products}
                    </strong>{' '}
                    Registered Brands
                  </div>
                </div>
                <div className="mt-3 text-[10px] text-teal-600 dark:text-teal-400 font-semibold group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                  <span>Compare Brands</span>
                  <span>→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FarmaChecker / Meditag Security Hologram Featurette */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-gradient-to-r from-teal-900 via-teal-800 to-zinc-950 text-white p-8 sm:p-12 shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-800/80 border border-teal-700 text-teal-200 text-xs font-semibold mb-4">
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
              <span>Consumer Safety Alert</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Always Verify Physical KKM Hologram Stickers
            </h3>
            <p className="mt-3 text-sm text-teal-100/90 leading-relaxed">
              Every genuine medicine registered with NPRA in Malaysia features a security hologram sticker on the box. Use the official FarmaChecker mobile application to scan the security code before consumption.
            </p>
            <div className="mt-6 flex flex-wrap gap-4 text-xs font-mono">
              <div className="bg-white/10 backdrop-blur-xs border border-white/20 rounded-lg px-3 py-2">
                ✓ Meditag Security Hologram
              </div>
              <div className="bg-white/10 backdrop-blur-xs border border-white/20 rounded-lg px-3 py-2">
                ✓ Official FarmaChecker App Scan
              </div>
              <div className="bg-white/10 backdrop-blur-xs border border-white/20 rounded-lg px-3 py-2">
                ✓ Valid MAL Registration Number
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
