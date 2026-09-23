import React from 'react';
import { Sparkles, Calendar, DollarSign, Database, TrendingUp, ShieldCheck } from 'lucide-react';

export default function StatsOverview({ totalCount, paidCount, upcomingDeadlinesCount, sourcesCount }) {
  const stats = [
    {
      label: 'Indexed Opportunities',
      value: totalCount.toLocaleString(),
      subtext: 'Across 99+ curated repositories',
      icon: Sparkles,
      color: 'text-brand-400',
      bgGlow: 'from-brand-500/10 to-transparent',
      borderColor: 'border-brand-500/20',
      accentBar: 'bg-brand-500',
      tag: 'LIVE FEED',
    },
    {
      label: 'Funded / Paid Roles',
      value: paidCount.toLocaleString(),
      subtext: 'With stipends or fee waivers',
      icon: DollarSign,
      color: 'text-emerald-400',
      bgGlow: 'from-emerald-500/10 to-transparent',
      borderColor: 'border-emerald-500/20',
      accentBar: 'bg-emerald-500',
      tag: 'STIPENDS',
    },
    {
      label: 'Upcoming Deadlines',
      value: upcomingDeadlinesCount.toLocaleString(),
      subtext: 'Actively accepting applications',
      icon: Calendar,
      color: 'text-amber-400',
      bgGlow: 'from-amber-500/10 to-transparent',
      borderColor: 'border-amber-500/20',
      accentBar: 'bg-amber-500',
      tag: 'ACCEPTING',
    },
    {
      label: 'Verified Source Repos',
      value: sourcesCount.toLocaleString(),
      subtext: 'Real-time GitHub trackers',
      icon: Database,
      color: 'text-cyan-400',
      bgGlow: 'from-cyan-500/10 to-transparent',
      borderColor: 'border-cyan-500/20',
      accentBar: 'bg-cyan-500',
      tag: 'OPEN SOURCE',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div
            key={i}
            className={`relative overflow-hidden rounded-xl border ${stat.borderColor} bg-slate-900/60 backdrop-blur-md p-4 transition-all duration-200 hover:border-slate-700 hover:shadow-lg`}
          >
            {/* Top gradient highlight */}
            <div className={`absolute -top-12 -right-12 w-28 h-28 bg-gradient-to-b ${stat.bgGlow} rounded-full blur-xl pointer-events-none`} />

            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[10px] tracking-wider font-semibold text-slate-400 uppercase">
                {stat.label}
              </span>
              <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/[0.05] text-slate-400 border border-white/[0.08]">
                {stat.tag}
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <div className="font-mono text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {stat.value}
              </div>
              <div className={`p-1.5 rounded-lg bg-white/[0.04] ${stat.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
              <span className="truncate">{stat.subtext}</span>
            </div>

            {/* Bottom accent strip */}
            <div className={`absolute bottom-0 left-0 right-0 h-[2px] ${stat.accentBar} opacity-60`} />
          </div>
        );
      })}
    </div>
  );
}
