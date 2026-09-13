import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Layers } from 'lucide-react';
import fs from 'fs';
import path from 'path';
import ThemeToggle from '@/components/ThemeToggle';

export const metadata = {
  title: 'Clinical Medication & Dietary Interaction Index | NutriDive SafeStack',
  description: 'Search hundreds of clinical drug-drug, drug-food, and drug-supplement interaction evaluations with mechanisms and timing rules.',
  alternates: {
    canonical: 'https://nutridive.net/interactions'
  }
};

interface PairEntry {
  slug: string;
  substanceA: string;
  substanceB: string;
  priority?: number;
}

function getPairs(): PairEntry[] {
  const filePath = path.join(process.cwd(), 'data/rules/interaction_pairs.json');
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

export default function InteractionsDirectoryPage() {
  const pairs = getPairs();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090D16] text-slate-900 dark:text-slate-100 flex flex-col justify-between transition-colors duration-200">
      {/* Header */}
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
            <span className="hidden sm:inline-flex text-xs font-semibold px-2.5 py-1 bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 rounded-full border border-purple-200 dark:border-purple-800">
              {pairs.length} Evaluated Pairings
            </span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 flex-1 w-full">
        <div className="space-y-2 text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Pairwise Interaction &amp; Synergy Directory
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
            Evidence-based pairwise conflict assessments between prescription medications, common kitchen ingredients, vitamins, and herbal extracts.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {pairs.map((p) => {
            const cleanA = p.substanceA.replace(/-/g, ' ');
            const cleanB = p.substanceB.replace(/-/g, ' ');

            return (
              <Link
                key={p.slug}
                href={`/interactions/${p.slug}`}
                className="group p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-md transition flex flex-col justify-between gap-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 capitalize group-hover:text-purple-700 dark:group-hover:text-purple-400 transition">
                      {cleanA}
                    </span>
                    <span className="text-slate-400 dark:text-slate-600 font-bold text-xs">+</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 capitalize group-hover:text-purple-700 dark:group-hover:text-purple-400 transition">
                      {cleanB}
                    </span>
                  </div>
                  <h2 className="text-xs text-slate-500 dark:text-slate-400 font-medium capitalize line-clamp-1">
                    {cleanA} and {cleanB} Interaction
                  </h2>
                </div>

                <div className="flex items-center justify-between text-[11px] font-semibold text-purple-700 dark:text-purple-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span>View Clinical Dossier</span>
                  <span>→</span>
                </div>
              </Link>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <p>© 2026 NutriDive SafeStack · Multi-Substance Clinical Interaction Radar</p>
      </footer>
    </div>
  );
}
