'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Pill, AlertTriangle, Clock, X, ArrowUp } from 'lucide-react';

export interface DirectoryDrug {
  drugName: string;
  genericName: string;
  slug: string;
  brandNames: string[];
  specialDietaryInstructions: string | null;
  hasSpecialDiet: boolean;
  foodPrecautions: string[];
  timingGuidance: string[];
}

interface Props {
  initialDrugs: DirectoryDrug[];
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function DrugDirectoryView({ initialDrugs }: Props) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter drugs based on query
  const filteredDrugs = useMemo(() => {
    if (!searchQuery.trim()) return initialDrugs;
    const q = searchQuery.toLowerCase().trim();
    return initialDrugs.filter(d =>
      d.drugName.toLowerCase().includes(q) ||
      d.genericName.toLowerCase().includes(q) ||
      d.slug.toLowerCase().includes(q) ||
      (d.brandNames && d.brandNames.some(b => b.toLowerCase().includes(q)))
    );
  }, [initialDrugs, searchQuery]);

  // Group by first letter
  const grouped = useMemo(() => {
    const map: Record<string, DirectoryDrug[]> = {};
    ALPHABET.forEach(letter => { map[letter] = []; });
    map['#'] = [];

    filteredDrugs.forEach(drug => {
      const firstChar = drug.drugName.charAt(0).toUpperCase();
      if (ALPHABET.includes(firstChar)) {
        map[firstChar].push(drug);
      } else {
        map['#'].push(drug);
      }
    });
    return map;
  }, [filteredDrugs]);

  const availableLetters = ALPHABET.filter(l => grouped[l]?.length > 0);
  if (grouped['#']?.length > 0) availableLetters.push('#');

  return (
    <div className="space-y-8">
      {/* Search Input Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search 2,056+ medications by name, active ingredient, or brand (e.g., Warfarin, Aliskiren, Lipitor, Advil)..."
            className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 px-1">
          <span>
            Showing <strong className="text-slate-900 dark:text-white">{filteredDrugs.length.toLocaleString()}</strong> of {initialDrugs.length.toLocaleString()} pharmaceuticals
          </span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
            >
              Clear Filter
            </button>
          )}
        </div>
      </div>

      {/* Alphabet Jump Navigation */}
      <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
          Jump to Letter
        </div>
        <div className="flex flex-wrap gap-1 sm:gap-1.5">
          {ALPHABET.map(letter => {
            const hasMatches = grouped[letter]?.length > 0;
            return hasMatches ? (
              <a
                key={letter}
                href={`#letter-${letter}`}
                className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white transition bg-slate-100/80 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                {letter}
              </a>
            ) : (
              <span
                key={letter}
                className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl text-xs sm:text-sm font-bold text-slate-300 dark:text-slate-700 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/50 cursor-not-allowed"
              >
                {letter}
              </span>
            );
          })}
        </div>
      </div>

      {/* Directory List by Letter */}
      {filteredDrugs.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <Pill className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            No medications found for &ldquo;{searchQuery}&rdquo;
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try searching by the chemical generic name (e.g., &ldquo;atorvastatin&rdquo; instead of a rare brand name) or clear your filter.
          </p>
          <button
            onClick={() => setSearchQuery('')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition"
          >
            Show All Medications
          </button>
        </div>
      ) : (
        <div className="space-y-10">
          {availableLetters.map(letter => {
            const list = grouped[letter];
            if (!list || list.length === 0) return null;

            return (
              <section key={letter} id={`letter-${letter}`} className="scroll-mt-20 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-black text-lg flex items-center justify-center shadow-xs">
                      {letter}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {list.length} medication{list.length > 1 ? 's' : ''}
                    </span>
                  </div>

                  <a
                    href="#"
                    className="text-xs font-semibold text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1 transition"
                  >
                    <span>Back to Top</span>
                    <ArrowUp className="w-3 h-3" />
                  </a>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {list.map(drug => {
                    const hasDiet = drug.hasSpecialDiet;
                    const hasTiming = drug.timingGuidance && drug.timingGuidance.length > 0;
                    const brandsCount = drug.brandNames ? drug.brandNames.length : 0;

                    return (
                      <Link
                        key={drug.slug}
                        href={`/drugs/${drug.slug}`}
                        className="group p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-md transition flex flex-col justify-between gap-2.5"
                      >
                        <div className="space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition leading-snug line-clamp-1">
                              {drug.drugName}
                            </h3>
                            <Pill className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          </div>

                          {brandsCount > 0 && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                              Brands: {drug.brandNames.slice(0, 3).join(', ')}
                              {brandsCount > 3 ? ` +${brandsCount - 3}` : ''}
                            </p>
                          )}
                        </div>

                        {/* Badges */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {hasDiet && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                              <AlertTriangle className="w-2.5 h-2.5" />
                              Dietary Warning
                            </span>
                          )}
                          {hasTiming && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                              <Clock className="w-2.5 h-2.5" />
                              Timing Rule
                            </span>
                          )}
                          {!hasDiet && !hasTiming && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                              Standard Diet
                            </span>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
