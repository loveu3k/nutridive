import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldAlert, Award, FileText } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

export const metadata = {
  title: 'Clinical & Legal Disclaimers | NutriDive SafeStack',
  description: 'Evidence-based transparency statements, openFDA federal data disclosures, trademark notices, and clinical triage limitations.',
  alternates: {
    canonical: 'https://nutridive.net/disclaimer'
  }
};

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090D16] text-slate-800 dark:text-slate-100 flex flex-col justify-between transition-colors duration-200">
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to SafeStack Radar</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full border border-slate-200 dark:border-slate-700">
              Legal &amp; Clinical Governance
            </span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-10">
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Clinical &amp; Legal Disclaimers
          </h1>
          <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
            NutriDive SafeStack is an open-access clinical intelligence tool built to help patients, caregivers, and clinicians navigate multi-substance interactions with radical transparency.
          </p>
        </div>

        {/* Clinical Disclaimer */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-800">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Clinical Decision Support Disclaimer</h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">Not a substitute for personalized medical judgment</span>
            </div>
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400 space-y-3 leading-relaxed">
            <p>
              NutriDive SafeStack synthesizes publicly accessible pharmacological monographs, package inserts, and evidence-based nutrition publications. <strong>It does not constitute medical advice, diagnosis, or personalized treatment recommendations.</strong>
            </p>
            <p>
              This platform does not evaluate individual patient health records, renal or hepatic function tests (e.g. eGFR, Child-Pugh score), pharmacogenomic CYP phenotypes (e.g. CYP2C19 or CYP2D6 rapid/poor metabolizers), or rare allergic idiosyncratic reactions. Never discontinue, adjust, or initiate prescription medications or high-potency dietary supplements without consulting a licensed physician or clinical pharmacist.
            </p>
          </div>
        </section>

        {/* openFDA & Federal Data Disclosure */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-800">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">openFDA &amp; U.S. Federal Data Disclosure</h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">Mandatory federal API attribution</span>
            </div>
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400 space-y-3 leading-relaxed">
            <p>
              This product uses public data feeds provided by <strong>openFDA</strong> (U.S. Food and Drug Administration Structured Product Labeling), but is <strong>not endorsed, certified, or sponsored by the U.S. FDA</strong>.
            </p>
            <p>
              The information in openFDA reflects drug labeling as submitted by manufacturers and approved by the FDA at the time of publication. Labeling may change over time as new post-marketing pharmacovigilance data becomes available.
            </p>
          </div>
        </section>

        {/* Evidence Sources */}
        <section id="sources" className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Authoritative Evidence Sources</h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">Public domain &amp; peer-reviewed clinical knowledge bases</span>
            </div>
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400 space-y-3 leading-relaxed">
            <p>
              Every rule, time-window recommendation, and interaction mechanism rendered by NutriDive SafeStack is deterministically grounded in authoritative public domain scientific databases:
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <li className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                <span className="font-semibold text-slate-900 dark:text-white block text-xs">U.S. openFDA Drug Labeling</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">Section 7 (Drug Interactions) &amp; Boxed Warnings</span>
              </li>
              <li className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                <span className="font-semibold text-slate-900 dark:text-white block text-xs">NIH NLM MedlinePlus</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">ASHP Drug Monographs &amp; Special Dietary Instructions</span>
              </li>
              <li className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                <span className="font-semibold text-slate-900 dark:text-white block text-xs">NIH NCCIH Herbs at a Glance</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">Clinical trial safety and botanical drug conflicts</span>
              </li>
              <li className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                <span className="font-semibold text-slate-900 dark:text-white block text-xs">NIH Office of Dietary Supplements</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">Health Professional Fact Sheets (ODS)</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Trademark Disclaimer */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Trademark &amp; Nominative Fair Use Notice</h2>
          <div className="text-sm text-slate-600 dark:text-slate-400 space-y-3 leading-relaxed">
            <p>
              All product names, brand names, registered trademarks, and trade names referenced on this site (e.g., Lipitor®, Coumadin®, Synthroid®, Glucophage®, Viagra®) belong entirely to their respective trademark holders.
            </p>
            <p>
              Reference to these marks is conducted strictly under <strong>nominative fair use</strong> principles for factual identification, patient safety education, and cross-reference purposes. NutriDive has no commercial affiliation with, sponsorship from, or endorsement by any pharmaceutical manufacturer.
            </p>
          </div>
        </section>

        {/* Privacy & Zero Retention */}
        <section className="bg-emerald-50/60 dark:bg-emerald-950/30 rounded-3xl p-6 sm:p-8 border border-emerald-200 dark:border-emerald-800/60 space-y-3">
          <h2 className="text-lg font-bold text-emerald-950 dark:text-emerald-200">Zero Data Retention &amp; Privacy Assurance</h2>
          <p className="text-sm text-emerald-800 dark:text-emerald-300 leading-relaxed">
            NutriDive SafeStack executes its evaluation stack entirely within your client browser memory. <strong>No medication lists, dietary logs, IP tracking records, or personal health queries are ever sent to, stored on, or harvested by our servers.</strong> No login, cookies, or tracking pixels required.
          </p>
        </section>
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <p>© 2026 NutriDive SafeStack. Published for educational &amp; clinical awareness under fair use.</p>
      </footer>
    </div>
  );
}
