import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ShieldCheck,
  Building2,
  Calendar,
  Factory,
  Pill,
  ExternalLink,
  Sparkles,
  ChevronRight,
  Truck,
  ArrowUpRight,
} from 'lucide-react';
import { getProduct, getGenericHub, getTopGenerics } from '@/lib/data';
import { formatDate, isDateExpired, getCategoryBadgeClass } from '@/lib/utils';
import VerificationBadge from '@/components/VerificationBadge';
import ActiveIngredientsMatrix from '@/components/ActiveIngredientsMatrix';
import GenericAlternativeGrid from '@/components/GenericAlternativeGrid';
import HologramGuidance from '@/components/HologramGuidance';
import { PharmacyAffiliateButton, AdUnitSlot } from '@/components/MonetizationSlots';
import CompareButton from '@/components/CompareButton';
import FaqAccordion, { type FaqItem } from '@/components/FaqAccordion';

interface PageProps {
  params: { slug: string };
}

export const revalidate = 86400; // ISR 24h

// Pre-render top 200 popular/essential products at build time for instant speed & zero Vercel compute
export async function generateStaticParams() {
  const topGenerics = await getTopGenerics(20);
  const slugs: { slug: string }[] = [];
  for (const g of topGenerics) {
    const hub = await getGenericHub(g.slug);
    if (hub) {
      for (const p of hub.products.slice(0, 10)) {
        slugs.push({ slug: p.slug });
      }
    }
  }
  return slugs.slice(0, 200);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const product = await getProduct(params.slug);
  if (!product) {
    return {
      title: 'Product Not Found | NutriDive',
    };
  }

  const primaryIngredient = product.active_ingredients[0]
    ? `${product.active_ingredients[0].name} (${product.active_ingredients[0].dosage})`
    : product.primary_molecule;

  const title = `${product.product_name} (${product.reg_no}) - Status KKM, Ingredients & Generic Alternatives`;
  const description = `Semakan status KKM untuk ${product.product_name} (${product.reg_no}). Bahan aktif: ${primaryIngredient}. Pendaftaran rasmi oleh ${product.holder}. Bandingkan jenama generik pengganti berdaftar NPRA di Malaysia.`;

  return {
    title,
    description,
    keywords: [
      product.reg_no,
      product.product_name,
      product.primary_molecule,
      product.holder,
      'Semakan status pendaftaran KKM',
      'NPRA Malaysia medicine directory',
      'Bahan aktif ubat',
      'Generic brand alternative Malaysia',
      'Nombor MAL berdaftar',
      'Ubat berdaftar KKM',
      'Pengganti ubat farmasi',
    ],
    openGraph: {
      title,
      description,
      url: `https://nutridive.net/mal/${product.slug}`,
      type: 'article',
      locale: 'en_MY',
    },
    alternates: {
      canonical: `https://nutridive.net/mal/${product.slug}`,
      languages: {
        'en-MY': `https://nutridive.net/mal/${product.slug}`,
        'ms-MY': `https://nutridive.net/mal/${product.slug}`,
      },
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const product = await getProduct(params.slug);

  if (!product) {
    notFound();
  }

  // Fetch generic alternatives
  const genericHub = await getGenericHub(product.generic_slug);
  const alternatives = genericHub ? genericHub.products : [];

  const badge = getCategoryBadgeClass(product.category.code);
  const primaryIngredientText =
    product.active_ingredients
      .map((i) => (i.dosage ? `${i.name} ${i.dosage}` : i.name))
      .join(', ') || product.primary_molecule;

  // AI SEO / RAG 2-sentence summary block:
  const ragSummary = `${product.product_name} is an officially registered ${product.category.name} in Malaysia under MAL number ${product.reg_no} by ${product.holder}. Its declared active therapeutic formulation is ${primaryIngredientText || 'specialized composition'}, manufactured by ${product.manufacturer || product.holder}.`;

  // FAQ Items for interactive Accordion + Rich Snippet schema
  const faqItems: FaqItem[] = [
    {
      question: `Is ${product.product_name} approved by KKM / NPRA in Malaysia?`,
      answer: (
        <span>
          Yes. <strong>{product.product_name}</strong> is officially registered with the National Pharmaceutical Regulatory Agency (NPRA), Ministry of Health Malaysia under registration number <strong>{product.reg_no}</strong> with current status <em>&ldquo;{product.status}&rdquo;</em>. Product Registration Holder (PRH) is {product.holder}.
        </span>
      ),
    },
    {
      question: `What are the active therapeutic ingredients of ${product.product_name}?`,
      answer: (
        <span>
          The declared active therapeutic components evaluated by NPRA are: <strong>{primaryIngredientText}</strong>. Please consult a licensed doctor or community pharmacist for dosage and administration guidance.
        </span>
      ),
    },
    {
      question: `What are the registered generic alternatives for ${product.product_name}?`,
      answer: (
        <span>
          In Malaysia, there are <strong>{alternatives.length}</strong> approved brand formulations sharing the identical active ingredient ({product.primary_molecule}). You can review them in the alternative brands section above or compare them side-by-side using the Compare tool.
        </span>
      ),
    },
  ];

  // Schema.org JSON-LD
  const isSupplement = product.category.code === 'N';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': isSupplement ? 'DietarySupplement' : 'Drug',
        name: product.product_name,
        identifier: product.reg_no,
        legalStatus: product.category.code === 'A' ? 'PrescriptionOnly' : 'OTC',
        activeIngredient: product.active_ingredients.map((i) => i.name),
        manufacturer: {
          '@type': 'Organization',
          name: product.manufacturer || product.holder,
        },
        proprietaryName: product.product_name,
        nonProprietaryName: product.generic_name,
        recognizingAuthority: {
          '@type': 'GovernmentOrganization',
          name: 'National Pharmaceutical Regulatory Agency (NPRA), Ministry of Health Malaysia (KKM)',
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://nutridive.net',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: product.category.name,
            item: `https://nutridive.net/category/${product.category.slug}`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: product.product_name,
            item: `https://nutridive.net/mal/${product.slug}`,
          },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: `Is ${product.product_name} approved by KKM / NPRA in Malaysia?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `Yes, ${product.product_name} is officially registered with the National Pharmaceutical Regulatory Agency (NPRA), Ministry of Health Malaysia under registration number ${product.reg_no} with status "${product.status}".`,
            },
          },
          {
            '@type': 'Question',
            name: `What are the active ingredients of ${product.product_name}?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `The active ingredients of ${product.product_name} as declared to NPRA are: ${primaryIngredientText}.`,
            },
          },
          {
            '@type': 'Question',
            name: `What are the generic alternatives for ${product.product_name} in Malaysia?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `There are ${alternatives.length} approved pharmaceutical formulations registered in Malaysia containing the same active ingredient (${product.primary_molecule}), which can be compared for cost and availability.`,
            },
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 mb-5 overflow-x-auto">
          <Link href="/" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
          <Link
            href={`/category/${product.category.slug}`}
            className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors capitalize"
          >
            {product.category.short}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
          <span className="font-mono text-zinc-800 dark:text-zinc-200 truncate max-w-[200px] sm:max-w-none">
            {product.reg_no}
          </span>
        </nav>

        {/* Unified Clinical Product Card */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono font-bold text-xs sm:text-sm bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 px-2.5 py-1 rounded-md tracking-wider">
                  {product.reg_no}
                </span>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${badge.bg} ${badge.text} ${badge.border}`}
                >
                  {badge.label}
                </span>
                {product.category.code === 'A' && (
                  <span className="text-[11px] font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded-md">
                    Ubat Preskripsi
                  </span>
                )}
                {product.category.code === 'X' && (
                  <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-md">
                    Ubat Am (OTC)
                  </span>
                )}
                {product.category.code === 'N' && (
                  <span className="text-[11px] font-medium text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 px-2 py-0.5 rounded-md">
                    Suplemen Kesihatan
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 pt-1">
                {product.product_name}
              </h1>

              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                Active Generic Molecule:{' '}
                <Link
                  href={`/generic/${product.generic_slug}`}
                  className="font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 underline underline-offset-4"
                >
                  {product.generic_name}
                </Link>
              </p>
            </div>

            {/* Action Bar: Compare Button & Verification Badge */}
            <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-3 shrink-0">
              <VerificationBadge
                status={product.status}
                regNo={product.reg_no}
                dateEnd={product.date_end}
                size="lg"
              />

              {/* High-visibility Compare Button */}
              <CompareButton
                item={{
                  slug: product.slug,
                  reg_no: product.reg_no,
                  product_name: product.product_name,
                  category_code: product.category.code,
                  generic_name: product.generic_name,
                  holder: product.holder,
                  dosage: primaryIngredientText,
                }}
                variant="button"
                className="w-full sm:w-auto"
              />
            </div>
          </div>

          {/* AI SEO & Regulatory Summary Strip */}
          <div className="mt-5 rounded-xl border border-teal-200/70 dark:border-teal-900/60 bg-teal-50/30 dark:bg-teal-950/20 p-3.5 sm:p-4 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
            <div className="flex items-center gap-1.5 font-semibold text-teal-800 dark:text-teal-300 text-[11px] uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>NPRA Official Regulatory Summary</span>
            </div>
            <p>{ragSummary}</p>
          </div>

          {/* Registration Specs Strip with Deep Cross-Linking */}
          <div className="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {/* Holder (PRH) + Deep Cross-Link */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-zinc-400">
                <Building2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>Holder (PRH)</span>
              </div>
              <div className="font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-2" title={product.holder}>
                {product.holder || 'Not Disclosed'}
              </div>
              {product.holder && (
                <Link
                  href={`/search?q=${encodeURIComponent(product.holder)}&cat=ALL`}
                  className="inline-flex items-center gap-0.5 text-[11px] text-teal-600 dark:text-teal-400 hover:underline font-medium"
                >
                  <span>All products by holder</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              )}
            </div>

            {/* Manufacturer + Deep Cross-Link */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-zinc-400">
                <Factory className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>Manufacturer</span>
              </div>
              <div className="font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-2" title={product.manufacturer}>
                {product.manufacturer || 'Not Disclosed'}
              </div>
              {product.manufacturer && (
                <Link
                  href={`/search?q=${encodeURIComponent(product.manufacturer)}&cat=ALL`}
                  className="inline-flex items-center gap-0.5 text-[11px] text-teal-600 dark:text-teal-400 hover:underline font-medium"
                >
                  <span>All by manufacturer</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              )}
            </div>

            {/* Registration Dates */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-zinc-400">
                <Calendar className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>Registration Timeline</span>
              </div>
              <div className="font-mono text-zinc-800 dark:text-zinc-200">
                Registered: <strong>{formatDate(product.date_reg)}</strong>
              </div>
              <div className="font-mono text-zinc-600 dark:text-zinc-400 text-[11px]">
                Valid until: <strong className="text-zinc-800 dark:text-zinc-200">{formatDate(product.date_end)}</strong>
              </div>
            </div>

            {/* Importer or Hologram Spec */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-zinc-400">
                {product.importer ? (
                  <>
                    <Truck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    <span>Importer</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    <span>Security Hologram</span>
                  </>
                )}
              </div>
              {product.importer ? (
                <>
                  <div className="font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-2" title={product.importer}>
                    {product.importer}
                  </div>
                  <Link
                    href={`/search?q=${encodeURIComponent(product.importer)}&cat=ALL`}
                    className="inline-flex items-center gap-0.5 text-[11px] text-teal-600 dark:text-teal-400 hover:underline font-medium"
                  >
                    <span>Products by importer</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </>
              ) : (
                <div className="text-zinc-800 dark:text-zinc-200 font-medium">
                  KKM Meditag / FarmaChecker Required
                </div>
              )}
            </div>
          </div>

          {/* Pharmacy Action Link */}
          <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800/60">
            <PharmacyAffiliateButton
              productName={product.product_name}
              categoryCode={product.category.code}
            />
          </div>
        </div>

        {/* Formulation & Active Ingredients Section */}
        <div className="mt-8">
          <ActiveIngredientsMatrix
            ingredients={product.active_ingredients}
            productName={product.product_name}
            categoryCode={product.category.code}
          />
        </div>

        {/* Ad Unit: In-Content Slot */}
        <AdUnitSlot slot="in_content" />

        {/* Generic Alternative Grid Section */}
        <div className="mt-8">
          <GenericAlternativeGrid
            currentSlug={product.slug}
            genericName={product.primary_molecule}
            genericSlug={product.generic_slug}
            alternatives={alternatives}
            currentProduct={{
              reg_no: product.reg_no,
              product_name: product.product_name,
              category_code: product.category.code,
              holder: product.holder,
              dosage: primaryIngredientText,
            }}
          />
        </div>

        {/* Meditag / FarmaChecker Security Hologram Guidance */}
        <div className="mt-10">
          <HologramGuidance regNo={product.reg_no} />
        </div>

        {/* Automated Collapsible FAQ Section for Rich Snippets & Clean Modern UI */}
        <div className="mt-10">
          <FaqAccordion
            title="Frequently Asked Questions & NPRA Verification Details"
            items={faqItems}
          />
        </div>

        {/* Bicultural Malaysian Search Terms Footer */}
        <div className="mt-8 text-center text-[11px] text-zinc-400 dark:text-zinc-500 space-y-1">
          <p>
            Semakan status pendaftaran KKM / NPRA: {product.product_name} ({product.reg_no}) | Pengganti ubat berdaftar di Malaysia | Bahan aktif &amp; maklumat farmasi Kementerian Kesihatan Malaysia.
          </p>
        </div>
      </div>
    </>
  );
}
