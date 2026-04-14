import { getTeamData } from "@/lib/data";
import { PlayerCard } from "@/components/PlayerCard";

// Define a preferred display order for roles
const ROLE_ORDER = ["All-Rounder", "Batsman", "Bowler", "Wicket-Keeper", "Wicket-Keeper Batsman", "Others"];

export default function PlayersPage() {
  const { players } = getTeamData();

  const grouped: Record<string, typeof players> = {};
  for (const p of players) {
    const role = p.sub_title?.trim() || "Others";
    if (!grouped[role]) grouped[role] = [];
    grouped[role].push(p);
  }

  // Sort roles by preferred order, unknown roles go last
  const sortedRoles = Object.keys(grouped).sort((a, b) => {
    const ai = ROLE_ORDER.indexOf(a);
    const bi = ROLE_ORDER.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Players</h1>
        <p className="text-sm text-slate-400 dark:text-zinc-500 mt-1">{players.length} squad members</p>
      </div>

      {players.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 dark:border-white/[0.07] py-20 text-center">
          <p className="text-sm text-slate-400 dark:text-zinc-600">No squad data yet.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {sortedRoles.map((role) => (
            <div key={role}>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-xs font-bold text-emerald-500 uppercase tracking-widest">{role}</h2>
                <div className="flex-1 h-px bg-slate-100 dark:bg-white/[0.05]" />
                <span className="text-xs text-slate-400 dark:text-zinc-600">{grouped[role].length}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {grouped[role].map((player) => (
                  <PlayerCard key={player.player_id ?? player.name} player={player} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
