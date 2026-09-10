'use client';

import React, { useState } from 'react';
import { Pill, Sparkles, ShieldCheck, Leaf, Syringe, Droplets, HeartPulse } from 'lucide-react';

interface ProductVisualCardProps {
  categoryCode: string;
  productName: string;
  regNo: string;
  primaryMolecule: string;
  imageUrl?: string | null;
  className?: string;
}

export type DosageFormType =
  | 'tablet'
  | 'capsule'
  | 'syrup'
  | 'cream'
  | 'injection'
  | 'inhaler'
  | 'powder'
  | 'herbal'
  | 'general';

export function detectDosageForm(name: string): { type: DosageFormType; label: string } {
  const lower = name.toLowerCase();
  if (lower.includes('tablet') || lower.includes('tab') || lower.includes('caplet') || lower.includes('lozenges') || lower.includes('lozenge')) {
    return { type: 'tablet', label: 'Oral Tablet' };
  }
  if (lower.includes('capsule') || lower.includes('cap') || lower.includes('softgel')) {
    return { type: 'capsule', label: 'Oral Capsule' };
  }
  if (lower.includes('syrup') || lower.includes('suspension') || lower.includes('liquid') || lower.includes('solution') || lower.includes('elixir') || lower.includes('oral drops')) {
    return { type: 'syrup', label: 'Oral Liquid / Syrup' };
  }
  if (lower.includes('cream') || lower.includes('ointment') || lower.includes('gel') || lower.includes('lotion')) {
    return { type: 'cream', label: 'Topical Formulation' };
  }
  if (lower.includes('injection') || lower.includes('inj') || lower.includes('infusion') || lower.includes('vial') || lower.includes('ampoule')) {
    return { type: 'injection', label: 'Sterile Injectable' };
  }
  if (lower.includes('powder') || lower.includes('granule') || lower.includes('granules') || lower.includes('sachet')) {
    return { type: 'powder', label: 'Oral Powder / Sachet' };
  }
  if (lower.includes('herbal') || lower.includes('akar') || lower.includes('daun') || lower.includes('jamu') || lower.includes('tea')) {
    return { type: 'herbal', label: 'Traditional Herbal' };
  }
  return { type: 'general', label: 'Pharmaceutical Unit' };
}

export default function ProductVisualCard({
  categoryCode,
  productName,
  regNo,
  primaryMolecule,
  imageUrl,
  className = '',
}: ProductVisualCardProps) {
  const [imageError, setImageError] = useState(false);
  const { type: formType, label: formLabel } = detectDosageForm(productName);
  const hasRealImage = Boolean(imageUrl && !imageError);

  // Category Theme Palette
  const getTheme = () => {
    switch (categoryCode) {
      case 'A':
        return {
          gradient: 'from-blue-500/10 via-blue-500/5 to-transparent dark:from-blue-500/20 dark:via-blue-500/5',
          border: 'border-blue-200/80 dark:border-blue-900/50',
          accent: 'text-blue-600 dark:text-blue-400',
          glow: 'bg-blue-500/15',
          pillBg: 'bg-blue-600 text-white',
          tag: 'Prescription (MAL-A)',
        };
      case 'X':
        return {
          gradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent dark:from-emerald-500/20 dark:via-emerald-500/5',
          border: 'border-emerald-200/80 dark:border-emerald-900/50',
          accent: 'text-emerald-600 dark:text-emerald-400',
          glow: 'bg-emerald-500/15',
          pillBg: 'bg-emerald-600 text-white',
          tag: 'Over-the-Counter (MAL-X)',
        };
      case 'N':
        return {
          gradient: 'from-purple-500/10 via-purple-500/5 to-transparent dark:from-purple-500/20 dark:via-purple-500/5',
          border: 'border-purple-200/80 dark:border-purple-900/50',
          accent: 'text-purple-600 dark:text-purple-400',
          glow: 'bg-purple-500/15',
          pillBg: 'bg-purple-600 text-white',
          tag: 'Supplement (MAL-N)',
        };
      case 'T':
        return {
          gradient: 'from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-500/20 dark:via-amber-500/5',
          border: 'border-amber-200/80 dark:border-amber-900/50',
          accent: 'text-amber-600 dark:text-amber-400',
          glow: 'bg-amber-500/15',
          pillBg: 'bg-amber-600 text-white',
          tag: 'Traditional (MAL-T)',
        };
      default:
        return {
          gradient: 'from-teal-500/10 via-teal-500/5 to-transparent dark:from-teal-500/20 dark:via-teal-500/5',
          border: 'border-teal-200/80 dark:border-teal-900/50',
          accent: 'text-teal-600 dark:text-teal-400',
          glow: 'bg-teal-500/15',
          pillBg: 'bg-teal-600 text-white',
          tag: 'Regulated Health Product',
        };
    }
  };

  const theme = getTheme();

  return (
    <div
      className={`rounded-3xl border ${theme.border} bg-white dark:bg-zinc-950 p-6 shadow-sm relative overflow-hidden flex flex-col items-center justify-between ${className}`}
    >
      {/* Ambient background glow */}
      <div
        className={`absolute -top-12 -right-12 w-48 h-48 rounded-full ${theme.glow} blur-3xl pointer-events-none`}
      />
      <div
        className={`absolute -bottom-12 -left-12 w-48 h-48 rounded-full ${theme.glow} blur-3xl pointer-events-none`}
      />

      {/* Top Header Row: Category Badge & Hologram Indicator */}
      <div className="w-full flex items-center justify-between relative z-10 text-[11px]">
        <span className="font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700">
          {theme.tag}
        </span>
        <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span className="font-mono text-[10px]">Meditag</span>
        </div>
      </div>

      {/* Central Dosage Form Visualizer or Real Product Image */}
      <div className="relative z-10 my-6 sm:my-8 flex flex-col items-center justify-center">
        {hasRealImage ? (
          <div className="flex flex-col items-center gap-2">
            <div className="relative w-40 h-40 sm:w-44 sm:h-44 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-3 shadow-sm flex items-center justify-center overflow-hidden group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl!}
                alt={productName}
                referrerPolicy="no-referrer"
                loading="lazy"
                onError={() => setImageError(true)}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 text-center tracking-tight">
              Identification reference &bull; Copyright belongs to owner
            </span>
          </div>
        ) : (
          /* Outer Halo ring */
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-tr from-zinc-100 to-zinc-50 dark:from-zinc-900 dark:to-zinc-800 border border-zinc-200/80 dark:border-zinc-700/60 shadow-inner flex items-center justify-center group">
            {/* Subtle dosage pattern decoration */}
            <div className="absolute inset-2 rounded-2xl border border-dashed border-zinc-300/60 dark:border-zinc-700/60" />

            {/* Form-specific 3D vector illustration */}
            {formType === 'tablet' && (
              <div className="relative flex flex-col items-center justify-center">
                {/* Embossed tablet geometry */}
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-white via-zinc-100 to-zinc-200 dark:from-zinc-800 dark:via-zinc-700 dark:to-zinc-900 shadow-md border border-zinc-200 dark:border-zinc-600 flex items-center justify-center relative">
                  {/* Score line across tablet */}
                  <div className="w-10 h-0.5 bg-zinc-300 dark:bg-zinc-500 rounded-full" />
                  <div className="absolute w-2 h-2 rounded-full bg-teal-500/70" />
                </div>
              </div>
            )}

            {formType === 'capsule' && (
              <div className="relative flex items-center justify-center rotate-45">
                <div className="w-7 h-14 rounded-full bg-gradient-to-b from-teal-500 to-teal-700 shadow-md border border-teal-400 flex flex-col overflow-hidden">
                  <div className="w-full h-1/2 bg-white/90 dark:bg-zinc-800 border-b border-teal-300" />
                  <div className="w-full h-1/2 bg-gradient-to-b from-teal-500 to-teal-600" />
                </div>
              </div>
            )}

            {formType === 'syrup' && (
              <div className="relative flex flex-col items-center justify-center">
                <div className="w-10 h-16 rounded-xl bg-gradient-to-br from-amber-100 via-amber-50 to-white dark:from-amber-950 dark:via-amber-900 dark:to-zinc-900 border border-amber-300 dark:border-amber-700 shadow-md relative overflow-hidden flex flex-col items-center">
                  <div className="w-6 h-3 rounded-t-md bg-zinc-400 dark:bg-zinc-600" />
                  <div className="w-full flex-1 flex items-center justify-center">
                    <Droplets className="w-4 h-4 text-amber-500 animate-pulse" />
                  </div>
                </div>
              </div>
            )}

            {formType === 'injection' && (
              <div className="relative flex items-center justify-center">
                <Syringe className="w-12 h-12 text-blue-500 dark:text-blue-400 drop-shadow-md" />
              </div>
            )}

            {formType === 'herbal' && (
              <div className="relative flex items-center justify-center">
                <Leaf className="w-12 h-12 text-amber-500 dark:text-amber-400 drop-shadow-md" />
              </div>
            )}

            {(formType === 'cream' || formType === 'powder' || formType === 'general') && (
              <div className="relative flex items-center justify-center">
                <Pill className={`w-12 h-12 ${theme.accent} drop-shadow-md`} />
              </div>
            )}
          </div>
        )}

        {/* Dosage Form Badge */}
        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200 shadow-2xs">
          <span>{formLabel}</span>
        </div>
      </div>

      {/* Bottom Identity Block: MAL Number & Active Molecule */}
      <div className="w-full text-center relative z-10 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
        <div className="font-mono text-xs font-bold tracking-widest text-zinc-900 dark:text-zinc-100">
          {regNo}
        </div>
        <div className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5 max-w-[220px] mx-auto font-medium">
          {primaryMolecule}
        </div>
      </div>
    </div>
  );
}
