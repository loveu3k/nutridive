import React from 'react';
import Link from 'next/link';
import { Pill, ExternalLink, Info, ArrowUpRight } from 'lucide-react';
import type { ActiveIngredient } from '@/lib/types';
import { formatStrength } from '@/lib/utils';

interface ActiveIngredientsMatrixProps {
  ingredients: ActiveIngredient[];
  productName: string;
  categoryCode: string;
}

// Harmonious color palette cycling for multi-ingredient clarity
const INGREDIENT_PALETTES = [
  {
    border: 'border-l-teal-500',
    bgBadge: 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-800',
    link: 'text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300',
    dot: 'bg-teal-500',
  },
  {
    border: 'border-l-indigo-500',
    bgBadge: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    link: 'text-indigo-700 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300',
    dot: 'bg-indigo-500',
  },
  {
    border: 'border-l-rose-500',
    bgBadge: 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    link: 'text-rose-700 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300',
    dot: 'bg-rose-500',
  },
  {
    border: 'border-l-amber-500',
    bgBadge: 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    link: 'text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300',
    dot: 'bg-amber-500',
  },
  {
    border: 'border-l-cyan-500',
    bgBadge: 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
    link: 'text-cyan-700 dark:text-cyan-400 hover:text-cyan-800 dark:hover:text-cyan-300',
    dot: 'bg-cyan-500',
  },
  {
    border: 'border-l-violet-500',
    bgBadge: 'bg-violet-50 dark:bg-violet-950/60 text-violet-800 dark:text-violet-300 border-violet-200 dark:border-violet-800',
    link: 'text-violet-700 dark:text-violet-400 hover:text-violet-800 dark:hover:text-violet-300',
    dot: 'bg-violet-500',
  },
];

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
    <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-5 py-3.5 bg-zinc-50/60 dark:bg-zinc-900/50">
        <div className="flex items-center gap-2">
          <Pill className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
            Active Formulation &amp; Therapeutic Molecules
          </h3>
        </div>
        <span className="text-xs font-mono font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-200/60 dark:bg-zinc-800 px-2.5 py-0.5 rounded-full">
          {ingredients.length} {ingredients.length === 1 ? 'Ingredient' : 'Ingredients'}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-200/80 dark:border-zinc-800 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider bg-zinc-50/30 dark:bg-zinc-900/30">
              <th className="py-3 px-5">Active Substance / Generic Molecule</th>
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

              const palette = INGREDIENT_PALETTES[idx % INGREDIENT_PALETTES.length];

              return (
                <tr
                  key={idx}
                  className={`border-l-4 ${palette.border} hover:bg-zinc-50/80 dark:hover:bg-zinc-900/50 transition-colors group`}
                >
                  <td className="py-3.5 px-5 font-medium">
                    <Link
                      href={`/generic/${genericSlug}`}
                      className={`inline-flex items-center gap-1.5 font-semibold ${palette.link} hover:underline underline-offset-4 transition-colors`}
                      title={`View all products with ${ing.name} in Malaysia`}
                    >
                      <span className={`w-2 h-2 rounded-full ${palette.dot} shrink-0`} />
                      <span>{ing.name}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </td>
                  <td className="py-3.5 px-5 text-right font-mono tabular-nums text-zinc-700 dark:text-zinc-300">
                    {ing.dosage ? (
                      <span className="bg-zinc-100 dark:bg-zinc-800/90 border border-zinc-200/70 dark:border-zinc-700/60 px-2.5 py-1 rounded-md text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        {formatStrength(ing.dosage)}
                      </span>
                    ) : (
                      <span className="text-xs text-zinc-400 italic">Formulation Proprietary</span>
                    )}
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <Link
                      href={`/generic/${genericSlug}`}
                      className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg border ${palette.bgBadge} transition-all hover:shadow-2xs`}
                    >
                      <span>Find All Brands</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend & Medical Notice */}
      <div className="bg-zinc-50/70 dark:bg-zinc-900/40 px-5 py-2.5 border-t border-zinc-200/80 dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
        <div className="flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
          <span>
            Tap any active substance to view all approved brands registered with NPRA Malaysia containing that ingredient.
          </span>
        </div>
        <div className="text-zinc-400 text-[10px] font-mono">
          NPRA Schedule: MAL...{categoryCode}
        </div>
      </div>
    </div>
  );
}
