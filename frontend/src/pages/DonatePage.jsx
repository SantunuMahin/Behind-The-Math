import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Heart,
  Copy,
  Check,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  ShieldCheck,
  Send,
  Zap,
  Server,
  BookOpen,
  ArrowRight,
  Share2,
  ExternalLink
} from 'lucide-react';
import { useStudent } from '../context/StudentContext';
import { donationsApi } from '../api/formulasApi';

const MFS_NUMBER = '01631009941';
const GPAY_UPI = '01631009941@gpay';

const PAYMENT_METHODS = [
  {
    id: 'bkash',
    name: 'bKash',
    color: '#E2136E',
    badge: 'Personal · Send Money',
    ussd: '*247#',
    number: MFS_NUMBER,
    ref: 'BTM',
    instructions: 'Open bKash app > Send Money > Enter 01631009941 > Ref: BTM'
  },
  {
    id: 'nagad',
    name: 'Nagad',
    color: '#F7941D',
    badge: 'Personal · Send Money',
    ussd: '*167#',
    number: MFS_NUMBER,
    ref: 'BTM',
    instructions: 'Open Nagad app > Send Money > Enter 01631009941 > Ref: BTM'
  },
  {
    id: 'rocket',
    name: 'Rocket',
    color: '#8C3494',
    badge: 'DBBL MFS · Send Money',
    ussd: '*322#',
    number: MFS_NUMBER,
    ref: 'BTM',
    instructions: 'Open Rocket app > Send Money > Enter 01631009941 > Ref: BTM'
  },
  {
    id: 'googlepay',
    name: 'Google Pay',
    color: '#4285F4',
    badge: 'GPay / UPI',
    ussd: 'GPay App',
    number: GPAY_UPI,
    ref: 'BTM',
    instructions: 'Open Google Pay > Pay to UPI ID > Enter 01631009941@gpay'
  }
];

const PRESET_AMOUNTS = [50, 100, 250, 500, 1000];

const FAQS = [
  {
    q: 'How do I send money via bKash, Nagad, or Rocket?',
    a: 'Use the "Send Money" option in your bKash, Nagad, or Rocket app to 01631009941 (Personal). Put "BTM" as reference. Once sent, enter your sender phone number and TrxID in the form on this page so we can record your support!'
  },
  {
    q: 'Will BehindTheMath ever lock formulas behind a paywall?',
    a: 'Never. BehindTheMath is 100% free, ad-free, and open to every student, teacher, and self-learner worldwide. Your support keeps cloud servers and computations completely free for everyone.'
  },
  {
    q: 'Can I remain anonymous?',
    a: 'Yes. Simply check the "Keep my contribution anonymous" box before submitting.'
  },
  {
    q: 'Can I help without donating money?',
    a: 'Absolutely! You can report typos, suggest formulas for your syllabus, star our project on GitHub, or share BehindTheMath with your classmates.'
  }
];

export default function DonatePage() {
  const { supporters, addSupporter } = useStudent();
  const [searchParams] = useSearchParams();
  const paramAmount = Number(searchParams.get('amount'));
  const paramMethod = searchParams.get('method');

  const [selectedMethodId, setSelectedMethodId] = useState(() => {
    if (paramMethod && ['bkash', 'nagad', 'rocket', 'googlepay'].includes(paramMethod.toLowerCase())) {
      return paramMethod.toLowerCase();
    }
    return 'bkash';
  });

  const [selectedAmount, setSelectedAmount] = useState(() => {
    if (paramAmount && !isNaN(paramAmount) && paramAmount > 0) return paramAmount;
    return 100;
  });
  const [customAmount, setCustomAmount] = useState('');

  // Form fields
  const [senderPhone, setSenderPhone] = useState('');
  const [trxId, setTrxId] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [supportSuccess, setSupportSuccess] = useState(false);

  // Copy states
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  // FAQ state
  const [openFaq, setOpenFaq] = useState(0);

  // Keep state synced if URL params change
  useEffect(() => {
    if (paramAmount && !isNaN(paramAmount) && paramAmount > 0) {
      setSelectedAmount(paramAmount);
      setCustomAmount('');
    }
    if (paramMethod && ['bkash', 'nagad', 'rocket', 'googlepay'].includes(paramMethod.toLowerCase())) {
      setSelectedMethodId(paramMethod.toLowerCase());
    }
  }, [paramAmount, paramMethod]);

  const activeMethod = PAYMENT_METHODS.find((p) => p.id === selectedMethodId) || PAYMENT_METHODS[0];

  const handleSelectAmount = (amt) => {
    setSelectedAmount(amt);
    setCustomAmount('');
  };

  const handleCustomChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setCustomAmount(val);
    if (val && Number(val) > 0) {
      setSelectedAmount(Number(val));
    }
  };

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(activeMethod.number);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2500);
  };

  const handleCopyShare = () => {
    navigator.clipboard.writeText(window.location.origin);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  const handleSupportSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const donationPayload = {
      sender_name: isAnonymous ? 'Anonymous Benefactor' : name.trim() || 'Generous Supporter',
      sender_phone: senderPhone.trim() || null,
      sender_role: 'STEM Supporter',
      provider: activeMethod.id || 'bkash',
      amount: selectedAmount,
      currency: 'BDT',
      trx_id: trxId.trim() || null,
      message: message.trim() || `Supported via ${activeMethod.name}. Thank you for keeping math free!`,
      is_monthly: false,
    };

    let createdDonation = null;
    try {
      const res = await donationsApi.submitDonation(donationPayload);
      if (res && res.donation) {
        createdDonation = res.donation;
      }
    } catch (err) {
      console.warn('Recorded locally (backend offline):', err);
    }

    setIsSubmitting(false);
    setSupportSuccess(true);

    addSupporter({
      id: createdDonation?.id ? `trx-${createdDonation.id}` : `local-${Date.now()}`,
      name: createdDonation?.sender_name || donationPayload.sender_name,
      role: createdDonation?.sender_role || 'Supporter',
      amount: selectedAmount,
      currency: 'BDT',
      provider: activeMethod.name,
      trxId: createdDonation?.trx_id || donationPayload.trx_id,
      senderPhone: donationPayload.sender_phone,
      tier: selectedAmount >= 1000 ? 'Visual Lab Creator' : 'Supporter',
      isMonthly: false,
      date: createdDonation?.formatted_date || 'Just now',
      avatar: activeMethod.id === 'googlepay' ? '🟢' : '🇧🇩',
      message: donationPayload.message,
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-12">
      
      {/* 1. Clear, Honest Header */}
      <section className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold">
          <Heart className="w-3.5 h-3.5 fill-current" />
          <span>Our Mission — Turn Potential into Possibilities</span>
        </div>
        <h1 className="font-heading font-extrabold text-3xl sm:text-5xl text-zinc-900 dark:text-white tracking-tight">
          Support BehindTheMath
        </h1>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto leading-relaxed">
          Help us help students grow. BehindTheMath is 100% free and open-source. Your contribution keeps quality learning accessible to everyone, everywhere—powering cloud servers, step-by-step solver calculations, and 60 FPS interactive visual labs.
        </p>
      </section>

      {/* 2. Primary Payment & Verification Hub (Simple & Directly Useful) */}
      <section className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
        
        {/* Step A: Payment Method Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
              1. Choose Payment Method
            </span>
            <span className="text-zinc-400">Account: <strong>Santunu Kaysar</strong></span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {PAYMENT_METHODS.map((m) => {
              const active = selectedMethodId === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedMethodId(m.id)}
                  className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                    active
                      ? 'border-black dark:border-white bg-zinc-100 dark:bg-zinc-800 shadow-xs ring-1 ring-black dark:ring-white'
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 bg-white dark:bg-zinc-950'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-heading font-extrabold text-sm sm:text-base text-zinc-900 dark:text-white">
                      {m.name}
                    </span>
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: m.color }}
                    />
                  </div>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">
                    {m.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step B: Prominent Account Number & 1-Click Copy Banner */}
        <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">
                {activeMethod.name} Send Money Number
              </span>
              <div className="font-mono font-extrabold text-xl sm:text-2xl text-zinc-900 dark:text-white tracking-wide">
                {activeMethod.number}
              </div>
              <div className="text-xs text-zinc-500 mt-0.5">
                Reference: <strong className="text-zinc-900 dark:text-white font-mono">{activeMethod.ref}</strong> · Type: <strong>Personal</strong>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopyNumber}
              className="px-4 py-2.5 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-xs cursor-pointer self-start sm:self-auto"
            >
              {copiedNumber ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedNumber ? 'Copied to Clipboard!' : 'Copy Number'}</span>
            </button>
          </div>

          <div className="text-xs text-zinc-600 dark:text-zinc-400 pt-1 border-t border-zinc-200/60 dark:border-zinc-800/60 flex items-center gap-2">
            <span>💡</span>
            <span>{activeMethod.instructions}</span>
          </div>
        </div>

        {/* Step C: Amount Selection */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
            2. Select Amount (BDT ৳)
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {PRESET_AMOUNTS.map((amt) => {
              const isSelected = selectedAmount === amt && !customAmount;
              return (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleSelectAmount(amt)}
                  className={`py-2.5 px-3 rounded-xl font-heading font-extrabold text-sm transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                      : 'bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  ৳{amt}
                </button>
              );
            })}
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">৳</span>
              <input
                type="text"
                value={customAmount}
                onChange={handleCustomChange}
                placeholder="Custom"
                className={`w-full pl-6 pr-2 py-2 rounded-xl text-xs font-bold outline-none border transition-all ${
                  customAmount
                    ? 'border-black dark:border-white bg-white dark:bg-black text-black dark:text-white'
                    : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-black text-zinc-800 dark:text-zinc-200'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Step D: Verification Form or Success Feedback */}
        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
          {supportSuccess ? (
            <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 text-center space-y-3 animate-in fade-in duration-200">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-lg text-zinc-900 dark:text-white">
                Thank you for supporting BehindTheMath!
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
                Your support of ৳{selectedAmount} via {activeMethod.name} has been verified and recorded. You're helping keep mathematics free and accessible for thousands of students.
              </p>
              <button
                type="button"
                onClick={() => setSupportSuccess(false)}
                className="px-4 py-2 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-semibold cursor-pointer"
              >
                Send Another Contribution
              </button>
            </div>
          ) : (
            <form onSubmit={handleSupportSubmit} className="space-y-4">
              <div className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                3. Confirm Transaction Details
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    Your {activeMethod.name} Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={senderPhone}
                    onChange={(e) => setSenderPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black text-xs text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    Transaction ID (TrxID / UTR) *
                  </label>
                  <input
                    type="text"
                    required
                    value={trxId}
                    onChange={(e) => setTrxId(e.target.value)}
                    placeholder="e.g. BL92XK89P"
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black text-xs text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-black dark:focus:ring-white uppercase font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    Your Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Arif Hossain"
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black text-xs text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    Short Message (Optional)
                  </label>
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="e.g. Loved the Fourier transform lab!"
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black text-xs text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 pt-1">
                <input
                  type="checkbox"
                  id="anonymous-check"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded border-zinc-300 dark:border-zinc-700 accent-black dark:accent-white"
                />
                <label htmlFor="anonymous-check" className="cursor-pointer">
                  Keep my name anonymous on the public supporter list
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-2xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-extrabold text-sm shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white dark:border-black border-t-transparent dark:border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Heart className="w-4 h-4 fill-current" />
                    <span>Confirm ৳{selectedAmount} Support via {activeMethod.name}</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

      </section>

      {/* 3. Where Your Money Goes (Useful & Transparent) */}
      <section className="space-y-4">
        <h2 className="font-heading font-bold text-xl text-zinc-900 dark:text-white text-center">
          How Your Support Is Used
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-white">
              <Server className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Cloud Servers & Fast Compute</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Keeps 169 KaTeX rendered formulas, step-by-step solver servers, and API backends responsive with 99.9% uptime.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-white">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Interactive 60 FPS Labs</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Funds development of interactive canvas simulations like Snell's law, Lorentz time dilation, and neural network math.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-white">
              <BookOpen className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-zinc-900 dark:text-white">100% Free For Everyone</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Ensures formulas, flashcards, printable cheat sheets, and practice quizzes remain completely free of ads and paywalls.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Recent Community Supporters (Direct Recognition) */}
      {supporters && supporters.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-bold text-lg sm:text-xl text-zinc-900 dark:text-white">
              Recent Supporters
            </h2>
            <span className="text-xs text-zinc-400">{supporters.length} contributions</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {supporters.slice(0, 6).map((supporter, idx) => (
              <div
                key={supporter.id || idx}
                className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{supporter.avatar || '❤️'}</span>
                    <div>
                      <div className="font-bold text-xs text-zinc-900 dark:text-white">
                        {supporter.name}
                      </div>
                      <span className="text-[10px] text-zinc-400">{supporter.provider || 'bKash'}</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                    ৳{supporter.amount}
                  </span>
                </div>
                {supporter.message && (
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 italic">
                    "{supporter.message}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. Helpful Free Ways to Support */}
      <section className="p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3">
        <h3 className="font-heading font-bold text-base text-zinc-900 dark:text-white">
          Other Ways to Support
        </h3>
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          You don't need money to make a huge difference. Here is how you can help BehindTheMath:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <button
            type="button"
            onClick={handleCopyShare}
            className="p-3 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-left hover:border-zinc-400 transition-colors flex items-center justify-between cursor-pointer"
          >
            <div>
              <div className="text-xs font-bold text-zinc-900 dark:text-white">Share with Classmates</div>
              <div className="text-[11px] text-zinc-500">{copiedShare ? 'Copied link!' : 'Copy link to share'}</div>
            </div>
            <Share2 className="w-4 h-4 text-zinc-400" />
          </button>

          <Link
            to="/about"
            className="p-3 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-left hover:border-zinc-400 transition-colors flex items-center justify-between"
          >
            <div>
              <div className="text-xs font-bold text-zinc-900 dark:text-white">Report Errata / Typos</div>
              <div className="text-[11px] text-zinc-500">Help verify formulas</div>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-400" />
          </Link>

          <a
            href="https://github.com/SantunuMahin/Behind-The-Math"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-left hover:border-zinc-400 transition-colors flex items-center justify-between"
          >
            <div>
              <div className="text-xs font-bold text-zinc-900 dark:text-white">Star on GitHub</div>
              <div className="text-[11px] text-zinc-500">Contribute open-source</div>
            </div>
            <ExternalLink className="w-4 h-4 text-zinc-400" />
          </a>
        </div>
      </section>

      {/* 6. Concise FAQ */}
      <section className="space-y-4">
        <h2 className="font-heading font-bold text-xl text-zinc-900 dark:text-white text-center">
          Frequently Asked Questions
        </h2>

        <div className="space-y-2.5 max-w-2xl mx-auto">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                  className="w-full p-4 flex items-center justify-between text-left gap-4 cursor-pointer"
                >
                  <span className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-white">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-zinc-400 transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 text-black dark:text-white' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-800/80 pt-2.5">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. Creator & Contact */}
      <div className="text-center text-xs text-zinc-500 dark:text-zinc-400 pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-1">
        <div>
          Presented by <strong>Santunu Kaysar</strong> · Intellisoft Innovations
        </div>
        <div>
          For institutional sponsorships or questions: <a href="tel:01631009941" className="underline font-mono">01631009941</a>
        </div>
      </div>

    </div>
  );
}
