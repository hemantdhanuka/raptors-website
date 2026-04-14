import { Player } from "@/lib/types";
import { User } from "lucide-react";
import Image from "next/image";

export function PlayerCard({ player }: { player: Player }) {
  return (
    <div className="group rounded-xl border border-slate-200 dark:border-white/[0.07] bg-white dark:bg-[#111] p-4 hover:border-emerald-500/30 hover:dark:border-emerald-500/25 transition-colors flex flex-col items-center text-center gap-3">
      <div className="relative">
        {player.profile_pic_url ? (
          <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-slate-200 dark:ring-white/10 group-hover:ring-emerald-500/40 transition-all">
            <Image
              src={player.profile_pic_url}
              alt={player.name}
              width={64}
              height={64}
              className="object-cover w-full h-full"
              unoptimized
            />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-full ring-2 ring-slate-200 dark:ring-white/10 bg-slate-100 dark:bg-[#1a1a1a] flex items-center justify-center group-hover:ring-emerald-500/30 transition-all">
            <User size={22} className="text-slate-400 dark:text-zinc-600" />
          </div>
        )}
        {player.is_captain && (
          <span className="absolute -top-1 -right-1 text-sm" title="Captain">⭐</span>
        )}
      </div>

      <div className="w-full min-w-0">
        <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">
          {player.name}
        </p>
        {player.sub_title && (
          <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">{player.sub_title}</p>
        )}
      </div>

    </div>
  );
}
