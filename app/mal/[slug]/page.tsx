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
  HelpCircle,
  Sparkles,
  ArrowLeft,
  ChevronRight,
  Info,
} from 'lucide-react';
import { getProduct, getGenericHub } from '@/lib/data';
import { formatDate, isDateExpired, getCategoryBadgeClass } from '@/lib/utils';
import VerificationBadge from '@/components/VerificationBadge';
import ActiveIngredientsMatrix from '@/components/ActiveIngredientsMatrix';
import GenericAlternativeGrid from '@/components/GenericAlternativeGrid';
import HologramGuidance from '@/components/HologramGuidance';
import { PharmacyAffiliateButton, AdUnitSlot } from '@/components/MonetizationSlots';

interface PageProps {
  params: { slug: string };
}

export const revalidate = 86400; // ISR

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

  const title = `${product.product_name} (${product.reg_no}) - Status, Ingredients & Generic Alternatives`;
  const description = `Semakan status KKM untuk ${product.product_name} (${product.reg_no}). Bahan aktif: ${primaryIngredient}. Pendaftaran oleh ${product.holder}. Cari jenama generik pengganti di Malaysia.`;

  return {
    title,
    description,
    keywords: [
      product.reg_no,
      product.product_name,
      product.primary_molecule,
      product.holder,
      'Semakan status pendaftaran KKM',
      'NPRA Malaysia medicine',
      'Bahan aktif ubat',
      'Generic brand alternative Malaysia',
      'Nombor MAL berdaftar',
    ],
    openGraph: {
      title,
      description,
      url: `https://nutridive.net/mal/${product.slug}`,
      type: 'article',
    },
    alternates: {
      canonical: `https://nutridive.net/mal/${product.slug}`,
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
  const primaryIngredientText = product.active_ingredients
    .map((i) => (i.dosage ? `${i.name} ${i.dosage}` : i.name))
    .join(', ') || product.primary_molecule;

  // AI SEO / RAG 2-sentence summary block:
  const ragSummary = `${product.product_name} is a KKM-approved ${product.category.name} registered under MAL number ${product.reg_no} by ${product.holder}. Its active ingredient is ${primaryIngredientText || 'specified regulatory formulation'}, manufactured by ${product.manufacturer || product.holder}.`;

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
          name: 'National Pharmaceutical Regulatory Agency (NPRA), Ministry of Health Malaysia',
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 mb-6 overflow-x-auto">
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

        {/* Top Header Card */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 md:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono font-bold text-sm bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 px-2.5 py-1 rounded-md tracking-wider">
                  {product.reg_no}
                </span>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${badge.bg} ${badge.text} ${badge.border}`}
                >
                  {badge.label}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mt-2">
                {product.product_name}
              </h1>

              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Generic Molecule:{' '}
                <Link
                  href={`/generic/${product.generic_slug}`}
                  className="font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400 underline underline-offset-4"
                >
                  {product.generic_name}
                </Link>
              </p>
            </div>

            {/* Verification Badge */}
            <div className="shrink-0">
              <VerificationBadge
                status={product.status}
                regNo={product.reg_no}
                dateEnd={product.date_end}
                size="lg"
              />
            </div>
          </div>

          {/* AI SEO & LLM RAG Zero-Ambiguity Summary Block */}
          <div className="mt-6 rounded-xl border border-teal-200/80 dark:border-teal-900/60 bg-teal-50/40 dark:bg-teal-950/20 p-4 text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed">
            <div className="flex items-center gap-1.5 font-semibold text-teal-800 dark:text-teal-300 text-[11px] uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>NPRA Official Regulatory Summary</span>
            </div>
            <p>{ragSummary}</p>
          </div>

          {/* Monetization / Action Hook */}
          <div className="mt-6">
            <PharmacyAffiliateButton
              productName={product.product_name}
              categoryCode={product.category.code}
            />
          </div>
        </div>

        {/* Ad Unit: Leaderboard Slot */}
        <AdUnitSlot slot="leaderboard" />

        {/* Metadata Grid */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Holder */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4">
            <div className="flex items-center gap-2 text-zinc-400 text-xs mb-1.5">
              <Building2 className="w-4 h-4 text-teal-600" />
              <span>Registration Holder (PRH)</span>
            </div>
            <div className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 leading-snug">
              {product.holder || 'Not Disclosed'}
            </div>
          </div>

          {/* Manufacturer */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4">
            <div className="flex items-center gap-2 text-zinc-400 text-xs mb-1.5">
              <Factory className="w-4 h-4 text-teal-600" />
              <span>Manufacturer</span>
            </div>
            <div className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 leading-snug">
              {product.manufacturer || 'Not Disclosed'}
            </div>
          </div>

          {/* Registration Date */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4">
            <div className="flex items-center gap-2 text-zinc-400 text-xs mb-1.5">
              <Calendar className="w-4 h-4 text-teal-600" />
              <span>First Registered</span>
            </div>
            <div className="font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">
              {formatDate(product.date_reg)}
            </div>
          </div>

          {/* Expiry Date */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4">
            <div className="flex items-center gap-2 text-zinc-400 text-xs mb-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>Registration Validity</span>
            </div>
            <div className="font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">
              {formatDate(product.date_end)}
            </div>
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
          />
        </div>

        {/* Meditag / FarmaChecker Security Hologram Guidance */}
        <div className="mt-12">
          <HologramGuidance regNo={product.reg_no} />
        </div>

        {/* Automated FAQ Section for Rich Snippets & Search Engine Optimization */}
        <section className="mt-12 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 md:p-8">
          <div className="flex items-center gap-2 text-sm font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-4">
            <HelpCircle className="w-4 h-4" />
            <span>Frequently Asked Questions &amp; Verification Details</span>
          </div>

          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            <div className="py-4">
              <h3 className="font-semibold text-base text-zinc-900 dark:text-zinc-100">
                Is {product.product_name} approved by KKM / NPRA?
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed">
                Yes. {product.product_name} is actively registered with the National Pharmaceutical Regulatory Agency under official registration number <strong>{product.reg_no}</strong> with current status <em>{product.status}</em>. Registration was filed by {product.holder}.
              </p>
            </div>

            <div className="py-4">
              <h3 className="font-semibold text-base text-zinc-900 dark:text-zinc-100">
                What are the active ingredients of {product.product_name}?
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed">
                The declared active therapeutic components are: <strong>{primaryIngredientText}</strong>. Always follow dosage recommendations prescribed by a certified doctor or licensed pharmacist.
              </p>
            </div>

            <div className="py-4">
              <h3 className="font-semibold text-base text-zinc-900 dark:text-zinc-100">
                What are the registered generic alternatives in Malaysia?
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed">
                In Malaysia, there are <strong>{alternatives.length}</strong> registered brand formulations containing identical active ingredients ({product.primary_molecule}). You can review them in the alternative brands section above or consult your community pharmacist for generic bioequivalent substitution.
              </p>
            </div>
          </div>
        </section>

        {/* Bicultural Malaysian Search Terms Footer */}
        <div className="mt-8 text-center text-[11px] text-zinc-400 dark:text-zinc-500 space-y-1">
          <p>
            Semakan status pendaftaran KKM / NPRA: {product.product_name} ({product.reg_no}) | Pengganti ubat di Malaysia | Bahan aktif ubat &amp; maklumat farmasi.
          </p>
        </div>
      </div>
    </>
  );
}
