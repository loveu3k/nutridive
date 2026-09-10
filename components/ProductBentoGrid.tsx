'use client';

import React from 'react';
import Link from 'next/link';
import {
  Atom,
  ShieldCheck,
  Building2,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Calendar,
  Factory,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface ProductBentoGridProps {
  primaryMolecule: string;
  genericSlug: string;
  primaryDosage?: string | null;
  regNo: string;
  status: string;
  categoryName: string;
  dateReg?: string | null;
  dateEnd?: string | null;
  holder: string;
  manufacturer?: string | null;
  importer?: string | null;
}

export default function ProductBentoGrid({
  primaryMolecule,
  genericSlug,
  primaryDosage,
  regNo,
  status,
  categoryName,
  dateReg,
  dateEnd,
  holder,
  manufacturer,
  importer,
}: ProductBentoGridProps) {
  const isApproved = status.toLowerCase().includes('active') || status.toLowerCase().includes('approved');

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
      {/* Bento 1: Primary Therapeutic Molecule */}
      <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/60 p-4 sm:p-5 flex flex-col justify-between hover:border-teal-500/60 transition-all shadow-2xs group">
        <div>
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
            <span className="flex items-center gap-1.5 font-medium">
              <Atom className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              Primary Active Molecule
            </span>
            {primaryDosage && (
              <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold">
                {primaryDosage}
              </span>
            )}
          </div>
          <div className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-50 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors line-clamp-1">
            {primaryMolecule}
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
            Identical active pharmaceutical ingredient used across approved generic substitute brands.
          </p>
        </div>
        <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
          <Link
            href={`/generic/${genericSlug}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 group-hover:translate-x-0.5 transition-transform"
          >
            <span>Explore all generic alternatives</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Bento 2: Registration & Legal Schedule */}
      <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/60 p-4 sm:p-5 flex flex-col justify-between hover:border-teal-500/60 transition-all shadow-2xs">
        <div>
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              Registration Status
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {status}
            </span>
          </div>
          <div className="text-base sm:text-lg font-bold font-mono text-zinc-900 dark:text-zinc-50">
            {regNo}
          </div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 flex flex-col gap-0.5 font-mono">
            <span>Valid Until: <strong className="text-zinc-800 dark:text-zinc-200">{formatDate(dateEnd)}</strong></span>
            {dateReg && <span className="text-[11px] text-zinc-400">First registered: {formatDate(dateReg)}</span>}
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 text-xs text-zinc-500 dark:text-zinc-400">
          Classification: <strong className="text-zinc-700 dark:text-zinc-300">{categoryName}</strong>
        </div>
      </div>

      {/* Bento 3: Brand Holder & Manufacturing */}
      <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/60 p-4 sm:p-5 flex flex-col justify-between hover:border-teal-500/60 transition-all shadow-2xs group">
        <div>
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
            <span className="flex items-center gap-1.5 font-medium">
              <Building2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              Registration Holder (PRH)
            </span>
          </div>
          <div className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 line-clamp-2" title={holder}>
            {holder || 'Not Disclosed'}
          </div>
          {manufacturer && (
            <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-1 flex items-center gap-1">
              <Factory className="w-3 h-3 text-zinc-400 shrink-0" />
              <span className="truncate">Mfg: {manufacturer}</span>
            </div>
          )}
        </div>
        <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
          {holder ? (
            <Link
              href={`/search?q=${encodeURIComponent(holder)}&cat=ALL`}
              className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 group-hover:translate-x-0.5 transition-transform"
            >
              <span>View all brands by holder</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <span className="text-xs text-zinc-400">Official Malaysian PRH</span>
          )}
        </div>
      </div>

      {/* Bento 4: Packaging Security & Authenticity */}
      <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/60 p-4 sm:p-5 flex flex-col justify-between hover:border-teal-500/60 transition-all shadow-2xs">
        <div>
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Physical Authentication
            </span>
            <span className="text-[10px] font-mono font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
              KKM Security
            </span>
          </div>
          <div className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
            Meditag Hologram Sticker
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
            Must be present on the outer carton. Scan with the official FarmaChecker mobile app to verify genuine serial token.
          </p>
        </div>
        <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
          <span className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Compulsory for all genuine retail units
          </span>
        </div>
      </div>
    </div>
  );
}
