'use client';

import React, { useState } from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';

export interface FaqItem {
  question: string;
  answer: string | React.ReactNode;
}

interface FaqAccordionProps {
  title?: string;
  items: FaqItem[];
}

export default function FaqAccordion({
  title = 'Frequently Asked Questions & Regulatory Verification',
  items,
}: FaqAccordionProps) {
  // First item open by default for immediate preview, others collapsed
  const [openIndices, setOpenIndices] = useState<number[]>([0]);

  const toggleItem = (idx: number) => {
    setOpenIndices((current) =>
      current.includes(idx) ? current.filter((i) => i !== idx) : [...current, idx]
    );
  };

  return (
    <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 sm:p-6 shadow-xs">
      <div className="flex items-center gap-2 text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-3">
        <HelpCircle className="w-4 h-4" />
        <span>{title}</span>
      </div>

      <div className="divide-y divide-zinc-200/80 dark:divide-zinc-800">
        {items.map((item, idx) => {
          const isOpen = openIndices.includes(idx);
          return (
            <div key={idx} className="py-3.5 first:pt-2 last:pb-2">
              <button
                type="button"
                onClick={() => toggleItem(idx)}
                className="w-full flex items-center justify-between text-left gap-3 group transition-colors"
                aria-expanded={isOpen}
              >
                <h3 className="font-semibold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                  {item.question}
                </h3>
                <span
                  className={`p-1 rounded-md text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-200 transition-transform duration-200 shrink-0 ${
                    isOpen ? 'rotate-180 text-teal-600 dark:text-teal-400' : ''
                  }`}
                >
                  <ChevronDown className="w-4 h-4" />
                </span>
              </button>

              {/* Keeps content in DOM for search bots and screen readers */}
              <div
                className={`overflow-hidden transition-all duration-200 ease-in-out ${
                  isOpen ? 'max-h-96 opacity-100 mt-2.5' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed pr-4">
                  {item.answer}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
