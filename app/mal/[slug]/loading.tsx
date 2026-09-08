import React from 'react';

export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 animate-pulse space-y-6">
      {/* Breadcrumb Skeleton */}
      <div className="h-4 w-48 bg-zinc-200 dark:bg-zinc-800 rounded-md mb-6" />

      {/* Main Header Card Skeleton */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 md:p-8 space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-3 flex-1">
            <div className="flex gap-2">
              <div className="h-6 w-28 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
              <div className="h-6 w-36 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
            </div>
            <div className="h-8 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
            <div className="h-4 w-1/2 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
          </div>
          <div className="h-10 w-28 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
        </div>

        <div className="h-16 w-full bg-zinc-100 dark:bg-zinc-900 rounded-xl" />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-3 w-16 bg-zinc-200 dark:bg-zinc-800 rounded" />
              <div className="h-4 w-28 bg-zinc-200 dark:bg-zinc-800 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Ingredients Skeleton */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 space-y-4">
        <div className="h-5 w-40 bg-zinc-200 dark:bg-zinc-800 rounded" />
        <div className="h-12 w-full bg-zinc-100 dark:bg-zinc-900 rounded-xl" />
      </div>
    </div>
  );
}
