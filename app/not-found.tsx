import React from 'react';
import Link from 'next/link';
import { Search, Pill, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto mb-4 border border-teal-200 dark:border-teal-800">
        <Pill className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
        Record Not Found
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        We could not locate this MAL registration number or generic molecule in the NPRA dataset. The registration may be expired, deregistered, or pending approval.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-700 text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return Home</span>
        </Link>
        <Link
          href="/search"
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-800 dark:text-zinc-200 transition-colors"
        >
          <Search className="w-4 h-4" />
          <span>Search Database</span>
        </Link>
      </div>
    </div>
  );
}
