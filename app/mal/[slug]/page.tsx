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
  ChevronRight,
  Truck,
  ArrowRight,
  FileText,
  Clock,
  Shield,
  CheckCircle2,
  Atom,
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

// Pre-render top 200 popular/essential products at build time for instant speed & zero compute
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

  // FAQ generator
  const faqItems: FaqItem[] = [
    {
      question: `Is ${product.product_name} officially registered with KKM / NPRA?`,
      answer: (
        <span>
          Yes, <strong>{product.product_name}</strong> is registered under National Pharmaceutical Regulatory Agency (NPRA) registration number <strong>{product.reg_no}</strong>. Its current public status is <strong>{product.status}</strong>, with registration validity until <strong>{formatDate(product.date_end)}</strong>.
        </span>
      ),
    },
    {
      question: `What are the active therapeutic ingredients of ${product.product_name}?`,
      answer: (
        <span>
          The declared active therapeutic ingredients in official records are: <strong>{primaryIngredientText}</strong>. Please consult a licensed medical doctor or pharmacist for clinical dosage and indication advice.
        </span>
      ),
    },
    {
      question: `What are the approved generic alternatives for ${product.product_name}?`,
      answer: (
        <span>
          In Malaysia, there are <strong>{alternatives.length}</strong> registered pharmaceutical brands sharing the identical primary active substance ({product.primary_molecule}). You can review them in the alternative brands section or use the Compare tool to compare holders and registrations.
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
            name: product.reg_no,
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
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

        {/* Minimalist Monograph Header */}
        <header className="rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 sm:p-8 shadow-xs">
          {/* Top Status & Category Badges */}
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

          {/* Product Main Title */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 mt-4 leading-tight">
            {product.product_name}
          </h1>

          {/* Primary Molecule Highlight Bar */}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
            <span className="font-medium">Active Therapeutic Substance:</span>
            <Link
              href={`/generic/${product.generic_slug}`}
              className="inline-flex items-center gap-1 font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 underline underline-offset-4"
            >
              <span>{product.generic_name}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Clean Action Toolbar */}
          <div className="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center gap-3">
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
            />

            <a
              href="https://quest3plus.bpfk.gov.my/pmo2/index.php"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition-colors"
            >
              <span>Verify on QUEST 3+</span>
              <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
            </a>

            <PharmacyAffiliateButton
              productName={product.product_name}
              categoryCode={product.category.code}
            />
          </div>
        </header>

        {/* Section 1: Official Regulatory & Registration Specifications Table */}
        <section className="mt-8 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 sm:p-8 shadow-xs">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-zinc-100 dark:border-zinc-800">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                Official Filing
              </span>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                Maklumat Pendaftaran &amp; Kawal Selia Rasmi
              </h2>
            </div>
            <span className="text-[11px] font-mono text-zinc-400">NPRA / KKM</span>
          </div>

          <dl className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-xs sm:text-sm">
            <div className="py-2.5 border-b border-zinc-100 dark:border-zinc-900 flex justify-between gap-4">
              <dt className="text-zinc-500 dark:text-zinc-400">Nombor Pendaftaran MAL:</dt>
              <dd className="font-mono font-bold text-zinc-900 dark:text-zinc-100 text-right">
                {product.reg_no}
              </dd>
            </div>

            <div className="py-2.5 border-b border-zinc-100 dark:border-zinc-900 flex justify-between gap-4">
              <dt className="text-zinc-500 dark:text-zinc-400">Status Pendaftaran:</dt>
              <dd className="font-semibold text-emerald-600 dark:text-emerald-400 text-right flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                {product.status}
              </dd>
            </div>

            <div className="py-2.5 border-b border-zinc-100 dark:border-zinc-900 flex justify-between gap-4">
              <dt className="text-zinc-500 dark:text-zinc-400">Kategori / Jadual Racun:</dt>
              <dd className="font-semibold text-zinc-900 dark:text-zinc-100 text-right">
                {product.category.name} ({product.category.code})
              </dd>
            </div>

            <div className="py-2.5 border-b border-zinc-100 dark:border-zinc-900 flex justify-between gap-4">
              <dt className="text-zinc-500 dark:text-zinc-400">Tempoh Sah Pendaftaran:</dt>
              <dd className="font-mono text-zinc-900 dark:text-zinc-100 text-right">
                {formatDate(product.date_reg)} &rarr;{' '}
                <strong className="text-zinc-900 dark:text-zinc-50 font-bold">
                  {formatDate(product.date_end)}
                </strong>
              </dd>
            </div>

            <div className="py-2.5 border-b border-zinc-100 dark:border-zinc-900 flex justify-between gap-4 md:col-span-2">
              <dt className="text-zinc-500 dark:text-zinc-400 shrink-0">Pemegang Pendaftaran (PRH):</dt>
              <dd className="font-semibold text-zinc-900 dark:text-zinc-100 text-right">
                {product.holder || 'Not Disclosed'}
              </dd>
            </div>

            <div className="py-2.5 border-b border-zinc-100 dark:border-zinc-900 flex justify-between gap-4 md:col-span-2">
              <dt className="text-zinc-500 dark:text-zinc-400 shrink-0">Pengilang Utama (Manufacturer):</dt>
              <dd className="font-semibold text-zinc-900 dark:text-zinc-100 text-right">
                {product.manufacturer || 'Disclosed in Filing'}
              </dd>
            </div>

            {product.importer && (
              <div className="py-2.5 border-b border-zinc-100 dark:border-zinc-900 flex justify-between gap-4 md:col-span-2">
                <dt className="text-zinc-500 dark:text-zinc-400 shrink-0">Pengimport Berlesen (Importer):</dt>
                <dd className="font-semibold text-zinc-900 dark:text-zinc-100 text-right">
                  {product.importer}
                </dd>
              </div>
            )}

            <div className="py-2.5 border-b border-zinc-100 dark:border-zinc-900 flex justify-between gap-4 md:col-span-2">
              <dt className="text-zinc-500 dark:text-zinc-400">Pelekat Keselamatan Fizikal:</dt>
              <dd className="font-semibold text-emerald-700 dark:text-emerald-400 text-right flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Pelekat Meditag Hologram KKM Diwajibkan
              </dd>
            </div>
          </dl>
        </section>

        {/* Section 2: Active Ingredients Composition Matrix */}
        <section className="mt-8">
          <ActiveIngredientsMatrix
            ingredients={product.active_ingredients}
            productName={product.product_name}
            categoryCode={product.category.code}
          />
        </section>

        {/* Ad Unit: In-Content Slot */}
        <AdUnitSlot slot="in_content" />

        {/* Section 3: Approved Generic Alternative Brands */}
        <section className="mt-8">
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
        </section>

        {/* Section 4: Meditag Hologram Security Verification Guidance */}
        <section className="mt-8">
          <HologramGuidance regNo={product.reg_no} />
        </section>

        {/* Section 5: Automated Collapsible FAQ Section */}
        <section className="mt-8">
          <FaqAccordion
            title="Soalan Lazim Mengenai Produk Ini"
            items={faqItems}
          />
        </section>

        {/* Independent Third-Party Footnote Disclaimer */}
        <footer className="mt-12 text-center text-xs text-zinc-400 dark:text-zinc-500 max-w-xl mx-auto border-t border-zinc-200/70 dark:border-zinc-800/70 pt-6">
          <p>
            Penafian: NutriDive adalah platform carian direktori ubat bebas dan tidak mewakili Bahagian Regulatori Farmasi Negara (NPRA) mahupun Kementerian Kesihatan Malaysia (KKM). Maklumat diperoleh daripada katalog data terbuka rasmi kerajaan (data.gov.my).
          </p>
        </footer>
      </div>
    </>
  );
}
