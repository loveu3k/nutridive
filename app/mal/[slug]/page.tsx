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
  ArrowRight,
  FileCheck2,
  CheckCircle2,
  Share2,
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
import ProductVisualCard from '@/components/ProductVisualCard';
import ProductBentoGrid from '@/components/ProductBentoGrid';

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
  const description = `Semakan maklumat untuk ${product.product_name} (${product.reg_no}). Bahan aktif: ${primaryIngredient}. Pendaftaran oleh ${product.holder}. Bandingkan jenama generik pengganti berdaftar di Malaysia.`;

  return {
    title,
    description,
    keywords: [
      product.reg_no,
      product.product_name,
      product.primary_molecule,
      product.holder,
      'Semakan status pendaftaran KKM',
      'Malaysia medicine directory',
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
  const ragSummary = `${product.product_name} is an approved ${product.category.name} in Malaysia under registration number ${product.reg_no} by ${product.holder}. Declared active therapeutic formulation: ${primaryIngredientText || 'specialized composition'}.`;

  // FAQ Items for interactive Accordion + Rich Snippet schema
  const faqItems: FaqItem[] = [
    {
      question: `Is ${product.product_name} approved in Malaysia?`,
      answer: (
        <span>
          Yes. <strong>{product.product_name}</strong> is registered under registration number <strong>{product.reg_no}</strong> with current status <em>&ldquo;{product.status}&rdquo;</em>. Product Registration Holder (PRH) is {product.holder}.
        </span>
      ),
    },
    {
      question: `What are the active therapeutic ingredients of ${product.product_name}?`,
      answer: (
        <span>
          The declared active therapeutic components in public records are: <strong>{primaryIngredientText}</strong>. Please consult a licensed healthcare professional for medical dosage and indications.
        </span>
      ),
    },
    {
      question: `What are the generic alternatives for ${product.product_name}?`,
      answer: (
        <span>
          In Malaysia, there are <strong>{alternatives.length}</strong> approved brand formulations sharing the identical active substance ({product.primary_molecule}). You can review them in the alternative brands section above or compare them side-by-side using the Compare tool.
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
            name: `Is ${product.product_name} approved in Malaysia?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `Yes, ${product.product_name} is officially registered under registration number ${product.reg_no} with status "${product.status}".`,
            },
          },
          {
            '@type': 'Question',
            name: `What are the active ingredients of ${product.product_name}?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `The active ingredients of ${product.product_name} are: ${primaryIngredientText}.`,
            },
          },
          {
            '@type': 'Question',
            name: `What are the generic alternatives for ${product.product_name} in Malaysia?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `There are ${alternatives.length} approved pharmaceutical formulations registered in Malaysia containing the same active ingredient (${product.primary_molecule}).`,
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

        {/* Modern Split-Hero Architecture: Left Visual Card + Right Bento Canvas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left Column (4 cols on lg): Visual Anchor Card & Quick Verification Actions */}
          <div className="lg:col-span-4 space-y-4">
            <ProductVisualCard
              categoryCode={product.category.code}
              productName={product.product_name}
              regNo={product.reg_no}
              primaryMolecule={product.primary_molecule}
              imageUrl={product.image_url}
            />

            {/* Quick Actions & Pharmacy Access Card */}
            <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/50 p-4 text-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">Official Database:</span>
                <a
                  href={`https://quest3plus.bpfk.gov.my/pmo2/index.php`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-teal-600 dark:text-teal-400 hover:underline inline-flex items-center gap-1"
                >
                  <span>QUEST3+ Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">Open Data Source:</span>
                <span className="font-mono text-zinc-700 dark:text-zinc-300">data.gov.my</span>
              </div>
              <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-800">
                <PharmacyAffiliateButton
                  productName={product.product_name}
                  categoryCode={product.category.code}
                />
              </div>
            </div>
          </div>

          {/* Right Column (8 cols on lg): Header Identity + Bento Attributes Grid */}
          <div className="lg:col-span-8 space-y-5">
            {/* Header Identity Card */}
            <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 sm:p-7 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono font-bold text-xs sm:text-sm bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 px-2.5 py-1 rounded-md tracking-wider">
                    {product.reg_no}
                  </span>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${badge.bg} ${badge.text} ${badge.border}`}
                  >
                    {badge.label}
                  </span>
                  <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                    {product.category.name}
                  </span>
                </div>

                <VerificationBadge
                  status={product.status}
                  regNo={product.reg_no}
                  dateEnd={product.date_end}
                  size="sm"
                />
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mt-3 leading-tight">
                {product.product_name}
              </h1>

              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-2">
                Active Generic Molecule:{' '}
                <Link
                  href={`/generic/${product.generic_slug}`}
                  className="font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 underline underline-offset-4"
                >
                  {product.generic_name}
                </Link>
              </p>

              {/* Action Bar */}
              <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center gap-3">
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

                <Link
                  href={`/generic/${product.generic_slug}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition-colors"
                >
                  <span>Compare with Equivalents</span>
                  <ArrowRight className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                </Link>
              </div>
            </div>

            {/* Bento Grid: 4 Scan-Friendly Attribute Tiles */}
            <ProductBentoGrid
              primaryMolecule={product.primary_molecule}
              genericSlug={product.generic_slug}
              primaryDosage={product.active_ingredients[0]?.dosage}
              regNo={product.reg_no}
              status={product.status}
              categoryName={product.category.name}
              dateReg={product.date_reg}
              dateEnd={product.date_end}
              holder={product.holder}
              manufacturer={product.manufacturer}
              importer={product.importer}
            />
          </div>
        </div>

        {/* Section 1: Active Ingredients Formulation Matrix */}
        <div className="mt-10">
          <ActiveIngredientsMatrix
            ingredients={product.active_ingredients}
            productName={product.product_name}
            categoryCode={product.category.code}
          />
        </div>

        {/* Ad Unit: In-Content Slot */}
        <AdUnitSlot slot="in_content" />

        {/* Section 2: Approved Generic Alternatives */}
        <div className="mt-10">
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

        {/* Section 3: Technical Specifications & Supply Chain Directory Table */}
        <div className="mt-10 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 sm:p-8 shadow-xs">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">
            Regulatory &amp; Manufacturing Specifications
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6">
            Detailed registration filings recorded in the Malaysian open pharmaceutical catalogue.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-xs">
            <div className="flex items-start justify-between py-2 border-b border-zinc-100 dark:border-zinc-900">
              <span className="text-zinc-500 dark:text-zinc-400">Product Registration Holder:</span>
              <span className="font-semibold text-right text-zinc-900 dark:text-zinc-100 max-w-[60%]">
                {product.holder || 'Not Disclosed'}
              </span>
            </div>

            <div className="flex items-start justify-between py-2 border-b border-zinc-100 dark:border-zinc-900">
              <span className="text-zinc-500 dark:text-zinc-400">Authorized Manufacturer:</span>
              <span className="font-semibold text-right text-zinc-900 dark:text-zinc-100 max-w-[60%]">
                {product.manufacturer || 'Disclosed in Filing'}
              </span>
            </div>

            <div className="flex items-start justify-between py-2 border-b border-zinc-100 dark:border-zinc-900">
              <span className="text-zinc-500 dark:text-zinc-400">Licensed Importer:</span>
              <span className="font-semibold text-right text-zinc-900 dark:text-zinc-100 max-w-[60%]">
                {product.importer || 'Local Manufacture / Direct PRH'}
              </span>
            </div>

            <div className="flex items-start justify-between py-2 border-b border-zinc-100 dark:border-zinc-900">
              <span className="text-zinc-500 dark:text-zinc-400">Registration Validity:</span>
              <span className="font-mono font-semibold text-right text-zinc-900 dark:text-zinc-100">
                {formatDate(product.date_reg)} &rarr; {formatDate(product.date_end)}
              </span>
            </div>

            <div className="flex items-start justify-between py-2 border-b border-zinc-100 dark:border-zinc-900">
              <span className="text-zinc-500 dark:text-zinc-400">Poison Act Schedule:</span>
              <span className="font-semibold text-right text-zinc-900 dark:text-zinc-100">
                {product.category.name} ({product.category.code})
              </span>
            </div>

            <div className="flex items-start justify-between py-2 border-b border-zinc-100 dark:border-zinc-900">
              <span className="text-zinc-500 dark:text-zinc-400">Physical Security Seal:</span>
              <span className="font-semibold text-right text-emerald-700 dark:text-emerald-400">
                KKM Meditag Hologram Required
              </span>
            </div>
          </div>
        </div>

        {/* Section 4: Hologram Guidance */}
        <div className="mt-10">
          <HologramGuidance regNo={product.reg_no} />
        </div>

        {/* Section 5: Automated Collapsible FAQ Section */}
        <div className="mt-10">
          <FaqAccordion
            title="Frequently Asked Questions & Product Details"
            items={faqItems}
          />
        </div>

        {/* Subtle Non-Government Footnote Notice */}
        <div className="mt-12 text-center text-xs text-zinc-400 dark:text-zinc-500 max-w-xl mx-auto border-t border-zinc-200/60 dark:border-zinc-800/60 pt-6">
          <p>
            Penafian: NutriDive adalah platform direktori bebas dan tidak mewakili Bahagian Regulatori Farmasi Negara (NPRA) atau Kementerian Kesihatan Malaysia (KKM). Maklumat diperoleh daripada rekod data terbuka awam (data.gov.my).
          </p>
        </div>
      </div>
    </>
  );
}

