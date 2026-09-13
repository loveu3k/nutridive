import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ShieldAlert, AlertTriangle, CheckCircle2, Clock, Zap, ShieldCheck, Sparkles } from 'lucide-react';
import fs from 'fs';
import path from 'path';
import ThemeToggle from '@/components/ThemeToggle';
import { evaluateStack } from '@/lib/checker';

interface PairEntry {
  slug: string;
  substanceA: string;
  substanceB: string;
  priority?: number;
}

function getPredefinedPairs(): PairEntry[] {
  const filePath = path.join(process.cwd(), 'data/rules/interaction_pairs.json');
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

export async function generateStaticParams() {
  const pairs = getPredefinedPairs();
  return pairs.slice(0, 100).map(p => ({ slug: p.slug }));
}

function parseSlug(slug: string): { nameA: string; nameB: string } | null {
  const parts = slug.split('-and-');
  if (parts.length !== 2) return null;
  const cleanName = (s: string) => s.replace(/-/g, ' ').trim();
  return {
    nameA: cleanName(parts[0]),
    nameB: cleanName(parts[1])
  };
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const parsed = parseSlug(params.slug);
  if (!parsed) return { title: 'Interaction Not Found | NutriDive SafeStack' };

  const { nameA, nameB } = parsed;
  const audit = evaluateStack([nameA, nameB]);

  const hasCritical = audit.redFlags.some(rf => rf.severity === 'CRITICAL') || audit.crossInteractions.some(ci => ci.severity === 'CRITICAL');
  const hasHigh = audit.redFlags.some(rf => rf.severity === 'HIGH') || audit.crossInteractions.some(ci => ci.severity === 'HIGH') || audit.synergyAlerts.length > 0;

  const statusText = hasCritical ? 'CRITICAL Hazard' : hasHigh ? 'High Clinical Risk' : 'Safety Evaluation';

  return {
    title: `${nameA} and ${nameB} Interaction: ${statusText} & Guidelines | NutriDive`,
    description: `Clinical evidence evaluation for taking ${nameA} and ${nameB} together. Mechanism of action, severity rating, and timing rules from openFDA & NIH.`,
    alternates: {
      canonical: `https://nutridive.net/interactions/${params.slug}`
    },
    openGraph: {
      title: `${nameA} & ${nameB} Interaction & Safety Guidelines`,
      description: `Evidence-based clinical safety evaluation for taking ${nameA} with ${nameB}.`,
      url: `https://nutridive.net/interactions/${params.slug}`,
      siteName: 'NutriDive SafeStack',
      type: 'article'
    }
  };
}

export default function InteractionPairPage({ params }: { params: { slug: string } }) {
  const parsed = parseSlug(params.slug);
  if (!parsed) notFound();

  const { nameA, nameB } = parsed;
  const audit = evaluateStack([nameA, nameB]);

  // Aggregate Findings
  const criticalFlags = [
    ...audit.redFlags.filter(rf => rf.severity === 'CRITICAL'),
    ...audit.crossInteractions.filter(ci => ci.severity === 'CRITICAL')
  ];

  const highFlags = [
    ...audit.redFlags.filter(rf => rf.severity === 'HIGH'),
    ...audit.crossInteractions.filter(ci => ci.severity === 'HIGH')
  ];

  const mediumFlags = [
    ...audit.redFlags.filter(rf => rf.severity === 'MEDIUM'),
    ...audit.crossInteractions.filter(ci => ci.severity === 'MEDIUM')
  ];

  const synergies = audit.synergyAlerts;
  const timingRules = audit.timingRules;

  const isCritical = criticalFlags.length > 0;
  const isHigh = !isCritical && (highFlags.length > 0 || synergies.length > 0);
  const isMedium = !isCritical && !isHigh && (mediumFlags.length > 0 || timingRules.length > 0);
  const isClean = !isCritical && !isHigh && !isMedium;

  // JSON-LD for AI Search Engines & Google Rich Snippets
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    name: `${nameA} and ${nameB} Clinical Interaction Assessment`,
    about: [
      { '@type': 'MedicalEntity', name: nameA },
      { '@type': 'MedicalEntity', name: nameB }
    ],
    headline: isCritical
      ? `Critical Contraindication: ${nameA} and ${nameB}`
      : isHigh
      ? `High Clinical Hazard: Co-administration of ${nameA} and ${nameB}`
      : `Clinical Assessment: ${nameA} and ${nameB}`,
    citation: [
      'U.S. Food and Drug Administration (openFDA Structured Product Labeling)',
      'National Library of Medicine (NLM MedlinePlus)',
      'NIH National Center for Complementary and Integrative Health (NCCIH)'
    ],
    lastReviewed: '2026-09-13'
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090D16] text-slate-900 dark:text-slate-100 flex flex-col justify-between transition-colors duration-200">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 shadow-2xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-400 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>SafeStack Radar</span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href={`/?preset=${encodeURIComponent(`${nameA}, ${nameB}`)}`}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-2xs transition"
            >
              <span>Test Both in Radar</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 flex-1 w-full">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
          <Link href="/" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition">Radar</Link>
          <span>/</span>
          <Link href="/interactions" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition">Pairwise Interactions</Link>
          <span>/</span>
          <span className="text-slate-700 dark:text-slate-300 font-semibold capitalize">{nameA} &amp; {nameB}</span>
        </nav>

        {/* Hero Title & Pair Badges */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-xl text-xs font-bold bg-slate-900 dark:bg-slate-800 text-white shadow-2xs capitalize">
              {nameA}
            </span>
            <span className="text-slate-400 dark:text-slate-500 font-bold text-xs">+</span>
            <span className="px-3 py-1 rounded-xl text-xs font-bold bg-slate-900 dark:bg-slate-800 text-white shadow-2xs capitalize">
              {nameB}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight capitalize">
            Can You Take {nameA} and {nameB} Together?
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            Evidence-based clinical pharmacological assessment, adverse synergy evaluation, and administration separation protocols.
          </p>
        </div>

        {/* Executive Verdict Banner */}
        {isCritical && (
          <div className="p-6 rounded-3xl bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-300 dark:border-rose-900 shadow-sm space-y-3">
            <div className="flex items-center gap-2.5 text-rose-800 dark:text-rose-300 font-bold text-base">
              <ShieldAlert className="w-6 h-6 text-rose-600 dark:text-rose-400 shrink-0" />
              <span>CRITICAL HAZARD: Potentially Severe or Contraindicated Combination</span>
            </div>
            <p className="text-sm text-rose-900 dark:text-rose-200 leading-relaxed">
              Co-administering {nameA} and {nameB} has documented pharmacodynamic or pharmacokinetic antagonism capable of triggering acute clinical harm. Do not combine without explicit specialist oversight.
            </p>
          </div>
        )}

        {isHigh && (
          <div className="p-6 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-900 shadow-sm space-y-3">
            <div className="flex items-center gap-2.5 text-amber-800 dark:text-amber-300 font-bold text-base">
              <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>HIGH CLINICAL RISK: Significant Interaction or Multi-Agent Synergy</span>
            </div>
            <p className="text-sm text-amber-900 dark:text-amber-200 leading-relaxed">
              This combination presents a meaningful risk of altered drug bioavailability, metabolic enzyme competition, or cumulative toxicity. Close clinical monitoring or dosing separation is required.
            </p>
          </div>
        )}

        {isMedium && (
          <div className="p-6 rounded-3xl bg-blue-50 dark:bg-blue-950/40 border-2 border-blue-200 dark:border-blue-900 shadow-sm space-y-3">
            <div className="flex items-center gap-2.5 text-blue-800 dark:text-blue-300 font-bold text-base">
              <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>MODERATE / TIMING SENSITIVE: Separation Window or Monitoring Recommended</span>
            </div>
            <p className="text-sm text-blue-900 dark:text-blue-200 leading-relaxed">
              An absorption competition or minor metabolic overlap exists between these substances. Separating doses by 2 to 4 hours typically avoids adverse bioavailability loss.
            </p>
          </div>
        )}

        {isClean && (
          <div className="p-6 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-300 dark:border-emerald-900 shadow-sm space-y-3">
            <div className="flex items-center gap-2.5 text-emerald-800 dark:text-emerald-300 font-bold text-base">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>NO DIRECT ADVERSE CONFLICT DETECTED</span>
            </div>
            <p className="text-sm text-emerald-900 dark:text-emerald-200 leading-relaxed">
              Based on U.S. openFDA package inserts, NIH ODS clinical fact sheets, and NLM MedlinePlus monographs, there is no direct pharmacological contraindication between {nameA} and {nameB}. Always take medications with adequate water and follow your physician’s schedule.
            </p>
          </div>
        )}

        {/* Synergistic Cumulative Warnings */}
        {synergies.length > 0 && (
          <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-200 dark:border-purple-800">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Multi-Agent Synergistic Hazard Detected</h2>
                <span className="text-xs text-slate-500 dark:text-slate-400">Cumulative physiological stress mechanism</span>
              </div>
            </div>

            <div className="space-y-3">
              {synergies.map((syn, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/60 space-y-2">
                  <span className="text-xs font-bold text-purple-900 dark:text-purple-300 uppercase tracking-wide">
                    {syn.title}
                  </span>
                  <p className="text-sm text-purple-950 dark:text-purple-200 leading-relaxed">
                    {syn.clinicalWarning}
                  </p>
                  <p className="text-xs font-semibold text-purple-700 dark:text-purple-300 bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-xl border border-purple-100 dark:border-purple-900">
                    💡 Actionable Step: {syn.actionableGuidance}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Cross-Interaction Mechanism & Red Flags */}
        {(criticalFlags.length > 0 || highFlags.length > 0 || mediumFlags.length > 0) && (
          <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Clinical Mechanism &amp; Evidence Details</h2>
            <div className="space-y-3">
              {[...criticalFlags, ...highFlags, ...mediumFlags].map((flag: any, idx) => {
                const isCrit = flag.severity === 'CRITICAL';
                const isHi = flag.severity === 'HIGH';
                const badgeColor = isCrit
                  ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                  : isHi
                  ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                  : 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800';

                return (
                  <div key={idx} className="p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {flag.item || `${flag.substanceA} ↔ ${flag.substanceB}`}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${badgeColor}`}>
                        {flag.severity}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      {flag.reason || flag.mechanism}
                    </p>
                    {flag.actionableAdvice && (
                      <p className="text-xs font-medium text-emerald-800 dark:text-emerald-300 bg-emerald-50/70 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900">
                        Clinical Guidance: {flag.actionableAdvice}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Timing Separation Protocol */}
        {timingRules.length > 0 && (
          <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center gap-2.5 font-bold text-slate-900 dark:text-white text-base">
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>Recommended Administration Timing Window</span>
            </div>
            <div className="space-y-2">
              {timingRules.map((tr, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-sm text-blue-950 dark:text-blue-200 flex items-start gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <span>{tr.rule}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Interactive CTA */}
        <section className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 to-emerald-950 text-white shadow-md space-y-4 border border-emerald-900/40">
          <div className="space-y-1">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Comprehensive Personal Stack Evaluation
            </span>
            <h2 className="text-xl font-bold">Taking other supplements, foods, or medications with this pair?</h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
              Add your morning coffee, daily multivitamins, prescription pills, and dinner foods into our instant browser-based radar to check for multi-way chain reactions.
            </p>
          </div>
          <div>
            <Link
              href={`/?preset=${encodeURIComponent(`${nameA}, ${nameB}`)}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs sm:text-sm font-bold rounded-xl shadow-xs transition cursor-pointer"
            >
              <span>Launch SafeStack Radar with {nameA} + {nameB}</span>
              <span>→</span>
            </Link>
          </div>
        </section>

        {/* Citations & Evidence */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 text-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Authoritative Regulatory Citations</span>
          </div>
          <p className="leading-relaxed">
            Clinical mechanism and interaction severity derived from openFDA Drug Structured Product Labeling (Section 7), NIH Office of Dietary Supplements (ODS), and NIH NCCIH clinical botanicals database.
          </p>
          <div className="pt-1 flex flex-wrap items-center gap-3">
            <Link href="/disclaimer#sources" className="text-emerald-700 dark:text-emerald-400 hover:underline font-semibold">
              Evidence Methodology
            </Link>
            <span>·</span>
            <Link href="/drugs" className="text-slate-600 dark:text-slate-400 hover:underline">
              A-Z Medication Directory
            </Link>
            <span>·</span>
            <Link href="/disclaimer" className="text-slate-600 dark:text-slate-400 hover:underline">
              Medical Disclaimer
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <p>© 2026 NutriDive SafeStack · Multi-Substance Clinical Interaction Radar</p>
      </footer>
    </div>
  );
}
