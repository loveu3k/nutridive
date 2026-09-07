import React from 'react';
import Link from 'next/link';
import { Pill, ExternalLink, Info } from 'lucide-react';
import type { ActiveIngredient } from '@/lib/types';

interface ActiveIngredientsMatrixProps {
  ingredients: ActiveIngredient[];
  productName: string;
  categoryCode: string;
}

export default function ActiveIngredientsMatrix({
  ingredients,
  productName,
  categoryCode,
}: ActiveIngredientsMatrixProps) {
  if (!ingredients || ingredients.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-800 p-6 text-center text-sm text-zinc-500">
        No active ingredients listed in regulatory record for {productName}.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm">
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-5 py-3.5 bg-zinc-50/50 dark:bg-zinc-900/50">
        <div className="flex items-center gap-2">
          <Pill className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
            Active Ingredients & Strength Formulation
          </h3>
        </div>
        <span className="text-xs font-mono font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-200/60 dark:bg-zinc-800 px-2 py-0.5 rounded">
          {ingredients.length} {ingredients.length === 1 ? 'Component' : 'Components'}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider bg-zinc-50/30 dark:bg-zinc-900/30">
              <th className="py-3 px-5">Active Substance / Molecule</th>
              <th className="py-3 px-5 text-right font-mono">Declared Strength / Dosage</th>
              <th className="py-3 px-5 text-right">Generic Directory</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-sm">
            {ingredients.map((ing, idx) => {
              const genericSlug = ing.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '');

              return (
                <tr
                  key={idx}
                  className="hover:bg-teal-50/30 dark:hover:bg-teal-950/20 transition-colors"
                >
                  <td className="py-3.5 px-5 font-medium text-zinc-900 dark:text-zinc-100">
                    <span className="inline-block text-zinc-900 dark:text-zinc-100">
                      {ing.name}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-right font-mono tabular-nums text-zinc-700 dark:text-zinc-300">
                    {ing.dosage ? (
                      <span className="bg-zinc-100 dark:bg-zinc-800/80 px-2.5 py-1 rounded text-xs font-semibold text-teal-800 dark:text-teal-300">
                        {ing.dosage}
                      </span>
                    ) : (
                      <span className="text-xs text-zinc-400 italic">Formulation Proprietary</span>
                    )}
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <Link
                      href={`/generic/${genericSlug}`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 transition-colors"
                    >
                      <span>Find Brands</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="bg-zinc-50/60 dark:bg-zinc-900/40 px-5 py-2.5 border-t border-zinc-200/80 dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
        <Info className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
        <span>
          Dosage values indicate declared active concentration per unit dose as registered with NPRA Malaysia.
        </span>
      </div>
    </div>
  );
}
