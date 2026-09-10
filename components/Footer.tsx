import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ExternalLink, Activity, FileText } from 'lucide-react';
import BrandLogo from './BrandLogo';

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 text-xs mt-16">
      {/* Top Banner: Non-Medical Disclaimer */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100/80 dark:bg-zinc-900/60 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <span className="font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded text-[10px] uppercase shrink-0 mt-0.5">
              Medical Disclaimer
            </span>
            <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed text-[11px] sm:text-xs">
              <strong>NutriDive</strong> is an independent open-data directory providing public regulatory records for educational and informational purposes. NutriDive is not affiliated with the Ministry of Health Malaysia (KKM) or NPRA. Content on this site does not constitute medical advice, diagnosis, or treatment. Always consult a certified doctor or pharmacist before starting, altering, or stopping any medication.
            </p>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Col 1: Brand & Purpose */}
        <div className="space-y-3 md:col-span-1">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <BrandLogo size="sm" />
            <span className="font-bold text-base text-zinc-900 dark:text-zinc-100">NutriDive</span>
          </Link>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Independent Malaysian Medicine &amp; Generic Brand Directory. An educational open-data project helping consumers explore registered active ingredients and find affordable generic alternatives.
          </p>
          <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
            <span>Target Region: </span>
            <strong className="text-zinc-700 dark:text-zinc-200">Malaysia (MY)</strong>
          </div>
        </div>

        {/* Col 2: Drug Classifications */}
        <div className="space-y-2">
          <h4 className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
            Product Categories
          </h4>
          <ul className="space-y-1.5">
            <li>
              <Link
                href="/category/prescription"
                className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
              >
                Prescription Medicine (MAL-A)
              </Link>
            </li>
            <li>
              <Link
                href="/category/otc"
                className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
              >
                Over-the-Counter Drugs (MAL-X)
              </Link>
            </li>
            <li>
              <Link
                href="/category/supplement"
                className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
              >
                Health Supplements (MAL-N)
              </Link>
            </li>
            <li>
              <Link
                href="/category/traditional"
                className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
              >
                Traditional Herbal (MAL-T)
              </Link>
            </li>
            <li>
              <Link
                href="/category/veterinary"
                className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
              >
                Veterinary Healthcare (MAL-V)
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3: Verification & Regulatory Resources */}
        <div className="space-y-2">
          <h4 className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
            Official Government Portals
          </h4>
          <ul className="space-y-1.5">
            <li>
              <a
                href="https://www.npra.gov.my"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
              >
                <span>NPRA Official Portal (QUEST3+)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </li>
            <li>
              <a
                href="https://data.gov.my/data-catalogue/pharmaceutical_products"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
              >
                <span>data.gov.my Open Dataset</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </li>
            <li>
              <a
                href="https://pharmacy.moh.gov.my"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
              >
                <span>Bahagian Perkhidmatan Farmasi KKM</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </li>
            <li>
              <Link
                href="/llms.txt"
                className="inline-flex items-center gap-1 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
              >
                <FileText className="w-3 h-3" />
                <span>AI Agent Documentation (llms.txt)</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 4: Mandatory Attribution & License */}
        <div className="space-y-2">
          <h4 className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
            Data Attribution
          </h4>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Official Administrative Data Source: <strong>National Pharmaceutical Regulatory Agency (NPRA)</strong>, Ministry of Health Malaysia (KKM) via data.gov.my.
          </p>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
            Licensed under{' '}
            <a
              href="https://creativecommons.org/licenses/by/4.0/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-600 dark:text-teal-400 hover:underline inline-flex items-center gap-0.5"
            >
              Creative Commons Attribution 4.0 International (CC BY 4.0)
            </a>
            .
          </p>
        </div>
      </div>

      {/* Bottom Copyright & Legal */}
      <div className="border-t border-zinc-200 dark:border-zinc-800 py-6 px-4 sm:px-6 lg:px-8 text-center text-[11px] text-zinc-400">
        <p>© {new Date().getFullYear()} NutriDive (nutridive.net). All rights reserved. Open data provided for public health transparency.</p>
      </div>
    </footer>
  );
}
