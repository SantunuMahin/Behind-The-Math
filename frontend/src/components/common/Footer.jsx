import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  Coffee,
  Copy,
  Check,
  ExternalLink,
  ArrowUp,
  Code2,
  Calculator,
  Compass,
  HelpCircle,
  FlaskConical
} from 'lucide-react';

export default function Footer() {
  const [copiedMfs, setCopiedMfs] = useState(false);

  const handleCopyMfs = (e) => {
    e.preventDefault();
    navigator.clipboard.writeText('01631009941');
    setCopiedMfs(true);
    setTimeout(() => setCopiedMfs(false), 2000);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black text-zinc-700 dark:text-zinc-300 transition-colors pt-10 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* 1. Minimal & Useful Support Card */}
        <div className="relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-5 sm:p-7 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            {/* Left: Purpose & 1-Click Copy Number */}
            <div className="space-y-2.5 max-w-xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-200/60 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-semibold border border-zinc-300/60 dark:border-zinc-700">
                  <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                  <span>Free & Open Source</span>
                </span>
                
                {/* 1-Click Interactive Copy Number */}
                <button
                  type="button"
                  onClick={handleCopyMfs}
                  title="Click to copy bKash / Nagad / Rocket number"
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-mono font-medium transition-colors border border-zinc-200 dark:border-zinc-700 cursor-pointer"
                >
                  <span className="text-[11px] font-sans text-zinc-500 dark:text-zinc-400">bKash/Nagad/Rocket:</span>
                  <span className="font-semibold">01631009941</span>
                  {copiedMfs ? (
                    <span className="inline-flex items-center gap-0.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-sans font-bold">
                      <Check className="w-3 h-3" /> Copied!
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-0.5 text-[11px] text-zinc-500 dark:text-zinc-400 font-sans">
                      <Copy className="w-3 h-3" /> Copy
                    </span>
                  )}
                </button>
              </div>

              <div>
                <h3 className="font-heading font-bold text-xl sm:text-2xl text-black dark:text-white tracking-tight">
                  Keep BehindTheMath Free & Open
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                  Zero ads, zero paywalls. A small contribution directly covers cloud hosting, step-by-step solver compute, and interactive 60 FPS visual physics labs.
                </p>
              </div>
            </div>

            {/* Right: Quick Preset Amounts & Support Button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
              <div className="grid grid-cols-3 sm:flex items-center gap-2">
                {[
                  { label: '৳100', amount: 100, tag: 'Coffee' },
                  { label: '৳250', amount: 250, tag: 'Supporter' },
                  { label: '৳500', amount: 500, tag: 'Sponsor' },
                ].map((tier) => (
                  <Link
                    key={tier.amount}
                    to={`/support?amount=${tier.amount}`}
                    className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:border-black dark:hover:border-white bg-white hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-center transition-all group"
                  >
                    <div className="text-xs font-bold text-black dark:text-white group-hover:underline">
                      {tier.label}
                    </div>
                    <div className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-none mt-0.5">
                      {tier.tag}
                    </div>
                  </Link>
                ))}
              </div>

              <Link
                to="/support"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-black hover:opacity-90 dark:bg-white dark:text-black dark:hover:opacity-90 text-white font-semibold text-xs transition-opacity shadow-xs"
              >
                <Coffee className="w-3.5 h-3.5" />
                <span>Support Project →</span>
              </Link>
            </div>

          </div>
        </div>

        {/* 2. Streamlined Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-6 pt-2">
          
          {/* Brand Info & Collaboration (Col 1-4) */}
          <div className="lg:col-span-4 space-y-3">
            <Link to="/" className="inline-flex items-center gap-3 group select-none">
              <div className="relative shrink-0">
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 34 34"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="shrink-0 transition-all duration-300 group-hover:scale-105"
                >
                  <rect x="0.5" y="0.5" width="33" height="33" rx="9" fill="#000000" stroke="#27272A" strokeWidth="1" />
                  <path
                    d="M23.5 10H11.5L17.5 17L11.5 24H23.5"
                    stroke="#FFFFFF"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="23.5" cy="10" r="2.2" fill="#10B981" />
                </svg>
              </div>
              <div className="flex flex-col justify-center">
                <span className="font-heading font-extrabold text-[16px] tracking-tight text-black dark:text-white group-hover:underline transition-colors leading-none">
                  BehindTheMath
                </span>
                <span className="text-[10px] font-medium tracking-tight text-zinc-500 dark:text-zinc-400 leading-none mt-1 flex items-center gap-1">
                  <span>Intuition</span>
                  <span className="text-emerald-500 font-bold">·</span>
                  <span>Visuals</span>
                  <span className="text-emerald-500 font-bold">·</span>
                  <span>Code</span>
                </span>
              </div>
            </Link>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm">
              Demystifying higher mathematics, university engineering, and machine learning through geometric intuition, interactive 60 FPS canvas labs, and dual C & Python code benchmarks.
            </p>

            <div className="pt-1 text-xs text-slate-500 dark:text-slate-400 space-y-0.5">
              <div>
                Crafted by <strong className="text-slate-700 dark:text-slate-200">Santunu Kaysar</strong>
              </div>
              <div className="text-[11px] text-slate-400 dark:text-slate-500">
                In technical collaboration with <strong>Intellisoft Innovations</strong>
              </div>
            </div>

            <div className="pt-1">
              <a
                href="https://github.com/SantunuMahin/Behind-The-Math"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 text-xs font-medium transition-colors"
              >
                <Code2 className="w-3.5 h-3.5 text-slate-500" />
                <span>GitHub Repository</span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            </div>
          </div>

          {/* Syllabi & Paths (Col 5-6) */}
          <div className="lg:col-span-2 space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-black dark:text-white flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" />
              <span>Syllabi & Paths</span>
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link to="/learn?category=calculus" className="text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors">
                  Class 11 & 12 HSC Math
                </Link>
              </li>
              <li>
                <Link to="/learn?category=linear-algebra" className="text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors">
                  University Engineering Math
                </Link>
              </li>
              <li>
                <Link to="/learn?category=physics" className="text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors">
                  Physics & Relativity
                </Link>
              </li>
              <li>
                <Link to="/learn?category=discrete" className="text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors">
                  Discrete Math & Graph Theory
                </Link>
              </li>
              <li>
                <Link to="/learn?category=statistics" className="text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors">
                  Machine Learning & AI Math
                </Link>
              </li>
            </ul>
          </div>

          {/* Interactive Tools (Col 7-8) */}
          <div className="lg:col-span-2 space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-black dark:text-white flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" />
              <span>Student Tools</span>
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link to="/solver" className="text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors inline-flex items-center gap-1.5">
                  <span>Step-by-Step Solver</span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold">Live</span>
                </Link>
              </li>
              <li>
                <Link to="/lab" className="text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors">
                  20 Visual Canvas Labs
                </Link>
              </li>
              <li>
                <Link to="/library" className="text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors">
                  169 Formula Directory
                </Link>
              </li>
              <li>
                <Link to="/practice" className="text-slate-600 dark:text-slate-400 hover:text-[#2A9D8F] transition-colors">
                  Rapid-Fire Math Quiz
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-slate-600 dark:text-slate-400 hover:text-[#2A9D8F] transition-colors">
                  Student Profile & Badges
                </Link>
              </li>
              <li>
                <Link to="/cheatsheet" className="text-slate-600 dark:text-slate-400 hover:text-[#2A9D8F] transition-colors">
                  Printable Cheat Sheet (PDF)
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Labs (Col 9-10) */}
          <div className="lg:col-span-2 space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
              <FlaskConical className="w-3.5 h-3.5 text-amber-500" />
              <span>Popular Labs</span>
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link to="/lessons/snells-law" className="text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                  Snell's Law of Refraction
                </Link>
              </li>
              <li>
                <Link to="/lessons/lorentz-dilation" className="text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                  Lorentz Time Dilation
                </Link>
              </li>
              <li>
                <Link to="/lessons/lagrange-multipliers" className="text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                  Lagrange Multipliers
                </Link>
              </li>
              <li>
                <Link to="/lessons/cosine-similarity" className="text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                  Cosine Similarity (ML)
                </Link>
              </li>
              <li>
                <Link to="/lessons/pythagorean-theorem" className="text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                  Pythagorean Proof
                </Link>
              </li>
            </ul>
          </div>

          {/* Help & Support (Col 11-12) */}
          <div className="lg:col-span-2 space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-rose-500" />
              <span>Help & Support</span>
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link to="/support" className="text-rose-600 dark:text-rose-400 font-semibold hover:underline">
                  Support Our Mission
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-slate-600 dark:text-slate-400 hover:text-rose-500 transition-colors">
                  About & Pedagogy
                </Link>
              </li>
              <li>
                <Link to="/support#hall-of-fame" className="text-slate-600 dark:text-slate-400 hover:text-rose-500 transition-colors">
                  Supporter Hall of Fame
                </Link>
              </li>
              <li>
                <Link to="/support#contribute" className="text-slate-600 dark:text-slate-400 hover:text-rose-500 transition-colors">
                  Suggest a Formula / Errata
                </Link>
              </li>
              <li>
                <Link to="/support#contribute" className="text-slate-600 dark:text-slate-400 hover:text-rose-500 transition-colors">
                  4 Free Ways to Help
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* 3. Clean Minimal Bottom Bar */}
        <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 gap-3">
          <p>
            © {new Date().getFullYear()} <strong>BehindTheMath</strong>. Open-access mathematical knowledge for all.
          </p>

          <div className="flex items-center gap-4">
            <span className="text-[11px] text-zinc-400">
              Typeset with <a href="https://katex.org/" target="_blank" rel="noopener noreferrer" className="hover:underline">KaTeX</a>
            </span>
            <button
              onClick={scrollToTop}
              title="Scroll to top"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs transition-colors cursor-pointer"
            >
              <ArrowUp className="w-3 h-3" />
              <span>Top</span>
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
