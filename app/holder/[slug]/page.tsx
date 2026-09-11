import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Building2,
  MapPin,
  Phone,
  ShieldCheck,
  ChevronRight,
  Factory,
  Truck,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { getHolder, getTopHolders } from '@/lib/data';
import HolderProductView from '@/components/HolderProductView';

interface PageProps {
  params: { slug: string };
}

export const dynamic = 'force-static';
export const dynamicParams = true;

export async function generateStaticParams() {
  const topHolders = await getTopHolders(50);
  return topHolders.map((h) => ({
    slug: h.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const holder = await getHolder(params.slug);
  if (!holder) {
    return {
      title: 'Company Not Found | NutriDive',
    };
  }

  const title = `${holder.name}: Registered Pharmaceutical & Health Products in Malaysia`;
  const description = `Official product portfolio for ${holder.name} (PRH) registered with the National Pharmaceutical Regulatory Agency (NPRA / KKM). View ${holder.total_products} approved and cancelled products.`;

  return {
    title,
    description,
    keywords: [
      holder.name,
      `${holder.name} Malaysia`,
      `${holder.name} products`,
      'Product Registration Holder Malaysia',
      'NPRA registered company',
    ],
    openGraph: {
      title,
      description,
      url: `https://nutridive.net/holder/${holder.slug}`,
      type: 'website',
    },
    alternates: {
      canonical: `https://nutridive.net/holder/${holder.slug}`,
    },
  };
}

export default async function HolderDetailPage({ params }: PageProps) {
  const holder = await getHolder(params.slug);
  if (!holder) {
    notFound();
  }

  // Schema.org JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: holder.name,
    url: `https://nutridive.net/holder/${holder.slug}`,
    address: holder.address
      ? {
          '@type': 'PostalAddress',
          streetAddress: holder.address,
          addressRegion: holder.state || undefined,
          postalCode: holder.postcode || undefined,
          addressCountry: 'MY',
        }
      : undefined,
    telephone: holder.phone || undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500 mb-8">
          <Link href="/" className="hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-zinc-400">Companies &amp; PRH</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-zinc-700 dark:text-zinc-200 truncate max-w-[200px] sm:max-w-none">
            {holder.name}
          </span>
        </nav>

        {/* Company Header Profile Card */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 sm:p-8 mb-8 shadow-xs">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">
              Product Registration Holder (PRH)
            </span>
            {holder.is_approved_manufacturer && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                <Factory className="w-3 h-3" />
                <span>GMP Manufacturer</span>
              </span>
            )}
            {holder.is_approved_importer && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 flex items-center gap-1">
                <Truck className="w-3 h-3" />
                <span>Licensed Importer</span>
              </span>
            )}
            {holder.is_approved_wholesaler && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                Licensed Wholesaler
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 leading-tight">
            {holder.name}
          </h1>

          {/* Address & Contact if available from official licensing register */}
          {(holder.address || holder.phone || holder.state) && (
            <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 space-y-1.5">
              {holder.address && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                  <span>
                    {holder.address}
                    {holder.postcode && `, ${holder.postcode}`}
                    {holder.state && `, ${holder.state}`}
                  </span>
                </div>
              )}
              {holder.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <span>{holder.phone}</span>
                </div>
              )}
            </div>
          )}

          {/* Stats Metrics Bar */}
          <div className="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-800 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100 tabular-nums">
                {holder.total_products}
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Total Products
              </div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                {holder.approved_count}
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Active / Approved
              </div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-zinc-700 dark:text-zinc-300 tabular-nums">
                {holder.cancelled_count}
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Cancelled / Revoked
              </div>
            </div>
          </div>
        </div>

        {/* Product Portfolio Section */}
        <section>
          <div className="mb-4">
            <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Registered Product Portfolio
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Browse all pharmaceutical and supplement formulations registered in Malaysia under {holder.name}.
            </p>
          </div>

          <HolderProductView
            products={holder.products}
            companyName={holder.name}
          />
        </section>

        {/* Independent Disclaimer */}
        <footer className="mt-12 text-[11px] text-zinc-400 dark:text-zinc-500 border-t border-zinc-200/70 dark:border-zinc-800/70 pt-6 leading-relaxed">
          Company registration data and product portfolio sourced from the National Pharmaceutical Regulatory Agency (NPRA) open data catalog (data.gov.my). NutriDive is an independent community directory.
        </footer>
      </div>
    </>
  );
}
