import { useState } from 'react';

export default function ReferenceList({ references }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!references || references.length === 0) return null;

  return (
    <div className="rounded-2xl border border-surface-200 bg-white overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-surface-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div className="text-left">
            <h3 className="font-display text-base font-bold text-surface-900">
              參考文獻
            </h3>
            <p className="text-xs text-surface-400 mt-0.5">
              共 {references.length} 篇科學文獻
            </p>
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-surface-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div
        className={`overflow-hidden transition-all duration-400 ease-in-out ${
          isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-6 pb-5 border-t border-surface-100">
          <ol className="mt-4 space-y-3">
            {references.map((ref, index) => (
              <li key={index} className="flex gap-3 group">
                <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-surface-100 flex items-center justify-center text-xs font-bold text-surface-500 group-hover:bg-primary-100 group-hover:text-primary-600 transition-colors">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-surface-700 leading-relaxed">
                    {ref.title || ref}
                  </p>
                  {ref.url && (
                    <a
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-1 text-xs text-primary-600 hover:text-primary-700 transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      查看原文
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
