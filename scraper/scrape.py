"""
Raptors CricHeroes scraper — uses CricHeroes internal API directly.
No Selenium needed. Works on any platform including GitHub Actions.

Team ID: 5686590

Usage:
    python scrape.py

Output:
    ../public/data.json
"""

import json
import os
import sys
import uuid
from datetime import datetime, date
from urllib.parse import urlparse, parse_qs

from typing import Optional

try:
    import cloudscraper
except ImportError:
    print("[scraper] ERROR: cloudscraper not installed. Run: pip install cloudscraper")
    sys.exit(1)

# ── Config ──────────────────────────────────────────────────────────────────
TEAM_ID      = "5686590"
TEAM_NAME    = "Raptors"
API_BASE     = "https://cricheroes.in"
OUTPUT_PATH  = os.path.join(os.path.dirname(__file__), "..", "public", "data.json")
MAX_MATCH_PAGES = 15   # Safety cap — 10 matches/page = up to 150 matches

# ── HTTP client ──────────────────────────────────────────────────────────────
_scraper = cloudscraper.create_scraper()
_HEADERS = {
    "api-key":     "cr!CkH3r0s",
    "device-type": "web",
    "udid":        str(uuid.uuid4()),
    "User-Agent":  (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept":      "application/json",
}

def _get(path: str, params: Optional[dict] = None) -> dict:
    url = f"{API_BASE}{path}"
    resp = _scraper.get(url, headers=_HEADERS, params=params, timeout=15)
    resp.raise_for_status()
    return resp.json()


# ── Scrapers ─────────────────────────────────────────────────────────────────

def fetch_profile() -> dict:
    d = _get(f"/api/v1/team/get-team-profile-info/{TEAM_ID}")
    if not d.get("status"):
        return {}
    p = d["data"]
    return {
        "team_name": p.get("team_name", TEAM_NAME),
        "logo":      p.get("logo", ""),
        "city":      p.get("city_name", ""),
    }


def fetch_stats() -> dict:
    """Return a clean record dict from team stats."""
    d = _get(f"/api/v1/team/get-team-statistic/{TEAM_ID}")
    raw = {s["title"].lower(): s["value"] for s in (d.get("data") or [])}

    def _int(key: str) -> int:
        v = raw.get(key, 0)
        try:
            return int(v)
        except (ValueError, TypeError):
            return 0

    matches = _int("matches")
    won     = _int("won")
    lost    = _int("lost")
    tie     = _int("tie")
    drawn   = _int("drawn")
    nr      = _int("nr")

    win_pct_raw = raw.get("win", "0%")
    try:
        win_pct = float(str(win_pct_raw).replace("%", ""))
    except ValueError:
        win_pct = round(won / matches * 100, 1) if matches else 0

    return {
        "matches": matches,
        "won":     won,
        "lost":    lost,
        "draw":    tie + drawn,
        "nr":      nr,
        "win_pct": win_pct,
        "raw":     [{"label": s["title"], "value": str(s["value"])}
                    for s in (d.get("data") or [])],
    }


def _match_result_for_team(match: dict) -> str:
    """Return 'W', 'L', or 'D' from Raptors' perspective."""
    winning_id = str(match.get("winning_team_id", ""))
    result     = match.get("match_result", "").lower()
    if "no result" in result or "nr" in result:
        return "NR"
    if not winning_id:
        return "D"
    return "W" if winning_id == TEAM_ID else "L"


def _format_score(match: dict) -> str:
    """Return 'TeamA 123/4 (20 ov) vs TeamB 100/8 (20 ov)' style string."""
    a = match.get("team_a_summary", "")
    b = match.get("team_b_summary", "")
    name_a = match.get("team_a", "")
    name_b = match.get("team_b", "")
    if a and b:
        return f"{name_a} {a} vs {name_b} {b}"
    summary = match.get("match_summary", {}).get("summary", "")
    return summary


def _match_date(match: dict) -> Optional[str]:
    raw = match.get("match_start_time") or match.get("match_end_time")
    if not raw:
        return None
    try:
        return raw[:10]   # "YYYY-MM-DD"
    except Exception:
        return None


def _scorecard_url(match_id: int) -> str:
    return f"https://cricheroes.in/scorecard/{match_id}/scorecard"


def fetch_matches() -> list:
    """Paginate through all matches and return parsed list (newest first)."""
    all_matches = []
    path   = f"/api/v1/team/get-team-match/{TEAM_ID}"
    params: dict = {}

    for page_num in range(1, MAX_MATCH_PAGES + 1):
        print(f"  [matches] page {page_num}...", end=" ", flush=True)
        d = _get(path, params)
        batch = d.get("data") or []
        print(f"{len(batch)} items")

        for m in batch:
            if m.get("status") != "past":
                continue
            outcome = _match_result_for_team(m)
            if outcome == "NR":
                continue   # skip no-result matches from form/record

            opp = m["team_b"] if m["team_a_id"] == int(TEAM_ID) else m["team_a"]
            summary = (m.get("match_summary") or {}).get("summary", "")

            all_matches.append({
                "match_id":   m["match_id"],
                "tournament": m.get("tournament_name", ""),
                "round":      m.get("tournament_round_name", ""),
                "info":       f"Raptors vs {opp}",
                "opponent":   opp,
                "score":      _format_score(m),
                "result":     summary or (
                    f"{'Won' if outcome == 'W' else 'Lost'} by {m.get('win_by','')}"
                    if m.get("win_by") else outcome
                ),
                "outcome":    outcome,          # W / L / D
                "url":        _scorecard_url(m["match_id"]),
                "venue":      m.get("ground_name", ""),
                "match_date": _match_date(m),
                "ball_type":  m.get("ball_type", ""),
            })

        # Follow pagination
        next_url = (d.get("page") or {}).get("next", "")
        if not next_url:
            break
        parsed = urlparse(next_url)
        params = {k: v[0] for k, v in parse_qs(parsed.query).items()}
        path   = f"/api/v1{parsed.path}"

    return all_matches


def fetch_players() -> list:
    d = _get(f"/api/v1/team/get-team-member/{TEAM_ID}")
    members = (d.get("data") or {}).get("members") or []
    result = []
    skill_label = {"BAT": "Batsman", "BOWL": "Bowler", "ALL": "All-Rounder",
                   "WK": "Wicket-Keeper", "WK-BAT": "Wicket-Keeper Batsman"}
    for m in members:
        skill = m.get("player_skill", "")
        result.append({
            "player_id":      m.get("player_id", 0),
            "name":           m.get("name", ""),
            "sub_title":      skill_label.get(skill, skill),
            "profile_url":    f"https://cricheroes.in/player-profile/{m.get('player_id', '')}/stats",
            "profile_pic_url": m.get("profile_photo", ""),
            "is_captain":     bool(m.get("is_captain")),
            "is_verified":    bool(m.get("is_verified")),
        })
    return result


def fetch_leaderboard() -> dict:
    def _parse(endpoint: str, stat_key: str, label: str) -> list:
        all_entries = []
        path = endpoint
        params: dict = {}
        while True:
            d = _get(path, params)
            batch = d.get("data") or []
            for e in batch:
                all_entries.append({
                    "player_id":      e.get("player_id", 0),
                    "player_name":    e.get("name", ""),
                    "stat":           str(e.get(stat_key, "")),
                    "profile_pic_url": e.get("profile_photo", ""),
                    "rank":           e.get("rank", 0),
                    "profile":        label.upper(),
                })
            next_url = (d.get("page") or {}).get("next", "")
            if not next_url:
                break
            parsed = urlparse(next_url)
            params = {k: v[0] for k, v in parse_qs(parsed.query).items()}
            path   = f"/api/v1{parsed.path}"
        return all_entries

    batting = _parse(
        f"/api/v1/leaderboard/get-team-batting-leaderboard/{TEAM_ID}",
        "total_runs", "BATTING"
    )
    bowling = _parse(
        f"/api/v1/leaderboard/get-team-bowling-leaderboard/{TEAM_ID}",
        "total_wickets", "BOWLING"
    )
    fielding = _parse(
        f"/api/v1/leaderboard/get-team-fielding-leaderboard/{TEAM_ID}",
        "total_dismissal", "FIELDING"
    )

    # Enrich stat labels
    for e in batting:
        e["stat"] = f"{e['stat']} runs"
    for e in bowling:
        e["stat"] = f"{e['stat']} wkts"
    for e in fielding:
        e["stat"] = f"{e['stat']} dismissals"

    return {"batting": batting, "bowling": bowling, "fielding": fielding}


def compute_form(matches: list, n: int = 5) -> list:
    """Last N outcomes (newest first), only W/L/D."""
    return [m["outcome"] for m in matches[:n] if m["outcome"] in ("W", "L", "D")]


# ── Main ─────────────────────────────────────────────────────────────────────

def main():
    print(f"[scraper] Raptors CricHeroes — team {TEAM_ID}")
    print("[scraper] Fetching profile...")
    profile = fetch_profile()

    print("[scraper] Fetching stats...")
    stats   = fetch_stats()

    print("[scraper] Fetching matches (paginated)...")
    matches = fetch_matches()
    print(f"  → {len(matches)} completed matches fetched")

    print("[scraper] Fetching players...")
    players = fetch_players()
    print(f"  → {len(players)} players")

    print("[scraper] Fetching leaderboard...")
    leaderboard = fetch_leaderboard()
    print(f"  → bat={len(leaderboard['batting'])} bowl={len(leaderboard['bowling'])} field={len(leaderboard['fielding'])}")

    form = compute_form(matches)

    payload = {
        "team_name":   profile.get("team_name", TEAM_NAME),
        "team_id":     TEAM_ID,
        "logo":        profile.get("logo", ""),
        "city":        profile.get("city", ""),
        "last_updated": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
        "record": {
            "matches": stats["matches"],
            "won":     stats["won"],
            "lost":    stats["lost"],
            "draw":    stats["draw"],
            "nr":      stats["nr"],
            "win_pct": stats["win_pct"],
        },
        "form":       form,
        "players":    players,
        "matches":    matches,
        "stats":      stats["raw"],
        "leaderboard": leaderboard,
    }

    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2, ensure_ascii=False)

    print(f"\n[scraper] ✓ Done → {OUTPUT_PATH}")
    print(f"  record : {stats['won']}W / {stats['lost']}L / {stats['draw']}D  ({stats['win_pct']}% win)")
    print(f"  form   : {form}")


if __name__ == "__main__":
    main()
