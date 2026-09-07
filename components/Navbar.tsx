'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, ShieldCheck, Moon, Sun, Menu, X, Pill, Activity } from 'lucide-react';
import GlobalSearchModal from './GlobalSearchModal';

export default function Navbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Initialize theme
  useEffect(() => {
    const isDark =
      localStorage.getItem('theme') === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
    }
  }, []);

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  // Keyboard shortcut Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-teal-600 dark:bg-teal-500 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                <Activity className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-lg tracking-tight text-zinc-900 dark:text-zinc-100">
                    Nutri<span className="text-teal-600 dark:text-teal-400">Dive</span>
                  </span>
                  <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/80 border border-teal-200 dark:border-teal-800 px-1.5 py-0.2 rounded">
                    NPRA
                  </span>
                </div>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 -mt-0.5 tracking-tight font-medium hidden sm:inline">
                  Malaysia Pharmaceutical & Supplement Engine
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-300">
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
          </nav>

          {/* Actions & Search Trigger */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-lg transition-colors cursor-pointer group"
              title="Search database (Ctrl+K / Cmd+K)"
            >
              <Search className="w-4 h-4 text-zinc-400 group-hover:text-teal-600 dark:group-hover:text-teal-400" />
              <span className="hidden sm:inline font-normal">Search MAL, brand, molecule...</span>
              <span className="sm:hidden font-normal">Search</span>
              <kbd className="hidden lg:inline-flex items-center gap-0.5 text-[10px] font-mono text-zinc-400 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-1.5 py-0.5 rounded shadow-2xs">
                ⌘K
              </kbd>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 transition-colors"
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="md:hidden p-2 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              aria-label="Open menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3 space-y-2 text-sm">
            <Link
              href="/category/prescription"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-1.5 font-medium text-zinc-700 dark:text-zinc-200"
            >
              Prescription Medicine (MAL-A)
            </Link>
            <Link
              href="/category/otc"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-1.5 font-medium text-zinc-700 dark:text-zinc-200"
            >
              Over-the-Counter (MAL-X)
            </Link>
            <Link
              href="/category/supplement"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-1.5 font-medium text-zinc-700 dark:text-zinc-200"
            >
              Health Supplements (MAL-N)
            </Link>
            <Link
              href="/category/traditional"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-1.5 font-medium text-zinc-700 dark:text-zinc-200"
            >
              Traditional & Herbal (MAL-T)
            </Link>
          </div>
        )}
      </header>

      {/* Global Search Modal */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
