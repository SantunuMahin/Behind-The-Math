import React, { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';

export default function CodeTabs({ codeSnippets = [] }) {
  const [activeTab, setActiveTab] = useState(codeSnippets[0]?.language || 'c');
  const [copied, setCopied] = useState(false);

  if (!codeSnippets || codeSnippets.length === 0) return null;

  const currentSnippet = codeSnippets.find((s) => s.language === activeTab) || codeSnippets[0];

  const handleCopy = () => {
    if (!currentSnippet?.code) return;
    navigator.clipboard.writeText(currentSnippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-[#0F172A] text-slate-100 shadow-lg my-6">
      {/* Tab bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#1E293B] border-b border-slate-700/60">
        <div className="flex items-center gap-1.5">
          <Terminal className="w-4 h-4 text-emerald-400 mr-2" />
          {codeSnippets.map((snippet) => (
            <button
              key={snippet.language}
              onClick={() => setActiveTab(snippet.language)}
              className={`px-3 py-1 rounded-md text-xs font-mono font-medium transition-colors ${
                activeTab === snippet.language
                  ? 'bg-[#0F172A] text-[#A8DADC] border border-slate-700 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/40'
              }`}
            >
              {snippet.language_display || (snippet.language === 'c' ? 'C (C11)' : 'Python 3')}
            </button>
          ))}
        </div>

        {/* Copy button */}
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          title="Copy code"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>

      {/* Code body */}
      <div className="p-4 overflow-x-auto text-xs sm:text-sm font-mono leading-relaxed max-h-[460px] scrollbar-thin">
        <pre className="text-slate-200 font-code whitespace-pre">
          <code>{currentSnippet.code}</code>
        </pre>
      </div>

      {/* Sample output footnote */}
      {(currentSnippet.sample_input || currentSnippet.sample_output) && (
        <div className="px-4 py-2.5 bg-[#162032] border-t border-slate-800 text-xs font-mono text-slate-400 flex flex-wrap gap-4">
          {currentSnippet.sample_input && <span>Input: {currentSnippet.sample_input}</span>}
          {currentSnippet.sample_output && (
            <span className="text-emerald-400">Output: {currentSnippet.sample_output}</span>
          )}
        </div>
      )}
    </div>
  );
}
