'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  evaluateStack,
  loadFullIndex,
  searchSuggestions,
  getItemMetadata,
  AuditResult,
  SuggestionItem
} from '@/lib/checker';
import SafetyCard from '@/components/SafetyCard';
import Footer from '@/components/Footer';
import ThemeToggle from '@/components/ThemeToggle';

const PRESET_COMBOS = [
  { label: 'Cardio & Lipid Protocol', items: ['Amlodipine', 'Lipitor', 'Fish Oil'] },
  { label: 'Diabetes & Metabolism', items: ['Metformin', 'Fish Oil'] },
  { label: 'Thyroid & Bone Health', items: ['Levothyroxine', 'Calcium'] },
  { label: 'Antibiotic & Gut Health', items: ['Ciprofloxacin', 'Probiotics', 'Dairy Milk'] },
  { label: 'Anticoagulation & Diet', items: ['Warfarin', 'Spinach', 'Curcumin'] },
  { label: 'Hypertension & Seasoning', items: ['Lisinopril', 'Salt Substitute', 'Zinc'] }
];

export default function HomePage() {
  const [items, setItems] = useState<string[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);

  // Autocomplete state
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadFullIndex();
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const preset = params.get('preset');
      if (preset && preset.trim()) {
        const p = preset.trim();
        setItems([p]);
        setAuditResult(evaluateStack([p]));
      }
    }
  }, []);

  // Update suggestions dynamically as input changes
  useEffect(() => {
    if (inputVal.trim().length >= 1) {
      const results = searchSuggestions(inputVal.trim(), 8);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
      setSelectedIndex(-1);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  }, [inputVal]);

  // Click outside to close suggestion dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addItem = (itemToAdd?: string) => {
    const val = (itemToAdd || inputVal).trim();
    if (val && !items.includes(val)) {
      const updated = [...items, val];
      setItems(updated);
      setInputVal('');
      setShowSuggestions(false);
      setSelectedIndex(-1);
      setAuditResult(evaluateStack(updated));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          addItem(suggestions[selectedIndex].name);
        } else {
          addItem();
        }
        return;
      }
      if (e.key === 'Escape') {
        setShowSuggestions(false);
        return;
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      addItem();
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

  const getCategoryBadge = (cat: SuggestionItem['category'] | 'Unrecognized') => {
    switch (cat) {
      case 'Drug':
        return {
          icon: '💊',
          label: 'Prescription Drug',
          tagClass: 'bg-blue-50 text-blue-800 border-blue-200'
        };
      case 'Food':
        return {
          icon: '🥗',
          label: 'Food / Ingredient',
          tagClass: 'bg-amber-50 text-amber-800 border-amber-200'
        };
      case 'Supplement':
        return {
          icon: '🌿',
          label: 'Herb / Supplement',
          tagClass: 'bg-emerald-50 text-emerald-800 border-emerald-200'
        };
      case 'Nutrient':
        return {
          icon: '🧪',
          label: 'Nutrient / Mineral',
          tagClass: 'bg-indigo-50 text-indigo-800 border-indigo-200'
        };
      default:
        return {
          icon: '⚠️',
          label: 'Unmatched',
          tagClass: 'bg-gray-100 text-gray-700 border-gray-300'
        };
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#090D16] text-gray-900 dark:text-slate-100 pb-20" suppressHydrationWarning>
      <header className="border-b border-gray-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 shadow-2xs" suppressHydrationWarning>
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight text-lg flex items-center gap-1.5 hover:opacity-90 transition">
            <span>🛡️</span>
            <span>NutriDive <span className="text-gray-400 dark:text-slate-500 font-normal text-xs ml-1">SafeStack</span></span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/drugs"
              className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-400 border border-slate-200 dark:border-slate-700 transition flex items-center gap-1.5"
            >
              <span>💊 A-Z Drugs</span>
              <span className="text-[10px] bg-white dark:bg-slate-900 px-1.5 py-0.2 rounded-full border border-slate-200 dark:border-slate-700 font-mono text-slate-500 dark:text-slate-400">2,056</span>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Food &amp; Medication Interaction Radar
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1.5 max-w-lg mx-auto leading-relaxed">
            Zero-login clinical evaluation for food-drug hazards, grapefruit warnings, and nutrient depletions.
          </p>
        </div>

        {/* Quick presets */}
        <div className="mb-6 flex flex-wrap items-center gap-2 justify-center">
          <span className="text-xs text-gray-400 dark:text-slate-500 font-medium">Quick Presets:</span>
          {PRESET_COMBOS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => loadPreset(p.items)}
              className="text-xs bg-white dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 px-3 py-1 rounded-full hover:border-emerald-400 dark:hover:border-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-400 transition cursor-pointer shadow-2xs"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Input Card with Smart Autocomplete */}
        <div className="bg-white dark:bg-slate-900/90 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 sm:p-7 shadow-xs flex flex-col gap-4 relative">
          <div className="flex items-center justify-between">
            <label htmlFor="substance-input" className="text-xs font-bold text-gray-800 dark:text-slate-200">
              Add Medication, Dietary Supplement, or Food
            </label>
            <span className="text-[11px] text-gray-400 dark:text-slate-500">FDA &amp; Clinical Database (50k+ substances)</span>
          </div>

          <div className="relative">
            <div className="flex gap-2">
              <input
                id="substance-input"
                ref={inputRef}
                type="text"
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                onFocus={() => {
                  if (suggestions.length > 0) setShowSuggestions(true);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Type drug, supplement, herb, or food name (e.g. Warfarin, Fish Oil, Spinach)..."
                className="flex-1 text-sm bg-gray-50/80 dark:bg-slate-800/80 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 rounded-xl px-3.5 py-2.5 outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition"
                autoComplete="off"
              />
              <button
                type="button"
                onClick={() => addItem()}
                className="px-5 py-2.5 bg-gray-900 hover:bg-black dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white dark:text-slate-950 text-xs font-semibold rounded-xl transition cursor-pointer shrink-0 shadow-2xs active:scale-95"
              >
                Add Item
              </button>
            </div>

            {/* Instant Typeahead Suggestion Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div
                ref={dropdownRef}
                className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden max-h-72 overflow-y-auto"
              >
                <div className="px-3 py-1.5 bg-gray-50 border-b border-gray-100 text-[10px] font-semibold text-gray-400 uppercase tracking-wider flex justify-between">
                  <span>Suggestions ({suggestions.length})</span>
                  <span>Use ↑ ↓ to navigate · Enter to add</span>
                </div>
                <div className="divide-y divide-gray-100">
                  {suggestions.map((sug, idx) => {
                    const badge = getCategoryBadge(sug.category);
                    const isSelected = idx === selectedIndex;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onMouseEnter={() => setSelectedIndex(idx)}
                        onClick={() => addItem(sug.name)}
                        className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between text-xs transition cursor-pointer ${
                          isSelected ? 'bg-emerald-50/80 text-emerald-950' : 'hover:bg-gray-50 text-gray-800'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          <span className="text-sm shrink-0">{badge.icon}</span>
                          <div className="truncate">
                            <span className="font-semibold text-gray-900">{sug.name}</span>
                            {sug.keyword !== sug.name.toLowerCase() && (
                              <span className="text-[11px] text-gray-400 ml-1.5">
                                (match: &quot;{sug.keyword}&quot;)
                              </span>
                            )}
                          </div>
                        </div>
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-full border shrink-0 ${badge.tagClass}`}
                        >
                          {badge.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Active Stack Tags with Verified Category Badges */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold text-gray-500">Current Substances in Evaluation Stack:</span>
            <div className="flex flex-wrap gap-2 min-h-[42px] p-2.5 bg-gray-50/80 rounded-xl border border-dashed border-gray-200">
              {items.map(item => {
                const meta = getItemMetadata(item);
                const badge = getCategoryBadge(meta.category);

                return (
                  <span
                    key={item}
                    className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl border shadow-2xs transition ${badge.tagClass}`}
                  >
                    <span className="text-xs">{badge.icon}</span>
                    <span className="font-semibold">{item}</span>
                    {meta.category === 'Unrecognized' && (
                      <span className="text-[10px] text-rose-500 font-bold">(Not in DB)</span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeItem(item)}
                      className="text-gray-400 hover:text-rose-600 cursor-pointer font-bold ml-1 transition"
                      title="Remove from stack"
                    >
                      ×
                    </button>
                  </span>
                );
              })}
              {items.length === 0 && (
                <span className="text-xs text-gray-400 self-center py-1">
                  No medications or supplements entered yet. Choose a preset above or type to search.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Results Card */}
        {auditResult && <SafetyCard result={auditResult} />}
      </main>

      <Footer />
    </div>
  );
}
