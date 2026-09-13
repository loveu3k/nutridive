'use client';

import React, { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { AuditResult } from '@/lib/checker';

export default function SafetyCard({ result }: { result: AuditResult }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `NutriDive-Safety-Report.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      alert('Unable to export image directly. Please take a screenshot.');
    } finally {
      setDownloading(false);
    }
  };

  // Determine overall triage risk status
  const hasCriticalSynergy = (result.synergyAlerts?.length || 0) > 0;
  const hasCriticalRedFlag = result.redFlags.some(r => r.severity === 'CRITICAL');
  const hasModerateRisk =
    (result.crossInteractions?.length || 0) > 0 ||
    result.timingRules.length > 0 ||
    result.redFlags.length > 0;

  const getTriageStatus = () => {
    if (hasCriticalSynergy || hasCriticalRedFlag) {
      return {
        level: 'CRITICAL HAZARDS DETECTED',
        badgeClass: 'bg-rose-600 text-white shadow-xs',
        bannerClass: 'bg-gradient-to-r from-rose-50 via-rose-100/50 to-orange-50 dark:from-rose-950/40 dark:via-rose-900/30 dark:to-orange-950/30 border-rose-200 dark:border-rose-900 text-rose-950 dark:text-rose-200',
        summaryText:
          'High-risk cumulative synergy or strict dietary contraindication identified. Prioritize medical review and immediate regimen adjustment.'
      };
    }
    if (hasModerateRisk) {
      return {
        level: 'INTERACTION & TIMING CAUTION',
        badgeClass: 'bg-amber-500 text-white shadow-xs',
        bannerClass: 'bg-gradient-to-r from-amber-50 via-amber-100/40 to-yellow-50 dark:from-amber-950/40 dark:via-amber-900/30 dark:to-yellow-950/30 border-amber-200 dark:border-amber-900 text-amber-950 dark:text-amber-200',
        summaryText:
          'Staggered intake timing or dose separation required to prevent absorption competition and reduced efficacy.'
      };
    }
    return {
      level: 'OPTIMAL COMPATIBILITY',
      badgeClass: 'bg-emerald-600 text-white shadow-xs',
      bannerClass: 'bg-gradient-to-r from-emerald-50 via-teal-50/50 to-sky-50 dark:from-emerald-950/40 dark:via-teal-900/30 dark:to-sky-950/30 border-emerald-200 dark:border-emerald-900 text-emerald-950 dark:text-emerald-200',
      summaryText:
        'No high-risk contraindications or absorption conflicts detected across evaluated substances.'
    };
  };

  const triage = getTriageStatus();

  return (
    <div className="flex flex-col items-center gap-4 w-full mt-8">
      <div
        ref={cardRef}
        className="w-full bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-6 text-slate-800 dark:text-slate-200 font-sans transition"
      >
        {/* Header Bar */}
        <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <h3 className="font-extrabold text-lg sm:text-xl text-slate-950 dark:text-white tracking-tight">
                Clinical Interaction &amp; Safety Protocol
              </h3>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 ml-5.5 font-medium">
              NutriDive SafeStack · OpenFDA &amp; Clinical Nutrition Radar
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
              🖨️ Fridge-Ready Sheet
            </span>
          </div>
        </div>

        {/* 1. Executive Triage Summary Dashboard */}
        <div className={`rounded-2xl p-4 sm:p-5 border ${triage.bannerClass} flex flex-col gap-3.5`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-md ${triage.badgeClass}`}>
                {triage.level}
              </span>
            </div>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Evaluated Stack: {result.identifiedItems.length} active substance(s)
            </span>
          </div>
          <p className="text-xs sm:text-sm leading-relaxed font-medium">
            {triage.summaryText}
          </p>

          {/* Quick Metrics Ticker */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs rounded-xl p-2.5 border border-purple-200/60 dark:border-purple-800/60 flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400">Synergies</span>
              <span className="text-lg font-black text-purple-950 dark:text-purple-200">
                {result.synergyAlerts?.length || 0}
              </span>
            </div>
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs rounded-xl p-2.5 border border-blue-200/60 dark:border-blue-800/60 flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">Cross-Pairs</span>
              <span className="text-lg font-black text-blue-950 dark:text-blue-200">
                {result.crossInteractions?.length || 0}
              </span>
            </div>
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs rounded-xl p-2.5 border border-rose-200/60 dark:border-rose-800/60 flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">Red Flags</span>
              <span className="text-lg font-black text-rose-950 dark:text-rose-200">
                {result.redFlags.length}
              </span>
            </div>
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs rounded-xl p-2.5 border border-amber-200/60 dark:border-amber-800/60 flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">Separations</span>
              <span className="text-lg font-black text-amber-950 dark:text-amber-200">
                {result.timingRules.length}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Multi-Agent Cumulative Synergies (Compounded Multi-Drug Hazards) */}
        {result.synergyAlerts && result.synergyAlerts.length > 0 && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs">⚡</span>
              <h4 className="font-extrabold text-slate-900 dark:text-white text-sm tracking-tight">
                Multi-Substance Synergistic Hazards (Compounded Toxicity)
              </h4>
            </div>

            <div className="space-y-3">
              {result.synergyAlerts.map((syn, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-900 border-l-4 border-l-purple-600 border border-purple-200/80 dark:border-purple-900 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col gap-2.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <span className="font-bold text-purple-950 dark:text-purple-200 text-sm sm:text-base">{syn.title}</span>
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 w-fit">
                      {syn.severity} SYNERGY
                    </span>
                  </div>

                  {/* Combined Substances Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Triggered by:</span>
                    {syn.contributingSubstances.map((sub, i) => (
                      <span
                        key={i}
                        className="font-semibold bg-purple-50 dark:bg-purple-950/60 text-purple-900 dark:text-purple-300 px-2.5 py-0.5 rounded-lg border border-purple-200/60 dark:border-purple-800"
                      >
                        {sub}
                      </span>
                    ))}
                  </div>

                  {/* Prominent Action Callout */}
                  <div className="bg-purple-50/90 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 rounded-xl p-3 text-xs text-purple-950 dark:text-purple-200 font-medium flex items-start gap-2">
                    <span className="text-sm shrink-0">🚨</span>
                    <div>
                      <span className="font-bold text-purple-900 dark:text-purple-300">Clinical Action Required: </span>
                      {syn.actionableGuidance}
                    </div>
                  </div>

                  {/* Progressive Disclosure: Pharmacological Mechanism */}
                  <details className="group mt-1">
                    <summary className="text-xs text-purple-700 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300 cursor-pointer font-semibold list-none flex items-center gap-1.5 transition">
                      <span className="group-open:rotate-90 transition-transform">▸</span>
                      <span>View Molecular Pharmacology &amp; Clinical Mechanism</span>
                    </summary>
                    <p className="text-xs text-slate-700 dark:text-slate-300 mt-2 pl-3.5 border-l-2 border-purple-200 dark:border-purple-800 leading-relaxed bg-slate-50/50 dark:bg-slate-800/40 p-2.5 rounded-r-lg">
                      {syn.clinicalWarning}
                    </p>
                  </details>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. Direct Pairwise Cross-Interactions */}
        {result.crossInteractions && result.crossInteractions.length > 0 && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs">↔️</span>
              <h4 className="font-extrabold text-slate-900 dark:text-white text-sm tracking-tight">
                Direct Pairwise Cross-Interactions
              </h4>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {result.crossInteractions.map((ci, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-900 border-l-4 border-l-blue-500 border border-blue-100 dark:border-blue-900 rounded-2xl p-4 shadow-xs flex flex-col gap-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                      <span className="bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-800">
                        {ci.substanceA}
                      </span>
                      <span className="text-blue-500 font-black">⚡</span>
                      <span className="bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-800">
                        {ci.substanceB}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                      {ci.type.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="bg-blue-50/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 rounded-xl p-2.5 text-xs text-blue-950 dark:text-blue-200 font-medium">
                    <span className="font-bold text-blue-900 dark:text-blue-300">👉 Guidance: </span>
                    {ci.actionableAdvice}
                  </div>

                  <details className="group mt-0.5">
                    <summary className="text-xs text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 cursor-pointer font-semibold list-none flex items-center gap-1.5 transition">
                      <span className="group-open:rotate-90 transition-transform">▸</span>
                      <span>Biochemical Pathway Details</span>
                    </summary>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 pl-3 border-l-2 border-blue-200 dark:border-blue-800 leading-relaxed bg-slate-50/40 dark:bg-slate-800/40 p-2 rounded-r-lg">
                      {ci.mechanism}
                    </p>
                  </details>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Critical Dietary Restrictions (Red Flags) */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-200 text-xs">🚫</span>
            <h4 className="font-extrabold text-slate-900 dark:text-white text-sm tracking-tight">
              Critical Food &amp; Ingredient Restrictions (Strictly Avoid)
            </h4>
          </div>

          {result.redFlags.length > 0 ? (
            <div className="grid grid-cols-1 gap-2.5">
              {result.redFlags.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-900 border-l-4 border-l-rose-500 border border-rose-100 dark:border-rose-900 rounded-2xl p-4 shadow-xs flex flex-col gap-1.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <span className="font-bold text-rose-950 dark:text-rose-200 text-xs sm:text-sm flex items-center gap-1.5">
                      <span>❌ Avoid:</span>
                      <span className="bg-rose-50 dark:bg-rose-950/60 text-rose-900 dark:text-rose-300 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-800">
                        {item.item}
                      </span>
                    </span>
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      Triggered by: <strong className="text-slate-800 dark:text-slate-200">{item.sourceDrug}</strong>
                    </span>
                  </div>
                  <p className="text-xs text-rose-900 dark:text-rose-200 leading-relaxed font-medium bg-rose-50/40 dark:bg-rose-950/30 p-2.5 rounded-xl border border-rose-100/60 dark:border-rose-900">
                    {item.reason}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-900 rounded-2xl p-4 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
              <span className="text-base">✅</span>
              <span>No critical kitchen food or beverage contraindications identified for this stack.</span>
            </div>
          )}
        </div>

        {/* 5. Absorption Conflicts (Timing Separations) */}
        {result.timingRules.length > 0 && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 text-xs">⏰</span>
              <h4 className="font-extrabold text-slate-900 dark:text-white text-sm tracking-tight">
                Absorption &amp; Timing Rules (Mandatory Separation)
              </h4>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {result.timingRules.map((tr, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-900 border-l-4 border-l-amber-500 border border-amber-100 dark:border-amber-900 rounded-2xl p-4 shadow-xs flex flex-col gap-2"
                >
                  <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-amber-950 dark:text-amber-200">
                    <span className="bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800">
                      {tr.source}
                    </span>
                    <span className="text-amber-500 font-black">── ⏳ ──</span>
                    <span className="bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800">
                      {tr.conflictingWith}
                    </span>
                  </div>
                  <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed font-medium bg-amber-50/50 dark:bg-amber-950/30 p-2.5 rounded-xl border border-amber-100 dark:border-amber-900">
                    💡 {tr.rule}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. Nutrient Depletion (DIND) */}
        {result.depletions.length > 0 && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 text-xs">🧪</span>
              <h4 className="font-extrabold text-slate-900 dark:text-white text-sm tracking-tight">
                Drug-Induced Nutrient Depletion &amp; Recommended Replenishment
              </h4>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {result.depletions.map((dep, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-900 border-l-4 border-l-teal-500 border border-teal-100 dark:border-teal-900 rounded-2xl p-4 shadow-xs flex flex-col gap-1.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <span className="font-bold text-teal-950 dark:text-teal-200 text-xs sm:text-sm">
                      {dep.drug} <span className="text-teal-600 dark:text-teal-400 font-normal">depletes</span> {dep.nutrient}
                    </span>
                  </div>
                  <p className="text-xs text-teal-900 dark:text-teal-200 leading-relaxed font-medium bg-teal-50/50 dark:bg-teal-950/30 p-2.5 rounded-xl border border-teal-100 dark:border-teal-900">
                    🌿 {dep.advice}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. Optimized Daily Chronotherapy Schedule */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 bg-gradient-to-b from-slate-50/80 to-white dark:from-slate-800/40 dark:to-slate-900 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-slate-900 dark:text-white text-sm tracking-tight flex items-center gap-2">
              <span>📅</span>
              <span>Recommended Daily Chronotherapy Schedule</span>
            </h4>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Auto-sequenced</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-300 border-b border-slate-100 dark:border-slate-800 pb-1.5">
                <span>🌅</span>
                <span>Morning (Breakfast)</span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                {result.schedule.morning.length > 0 ? (
                  result.schedule.morning.join(', ')
                ) : (
                  <span className="text-slate-400 dark:text-slate-500 italic">None scheduled</span>
                )}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5 font-bold text-sky-900 dark:text-sky-300 border-b border-slate-100 dark:border-slate-800 pb-1.5">
                <span>☀️</span>
                <span>Midday / Lunch</span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                {result.schedule.afternoon.length > 0 ? (
                  result.schedule.afternoon.join(', ')
                ) : (
                  <span className="text-slate-400 dark:text-slate-500 italic">None scheduled</span>
                )}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5 font-bold text-indigo-900 dark:text-indigo-300 border-b border-slate-100 dark:border-slate-800 pb-1.5">
                <span>🌙</span>
                <span>Evening / Bedtime</span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                {result.schedule.evening.length > 0 ? (
                  result.schedule.evening.join(', ')
                ) : (
                  <span className="text-slate-400 dark:text-slate-500 italic">None scheduled</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Legal & Medical Reference Footer */}
        <div className="text-[10px] text-slate-400 dark:text-slate-500 text-center border-t border-slate-100 dark:border-slate-800 pt-3.5 space-y-1">
          <p className="leading-normal">
            * Reference data aggregated from FDA Structured Product Labeling (openFDA), NIH ODS, and peer-reviewed clinical nutrition literature.
          </p>
          <p className="leading-normal">
            Medical Disclaimer: NutriDive SafeStack is an evidence-based informational radar for dietary awareness, NOT medical advice or diagnostic software. Never stop or modify prescription dosages without consulting a licensed physician or clinical pharmacist.
          </p>
        </div>
      </div>

      {/* Export Button */}
      <button
        type="button"
        onClick={handleDownload}
        disabled={downloading}
        className="w-full py-3.5 bg-slate-900 hover:bg-black dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-sm font-semibold rounded-2xl transition shadow-sm hover:shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 active:scale-99"
      >
        <span>📥</span>
        <span>{downloading ? 'Rendering Fridge Sheet PNG...' : 'Save & Print Fridge Sheet (PNG)'}</span>
      </button>
    </div>
  );
}
