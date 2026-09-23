import React, { useState } from 'react';
import {
  X,
  Check,
  Copy,
  ExternalLink,
  Zap,
  Globe,
  Server,
  Terminal,
  ShieldCheck,
} from 'lucide-react';

export default function DeploymentModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('vercel');
  const [copiedIndex, setCopiedIndex] = useState(null);

  if (!isOpen) return null;

  const handleCopy = (text, index) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 md:p-8"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Deploy to Vercel or Netlify
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Host live for free with zero backend or database required
            </p>
          </div>
        </div>

        {/* Compatibility Confirmation Banner */}
        <div className="p-3.5 my-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <strong>100% Ready for Direct Hosting!</strong> Both <code className="bg-emerald-100 dark:bg-emerald-900/60 px-1 py-0.5 rounded">vercel.json</code> and <code className="bg-emerald-100 dark:bg-emerald-900/60 px-1 py-0.5 rounded">netlify.toml</code> configuration files are pre-generated with SPA rewrite rules and CORS compatibility.
          </div>
        </div>

        {/* Platform Selection Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 mb-5">
          <button
            onClick={() => setActiveTab('vercel')}
            className={`pb-2.5 px-4 text-xs font-semibold border-b-2 transition ${
              activeTab === 'vercel'
                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            ▲ Vercel (Recommended)
          </button>
          <button
            onClick={() => setActiveTab('netlify')}
            className={`pb-2.5 px-4 text-xs font-semibold border-b-2 transition ${
              activeTab === 'netlify'
                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            ◆ Netlify (Drag & Drop or Git)
          </button>
          <button
            onClick={() => setActiveTab('details')}
            className={`pb-2.5 px-4 text-xs font-semibold border-b-2 transition ${
              activeTab === 'details'
                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            ⚙️ How It Works
          </button>
        </div>

        {/* Tab 1: Vercel */}
        {activeTab === 'vercel' && (
          <div className="space-y-4 text-xs text-slate-700 dark:text-slate-300">
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-1.5 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-brand-500" />
                Option A: Fast CLI Deploy (1 Minute)
              </h4>
              <p className="text-slate-500 dark:text-slate-400 mb-2">
                Run these commands in your project root to deploy live instantly:
              </p>
              <div className="relative p-3 rounded-lg bg-slate-900 text-slate-100 font-mono text-[11px] leading-relaxed">
                <code>
                  npm run build<br />
                  npx vercel
                </code>
                <button
                  onClick={() => handleCopy('npm run build\nnpx vercel', 1)}
                  className="absolute right-2 top-2 p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                >
                  {copiedIndex === 1 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-1.5 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-brand-500" />
                Option B: Vercel Git Dashboard
              </h4>
              <ol className="list-decimal pl-4 space-y-1 text-slate-600 dark:text-slate-400">
                <li>Push this repository to your GitHub account.</li>
                <li>Go to <a href="https://vercel.com/new" target="_blank" rel="noopener noreferrer" className="text-brand-500 underline inline-flex items-center gap-0.5">vercel.com/new <ExternalLink className="w-2.5 h-2.5" /></a> and import the repo.</li>
                <li>Framework Preset: <strong>Vite</strong>.</li>
                <li>Build Command: <code>npm run build</code>, Output Directory: <code>dist</code>.</li>
                <li>Click <strong>Deploy</strong>. Your site gets a free HTTPS <code className="text-brand-500">.vercel.app</code> domain!</li>
              </ol>
            </div>
          </div>
        )}

        {/* Tab 2: Netlify */}
        {activeTab === 'netlify' && (
          <div className="space-y-4 text-xs text-slate-700 dark:text-slate-300">
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-1.5 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-teal-500" />
                Option A: Instant Drag & Drop (Zero Setup)
              </h4>
              <p className="text-slate-500 dark:text-slate-400 mb-2">
                1. Build the production package locally:
              </p>
              <div className="relative p-3 rounded-lg bg-slate-900 text-slate-100 font-mono text-[11px] leading-relaxed mb-2">
                <code>npm run build</code>
                <button
                  onClick={() => handleCopy('npm run build', 2)}
                  className="absolute right-2 top-2 p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                >
                  {copiedIndex === 2 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="text-slate-600 dark:text-slate-400">
                2. Open <a href="https://app.netlify.com/drop" target="_blank" rel="noopener noreferrer" className="text-brand-500 underline inline-flex items-center gap-0.5">app.netlify.com/drop <ExternalLink className="w-2.5 h-2.5" /></a> and drag the generated <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">dist</code> folder into the browser window. It will be live instantly!
              </p>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-1.5 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-teal-500" />
                Option B: Netlify CLI
              </h4>
              <div className="relative p-3 rounded-lg bg-slate-900 text-slate-100 font-mono text-[11px] leading-relaxed">
                <code>
                  npm run build<br />
                  npx netlify-cli deploy --prod --dir=dist
                </code>
                <button
                  onClick={() => handleCopy('npm run build\nnpx netlify-cli deploy --prod --dir=dist', 3)}
                  className="absolute right-2 top-2 p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                >
                  {copiedIndex === 3 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Details */}
        {activeTab === 'details' && (
          <div className="space-y-3 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            <p>
              <strong>Architecture:</strong> OpportunityRadar is designed as a high-performance Single Page Application (SPA).
            </p>
            <ul className="list-disc pl-4 space-y-1.5">
              <li>
                <strong>Zero Database Dependency:</strong> 2,698 opportunities across the 99 curated repositories are bundled in a pre-compiled JSON file (<code className="text-brand-500">src/data/initialOpportunities.json</code>), guaranteeing blazing-fast first paint (&lt;100ms) with no cold-starts.
              </li>
              <li>
                <strong>Browser-Direct Live Fetching:</strong> When clicking "Live Sync", the browser fetches raw markdown directly from GitHub's CDN (<code className="text-brand-500">raw.githubusercontent.com</code>), which natively permits CORS.
              </li>
              <li>
                <strong>Persistent User Tracker:</strong> All saved opportunities, custom stage statuses (Applied, Interviewing, Offered), and personal notes persist securely in the user's browser <code className="text-brand-500">localStorage</code>.
              </li>
            </ul>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-5 mt-5 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
