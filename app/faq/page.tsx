import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { HelpCircle, Search, ArrowRight, ShieldCheck } from 'lucide-react';
import FaqAccordion, { type FaqItem } from '@/components/FaqAccordion';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions (FAQ) | NutriDive Malaysia',
  description:
    'Essential guidance on Malaysian medicine registration (MAL codes), NPRA verification, generic medicine bioequivalence, and regulatory categories.',
};

export default function FaqPage() {
  const faqItems: FaqItem[] = [
    {
      question: 'How do I check if a medicine is registered in Malaysia?',
      answer: (
        <span>
          Every authentic medicine, health supplement, or traditional remedy approved for sale in Malaysia is assigned a unique registration number by the National Pharmaceutical Regulatory Agency (NPRA), Ministry of Health Malaysia. It starts with &quot;MAL&quot; followed by 8 digits and ends with an alphabetical classification code (e.g., <code>MAL19900523AZ</code>). You can verify any MAL code directly in NutriDive&apos;s search bar or cross-reference the official NPRA QUEST3+ portal.
        </span>
      ),
    },
    {
      question: 'What do the MAL letter codes mean (A, X, N, T, V)?',
      answer: (
        <span>
          The letter at the end of every registration number signifies its legal dispensing classification:
          <ul className="list-disc pl-5 mt-2 space-y-1.5 text-zinc-600 dark:text-zinc-300">
            <li><strong>A (Prescription Medicine):</strong> Controlled poisons requiring a prescription issued by a registered medical practitioner.</li>
            <li><strong>X (Over-the-Counter / OTC):</strong> Non-poison medications available for direct self-care purchase without a prescription.</li>
            <li><strong>N (Health Supplements):</strong> Formulated vitamins, minerals, amino acids, and dietary nutraceuticals.</li>
            <li><strong>T (Traditional &amp; Herbal):</strong> Herbal preparations, Traditional Chinese Medicine (TCM), Jamu, and Ayurvedic formulas.</li>
            <li><strong>V (Veterinary):</strong> Medications formulated specifically for animal healthcare.</li>
          </ul>
        </span>
      ),
    },
    {
      question: 'What is a generic alternative medicine, and is it as safe as the brand name?',
      answer: (
        <span>
          A generic medicine contains the exact same active pharmaceutical ingredient (API), dosage form, strength, and route of administration as the original innovator drug. In Malaysia, generic prescription drugs must pass stringent <strong>Bioequivalence (BE) studies</strong> evaluated by NPRA to prove they work identically in the human body before receiving market authorization. They offer the same therapeutic efficacy at significantly lower costs.
        </span>
      ),
    },
    {
      question: 'Can I verify authentic medicine by scanning the packaging barcode or hologram?',
      answer: (
        <span>
          <p className="mb-2">
            <strong>NPRA Security Hologram (Meditag / Farmatag):</strong> All registered medicines sold in Malaysia must bear an official tamper-evident security hologram sticker. The microscopic security features can only be verified cryptographically using the official Ministry of Health <em>Meditag</em> / <em>Faris</em> mobile app, as ordinary web cameras cannot read the holographic micro-gratings.
          </p>
          <p>
            <strong>Retail Barcode (EAN-13):</strong> Standard commercial barcodes identify product packaging for supermarket checkout, but the official NPRA government open dataset tracks products strictly by <strong>MAL Registration Number</strong>. To verify a medicine, search the MAL number printed on the box.
          </p>
        </span>
      ),
    },
    {
      question: 'Where does NutriDive source its database?',
      answer: (
        <span>
          NutriDive indexes the official open pharmaceutical catalog published by the National Pharmaceutical Regulatory Agency (NPRA), Ministry of Health Malaysia (KKM) under the Malaysian Open Data Initiative (<code>data.gov.my</code>). NutriDive is an independent consumer directory and is not affiliated with any government agency.
        </span>
      ),
    },
    {
      question: 'Does NutriDive sell medications or offer medical consultations?',
      answer: (
        <span>
          No. NutriDive is an educational and public transparency directory. We do not sell pharmaceuticals, fulfill prescriptions, or provide medical consultations. Always seek the advice of a registered doctor or licensed community pharmacist regarding medications and health conditions.
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
            Malaysian Medicine &amp; Registration Guidance
          </h1>
          <p className="mt-3 text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Everything you need to know about checking medicine registration, understanding NPRA codes, and finding safe, affordable generic alternatives in Malaysia.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-6 sm:p-8 shadow-xs">
          <FaqAccordion items={faqItems} />
        </div>

        {/* Search Callout */}
        <div className="mt-10 p-6 rounded-2xl bg-gradient-to-r from-teal-500/10 to-teal-600/5 border border-teal-500/20 dark:border-teal-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-base text-zinc-900 dark:text-zinc-100">
              Ready to verify a registered medicine?
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              Search over 27,000+ approved products by MAL code, brand, or active ingredient.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-semibold transition-colors shrink-0 shadow-xs"
          >
            <Search className="w-4 h-4" />
            <span>Search Directory</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
