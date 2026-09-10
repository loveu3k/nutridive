'use client';

import React from 'react';
import { useCompare, type CompareItem } from '@/lib/compare-context';
import { Columns, Check, Plus } from 'lucide-react';

interface CompareButtonProps {
  item: CompareItem;
  variant?: 'button' | 'checkbox' | 'icon' | 'badge';
  className?: string;
}

export default function CompareButton({
  item,
  variant = 'button',
  className = '',
}: CompareButtonProps) {
  const { isInCompare, toggleCompare } = useCompare();
  const inCompare = isInCompare(item.slug);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleCompare(item);
  };

  if (variant === 'checkbox') {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`inline-flex items-center gap-1.5 text-xs font-medium transition-colors py-1 px-2 rounded-md ${
          inCompare
            ? 'bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border border-teal-300 dark:border-teal-700'
            : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900'
        } ${className}`}
        title={inCompare ? 'Remove from compare' : 'Add to compare'}
      >
        <span
          className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition-colors ${
            inCompare
              ? 'bg-teal-600 border-teal-600 text-white'
              : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900'
          }`}
        >
          {inCompare && <Check className="w-2.5 h-2.5 stroke-[3]" />}
        </span>
        <span>{inCompare ? 'Compared' : 'Compare'}</span>
      </button>
    );
  }

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`p-1.5 rounded-lg border transition-colors ${
          inCompare
            ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
            : 'bg-white dark:bg-zinc-900 text-zinc-500 hover:text-teal-600 border-zinc-200 dark:border-zinc-800 hover:border-teal-500'
        } ${className}`}
        title={inCompare ? 'Remove from comparison' : 'Add to compare'}
      >
        {inCompare ? <Check className="w-3.5 h-3.5" /> : <Columns className="w-3.5 h-3.5" />}
      </button>
    );
  }

  if (variant === 'badge') {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border transition-all ${
          inCompare
            ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-teal-500 hover:text-teal-600'
        } ${className}`}
      >
        {inCompare ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
        <span>{inCompare ? 'In Compare' : 'Compare'}</span>
      </button>
    );
  }

  // Default 'button' variant
  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all shadow-xs ${
        inCompare
          ? 'bg-teal-600 hover:bg-teal-700 text-white border-teal-600'
          : 'bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-800 hover:border-teal-500'
      } ${className}`}
    >
      {inCompare ? (
        <>
          <Check className="w-4 h-4 text-white" />
          <span>In Comparison (Selected)</span>
        </>
      ) : (
        <>
          <Columns className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <span>＋ Add to Compare</span>
        </>
      )}
    </button>
  );
}
