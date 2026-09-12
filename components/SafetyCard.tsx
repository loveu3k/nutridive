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

  return (
    <div className="flex flex-col items-center gap-4 w-full mt-8">
      <div
        ref={cardRef}
        className="w-full bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col gap-6 text-gray-800 font-sans"
      >
        <div className="border-b border-gray-100 pb-4 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-emerald-500"></span>
              <h3 className="font-bold text-lg sm:text-xl text-gray-900">Kitchen &amp; Supplement Safety Protocol</h3>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">NutriDive.net · Evidence-Based Kitchen Radar</p>
          </div>
          <span className="text-[11px] font-medium bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200">
            Print &amp; Stick on Fridge
          </span>
        </div>

        {/* 1. Critical Red Flags */}
        <div className="bg-rose-50/80 border border-rose-200 rounded-xl p-4">
          <h4 className="font-bold text-rose-900 text-sm mb-2 flex items-center gap-1.5">
            <span>🔴</span> Critical Dietary Restrictions (Strictly Avoid)
          </h4>
          {result.redFlags.length > 0 ? (
            <div className="space-y-2">
              {result.redFlags.map((item, idx) => (
                <div key={idx} className="bg-white/80 rounded-lg p-3 border border-rose-100 text-xs sm:text-sm">
                  <div className="font-semibold text-rose-950 flex justify-between">
                    <span>{item.item}</span>
                    <span className="text-[11px] font-normal text-rose-600">Triggered by: {item.sourceDrug}</span>
                  </div>
                  <p className="text-rose-800 mt-1 leading-relaxed">{item.reason}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-emerald-800">No known critical food-drug contraindications found for this list.</p>
          )}
        </div>

        {/* 2. Timing Separation Rules */}
        {result.timingRules.length > 0 && (
          <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4">
            <h4 className="font-bold text-amber-900 text-sm mb-2 flex items-center gap-1.5">
              <span>🟡</span> Absorption Conflicts (Separate Intake Times)
            </h4>
            <div className="space-y-2">
              {result.timingRules.map((tr, idx) => (
                <div key={idx} className="bg-white/80 rounded-lg p-3 border border-amber-100 text-xs sm:text-sm">
                  <span className="font-semibold text-amber-950">{tr.source} vs. {tr.conflictingWith}:</span>
                  <p className="text-amber-800 mt-0.5">{tr.rule}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. Nutrient Depletion */}
        {result.depletions.length > 0 && (
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-4">
            <h4 className="font-bold text-emerald-900 text-sm mb-2 flex items-center gap-1.5">
              <span>🟢</span> Nutrient Depletion &amp; Replenishment
            </h4>
            <div className="space-y-2">
              {result.depletions.map((dep, idx) => (
                <div key={idx} className="bg-white/80 rounded-lg p-3 border border-emerald-100 text-xs sm:text-sm">
                  <span className="font-semibold text-emerald-950">{dep.drug} depletes {dep.nutrient}</span>
                  <p className="text-emerald-800 mt-0.5">{dep.advice}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Optimized Schedule */}
        <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50">
          <h4 className="font-bold text-gray-900 text-sm mb-3">📅 Recommended Daily Schedule</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-white p-3 rounded-lg border border-gray-200">
              <span className="font-semibold text-gray-800 block border-b pb-1">🌅 Morning (Empty Stomach)</span>
              <p className="text-gray-600 mt-1">{result.schedule.morning.join(', ') || 'None scheduled'}</p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-gray-200">
              <span className="font-semibold text-gray-800 block border-b pb-1">☀️ Midday / With Meal</span>
              <p className="text-gray-600 mt-1">{result.schedule.afternoon.join(', ') || 'None scheduled'}</p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-gray-200">
              <span className="font-semibold text-gray-800 block border-b pb-1">🌙 Evening / Bedtime</span>
              <p className="text-gray-600 mt-1">{result.schedule.evening.join(', ') || 'None scheduled'}</p>
            </div>
          </div>
        </div>

        <div className="text-[10px] text-gray-400 text-center border-t border-gray-100 pt-3">
          * Reference standard: Formulated from Krause and Mahan’s Food &amp; the Nutrition Care Process and NIH Open Drug Standards. This tool does not replace licensed medical advice.
        </div>
      </div>

      <button
        onClick={handleDownload}
        disabled={downloading}
        className="w-full py-3.5 bg-gray-900 hover:bg-black text-white text-sm font-semibold rounded-xl transition shadow hover:shadow-md cursor-pointer disabled:opacity-50"
      >
        {downloading ? 'Generating Fridge Sheet...' : '📥 Save Image / Print Fridge Sheet'}
      </button>
    </div>
  );
}
