import React from 'react';
import { ShoppingBag, Stethoscope, ExternalLink, ShieldCheck } from 'lucide-react';
import type { CategoryCode } from '@/lib/types';

interface PharmacyAffiliateButtonProps {
  productName: string;
  categoryCode: CategoryCode;
  className?: string;
}

export function PharmacyAffiliateButton({
  productName,
  categoryCode,
  className = '',
}: PharmacyAffiliateButtonProps) {
  const isPrescription = categoryCode === 'A';
  const encodedQuery = encodeURIComponent(productName.trim());

  if (isPrescription) {
    return (
      <div className={`rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/30 p-4 ${className}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-600 text-white shrink-0">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                Prescription Required (Schedule Poison)
              </h4>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                Need a valid doctor&apos;s prescription renewal in Malaysia?
              </p>
            </div>
          </div>

          <a
            href={`https://www.doctoroncall.com.my/find-a-doctor?query=${encodedQuery}`}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors shrink-0"
          >
            <span>Consult Online Doctor (Telehealth)</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    );
  }

  // OTC / Supplements / Traditional (MAL-X, MAL-N, MAL-T)
  return (
    <div className={`rounded-xl border border-teal-200 dark:border-teal-900/60 bg-teal-50/50 dark:bg-teal-950/30 p-4 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-teal-600 text-white shrink-0">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
              Check Verified Pharmacy Stock & Best Price
            </h4>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
              Compare retail prices across licensed Malaysian pharmacies (Watsons, Guardian, Big Pharmacy, Shopee Mall).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href={`https://www.watsons.com.my/search?text=${encodedQuery}`}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-700 text-white transition-colors shadow-sm"
          >
            <span>Watsons MY</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href={`https://guardian.com.my/search?q=${encodedQuery}`}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 transition-colors shadow-sm"
          >
            <span>Guardian MY</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}

interface AdUnitSlotProps {
  slot: 'leaderboard' | 'in_content' | 'sidebar';
  className?: string;
}

export function AdUnitSlot({ slot, className = '' }: AdUnitSlotProps) {
  // Ads disabled by user request - zero visual clutter and zero disturbance
  if (process.env.NEXT_PUBLIC_ENABLE_ADS !== 'true') {
    return null;
  }

  if (slot === 'leaderboard') {
    return (
      <div
        className={`w-full mx-auto my-4 min-h-[90px] rounded-lg border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 flex flex-col items-center justify-center p-2 text-center text-zinc-400 dark:text-zinc-500 text-[11px] ${className}`}
        data-ad-slot="leaderboard"
      >
        <span className="text-[10px] uppercase font-mono tracking-wider opacity-60">Sponsored / Pharmacy Partner</span>
        <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Licensed Healthcare & Pharmaceutical Services</span>
      </div>
    );
  }

  if (slot === 'in_content') {
    return (
      <div
        className={`w-full my-6 min-h-[120px] rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-900/20 flex flex-col items-center justify-center p-4 text-center text-zinc-400 dark:text-zinc-500 ${className}`}
        data-ad-slot="in-content"
      >
        <span className="text-[10px] uppercase font-mono tracking-wider opacity-60">Advertisement</span>
        <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Official Malaysian Healthcare & Wellness Directory</span>
      </div>
    );
  }

  return null;
}
