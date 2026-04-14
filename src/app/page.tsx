import { getTeamData, getWinStreak } from "@/lib/data";
import { FormStrip } from "@/components/FormStrip";
import { MatchCard } from "@/components/MatchCard";
import { PlayerCard } from "@/components/PlayerCard";
import { ArrowRight, Zap } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import Image from "next/image";

export default function HomePage() {
  const data = getTeamData();
  const { record, form, matches, players, leaderboard, logo } = data;
  const winStreak = getWinStreak(matches);
  const topBatter = leaderboard.batting[0];
  const topBowler = leaderboard.bowling[0];

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-14">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-500 p-8 md:p-12 text-white">
        {/* Subtle background circles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-black/10 rounded-full blur-3xl" />
        </div>

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8">
          {/* Left — name + form */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              {logo ? (
                <Image src={logo} alt="Raptors" width={48} height={48} className="rounded-full" unoptimized />
              ) : (
                <span className="text-5xl">🦅</span>
              )}
              {winStreak > 2 && (
                <span className="flex items-center gap-1 bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/30">
                  <Zap size={11} className="text-yellow-300" />
                  {winStreak}-match win streak
                </span>
              )}
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Raptors</h1>
              <p className="text-emerald-100/80 mt-1">Bengaluru · Tennis Ball Cricket</p>
            </div>
            <FormStrip form={form} />
          </div>

          {/* Right — record */}
          {record.matches > 0 && (
            <div className="flex gap-6 md:gap-10 shrink-0">
              {[
                { label: "Matches", value: record.matches },
                { label: "Won", value: record.won },
                { label: "Lost", value: record.lost },
                { label: "Win %", value: `${record.win_pct}%` },
              ].map(({ label, value }) => (
                <div key={label} className="text-center">
                  <div className="text-3xl font-bold">{value}</div>
                  <div className="text-xs text-emerald-100/70 uppercase tracking-wider mt-1">{label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Top Performers ── */}
      {(topBatter || topBowler) && (
        <section>
          <SectionHeader title="Top Performers" href="/leaderboard" linkLabel="Full leaderboard" />
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {topBatter && <PerformerCard emoji="🏏" label="Top Batter" name={topBatter.player_name} stat={topBatter.stat} picUrl={topBatter.profile_pic_url} />}
            {topBowler && <PerformerCard emoji="⚡" label="Top Bowler" name={topBowler.player_name} stat={topBowler.stat} picUrl={topBowler.profile_pic_url} />}
          </div>
        </section>
      )}

      {/* ── Recent Matches ── */}
      <section>
        <SectionHeader title="Recent Matches" href="/matches" linkLabel={`All ${matches.length} matches`} />
        {matches.length === 0 ? (
          <EmptyState message="No matches yet." />
        ) : (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {matches.slice(0, 3).map((match) => (
              <MatchCard key={match.match_id ?? match.info} match={match} />
            ))}
          </div>
        )}
      </section>

      {/* ── The Squad ── */}
      <section>
        <SectionHeader title="The Squad" href="/players" linkLabel={`All ${players.length} players`} />
        {players.length === 0 ? (
          <EmptyState message="No players data yet." />
        ) : (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {players.slice(0, 6).map((player) => (
              <PlayerCard key={player.player_id ?? player.name} player={player} />
            ))}
          </div>
        )}
      </section>

    </div>
  );
}

/* ─── Shared sub-components ─── */

function SectionHeader({ title, href, linkLabel }: { title: string; href: string; linkLabel?: string }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h2>
      {linkLabel && (
        <Link href={href} className="text-sm text-emerald-500 hover:text-emerald-400 flex items-center gap-1 transition-colors">
          {linkLabel} <ArrowRight size={13} />
        </Link>
      )}
    </div>
  );
}

function PerformerCard({ emoji, label, name, stat, picUrl }: {
  emoji: string; label: string; name: string; stat: string; picUrl?: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-200 dark:border-white/[0.07] bg-white dark:bg-[#111] p-4 hover:border-emerald-500/30 transition-colors">
      {picUrl ? (
        <Image src={picUrl} alt={name} width={44} height={44} className="rounded-full ring-2 ring-emerald-500/30 shrink-0 object-cover" unoptimized />
      ) : (
        <span className="text-3xl shrink-0">{emoji}</span>
      )}
      <div className="min-w-0">
        <p className="text-xs font-medium text-emerald-500 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{name}</p>
        <p className="text-xs text-slate-400 dark:text-zinc-500">{stat}</p>
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="mt-4 rounded-xl border border-dashed border-slate-300 dark:border-white/[0.07] py-12 text-center">
      <p className="text-sm text-slate-400 dark:text-zinc-600">{message}</p>
    </div>
  );
}
