'use client';

import React from 'react';
import { useCompare } from '@/lib/compare-context';
import { Columns, X, Trash2, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';

export default function CompareTray() {
  const {
    compareList,
    removeFromCompare,
    clearCompare,
    openCompare,
    toastMessage,
  } = useCompare();

  if (compareList.length === 0 && !toastMessage) {
    return null;
  }

  return (
    <>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 transition-all duration-300 transform translate-y-0 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-zinc-900/95 dark:bg-zinc-100/95 text-white dark:text-zinc-950 shadow-xl border border-zinc-700/50 dark:border-zinc-300 text-xs sm:text-sm font-medium backdrop-blur-md">
            <CheckCircle className="w-4 h-4 text-teal-400 dark:text-teal-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Floating Compare Bar */}
      {compareList.length > 0 && (
        <div className="fixed bottom-4 inset-x-3 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 z-40 max-w-3xl w-full">
          <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-2xl border border-teal-500/30 dark:border-teal-500/30 shadow-2xl p-3 sm:p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-5">
            {/* Left: Indicator & Chips */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto overflow-x-auto py-1 sm:py-0">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-xs font-semibold shrink-0">
                <Columns className="w-3.5 h-3.5" />
                <span>Compare ({compareList.length}/4)</span>
              </div>

              {/* Product chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto max-w-[340px] sm:max-w-md no-scrollbar">
                {compareList.map((item) => (
                  <div
                    key={item.slug}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs shrink-0 max-w-[150px] sm:max-w-[180px]"
                    title={`${item.product_name} (${item.reg_no})`}
                  >
                    <span className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
                      {item.product_name}
                    </span>
                    <button
                      onClick={() => removeFromCompare(item.slug)}
                      className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-0.5 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                      title="Remove product"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
              <button
                onClick={clearCompare}
                className="text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1"
                title="Clear all selected"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Clear</span>
              </button>

              <button
                onClick={openCompare}
                disabled={compareList.length < 2}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-50 disabled:pointer-events-none transition-all shadow-md hover:shadow-lg"
              >
                <span>{compareList.length < 2 ? 'Select 1 more' : 'Compare Now'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
