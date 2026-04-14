import { TeamData, Match } from "./types";
import dataJson from "../../public/data.json";

export function getTeamData(): TeamData {
  return dataJson as unknown as TeamData;
}

export function getMatchResult(match: Match): "W" | "L" | "D" {
  // Use pre-computed outcome if available
  if (match.outcome) return match.outcome;
  // Fallback: parse result string
  const r = match.result.toLowerCase();
  if (r.includes("lost") || r.includes("loss")) return "L";
  if (r.includes("won") || r.includes("win")) return "W";
  return "D";
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function getWinStreak(matches: TeamData["matches"]): number {
  let streak = 0;
  for (const m of matches) {
    const r = getMatchResult(m);
    if (r === "W") streak++;
    else break;
  }
  return streak;
}

export function getRelativeTime(isoString: string): string {
  const now = new Date();
  const updated = new Date(isoString);
  const diffMs = now.getTime() - updated.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}
