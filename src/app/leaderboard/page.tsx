"use client";

import { useState } from "react";
import { getTeamData } from "@/lib/data";
import { Trophy } from "lucide-react";
import clsx from "clsx";
import Image from "next/image";
import { User } from "lucide-react";
import type { LeaderboardStat } from "@/lib/types";

const TABS = [
  { key: "batting",  label: "Batting",  emoji: "🏏" },
  { key: "bowling",  label: "Bowling",  emoji: "⚡" },
  { key: "fielding", label: "Fielding", emoji: "🧤" },
] as const;

type TabKey = "batting" | "bowling" | "fielding";

export default function LeaderboardPage() {
  const { leaderboard } = getTeamData();
  const [tab, setTab] = useState<TabKey>("batting");
  const entries = leaderboard[tab] ?? [];

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
          <Trophy size={26} className="text-emerald-500" />
          Leaderboard
        </h1>
        <p className="text-sm text-slate-400 dark:text-zinc-500 mt-1">Top performers across all matches</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-slate-100 dark:bg-[#161616] mb-8 w-fit">
        {TABS.map(({ key, label, emoji }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={clsx(
              "flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all",
              tab === key
                ? "bg-white dark:bg-[#111] text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300"
            )}
          >
            <span>{emoji}</span> {label}
          </button>
        ))}
      </div>

      {entries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 dark:border-white/[0.07] py-16 text-center">
          <p className="text-sm text-slate-400 dark:text-zinc-600">No data yet.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 dark:border-white/[0.07] bg-white dark:bg-[#111] overflow-hidden">

          {/* Podium — top 3 */}
          {entries.length >= 3 && <Podium entries={entries} />}

          {/* Full ranked list */}
          <div className="divide-y divide-slate-100 dark:divide-white/[0.05]">
            {entries.map((entry, i) => (
              <div
                key={entry.player_id ?? entry.player_name}
                className={clsx(
                  "flex items-center gap-3 px-5 py-3.5 transition-colors",
                  i === 0 ? "bg-emerald-500/[0.04]" : "hover:bg-slate-50 dark:hover:bg-white/[0.03]"
                )}
              >
                {/* Rank */}
                <div className="w-7 text-center shrink-0">
                  {i < 3 ? (
                    <span className="text-base">{["🥇","🥈","🥉"][i]}</span>
                  ) : (
                    <span className="text-sm font-bold text-slate-300 dark:text-zinc-700">{i + 1}</span>
                  )}
                </div>

                {/* Avatar */}
                <Avatar src={entry.profile_pic_url} name={entry.player_name} size={36} />

                {/* Name */}
                <p className={clsx("flex-1 font-semibold text-sm truncate", i === 0 ? "text-emerald-500" : "text-slate-900 dark:text-white")}>
                  {entry.player_name}
                </p>

                {/* Stat */}
                <span className={clsx("font-bold text-sm tabular-nums", i === 0 ? "text-emerald-500" : "text-slate-700 dark:text-zinc-200")}>
                  {entry.stat}
                </span>
              </div>
            ))}
          </div>

        </div>
      )}
    </div>
  );
}

/* ── Podium ── */
function Podium({ entries }: { entries: LeaderboardStat[] }) {
  const [second, first, third] = [entries[1], entries[0], entries[2]];
  return (
    <div className="px-6 py-8 border-b border-slate-100 dark:border-white/[0.05]">
      <div className="flex items-end justify-center gap-4">
        {/* 2nd */}
        <PodiumSlot entry={second} medal="🥈" height={80} accent="zinc" />
        {/* 1st */}
        <PodiumSlot entry={first}  medal="🥇" height={108} accent="emerald" large />
        {/* 3rd */}
        <PodiumSlot entry={third}  medal="🥉" height={64}  accent="amber" />
      </div>
    </div>
  );
}

function PodiumSlot({ entry, medal, height, accent, large }: {
  entry: LeaderboardStat;
  medal: string;
  height: number;
  accent: "emerald" | "zinc" | "amber";
  large?: boolean;
}) {
  const statColor = accent === "emerald" ? "text-emerald-500" : accent === "amber" ? "text-amber-400" : "text-zinc-400";
  const barColor  = accent === "emerald" ? "bg-emerald-500/25" : accent === "amber" ? "bg-amber-500/25" : "bg-zinc-500/25";

  return (
    <div className="flex flex-col items-center gap-2 flex-1 max-w-[110px]">
      <span className="text-xl">{medal}</span>
      <Avatar src={entry.profile_pic_url} name={entry.player_name} size={large ? 52 : 44} ring={accent === "emerald"} />
      <div className="text-center">
        <p className="text-xs font-semibold text-slate-900 dark:text-white truncate max-w-[100px]">
          {entry.player_name.split(" ")[0]}
        </p>
        <p className={clsx("text-xs font-bold mt-0.5", statColor)}>{entry.stat}</p>
      </div>
      {/* Podium step */}
      <div
        className={clsx("w-full rounded-t-lg", barColor)}
        style={{ height }}
      />
    </div>
  );
}

/* ── Shared Avatar ── */
function Avatar({ src, name, size, ring }: { src?: string; name: string; size: number; ring?: boolean }) {
  const cls = clsx(
    "rounded-full overflow-hidden bg-slate-100 dark:bg-[#1a1a1a] flex items-center justify-center shrink-0",
    ring && "ring-2 ring-emerald-500/40"
  );
  return (
    <div className={cls} style={{ width: size, height: size }}>
      {src ? (
        <Image src={src} alt={name} width={size} height={size} className="object-cover w-full h-full" unoptimized />
      ) : (
        <User size={size * 0.44} className="text-slate-400 dark:text-zinc-600" />
      )}
    </div>
  );
}
