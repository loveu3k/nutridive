import React from 'react';
import { CheckCircle2, AlertTriangle, ShieldCheck, Clock } from 'lucide-react';
import { formatDate, isDateExpired } from '@/lib/utils';

interface VerificationBadgeProps {
  status: string;
  regNo: string;
  dateEnd: string | null;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function VerificationBadge({
  status,
  regNo,
  dateEnd,
  className = '',
  size = 'md',
}: VerificationBadgeProps) {
  const isApproved = status.toUpperCase().includes('APPROVED');
  const isConditional = status.toUpperCase().includes('CONDITIONAL');
  const isExpired = isDateExpired(dateEnd);

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1',
    md: 'text-sm px-3.5 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  return (
    <div className={`inline-flex flex-wrap items-center gap-2 ${className}`}>
      {isApproved ? (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 ${sizeClasses[size]}`}
          title="Verified active and approved by National Pharmaceutical Regulatory Agency (NPRA)"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>ACTIVE & APPROVED</span>
        </span>
      ) : isConditional ? (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 ${sizeClasses[size]}`}
          title="Conditionally registered under NPRA monitoring"
        >
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>CONDITIONAL REGISTRATION</span>
        </span>
      ) : (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 ${sizeClasses[size]}`}
        >
          <ShieldCheck className="w-4 h-4 text-zinc-500 shrink-0" />
          <span>{status}</span>
        </span>
      )}

      {dateEnd && (
        <span
          className={`inline-flex items-center gap-1 rounded-full font-mono tabular-nums text-xs px-2.5 py-1 ${
            isExpired
              ? 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900'
              : 'bg-zinc-100 text-zinc-600 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'
          }`}
          title={`Registration validity until ${formatDate(dateEnd)}`}
        >
          <Clock className="w-3 h-3 text-zinc-400 shrink-0" />
          <span>Valid till: {formatDate(dateEnd)}</span>
        </span>
      )}
    </div>
  );
}
