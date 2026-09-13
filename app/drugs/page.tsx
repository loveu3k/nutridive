import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import fs from 'fs';
import path from 'path';
import ThemeToggle from '@/components/ThemeToggle';
import DrugDirectoryView, { DirectoryDrug } from '@/components/DrugDirectoryView';

export const metadata = {
  title: 'A-Z Prescription Drug & Dietary Interaction Directory | NutriDive SafeStack',
  description: 'Browse all 2,050+ FDA & MedlinePlus prescription medications. Check food-drug interactions, grapefruit warnings, alcohol rules, and empty-stomach timing.',
  alternates: {
    canonical: 'https://nutridive.net/drugs'
  }
};

function getDrugs(): DirectoryDrug[] {
  const filePath = path.join(process.cwd(), 'data/rules/medline_dietary_rules.json');
  if (!fs.existsSync(filePath)) return [];
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

export default function DrugsDirectoryPage() {
  const allDrugs = getDrugs();
  const sorted = [...allDrugs].sort((a, b) => a.drugName.localeCompare(b.drugName));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090D16] text-slate-900 dark:text-slate-100 flex flex-col justify-between transition-colors duration-200">
      {/* Top Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 shadow-2xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>SafeStack Radar</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex text-xs font-semibold px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-full border border-emerald-200 dark:border-emerald-800">
              {allDrugs.length.toLocaleString()} Monographed Drugs
            </span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 flex-1 w-full">
        {/* Hero */}
        <div className="space-y-2 text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            A-Z Medication &amp; Dietary Guidelines Directory
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
            Clinical food interactions, grapefruit warnings, alcohol cautions, and meal-timing requirements for all FDA &amp; MedlinePlus monographed pharmaceuticals.
          </p>
        </div>

        {/* Live Interactive Directory View */}
        <DrugDirectoryView initialDrugs={sorted} />
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <p>© 2026 NutriDive SafeStack · Multi-Substance Clinical Interaction Radar</p>
      </footer>
    </div>
  );
}
