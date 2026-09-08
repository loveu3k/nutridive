import React from 'react';

export default function GenericLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 animate-pulse space-y-6">
      <div className="h-4 w-48 bg-zinc-200 dark:bg-zinc-800 rounded-md mb-6" />

      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 md:p-8 space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-2 flex-1">
            <div className="h-5 w-40 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
            <div className="h-8 w-2/3 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
            <div className="h-4 w-1/2 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
          </div>
          <div className="h-16 w-28 bg-zinc-100 dark:bg-zinc-900 rounded-xl" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 space-y-3"
          >
            <div className="flex justify-between">
              <div className="h-4 w-20 bg-zinc-200 dark:bg-zinc-800 rounded" />
              <div className="h-4 w-16 bg-zinc-200 dark:bg-zinc-800 rounded" />
            </div>
            <div className="h-5 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="h-3 w-1/2 bg-zinc-100 dark:bg-zinc-900 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
