import React, { useMemo } from 'react';
import {
  BarChart3,
  PieChart,
  Calendar,
  Globe,
  Award,
  DollarSign,
  GraduationCap,
  ExternalLink,
} from 'lucide-react';

export default function AnalyticsPage({
  opportunities = [],
  onSelectOpportunity,
}) {
  // 1. Distribution by Type
  const typeStats = useMemo(() => {
    const counts = {};
    opportunities.forEach((o) => {
      const t = o.type || 'Other';
      counts[t] = (counts[t] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [opportunities]);

  // 2. Distribution by Category
  const categoryStats = useMemo(() => {
    const counts = {};
    opportunities.forEach((o) => {
      const c = o.category || 'General';
      counts[c] = (counts[c] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [opportunities]);

  // 3. Location breakdown
  const locationStats = useMemo(() => {
    let remote = 0;
    let us = 0;
    let europe = 0;
    let asia = 0;
    let other = 0;

    opportunities.forEach((o) => {
      const loc = (o.location || '').toLowerCase();
      if (loc.includes('remote') || loc.includes('virtual') || loc.includes('online')) {
        remote++;
      } else if (loc.includes('usa') || loc.includes('united states') || loc.includes('us')) {
        us++;
      } else if (['europe', 'germany', 'uk', 'france', 'italy', 'spain', 'switzerland'].some((k) => loc.includes(k))) {
        europe++;
      } else if (['asia', 'japan', 'china', 'singapore', 'korea', 'taiwan', 'india'].some((k) => loc.includes(k))) {
        asia++;
      } else {
        other++;
      }
    });

    return [
      { name: '🌐 Remote / Virtual', count: remote, color: 'bg-indigo-500' },
      { name: '🇺🇸 United States', count: us, color: 'bg-blue-500' },
      { name: '🇪🇺 Europe', count: europe, color: 'bg-emerald-500' },
      { name: '🌏 Asia & Pacific', count: asia, color: 'bg-amber-500' },
      { name: '🌍 Global / Worldwide', count: other, color: 'bg-slate-500' },
    ];
  }, [opportunities]);

  // 4. Upcoming Deadlines Timeline
  const upcomingList = useMemo(() => {
    return opportunities
      .filter((o) => o.deadline && !o.deadline.toLowerCase().includes('passed') && !o.deadline.toLowerCase().includes('closed'))
      .slice(0, 10);
  }, [opportunities]);

  const maxTypeCount = typeStats[0]?.count || 1;
  const maxCatCount = categoryStats[0]?.count || 1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
            <BarChart3 className="w-5 h-5" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Ecosystem Analytics & Visual Trends
          </h1>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Synthesized metrics across {opportunities.length.toLocaleString()} global opportunities discovered in the 99 curated repositories.
        </p>
      </div>

      {/* Top 3 Visual Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: Opportunities by Type */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-brand-500" />
              <span>Program Types</span>
            </h3>
            <span className="text-[11px] text-slate-400">By volume</span>
          </div>

          <div className="space-y-3">
            {typeStats.map((item) => {
              const percentage = Math.round((item.count / opportunities.length) * 100);
              return (
                <div key={item.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-700 dark:text-slate-300">{item.name}</span>
                    <span className="text-slate-500 dark:text-slate-400 font-mono">
                      {item.count} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-500 to-indigo-500"
                      style={{ width: `${(item.count / maxTypeCount) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card 2: Location Distribution */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-500" />
              <span>Location & Remote Spread</span>
            </h3>
            <span className="text-[11px] text-slate-400">Regions</span>
          </div>

          <div className="space-y-3.5">
            {locationStats.map((loc) => {
              const pct = Math.round((loc.count / opportunities.length) * 100);
              return (
                <div key={loc.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-700 dark:text-slate-300">{loc.name}</span>
                    <span className="text-slate-500 dark:text-slate-400 font-mono">
                      {loc.count.toLocaleString()} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${loc.color}`}
                      style={{ width: `${Math.max(pct, 5)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card 3: Top Opportunity Categories */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Top Focus Areas</span>
            </h3>
            <span className="text-[11px] text-slate-400">Categories</span>
          </div>

          <div className="space-y-2.5">
            {categoryStats.map((cat) => {
              return (
                <div key={cat.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-700 dark:text-slate-300 truncate max-w-[200px]">
                      {cat.name}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                      {cat.count}
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-amber-500/80"
                      style={{ width: `${(cat.count / maxCatCount) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Upcoming Active Timeline Section */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-500" />
              <span>Upcoming High-Priority Deadlines</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Programs currently accepting applications with impending review dates.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {upcomingList.map((opp) => (
            <div
              key={opp.id}
              onClick={() => onSelectOpportunity(opp)}
              className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 hover:bg-slate-100/60 dark:hover:bg-slate-800/80 transition cursor-pointer flex items-center justify-between gap-3 group"
            >
              <div className="min-w-0">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
                  {opp.type || 'Program'}
                </span>
                <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate mt-1 group-hover:text-brand-500 transition">
                  {opp.title}
                </h4>
                {opp.host && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {opp.host}
                  </p>
                )}
              </div>

              <div className="text-right shrink-0">
                <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-900">
                  {opp.deadline}
                </span>
                <div className="text-[10px] text-slate-400 mt-1 font-mono truncate max-w-[120px]">
                  {opp.sourceRepo}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

