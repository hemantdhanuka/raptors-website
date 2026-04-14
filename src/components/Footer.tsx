import { getTeamData, getRelativeTime } from "@/lib/data";

export function Footer() {
  const { last_updated } = getTeamData();

  return (
    <footer className="mt-24 border-t border-slate-200 dark:border-white/[0.06] py-8">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-400 dark:text-zinc-600">
        <span className="font-medium text-slate-600 dark:text-zinc-400">🦅 Raptors Cricket</span>
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Updated {getRelativeTime(last_updated)} · refreshes every 6h
        </span>
      </div>
    </footer>
  );
}
