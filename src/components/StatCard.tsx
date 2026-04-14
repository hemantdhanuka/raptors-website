import clsx from "clsx";

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: "emerald" | "red" | "amber" | "white";
}

const accentMap = {
  emerald: "text-emerald-500",
  red: "text-red-500",
  amber: "text-amber-400",
  white: "text-white dark:text-white",
};

export function StatCard({ label, value, sub, accent = "white" }: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-white/[0.07] bg-white dark:bg-[#111] p-5 flex flex-col gap-1.5 hover:border-emerald-500/30 transition-colors">
      <span className="text-xs font-medium text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
        {label}
      </span>
      <span className={clsx("text-3xl font-bold leading-none tracking-tight", accentMap[accent])}>
        {value}
      </span>
      {sub && <span className="text-xs text-slate-400 dark:text-zinc-600">{sub}</span>}
    </div>
  );
}
