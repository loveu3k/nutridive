import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xs mt-16 text-xs text-slate-500 dark:text-slate-400 py-6 transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
          <span className="font-bold text-slate-800 dark:text-slate-200 tracking-tight">NutriDive SafeStack</span>
          <span className="hidden sm:inline text-slate-300 dark:text-slate-700">·</span>
          <span className="text-slate-500 dark:text-slate-400">100% Client-Side Private · Zero Tracking</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs font-medium">
          <Link
            href="/drugs"
            className="text-slate-600 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-400 transition"
          >
            A-Z Drugs
          </Link>
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <Link
            href="/interactions"
            className="text-slate-600 dark:text-slate-400 hover:text-purple-700 dark:hover:text-purple-400 transition"
          >
            Interaction Pairs
          </Link>
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <Link
            href="/disclaimer#sources"
            className="text-slate-600 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-400 transition"
          >
            Evidence Sources
          </Link>
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <Link
            href="/disclaimer"
            className="text-slate-600 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-400 transition"
          >
            Medical Disclaimer
          </Link>
        </div>
      </div>
    </footer>
  );
}
