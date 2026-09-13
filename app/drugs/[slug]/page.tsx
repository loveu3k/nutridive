import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  Pill,
  AlertTriangle,
  Clock,
  ShieldCheck,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Utensils,
  Layers,
  FlaskConical,
  Zap,
  Info,
  Activity,
  Calendar,
  Share2
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import { getAllDrugEntries, getEnrichedDrugDossier } from '@/lib/drug_dossier';

export async function generateStaticParams() {
  const all = getAllDrugEntries();
  // Pre-render top 200 drugs with special diets or timing guidance
  const priority = all.filter(d => d.hasSpecialDiet || (d.timingGuidance && d.timingGuidance.length > 0)).slice(0, 200);
  return priority.map(d => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const dossier = getEnrichedDrugDossier(params.slug);
  if (!dossier) {
    return { title: 'Medication Not Found | NutriDive SafeStack' };
  }

  const descSnippet = dossier.clinicalSummary ||
    `${dossier.drugName} clinical interactions: foods, prescription medications, vitamins, and administration timing rules.`;

  return {
    title: `${dossier.drugName} Food & Drug Interactions, Timing & Nutrient Depletions | NutriDive SafeStack`,
    description: `${descSnippet.slice(0, 155)}... Evidence-based from openFDA, NLM MedlinePlus, and NIH ODS.`,
    alternates: {
      canonical: `https://nutridive.net/drugs/${dossier.slug}`
    },
    openGraph: {
      title: `${dossier.drugName} Clinical Interaction Monograph & Dietary Guide`,
      description: descSnippet,
      url: `https://nutridive.net/drugs/${dossier.slug}`,
      siteName: 'NutriDive SafeStack',
      type: 'article'
    }
  };
}

export default function DrugDetailPage({ params }: { params: { slug: string } }) {
  const dossier = getEnrichedDrugDossier(params.slug);
  if (!dossier) notFound();

  // Construct JSON-LD for Google MedicalWebPage & Drug schema
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    name: `${dossier.drugName} Clinical Interactions & Dietary Guide`,
    description: dossier.clinicalSummary,
    about: {
      '@type': 'Drug',
      name: dossier.drugName,
      nonProprietaryName: dossier.genericName,
      proprietaryName: dossier.brandNames.slice(0, 5),
      drugClass: dossier.pharmacologicalClass,
      warning: dossier.specialDietaryInstructions || 'Follow prescribing physician directions regarding diet and hydration.'
    },
    citation: [
      'U.S. Food and Drug Administration (openFDA)',
      'National Library of Medicine (NLM MedlinePlus)',
      'NIH Office of Dietary Supplements (ODS)',
      'NIH National Center for Complementary and Integrative Health (NCCIH)'
    ],
    lastReviewed: '2026-09-13'
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090D16] text-slate-900 dark:text-slate-100 flex flex-col justify-between transition-colors duration-200">
      {/* Google Structured Data Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 shadow-2xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/drugs"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-400 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>A-Z Drug Directory</span>
          </Link>
          
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href={`/?preset=${encodeURIComponent(dossier.drugName)}`}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-2xs transition"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Test in Radar</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Dossier Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 flex-1 w-full">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
          <Link href="/" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition">Radar</Link>
          <span>/</span>
          <Link href="/drugs" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition">A-Z Drugs</Link>
          <span>/</span>
          <span className="text-slate-700 dark:text-slate-300 font-semibold">{dossier.drugName}</span>
        </nav>

        {/* Hero Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                <Pill className="w-3.5 h-3.5" />
                <span>Prescription Clinical Monograph</span>
              </span>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                {dossier.pharmacologicalClass}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Verified Evidence Sources: openFDA &amp; NLM MedlinePlus</span>
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              {dossier.drugName}
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl">
              {dossier.clinicalSummary}
            </p>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Generic Active Chemical: <span className="font-semibold text-slate-800 dark:text-slate-200">{dossier.genericName}</span>
            </div>
          </div>

          {/* Brand Names */}
          {dossier.brandNames && dossier.brandNames.length > 0 && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1">Brand Formulations:</span>
              {dossier.brandNames.map((brand, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                >
                  {brand}
                </span>
              ))}
            </div>
          )}

          {/* Quick Jump Navigation Bar */}
          <div className="pt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium mr-1">Quick Jump:</span>
            <a href="#foods" className="px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 hover:underline">
              Kitchen Foods ({dossier.foodConflicts.length})
            </a>
            <a href="#drugs" className="px-2.5 py-1 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 hover:underline">
              Drug Red Flags ({dossier.drugConflicts.length})
            </a>
            <a href="#supplements" className="px-2.5 py-1 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 hover:underline">
              Supplements &amp; Herbs ({dossier.supplementConflicts.length})
            </a>
            {dossier.depletions.length > 0 && (
              <a href="#depletions" className="px-2.5 py-1 rounded-md bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 hover:underline">
                Nutrient Depletion ({dossier.depletions.length})
              </a>
            )}
            <a href="#timing" className="px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 hover:underline">
              Administration Timing ({dossier.timingProtocols.length})
            </a>
            {dossier.relatedPairs.length > 0 && (
              <a href="#pairs" className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:underline">
                Pairwise Combos ({dossier.relatedPairs.length})
              </a>
            )}
          </div>
        </div>

        {/* Section 1: Kitchen Foods & Dietary Conflicts (DFI) */}
        <section id="foods" className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-800">
                <Utensils className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  Kitchen Food, Drink &amp; Dietary Conflicts
                </h2>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Biochemical interactions with common foods, beverages &amp; cooking ingredients
                </span>
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200">
              {dossier.foodConflicts.length} Flagged Foods
            </span>
          </div>

          {/* Official Medline Dietary Advice Box */}
          {dossier.specialDietaryInstructions && (
            <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-2 text-sm text-slate-800 dark:text-slate-200">
              <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300 text-xs">
                <AlertTriangle className="w-4 h-4" />
                <span>Official Patient Dietary Instruction (NLM MedlinePlus)</span>
              </div>
              <p className="leading-relaxed">{dossier.specialDietaryInstructions}</p>
            </div>
          )}

          {/* Structured Food Conflict Cards */}
          {dossier.foodConflicts.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {dossier.foodConflicts.map((item, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3 hover:border-amber-400 dark:hover:border-amber-600 transition"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                        item.severity === 'CRITICAL'
                          ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                          : 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                      }`}>
                        {item.severity}
                      </span>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base">
                        {item.foodName}
                      </h3>
                    </div>
                    <span className="text-xs text-slate-400 dark:text-slate-500">{item.source}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                      <span className="text-slate-400 font-semibold block mb-0.5">Bioactive Compound:</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">{item.bioactiveCompound}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                      <span className="text-slate-400 font-semibold block mb-0.5">Biological Target:</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">{item.biochemicalTarget}</span>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <span className="font-bold text-slate-600 dark:text-slate-400">Clinical Mechanism:</span>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{item.mechanism}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">Patient Actionable Rule:</span>
                      <span>{item.clinicalGuidance}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Unless your physician explicitly directs otherwise, continue your normal balanced diet while taking this medication. Maintain consistent hydration and meal intervals.</span>
            </div>
          )}
        </section>

        {/* Section 2: Prescription & OTC Medication Red Flags (DDI) */}
        <section id="drugs" className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-200 dark:border-rose-800">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  Prescription &amp; OTC Drug Interactions (DDI)
                </h2>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Documented pharmacological conflicts &amp; contraindicated co-prescriptions
                </span>
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200">
              {dossier.drugConflicts.length} Warning Classes
            </span>
          </div>

          {dossier.drugConflicts.length > 0 ? (
            <div className="space-y-4">
              {dossier.drugConflicts.map((dc, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-rose-50/30 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        dc.severity === 'CRITICAL'
                          ? 'bg-rose-600 text-white'
                          : 'bg-amber-500 text-white'
                      }`}>
                        {dc.severity} RISK
                      </span>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base">
                        {dc.drugOrClass}
                      </h3>
                    </div>
                    <span className="text-xs text-slate-400">{dc.source}</span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">Mechanism: </span>
                    {dc.mechanism}
                  </p>

                  <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-rose-200/80 dark:border-rose-800/60 text-xs space-y-1">
                    <div className="text-rose-700 dark:text-rose-400 font-semibold">
                      Clinical Consequence: {dc.clinicalConsequence}
                    </div>
                    <div className="text-slate-700 dark:text-slate-300">
                      <span className="font-bold">Physician Precaution: </span>
                      {dc.actionableAdvice}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>No major contraindicated drug classes listed in the basic monograph. Always provide your complete medication list to your prescribing physician.</span>
            </div>
          )}
        </section>

        {/* Section 3: Dietary Supplements, Herbs & Minerals (DNI) */}
        <section id="supplements" className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-200 dark:border-purple-800">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  Dietary Supplements, Herbs &amp; Minerals (DNI)
                </h2>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Interactions with over-the-counter vitamins, minerals, and herbal preparations
                </span>
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200">
              {dossier.supplementConflicts.length} Monitored
            </span>
          </div>

          {dossier.supplementConflicts.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {dossier.supplementConflicts.map((sc, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-purple-50/30 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/60 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-200 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                        {sc.severity}
                      </span>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base">
                        {sc.supplementName}
                      </h3>
                    </div>
                    <span className="text-xs text-slate-400">{sc.source}</span>
                  </div>

                  <div className="text-xs text-purple-700 dark:text-purple-300 font-medium">
                    Biological Target: {sc.biochemicalTarget}
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {sc.clinicalExplanation}
                  </p>

                  <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-purple-200 dark:border-purple-900 text-xs text-slate-800 dark:text-slate-200 leading-relaxed flex items-start gap-2">
                    <Info className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">Guidance &amp; Spacing:</span>
                      <span>{sc.actionableAdvice}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>No acute supplement or herb contraindications identified. Notify your healthcare provider of any multi-vitamins or botanicals you take daily.</span>
            </div>
          )}
        </section>

        {/* Section 4: Nutrient Depletion & Nutritional Defense Protocols */}
        {dossier.depletions.length > 0 && (
          <section id="depletions" className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-200 dark:border-teal-800">
                  <FlaskConical className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                    Drug-Induced Nutrient Depletion &amp; Nutritional Defense
                  </h2>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Micronutrient depletions caused by pharmacological pathways &amp; recommended replenishment
                  </span>
                </div>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200">
                {dossier.depletions.length} Depletion Pathways
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {dossier.depletions.map((dep, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-teal-50/40 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900/60 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">
                      {dep.nutrient}
                    </h3>
                    <span className="text-xs text-slate-400">{dep.evidenceSource}</span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Depletion Pathway: </span>
                    {dep.pathwayMechanism}
                  </p>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-teal-200 dark:border-teal-900 text-xs text-teal-900 dark:text-teal-200 leading-relaxed">
                    <span className="font-bold block mb-0.5">Nutritional Defense Protocol:</span>
                    <span>{dep.recommendedSupport}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section 5: Chronotherapy & Administration Protocols */}
        <section id="timing" className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-800">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  Chronotherapy &amp; Meal Administration Protocols
                </h2>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Optimal absorption, meal-timing rules &amp; GI tolerability protocols
                </span>
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200">
              {dossier.timingProtocols.length} Protocols
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {dossier.timingProtocols.map((tp, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-blue-50/30 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/60 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                    {tp.badge}
                  </span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{tp.title}</span>
                </div>

                <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white leading-snug">
                  {tp.instruction}
                </p>

                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Rationale: </span>
                  {tp.rationale}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 6: Related Pairwise Interaction Links */}
        {dossier.relatedPairs.length > 0 && (
          <section id="pairs" className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                    Frequently Researched Drug-Substance Combinations
                  </h2>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Explore pairwise interaction dossiers and laboratory safety analyses
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {dossier.relatedPairs.map((pair, idx) => (
                <Link
                  key={idx}
                  href={`/interactions/${pair.slug}`}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 group transition flex flex-col justify-between space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-2xs font-extrabold px-2 py-0.5 rounded-full ${
                      pair.severity === 'CRITICAL'
                        ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                        : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                    }`}>
                      {pair.severity}
                    </span>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform">
                      →
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                    {pair.title}
                  </h4>
                  <span className="text-2xs text-slate-400 dark:text-slate-500">
                    Pairwise Clinical Analysis &amp; Safety Rating
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Section 7: Interactive SafeStack Radar Launch CTA */}
        <section className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-900 to-slate-950 text-white shadow-xl space-y-4 border border-emerald-800/50">
          <div className="space-y-1">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Multi-Substance Interactive Radar</span>
            <h2 className="text-xl sm:text-2xl font-bold">
              Taking {dossier.drugName} alongside daily coffee, supplements, or other medications?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
              Add all your daily medications, foods (Dairy, Spinach, Coffee, Grapefruit), and botanicals (Ashwagandha, Curcumin, Melatonin) into the SafeStack interactive engine to run full multi-way synergy collision analysis in real time.
            </p>
          </div>
          <div>
            <Link
              href={`/?preset=${encodeURIComponent(dossier.drugName)}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs sm:text-sm font-bold rounded-xl shadow-md transition cursor-pointer"
            >
              <Activity className="w-4 h-4" />
              <span>Launch SafeStack Radar with {dossier.drugName}</span>
              <span>→</span>
            </Link>
          </div>
        </section>

        {/* Section 8: Authoritative Regulatory Sources & Disclaimers */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 text-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Authoritative Clinical Evidence &amp; Regulatory Sources</span>
          </div>
          <p className="leading-relaxed">
            Data on this clinical monograph is compiled from the U.S. National Library of Medicine (MedlinePlus), openFDA Structured Product Labeling (SPL Section 7 Drug Interactions), the NIH Office of Dietary Supplements (ODS), and Krause and Mahan&apos;s Food &amp; Nutrition Care Process.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <a
              href={dossier.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 hover:underline font-semibold"
            >
              <span>View Original NLM MedlinePlus Monograph</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span>·</span>
            <Link href="/disclaimer" className="text-slate-600 dark:text-slate-400 hover:underline">
              Clinical &amp; Legal Disclaimers
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <p>© 2026 NutriDive SafeStack · Evidence-Based Multi-Substance Interaction Engine</p>
      </footer>
    </div>
  );
}
