import React from 'react';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import BrandLogo from './BrandLogo';

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 text-zinc-500 dark:text-zinc-400 text-xs mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Top: Brand & Quick Navigation */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-zinc-100 dark:border-zinc-900">
          <div className="flex items-center gap-2.5">
            <BrandLogo size="sm" />
            <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 tracking-tight">
              NutriDive
            </span>
            <span className="text-[11px] text-zinc-400 dark:text-zinc-600">|</span>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Malaysian Medicine &amp; Generic Directory
            </span>
          </div>

          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium">
            <Link
              href="/category/prescription"
              className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
            >
              Prescription (MAL-A)
            </Link>
            <Link
              href="/category/otc"
              className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
            >
              OTC (MAL-X)
            </Link>
            <Link
              href="/category/supplement"
              className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
            >
              Supplements (MAL-N)
            </Link>
            <Link
              href="/category/traditional"
              className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
            >
              Traditional (MAL-T)
            </Link>
            <Link
              href="/faq"
              className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors text-teal-600 dark:text-teal-400"
            >
              FAQ
            </Link>
            <a
              href="https://www.npra.gov.my"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
            >
              <span>NPRA Official</span>
              <ExternalLink className="w-3 h-3 text-zinc-400" />
            </a>
          </nav>
        </div>

        {/* Bottom: Minimal Medical Disclaimer & Copyright */}
        <div className="pt-6 flex flex-col md:flex-row md:items-center justify-between gap-4 text-[11px] text-zinc-400 dark:text-zinc-500 leading-relaxed">
          <p className="max-w-2xl">
            <strong className="text-zinc-600 dark:text-zinc-400 font-medium">Disclaimer:</strong> Independent public directory indexing open pharmaceutical data from NPRA (data.gov.my). Not medical advice; always consult a licensed doctor or pharmacist.
          </p>
          <div className="shrink-0 text-zinc-400">
            © {new Date().getFullYear()} NutriDive. CC BY 4.0 Open Data.
          </div>
        </div>
      </div>
    </footer>
  );
}
