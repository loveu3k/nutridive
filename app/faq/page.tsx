import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { HelpCircle, ShieldCheck } from 'lucide-react';
import FaqAccordion, { type FaqItem } from '@/components/FaqAccordion';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions (FAQ) | NutriDive SafeStack',
  description:
    'Evidence-based guidance on drug-supplement-food interactions, timing separations, nutrient depletions, and clinical conflict screening.',
};

export default function FaqPage() {
  const faqItems: FaqItem[] = [
    {
      question: 'What is NutriDive SafeStack and how does it screen interactions?',
      answer: (
        <span>
          NutriDive SafeStack is a deterministic, evidence-based interaction screening engine. It cross-references the medications, vitamins, minerals, and herbal supplements you take daily against a curated clinical pharmacology rulebase. It instantly identifies hazardous food-drug contraindications, competitive absorption bottlenecks, and nutrient depletions.
        </span>
      ),
    },
    {
      question: 'What is the difference between Critical Red Flags and Timing Conflicts?',
      answer: (
        <span>
          <p className="mb-2">
            <strong>🔴 Critical Red Flags (Strict Avoidance):</strong> Severe contraindications where co-administration triggers toxic pharmacokinetic amplification or physiological risks (for example, grapefruit with CYP3A4-metabolized statins causing rhabdomyolysis, or high-dose Vitamin K reversing warfarin).
          </p>
          <p>
            <strong>🟡 Absorption &amp; Timing Conflicts (Separate Intake):</strong> Competitive bioavailability conflicts where two compounds compete for the same intestinal transporters or bind into unabsorbable complexes (such as calcium or iron binding thyroid hormone or levothyroxine). These can be safely mitigated by separating intake by 2 to 4 hours.
          </p>
        </span>
      ),
    },
    {
      question: 'What is Drug-Induced Nutrient Depletion (DIND)?',
      answer: (
        <span>
          Certain prescription medications interfere with the normal synthesis, absorption, or excretion of essential micronutrients over time. For example, statins inhibit the HMG-CoA reductase pathway which also suppresses endogenous Coenzyme Q10 (CoQ10) synthesis, and long-term metformin usage impairs ileal Vitamin B12 absorption. SafeStack alerts you to these depletions with evidence-backed replenishment strategies.
        </span>
      ),
    },
    {
      question: 'What authoritative clinical sources are used to formulate the rules?',
      answer: (
        <span>
          Our rules are distilled from peer-reviewed clinical nutrition and pharmacology references, including <em>Krause and Mahan’s Food &amp; the Nutrition Care Process</em>, NIH Clinical Pharmacokinetics monographs, American College of Clinical Pharmacy (ACCP) guidelines, and standard pharmacopoeial drug interaction databases.
        </span>
      ),
    },
    {
      question: 'How does SafeStack determine the Recommended Daily Schedule?',
      answer: (
        <span>
          Optimal administration timing depends on circadian pharmacokinetics and gastrointestinal absorption dynamics. For instance, thyroid hormones require an acidic, empty stomach in the morning, while lipophilic supplements like CoQ10 and Omega-3 require dietary fats at lunch or dinner, and cholesterol-synthesis inhibitors (statins) are most effective taken in the evening when hepatic cholesterol production peaks.
        </span>
      ),
    },
    {
      question: 'Does NutriDive SafeStack provide medical advice or prescriptions?',
      answer: (
        <span>
          No. NutriDive SafeStack is an educational and clinical risk screening tool. It does not provide individualized diagnoses, treatment plans, or prescriptions. Always discuss any planned changes to your medications or supplement stack with a licensed physician or registered clinical pharmacist.
        </span>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950 py-12 sm:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb / Nav */}
        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mb-6">
          <Link href="/" className="hover:text-teal-600 transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-zinc-800 dark:text-zinc-200 font-medium">FAQ</span>
        </div>

        {/* Page Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200/80 dark:border-teal-800 text-teal-700 dark:text-teal-300 text-xs font-semibold mb-4">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Frequently Asked Questions</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
            Medication &amp; Supplement Safety Guidance
          </h1>
          <p className="mt-3 text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Everything you need to know about screening drug-supplement-food interactions, timing absorption windows, and preventing micronutrient depletions.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-6 sm:p-8 shadow-xs">
          <FaqAccordion items={faqItems} />
        </div>

        {/* SafeStack Callout */}
        <div className="mt-10 p-6 rounded-2xl bg-gradient-to-r from-teal-500/10 to-teal-600/5 border border-teal-500/20 dark:border-teal-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-base text-zinc-900 dark:text-zinc-100">
              Ready to check your daily stack?
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              Screen medications, vitamins, and foods against clinical interaction rules.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-semibold transition-colors shrink-0 shadow-xs"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Go to SafeStack</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
