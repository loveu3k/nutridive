'use client';

import React, { useState } from 'react';
import { evaluateStack, AuditResult } from '@/lib/checker';
import SafetyCard from '@/components/SafetyCard';

const PRESET_COMBOS = [
  { label: 'Cardio & Lipid Protocol', items: ['Amlodipine', 'Lipitor', 'Fish Oil'] },
  { label: 'Diabetes & Metabolism', items: ['Metformin', 'Fish Oil'] },
  { label: 'Thyroid & Bone Health', items: ['Levothyroxine', 'Calcium'] }
];

export default function HomePage() {
  const [items, setItems] = useState<string[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);

  const addItem = (itemToAdd?: string) => {
    const val = (itemToAdd || inputVal).trim();
    if (val && !items.includes(val)) {
      const updated = [...items, val];
      setItems(updated);
      setInputVal('');
      setAuditResult(evaluateStack(updated));
    }
  };

  const removeItem = (target: string) => {
    const updated = items.filter(i => i !== target);
    setItems(updated);
    setAuditResult(updated.length > 0 ? evaluateStack(updated) : null);
  };

  const loadPreset = (presetItems: string[]) => {
    setItems(presetItems);
    setAuditResult(evaluateStack(presetItems));
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-gray-900 pb-20">
      <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-extrabold text-emerald-600 tracking-tight text-lg">
            NutriDive <span className="text-gray-400 font-normal text-xs ml-1">SafeStack</span>
          </span>
          <span className="text-xs text-gray-500 font-medium">Drug · Supplement · Food Interaction Radar</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Family Kitchen &amp; Medication Safety Radar
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-2">
            Instant check for food-drug hazards, nutrient depletion, and optimal daily intake timing.
          </p>
        </div>

        {/* Quick presets */}
        <div className="mb-6 flex flex-wrap items-center gap-2 justify-center">
          <span className="text-xs text-gray-400">Try common regimens:</span>
          {PRESET_COMBOS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => loadPreset(p.items)}
              className="text-xs bg-white border border-gray-200 text-gray-600 px-3 py-1 rounded-full hover:border-emerald-400 hover:text-emerald-700 transition cursor-pointer"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Input Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-7 shadow-xs flex flex-col gap-4">
          <label className="text-xs font-bold text-gray-700 block">
            Enter Daily Medications &amp; Supplements (e.g. Lipitor, Metformin, Calcium, Levothyroxine, Fish Oil)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addItem())}
              placeholder="Type drug or supplement name..."
              className="flex-1 text-sm bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 outline-none focus:bg-white focus:border-emerald-500 transition"
            />
            <button
              type="button"
              onClick={() => addItem()}
              className="px-5 py-2.5 bg-gray-900 hover:bg-black text-white text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              Add
            </button>
          </div>

          <div className="flex flex-wrap gap-2 min-h-[36px] p-2.5 bg-gray-50/70 rounded-xl border border-dashed border-gray-200">
            {items.map(item => (
              <span
                key={item}
                className="inline-flex items-center gap-1.5 text-xs bg-white text-gray-800 font-medium px-3 py-1 rounded-lg border border-gray-200 shadow-2xs"
              >
                {item}
                <button
                  onClick={() => removeItem(item)}
                  className="text-gray-400 hover:text-rose-500 cursor-pointer font-bold ml-1"
                >
                  ×
                </button>
              </span>
            ))}
            {items.length === 0 && (
              <span className="text-xs text-gray-400 self-center">No medications or supplements entered yet.</span>
            )}
          </div>
        </div>

        {/* Results Card */}
        {auditResult && <SafetyCard result={auditResult} />}
      </main>
    </div>
  );
}
