"use client";

import { useState, useMemo } from "react";
import { getTeamData, getMatchResult } from "@/lib/data";
import { MatchCard } from "@/components/MatchCard";
import clsx from "clsx";

const FILTERS = ["All", "Won", "Lost", "Draw"] as const;
type Filter = (typeof FILTERS)[number];

export default function MatchesPage() {
  const { matches, record, form } = getTeamData();
  const [filter, setFilter] = useState<Filter>("All");
  const [tournament, setTournament] = useState("All");

  const tournaments = useMemo(() => {
    const names = Array.from(new Set(matches.map((m) => m.tournament).filter(Boolean)));
    return ["All", ...names];
  }, [matches]);

  const filtered = useMemo(() => matches.filter((m) => {
    const r = getMatchResult(m);
    const resultOk = filter === "All" || (filter === "Won" && r === "W") || (filter === "Lost" && r === "L") || (filter === "Draw" && r === "D");
    const tournOk = tournament === "All" || m.tournament === tournament;
    return resultOk && tournOk;
  }), [matches, filter, tournament]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Matches</h1>
        <p className="text-sm text-slate-400 dark:text-zinc-500 mt-1">
          {record.won}W · {record.lost}L · {record.draw}D · {record.win_pct}% win rate
        </p>
        {form.length > 0 && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-slate-400 dark:text-zinc-600 uppercase tracking-wider font-medium">Recent form</span>
            <div className="flex gap-1">
              {form.map((r, i) => (
                <span
                  key={i}
                  className={clsx(
                    "w-6 h-6 flex items-center justify-center rounded text-xs font-bold border",
                    r === "W" && "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                    r === "L" && "bg-red-500/10 text-red-400 border-red-500/20",
                    r === "D" && "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
                  )}
                >
                  {r}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <div className="flex gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={clsx(
                "px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors border",
                filter === f
                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/25"
                  : "text-slate-500 dark:text-zinc-500 border-slate-200 dark:border-white/[0.07] hover:border-slate-300 dark:hover:border-white/[0.14]"
              )}
            >
              {f}
            </button>
          ))}
        </div>

        {tournaments.length > 2 && (
          <select
            value={tournament}
            onChange={(e) => setTournament(e.target.value)}
            className="ml-auto text-sm rounded-lg border border-slate-200 dark:border-white/[0.07] bg-white dark:bg-[#111] text-slate-700 dark:text-zinc-300 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          >
            {tournaments.map((t) => <option key={t}>{t}</option>)}
          </select>
        )}
      </div>

      <p className="text-xs text-slate-400 dark:text-zinc-600 mb-5">
        {filtered.length} of {matches.length} matches
      </p>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 dark:border-white/[0.07] py-16 text-center">
          <p className="text-sm text-slate-400 dark:text-zinc-600">No matches found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((match) => (
            <MatchCard key={match.match_id ?? match.info} match={match} />
          ))}
        </div>
      )}

    </div>
  );
}
