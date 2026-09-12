import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldAlert } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto mb-4 border border-teal-200 dark:border-teal-800">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
        Page Not Found (404)
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Sorry, the page you are looking for does not exist or has been restructured.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-700 text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to SafeStack Home</span>
        </Link>
      </div>
    </div>
  );
}
