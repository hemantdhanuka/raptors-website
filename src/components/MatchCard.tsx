import { Match } from "@/lib/types";
import { formatDate, getMatchResult } from "@/lib/data";
import { MapPin, Calendar } from "lucide-react";
import clsx from "clsx";

const outcomeConfig = {
  W: {
    bar: "bg-emerald-500",
    badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    label: "Won",
  },
  L: {
    bar: "bg-red-500",
    badge: "bg-red-500/10 text-red-400 border-red-500/20",
    label: "Lost",
  },
  D: {
    bar: "bg-zinc-500",
    badge: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
    label: "Draw",
  },
};

export function MatchCard({ match }: { match: Match }) {
  const outcome = getMatchResult(match);
  const cfg = outcomeConfig[outcome];

  return (
    <div className="group rounded-xl border border-slate-200 dark:border-white/[0.07] bg-white dark:bg-[#111] hover:border-slate-300 dark:hover:border-white/[0.14] transition-colors overflow-hidden flex flex-col">
      <div className={clsx("h-[3px]", cfg.bar)} />

      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Tournament + badge */}
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs text-slate-400 dark:text-zinc-500 font-medium truncate">
            {match.tournament || "Friendly"}
            {match.round ? ` · ${match.round}` : ""}
          </p>
          <span className={clsx("shrink-0 text-xs font-bold px-2.5 py-1 rounded-full border", cfg.badge)}>
            {cfg.label}
          </span>
        </div>

        {/* Opponent */}
        <p className="text-sm font-semibold text-slate-900 dark:text-white leading-snug">
          {match.info}
        </p>

        {/* Score */}
        {match.score && (
          <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
            {match.score}
          </p>
        )}

        {/* Result summary */}
        {match.result && (
          <p className={clsx("text-xs font-semibold", outcome === "W" ? "text-emerald-500" : outcome === "L" ? "text-red-400" : "text-zinc-400")}>
            {match.result}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100 dark:border-white/[0.05] text-xs text-slate-400 dark:text-zinc-600">
          <div className="flex items-center gap-3 min-w-0">
            {match.venue && (
              <span className="flex items-center gap-1 truncate max-w-[130px]">
                <MapPin size={10} className="shrink-0" />
                <span className="truncate">{match.venue}</span>
              </span>
            )}
            {match.match_date && (
              <span className="flex items-center gap-1 shrink-0">
                <Calendar size={10} />
                {formatDate(match.match_date)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
