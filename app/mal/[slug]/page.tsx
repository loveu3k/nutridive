import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { getProduct, getGenericHub, getTopGenerics } from '@/lib/data';
import { formatDate, getCategoryBadgeClass } from '@/lib/utils';
import CompareButton from '@/components/CompareButton';
import CopyButton from '@/components/CopyButton';
import FaqAccordion, { type FaqItem } from '@/components/FaqAccordion';

interface PageProps {
  params: { slug: string };
}

export const revalidate = 86400;

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
  if (!product) return { title: 'Product Not Found | NutriDive' };

  const primaryIngredient = product.active_ingredients[0]
    ? `${product.active_ingredients[0].name} (${product.active_ingredients[0].dosage})`
    : product.primary_molecule;

  const title = `${product.product_name} (${product.reg_no}) - Malaysia KKM Registration, Ingredients & Alternatives`;
  const description = `${product.product_name} (${product.reg_no}): ${primaryIngredient}. Registered by ${product.holder}. Compare ${product.primary_molecule} generic alternatives approved in Malaysia.`;

  return {
    title,
    description,
    keywords: [product.reg_no, product.product_name, product.primary_molecule, product.holder, 'KKM drug registration Malaysia', 'generic alternative Malaysia', 'MAL number check'],
    openGraph: { title, description, url: `https://nutridive.net/mal/${product.slug}`, type: 'article', locale: 'en_MY' },
    alternates: {
      canonical: `https://nutridive.net/mal/${product.slug}`,
      languages: { 'en-MY': `https://nutridive.net/mal/${product.slug}`, 'ms-MY': `https://nutridive.net/mal/${product.slug}` },
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const product = await getProduct(params.slug);
  if (!product) notFound();

  const genericHub = await getGenericHub(product.generic_slug);
  const alternatives = (genericHub?.products || []).filter(
    (p) => p.slug.toLowerCase() !== product.slug.toLowerCase()
  );

  const badge = getCategoryBadgeClass(product.category.code);
  const ingredientText =
    product.active_ingredients.map((i) => (i.dosage ? `${i.name} ${i.dosage}` : i.name)).join(', ') ||
    product.primary_molecule;

  // Schema.org JSON-LD (preserved for SEO — invisible to user)
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
        manufacturer: { '@type': 'Organization', name: product.manufacturer || product.holder },
        proprietaryName: product.product_name,
        nonProprietaryName: product.generic_name,
        recognizingAuthority: { '@type': 'GovernmentOrganization', name: 'National Pharmaceutical Regulatory Agency (NPRA), Ministry of Health Malaysia' },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://nutridive.net' },
          { '@type': 'ListItem', position: 2, name: product.category.name, item: `https://nutridive.net/category/${product.category.slug}` },
          { '@type': 'ListItem', position: 3, name: product.reg_no, item: `https://nutridive.net/mal/${product.slug}` },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          { '@type': 'Question', name: `Is ${product.product_name} approved in Malaysia?`, acceptedAnswer: { '@type': 'Answer', text: `Yes. Registration number ${product.reg_no}, status: ${product.status}.` } },
          { '@type': 'Question', name: `What are the active ingredients of ${product.product_name}?`, acceptedAnswer: { '@type': 'Answer', text: ingredientText } },
          { '@type': 'Question', name: `Generic alternatives for ${product.product_name}?`, acceptedAnswer: { '@type': 'Answer', text: `${alternatives.length} registered brands with ${product.primary_molecule} in Malaysia.` } },
        ],
      },
    ],
  };

  const faqItems: FaqItem[] = [
    { question: `Is ${product.product_name} approved in Malaysia?`, answer: (<span>Yes. Registered under <strong>{product.reg_no}</strong> with status <strong>{product.status}</strong>. Valid until <strong>{formatDate(product.date_end)}</strong>.</span>) },
    { question: `What are the active ingredients?`, answer: (<span><strong>{ingredientText}</strong>. Consult a healthcare professional for clinical advice.</span>) },
    { question: `Are there generic alternatives?`, answer: (<span><strong>{alternatives.length}</strong> registered brands share the active ingredient {product.primary_molecule}. See the list below.</span>) },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-xs text-zinc-400 dark:text-zinc-500 mb-8">
          <Link href="/" className="hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href={`/category/${product.category.slug}`} className="hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">{product.category.short}</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-zinc-600 dark:text-zinc-300 font-mono">{product.reg_no}</span>
        </nav>

        {/* ── Product Title Block ── */}
        <div className="mb-10">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${badge.bg} ${badge.text} ${badge.border}`}>
              {badge.label}
            </span>
            <span className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500">{product.reg_no}</span>
            <CopyButton text={product.reg_no} label="Copy" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 leading-tight">
            {product.product_name}
          </h1>

          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            <Link href={`/generic/${product.generic_slug}`} className="text-teal-600 dark:text-teal-400 hover:underline underline-offset-4 font-medium">
              {product.generic_name}
            </Link>
            {' · '}
            {product.holder}
          </p>
        </div>

        {/* ── Registration Details ── */}
        <section className="mb-10">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-4">
            Registration Details
          </h2>
          <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                <Row
                  label="Status"
                  value={product.status}
                  highlight
                  dot={product.status.toUpperCase().includes('APPROV')}
                />
                <Row
                  label="MAL Number"
                  value={product.reg_no}
                  mono
                  action={<CopyButton text={product.reg_no} label="Copy" />}
                />
                <Row label="Category" value={`${product.category.name} (${product.category.code})`} />
                <Row label="Valid" value={`${formatDate(product.date_reg)} → ${formatDate(product.date_end)}`} mono />
                <Row label="Registration Holder" value={product.holder || '—'} />
                <Row label="Manufacturer" value={product.manufacturer || '—'} />
                {product.importer && <Row label="Importer" value={product.importer} />}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Active Ingredients ── */}
        <section className="mb-10">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-4">
            Active Ingredients
          </h2>
          <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-900/60 text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  <th className="text-left font-medium px-4 py-2.5">Substance</th>
                  <th className="text-right font-medium px-4 py-2.5">Strength</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                {product.active_ingredients.map((ing, i) => {
                  const slug = ing.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                  return (
                    <tr key={i} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-900/40 transition-colors">
                      <td className="px-4 py-3">
                        <Link href={`/generic/${slug}`} className="text-teal-600 dark:text-teal-400 hover:underline underline-offset-4 font-medium">
                          {ing.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-zinc-700 dark:text-zinc-300">
                        {ing.dosage || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Generic Alternatives ── */}
        {alternatives.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                Alternatives with {product.primary_molecule}
                <span className="ml-2 text-[11px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-1.5 py-0.5 rounded">
                  {alternatives.length}
                </span>
              </h2>
              <Link href={`/generic/${product.generic_slug}`} className="text-xs text-teal-600 dark:text-teal-400 hover:underline">
                View all →
              </Link>
            </div>
            <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-900/60 text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    <th className="text-left font-medium px-4 py-2.5">Product</th>
                    <th className="text-left font-medium px-4 py-2.5 hidden sm:table-cell">Holder</th>
                    <th className="text-right font-medium px-4 py-2.5">Strength</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                  {alternatives.slice(0, 20).map((alt) => {
                    const altBadge = getCategoryBadgeClass(alt.category?.code || '');
                    return (
                      <tr key={alt.slug} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-900/40 transition-colors">
                        <td className="px-4 py-3">
                          <Link href={`/mal/${alt.slug}`} className="text-zinc-900 dark:text-zinc-100 hover:text-teal-600 dark:hover:text-teal-400 font-medium transition-colors">
                            {alt.product_name}
                          </Link>
                          <span className={`ml-2 text-[10px] font-semibold px-1.5 py-0.5 rounded border ${altBadge.bg} ${altBadge.text} ${altBadge.border}`}>
                            {alt.category?.code || '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400 hidden sm:table-cell text-xs">
                          {alt.holder}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-xs text-zinc-600 dark:text-zinc-400">
                          {alt.dosage || '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {alternatives.length > 20 && (
                <div className="bg-zinc-50 dark:bg-zinc-900/40 px-4 py-2.5 text-center border-t border-zinc-100 dark:border-zinc-800">
                  <Link href={`/generic/${product.generic_slug}`} className="text-xs text-teal-600 dark:text-teal-400 hover:underline font-medium">
                    See all {alternatives.length} alternatives →
                  </Link>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── Compare (sticky-subtle) ── */}
        <div className="mb-10 flex items-center gap-3">
          <CompareButton
            item={{
              slug: product.slug, reg_no: product.reg_no, product_name: product.product_name,
              category_code: product.category.code, generic_name: product.generic_name,
              holder: product.holder, dosage: ingredientText,
            }}
            variant="button"
          />
        </div>

        {/* ── FAQ (SEO) ── */}
        <section className="mb-10">
          <FaqAccordion title="Frequently Asked Questions" items={faqItems} />
        </section>

        {/* ── Disclaimer ── */}
        <footer className="text-[11px] text-zinc-400 dark:text-zinc-500 border-t border-zinc-200/70 dark:border-zinc-800/70 pt-6 leading-relaxed">
          NutriDive is an independent public directory. We are not affiliated with NPRA, KKM, or any government body. Data sourced from data.gov.my open catalogue.
        </footer>
      </div>
    </>
  );
}

/* ── Tiny Row helper ── */
function Row({
  label,
  value,
  mono,
  highlight,
  dot,
  action,
}: {
  label: string;
  value: string;
  mono?: boolean;
  highlight?: boolean;
  dot?: boolean;
  action?: React.ReactNode;
}) {
  return (
    <tr className="hover:bg-zinc-50/60 dark:hover:bg-zinc-900/40 transition-colors">
      <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400 w-1/3 sm:w-2/5">{label}</td>
      <td
        className={`px-4 py-3 text-right font-medium ${mono ? 'font-mono' : ''} ${
          highlight ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-900 dark:text-zinc-100'
        }`}
      >
        <div className="inline-flex items-center gap-1.5 justify-end">
          {dot && <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />}
          <span>{value}</span>
          {action}
        </div>
      </td>
    </tr>
  );
}
