export interface Player {
  player_id?: number;
  name: string;
  sub_title: string;
  profile_url: string;
  profile_pic_url: string;
  is_captain?: boolean;
  is_verified?: boolean;
}

export interface TeamStat {
  label: string;
  value: string;
}

export interface Match {
  match_id?: number;
  tournament: string;
  round?: string;
  info: string;
  opponent?: string;
  score: string;
  result: string;
  outcome?: "W" | "L" | "D";
  url: string;
  venue: string;
  match_date: string | null;
  ball_type?: string;
}

export interface LeaderboardStat {
  player_id?: number;
  player_name: string;
  stat: string;
  profile: string;
  profile_pic_url?: string;
  rank?: number;
}

export interface TeamRecord {
  matches: number;
  won: number;
  lost: number;
  draw: number;
  nr?: number;
  win_pct: number;
}

export interface TeamData {
  team_name: string;
  team_id: string;
  logo: string;
  city?: string;
  last_updated: string;
  record: TeamRecord;
  form: ("W" | "L" | "D")[];
  players: Player[];
  matches: Match[];
  stats: TeamStat[];
  leaderboard: {
    batting: LeaderboardStat[];
    bowling: LeaderboardStat[];
    fielding: LeaderboardStat[];
  };
}
