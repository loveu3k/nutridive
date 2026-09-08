import React from 'react';

export default function CategoryLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 animate-pulse space-y-6">
      <div className="h-4 w-48 bg-zinc-200 dark:bg-zinc-800 rounded-md mb-6" />

      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 md:p-8 space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-2 flex-1">
            <div className="flex gap-2">
              <div className="h-5 w-20 bg-zinc-200 dark:bg-zinc-800 rounded" />
              <div className="h-5 w-32 bg-zinc-200 dark:bg-zinc-800 rounded" />
            </div>
            <div className="h-8 w-2/3 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
            <div className="h-4 w-1/2 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
          </div>
          <div className="h-16 w-32 bg-zinc-100 dark:bg-zinc-900 rounded-xl" />
        </div>
      </div>

      <div className="h-14 w-full bg-zinc-100 dark:bg-zinc-900 rounded-2xl" />

      <div className="space-y-2">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            className="h-12 w-full bg-zinc-100 dark:bg-zinc-900/60 rounded-xl"
          />
        ))}
      </div>
    </div>
  );
}
