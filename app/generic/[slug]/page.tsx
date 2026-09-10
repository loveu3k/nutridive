import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Pill,
  ShieldCheck,
  Building2,
  ChevronRight,
  ArrowLeft,
  Search,
  Sparkles,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import { getGenericHub, getTopGenerics } from '@/lib/data';
import { GenericHubProductView } from '@/components/GenericHubProductView';

interface PageProps {
  params: { slug: string };
}

export const revalidate = 86400; // ISR 24h

// Pre-render the top 100 most popular generic molecules at build time
// to ensure zero cold-start latency and zero Vercel serverless executions!
export async function generateStaticParams() {
  const topGenerics = await getTopGenerics(100);
  return topGenerics.map((g) => ({
    slug: g.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const hub = await getGenericHub(params.slug);
  if (!hub) {
    return {
      title: 'Generic Ingredient Not Found | NutriDive',
    };
  }

  const title = `${hub.name} in Malaysia: Registered Brands, Dosages & Price Comparison`;
  const description = `Complete directory of all ${hub.total_products} KKM-approved brand formulations containing ${hub.name} in Malaysia. Compare prescription (MAL-A) vs OTC (MAL-X) brands and active dosages.`;

  return {
    title,
    description,
    keywords: [
      hub.name,
      `${hub.name} Malaysia`,
      `${hub.name} generic alternative`,
      `Pengganti ubat ${hub.name}`,
      `Jenama ${hub.name} berdaftar KKM`,
      'NPRA Malaysia generic substitution',
    ],
    openGraph: {
      title,
      description,
      url: `https://nutridive.net/generic/${hub.slug}`,
      type: 'article',
    },
    alternates: {
      canonical: `https://nutridive.net/generic/${hub.slug}`,
    },
  };
}

export default async function GenericHubPage({ params }: PageProps) {
  const hub = await getGenericHub(params.slug);

  if (!hub) {
    notFound();
  }

  // Schema.org JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    name: `${hub.name} Registered Brands in Malaysia`,
    about: {
      '@type': 'Substance',
      name: hub.name,
    },
    description: `Directory of ${hub.total_products} registered brand products containing ${hub.name} in Malaysia based on public open regulatory records.`,
    publisher: {
      '@type': 'Organization',
      name: 'NutriDive Malaysia',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 mb-6">
          <Link href="/" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
          <Link href="/search" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
            Generic Molecules
          </Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
          <span className="font-semibold text-zinc-800 dark:text-zinc-200">{hub.name}</span>
        </nav>

        {/* Hero Header */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 md:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 text-xs font-semibold">
                <Pill className="w-3.5 h-3.5" />
                <span>Active Substance &amp; Generic Molecule Directory</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                {hub.name} in Malaysia: Registered Brands, Dosages &amp; Price Comparison
              </h1>

              <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-3xl leading-relaxed">
                Directory of all approved pharmaceutical brands containing <strong>{hub.name}</strong> registered with the National Pharmaceutical Regulatory Agency (NPRA) / Ministry of Health Malaysia (KKM).
              </p>
            </div>

            {/* Total Count Pill */}
            <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-center shrink-0 min-w-[140px]">
              <div className="text-3xl font-bold font-mono text-teal-600 dark:text-teal-400 tabular-nums">
                {hub.total_products}
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Registered Brands
              </div>
            </div>
          </div>

          {/* Breakdown Badges */}
          <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-wrap items-center gap-3 text-xs">
            <span className="text-zinc-400 font-medium">Availability in Malaysia:</span>
            {hub.prescription_count > 0 && (
              <span className="font-mono bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-2.5 py-1 rounded-full font-medium">
                {hub.prescription_count} Prescription (MAL-A)
              </span>
            )}
            {hub.otc_count > 0 && (
              <span className="font-mono bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-full font-medium">
                {hub.otc_count} Over-The-Counter (MAL-X)
              </span>
            )}
            {hub.supplement_count > 0 && (
              <span className="font-mono bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 px-2.5 py-1 rounded-full font-medium">
                {hub.supplement_count} Supplements (MAL-N)
              </span>
            )}
            {hub.traditional_count > 0 && (
              <span className="font-mono bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 px-2.5 py-1 rounded-full font-medium">
                {hub.traditional_count} Traditional (MAL-T)
              </span>
            )}
          </div>
        </div>

        {/* Interactive Pharmacist Generic Products Directory (Table/Cards & Dosage Filter) */}
        <div className="mt-8">
          <GenericHubProductView
            products={hub.products}
            moleculeName={hub.name}
          />
        </div>

        {/* Related Generic Molecules in Malaysia (Internal Linking Matrix for SEO & Discovery) */}
        <section className="mt-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
            <div>
              <h3 className="font-bold text-base sm:text-lg text-zinc-900 dark:text-zinc-100">
                Explore Other Active Molecules in Malaysia
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Frequently prescribed therapeutic active substances registered under NPRA / KKM.
              </p>
            </div>
            <Link
              href="/search"
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400"
            >
              Search All Molecules →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
            {[
              { name: 'Paracetamol', slug: 'paracetamol', desc: 'Analgesic / Antipyretic' },
              { name: 'Atenolol', slug: 'atenolol', desc: 'Antihypertensive' },
              { name: 'Metformin', slug: 'metformin', desc: 'Antidiabetic' },
              { name: 'Atorvastatin', slug: 'atorvastatin', desc: 'Lipid Lowering' },
              { name: 'Amoxicillin', slug: 'amoxicillin', desc: 'Antibacterial' },
              { name: 'Omeprazole', slug: 'omeprazole', desc: 'Proton Pump Inhibitor' },
              { name: 'Cetirizine', slug: 'cetirizine', desc: 'Antihistamine' },
              { name: 'Amlodipine', slug: 'amlodipine', desc: 'Calcium Channel Blocker' },
              { name: 'Ibuprofen', slug: 'ibuprofen', desc: 'NSAID / Anti-inflammatory' },
              { name: 'Loratadine', slug: 'loratadine', desc: 'Allergy / Antihistamine' },
              { name: 'Losartan', slug: 'losartan', desc: 'ARB Antihypertensive' },
              { name: 'Pantoprazole', slug: 'pantoprazole', desc: 'Gastric Acid Reducer' },
            ]
              .filter((m) => m.slug !== hub.slug)
              .slice(0, 6)
              .map((molecule) => (
                <Link
                  key={molecule.slug}
                  href={`/generic/${molecule.slug}`}
                  className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-3 text-center transition-all hover:border-teal-500 hover:shadow-xs group"
                >
                  <div className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 truncate">
                    {molecule.name}
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-1 truncate">
                    {molecule.desc}
                  </div>
                </Link>
              ))}
          </div>
        </section>

        {/* Bioequivalence & Generic Substitution Advice */}
        <div className="mt-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 p-6">
          <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 mb-2">
            Generic Bioequivalence &amp; Drug Substitution in Malaysia (Panduan Penggantian Generik)
          </h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Generic medications registered under NPRA contain the identical active pharmaceutical ingredient (API) in identical dosage strength and route of administration as the originator brand. NPRA requires rigorous bioequivalence (BE) studies demonstrating that generic drugs deliver the exact therapeutic effect. Always confirm with your doctor or community pharmacist before switching between prescription brands.
          </p>
        </div>
      </div>
    </>
  );
}
