import React from 'react';
import { ShieldCheck, Smartphone, Eye, Sparkles, AlertCircle } from 'lucide-react';

export default function HologramGuidance({ regNo }: { regNo: string }) {
  return (
    <div className="rounded-xl border border-teal-200 dark:border-teal-900/60 bg-gradient-to-br from-teal-50/60 via-white to-emerald-50/40 dark:from-teal-950/30 dark:via-zinc-950 dark:to-emerald-950/20 p-5 md:p-6 shadow-sm">
      <div className="flex items-start gap-3.5">
        <div className="rounded-lg bg-teal-600 dark:bg-teal-500 p-2.5 text-white shrink-0 shadow-sm">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-base text-zinc-900 dark:text-zinc-100">
              Malaysian KKM Security Hologram Verification
            </h3>
            <span className="text-[11px] font-semibold uppercase tracking-wider bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 px-2 py-0.5 rounded">
              FarmaChecker & Meditag™
            </span>
          </div>

          <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
            By Malaysian Ministry of Health (KKM) regulation, all genuine registered pharmaceuticals, health supplements (MAL-N), and traditional products (MAL-T) distributed in Malaysia must feature an official tamper-evident security hologram sticker on the physical packaging.
          </p>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-lg border border-teal-100 dark:border-teal-900/40 bg-white/80 dark:bg-zinc-900/60 p-3">
              <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400 font-semibold text-xs mb-1">
                <Eye className="w-3.5 h-3.5" />
                <span>1. Visual Tilt Check</span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-tight">
                Tilt the box under light to view the micro-engraved KKM coat of arms and multi-layer iridescent security patterns.
              </p>
            </div>

            <div className="rounded-lg border border-teal-100 dark:border-teal-900/40 bg-white/80 dark:bg-zinc-900/60 p-3">
              <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400 font-semibold text-xs mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>2. Match MAL Number</span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-tight">
                Ensure the printed MAL code matches <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-200">{regNo}</span> exactly on label and box.
              </p>
            </div>

            <div className="rounded-lg border border-teal-100 dark:border-teal-900/40 bg-white/80 dark:bg-zinc-900/60 p-3">
              <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400 font-semibold text-xs mb-1">
                <Smartphone className="w-3.5 h-3.5" />
                <span>3. FarmaChecker Scan</span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-tight">
                Scan using the official <strong>FarmaChecker</strong> app on iOS / Android to authenticate serial token with NPRA servers.
              </p>
            </div>
          </div>

          <div className="mt-3.5 flex items-center gap-2 text-[11px] text-amber-700 dark:text-amber-300/90 bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-md px-3 py-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
            <span>
              If the packaging lacks a security hologram or fails the FarmaChecker scan, do not consume and report to Cawangan Penguatkuasaan Farmasi (CPF KKM).
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
