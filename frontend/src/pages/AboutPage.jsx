import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  Sparkles, 
  Compass, 
  BookOpen, 
  Terminal, 
  CheckCircle2, 
  Globe2, 
  Users, 
  ArrowRight, 
  Zap, 
  ShieldCheck,
  Award,
  Layers,
  Lightbulb
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-16">
      
      {/* =========================================================================
          SECTION 1: HERO MANIFESTO — OUR MISSION
          ========================================================================= */}
      <section className="space-y-6 text-center pt-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold tracking-wide">
          <Heart className="w-3.5 h-3.5 fill-current" />
          <span>Our Mission — Behind the Math</span>
        </div>

        <h1 className="font-heading font-extrabold text-3xl sm:text-5xl text-zinc-900 dark:text-white tracking-tight leading-tight max-w-3xl mx-auto">
          Helping Every Student Discover Their Potential and Become Their Best Self.
        </h1>

        <div className="p-6 sm:p-8 rounded-3xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-left space-y-4 shadow-xs">
          <p className="text-base sm:text-lg text-zinc-800 dark:text-zinc-200 font-medium leading-relaxed">
            At <strong className="text-zinc-950 dark:text-white font-extrabold">Behind the Math</strong>, our mission is to help every student discover their potential and become the best version of themselves.
          </p>

          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
            We believe that every student has the potential to achieve something extraordinary. However, without proper guidance, a structured learning environment, and a clear roadmap, that potential may never be fully realized.
          </p>

          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
            That is why we are building <strong className="text-zinc-900 dark:text-zinc-100">Behind the Math</strong>—a platform designed to make learning more accessible, structured, and meaningful. Our goal is to help students understand not only <em>what</em> they learn, but also <em>why</em> it matters and <em>how</em> they can use that knowledge to grow.
          </p>

          <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <p className="text-sm sm:text-base text-zinc-800 dark:text-zinc-200 font-medium leading-relaxed">
              Our second major commitment is to keep this platform <strong className="text-emerald-600 dark:text-emerald-400">free and open-source, accessible to everyone, everywhere</strong>. We believe that quality education should not be limited by financial circumstances. Every student deserves the opportunity to learn, explore, and reach their full potential.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: FOUR CORE COMMITMENTS / PILLARS
          ========================================================================= */}
      <section className="space-y-6">
        <div className="text-center space-y-1.5">
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
            Guiding Principles
          </span>
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-zinc-900 dark:text-white">
            The Pillars of Behind the Math
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Pillar 1 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2.5 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-lg">
              🌟
            </div>
            <h3 className="font-heading font-bold text-base text-zinc-900 dark:text-white">
              Discovering Latent Potential
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Providing clear learning roadmaps and supportive step-by-step environments so raw curiosity turns into mastery, confidence, and achievement.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2.5 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold text-lg">
              💡
            </div>
            <h3 className="font-heading font-bold text-base text-zinc-900 dark:text-white">
              Beyond What: Why & How
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Moving past rote memorization. Every formula is backed by intuitive geometric derivations, physical simulations, and actionable code applications.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2.5 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg">
              🌍
            </div>
            <h3 className="font-heading font-bold text-base text-zinc-900 dark:text-white">
              Free & Open-Source Worldwide
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Zero paywalls, zero ads. High-quality STEM education should never be restricted by financial background or geographic borders.
            </p>
          </div>

          {/* Pillar 4 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2.5 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-lg">
              🤝
            </div>
            <h3 className="font-heading font-bold text-base text-zinc-900 dark:text-white">
              Community & Continual Growth
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Continuously adding learning resources and interactive tools. Built with student feedback, open contributions, and shared passion.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: COMMUNITY CALLOUT BANNER
          ========================================================================= */}
      <section className="p-8 sm:p-10 rounded-3xl bg-black text-white dark:bg-zinc-950 border border-zinc-800 shadow-xl space-y-5 text-center relative overflow-hidden">
        <div className="max-w-2xl mx-auto space-y-3 relative z-10">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/20 inline-block">
            Together For Education
          </span>
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl leading-snug">
            Help us help students grow. Together, let's turn potential into possibilities and make quality learning accessible to everyone.
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
            We are continuously working to improve Behind the Math, add valuable learning resources, and create a better experience for learners. Your contributions, feedback, ideas, and encouragement can make a real difference.
          </p>
          <p className="text-sm font-semibold text-rose-400 pt-1">
            Thank you so much for being part of the Behind the Math journey! ❤️
          </p>

          <div className="flex flex-wrap justify-center gap-3 pt-3">
            <Link
              to="/support"
              className="px-5 py-2.5 rounded-xl bg-white text-black font-bold text-xs sm:text-sm hover:opacity-90 shadow-md flex items-center gap-2 transition-opacity"
            >
              <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
              <span>Support Our Mission</span>
            </Link>
            <Link
              to="/lab"
              className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-semibold text-xs sm:text-sm transition-colors flex items-center gap-2"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Explore Visual Labs</span>
            </Link>
            <Link
              to="/library"
              className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-semibold text-xs sm:text-sm transition-colors flex items-center gap-2"
            >
              <span>Browse Formulas</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: THE FOUR QUESTIONS FRAMEWORK
          ========================================================================= */}
      <section className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-6">
        <div>
          <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
            Pedagogical Structure
          </span>
          <h2 className="font-heading font-bold text-xl text-zinc-900 dark:text-white mt-1">
            The Four Questions Behind Every Formula
          </h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 space-y-1">
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">1. What does the formula say?</span>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Clear symbol definitions, exact units, domain constraints, and a plain-language summary before diving into symbols.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 space-y-1">
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">2. Why does it work?</span>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Step-by-step visual proofs, geometric ring unrolling, and conceptual diagrams that ground the equation in physical intuition.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 space-y-1">
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">3. What happens when values change?</span>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Live sliders, parameter inputs, and dynamic Canvas 2D visualizers that demonstrate quadratic vs linear growth rates at 60 FPS.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 space-y-1">
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">4. How can I apply it in code?</span>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Multi-language production-ready implementations in C (C11) and Python 3 with boundary guards and sample test outputs.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: CREDITS & ATTRIBUTION
          ========================================================================= */}
      <section className="p-8 rounded-3xl bg-zinc-900 text-white border border-zinc-800 shadow-xl space-y-6">
        <h2 className="font-heading font-extrabold text-2xl">
          Credits & Attribution
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
          <div className="space-y-1">
            <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">
              Project Presentation & Concept
            </span>
            <div className="font-heading font-bold text-lg text-white">Santunu Kaysar</div>
            <p className="text-xs text-zinc-400">
              Educational concept, mathematical curation, and domain design.
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">
              Development & Innovations
            </span>
            <div className="font-heading font-bold text-lg text-white">Intellisoft Innovations</div>
            <p className="text-xs text-zinc-400">
              Technical guidance, full-stack architecture, and interactive simulation engineering.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-800 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs text-zinc-400">
          <div>
            <strong className="text-white block">Typesetting</strong>
            <span>KaTeX mathematical renderer</span>
          </div>
          <div>
            <strong className="text-white block">Typography</strong>
            <span>Plus Jakarta Sans, Inter, JetBrains Mono</span>
          </div>
          <div>
            <strong className="text-white block">Stack</strong>
            <span>Django REST Framework + React 19 + Vite</span>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: ACCESSIBILITY & INCLUSION COMMITMENT
          ========================================================================= */}
      <section className="space-y-3">
        <h2 className="font-heading font-bold text-xl text-zinc-900 dark:text-white">
          Accessibility & Inclusion
        </h2>
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          <p>
            BehindTheMath adheres to WCAG AA accessibility standards. All interactive labs support keyboard focus traps, KaTeX equations provide fallback MathML and screen-reader announcements, and the UI fully respects user <code className="text-xs bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded text-zinc-800 dark:text-zinc-200">prefers-reduced-motion</code> settings.
          </p>
        </div>
      </section>

    </div>
  );
}
