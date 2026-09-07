import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string | null): string {
  if (!dateString) return 'Not Available';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-MY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function isDateExpired(dateString: string | null): boolean {
  if (!dateString) return false;
  try {
    const d = new Date(dateString);
    return d.getTime() < Date.now();
  } catch {
    return false;
  }
}

export function getCategoryBadgeClass(code: string): {
  bg: string;
  text: string;
  border: string;
  label: string;
} {
  switch (code.toUpperCase()) {
    case 'A':
      return {
        bg: 'bg-blue-50 dark:bg-blue-950/50',
        text: 'text-blue-700 dark:text-blue-300',
        border: 'border-blue-200 dark:border-blue-800',
        label: 'Prescription (MAL-A)',
      };
    case 'X':
      return {
        bg: 'bg-emerald-50 dark:bg-emerald-950/50',
        text: 'text-emerald-700 dark:text-emerald-300',
        border: 'border-emerald-200 dark:border-emerald-800',
        label: 'OTC (MAL-X)',
      };
    case 'N':
      return {
        bg: 'bg-purple-50 dark:bg-purple-950/50',
        text: 'text-purple-700 dark:text-purple-300',
        border: 'border-purple-200 dark:border-purple-800',
        label: 'Health Supplement (MAL-N)',
      };
    case 'T':
      return {
        bg: 'bg-amber-50 dark:bg-amber-950/50',
        text: 'text-amber-700 dark:text-amber-300',
        border: 'border-amber-200 dark:border-amber-800',
        label: 'Traditional Herbal (MAL-T)',
      };
    case 'V':
      return {
        bg: 'bg-slate-50 dark:bg-slate-900',
        text: 'text-slate-700 dark:text-slate-300',
        border: 'border-slate-200 dark:border-slate-800',
        label: 'Veterinary (MAL-V)',
      };
    default:
      return {
        bg: 'bg-zinc-50 dark:bg-zinc-900',
        text: 'text-zinc-700 dark:text-zinc-300',
        border: 'border-zinc-200 dark:border-zinc-800',
        label: 'Registered Product',
      };
  }
}
