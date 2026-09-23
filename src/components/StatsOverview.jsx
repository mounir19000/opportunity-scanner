import React from 'react';
import { Sparkles, Calendar, DollarSign, Database } from 'lucide-react';

export default function StatsOverview({ totalCount, paidCount, upcomingDeadlinesCount, sourcesCount }) {
  const stats = [
    {
      label: 'Total Opportunities',
      value: totalCount.toLocaleString(),
      subtext: 'Across 99+ curated repositories',
      icon: Sparkles,
      color: 'text-brand-500 bg-brand-500/10 dark:text-brand-400 dark:bg-brand-500/20',
    },
    {
      label: 'Funded / Paid Roles',
      value: paidCount.toLocaleString(),
      subtext: 'With stipends or fee waivers',
      icon: DollarSign,
      color: 'text-emerald-500 bg-emerald-500/10 dark:text-emerald-400 dark:bg-emerald-500/20',
    },
    {
      label: 'Upcoming Deadlines',
      value: upcomingDeadlinesCount.toLocaleString(),
      subtext: 'Actively accepting applications',
      icon: Calendar,
      color: 'text-amber-500 bg-amber-500/10 dark:text-amber-400 dark:bg-amber-500/20',
    },
    {
      label: 'Verified Sources',
      value: sourcesCount.toLocaleString(),
      subtext: 'GitHub open-source trackers',
      icon: Database,
      color: 'text-cyan-500 bg-cyan-500/10 dark:text-cyan-400 dark:bg-cyan-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div
            key={i}
            className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
                {stat.label}
              </span>
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {stat.value}
            </div>
            <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 truncate">
              {stat.subtext}
            </div>
          </div>
        );
      })}
    </div>
  );
}
