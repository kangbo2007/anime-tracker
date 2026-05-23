import os
import json
import time
from contextlib import contextmanager
from dotenv import load_dotenv

load_dotenv()

DB_URL = os.getenv("DATABASE_URL", "")
DB_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "..", "web", "prisma", "dev.db",
)

_is_pg = DB_URL.startswith("postgres://") or DB_URL.startswith("postgresql://")
_pg_conn = None


@contextmanager
def get_connection():
    if _is_pg:
        import psycopg2
        conn = psycopg2.connect(DB_URL)
        try:
            yield conn
        finally:
            conn.close()
    else:
        import sqlite3
        conn = sqlite3.connect(DB_PATH)
        try:
            yield conn
        finally:
            conn.close()


def _placeholder(n: int) -> str:
    return "%s" if _is_pg else "?"


def _now_expr() -> str:
    return "NOW()" if _is_pg else "datetime('now')"


def upsert_anime_ranking(anime_id: str, raw_data: dict) -> None:
    ph = _placeholder(0)
    with get_connection() as conn:
        cursor = conn.cursor()
        ranking_id = f"ar_{anime_id}_{time.time()}"
        cursor.execute(
            f"INSERT INTO anime_rankings (id, anime_id, raw_data, calculated_at) VALUES ({ph}, {ph}, {ph}, {_now_expr()})",
            (ranking_id, anime_id, json.dumps(raw_data, ensure_ascii=False)),
        )
        conn.commit()


def upsert_anime(data: dict) -> str:
    """Insert or update anime entry. Returns the anime id."""
    ph = _placeholder(0)
    title = data["title"]
    season = data.get("season", "SPRING")
    year = data.get("year", 2026)

    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            f"SELECT id FROM animes WHERE title = {ph} AND season = {ph} AND year = {ph}",
            (title, season, year),
        )
        row = cursor.fetchone()

        if row:
            anime_id = row[0]
            cursor.execute(
                f"""UPDATE animes SET
                    title_jp = COALESCE({ph}, title_jp),
                    cover = COALESCE({ph}, cover),
                    broadcast_day = COALESCE({ph}, broadcast_day),
                    broadcast_time = COALESCE({ph}, broadcast_time),
                    synopsis = COALESCE({ph}, synopsis),
                    updated_at = {_now_expr()}
                WHERE id = {ph}""",
                (
                    data.get("title_jp"),
                    data.get("cover"),
                    data.get("broadcast_day"),
                    data.get("broadcast_time"),
                    data.get("synopsis"),
                    anime_id,
                ),
            )
        else:
            anime_id = f"a_{title}_{season}_{year}"
            anime_id = anime_id.replace(" ", "_").replace("'", "").replace('"', "")[:50]
            cursor.execute(
                f"""INSERT INTO animes (id, title, title_jp, cover, season, year, broadcast_day, broadcast_time, synopsis, is_movie, created_at, updated_at)
                VALUES ({ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {_now_expr()}, {_now_expr()})""",
                (
                    anime_id,
                    title,
                    data.get("title_jp"),
                    data.get("cover"),
                    season,
                    year,
                    data.get("broadcast_day"),
                    data.get("broadcast_time"),
                    data.get("synopsis"),
                    False,
                ),
            )

        conn.commit()
        return anime_id


def upsert_play_sources(anime_id: str, sources: list[dict]) -> None:
    """Replace play sources for an anime. Each source: {source_name, url, type}."""
    ph = _placeholder(0)
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(f"DELETE FROM play_sources WHERE anime_id = {ph}", (anime_id,))
        for src in sources:
            src_id = f"ps_{anime_id}_{src['source_name']}_{time.time()}"
            cursor.execute(
                f"INSERT INTO play_sources (id, anime_id, source_name, url, type) VALUES ({ph}, {ph}, {ph}, {ph}, {ph})",
                (
                    src_id,
                    anime_id,
                    src.get("source_name", ""),
                    src.get("url", ""),
                    src.get("type", "redirect"),
                ),
            )
        conn.commit()


def fetch_animes() -> list[dict]:
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id, title, title_jp FROM animes")
        rows = cursor.fetchall()
        return [{"id": row[0], "title": row[1], "title_jp": row[2]} for row in rows]


def batch_upsert_animes(items: list[dict]) -> list[dict]:
    """Batch upsert anime entries in a single connection. Returns list of {title, anime_id}."""
    ph = _placeholder(0)
    results = []
    with get_connection() as conn:
        cursor = conn.cursor()
        for data in items:
            title = data["title"]
            season = data.get("season", "SPRING")
            year = data.get("year", 2026)

            cursor.execute(
                f"SELECT id FROM animes WHERE title = {ph} AND season = {ph} AND year = {ph}",
                (title, season, year),
            )
            row = cursor.fetchone()

            if row:
                anime_id = row[0]
                cursor.execute(
                    f"""UPDATE animes SET
                        title_jp = COALESCE({ph}, title_jp),
                        cover = COALESCE({ph}, cover),
                        broadcast_day = COALESCE({ph}, broadcast_day),
                        broadcast_time = COALESCE({ph}, broadcast_time),
                        synopsis = COALESCE({ph}, synopsis),
                        updated_at = {_now_expr()}
                    WHERE id = {ph}""",
                    (
                        data.get("title_jp"),
                        data.get("cover"),
                        data.get("broadcast_day"),
                        data.get("broadcast_time"),
                        data.get("synopsis"),
                        anime_id,
                    ),
                )
            else:
                anime_id = f"a_{title}_{season}_{year}"
                anime_id = anime_id.replace(" ", "_").replace("'", "").replace('"', "")[:50]
                cursor.execute(
                    f"""INSERT INTO animes (id, title, title_jp, cover, season, year, broadcast_day, broadcast_time, synopsis, is_movie, created_at, updated_at)
                    VALUES ({ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {_now_expr()}, {_now_expr()})""",
                    (
                        anime_id,
                        title,
                        data.get("title_jp"),
                        data.get("cover"),
                        season,
                        year,
                        data.get("broadcast_day"),
                        data.get("broadcast_time"),
                        data.get("synopsis"),
                        False,
                    ),
                )

            # Batch play sources
            sources = data.get("play_sources", [])
            if sources:
                cursor.execute(f"DELETE FROM play_sources WHERE anime_id = {ph}", (anime_id,))
                for src in sources:
                    src_id = f"ps_{anime_id}_{src['source_name']}_{time.time()}"
                    cursor.execute(
                        f"INSERT INTO play_sources (id, anime_id, source_name, url, type) VALUES ({ph}, {ph}, {ph}, {ph}, {ph})",
                        (
                            src_id,
                            anime_id,
                            src.get("source_name", ""),
                            src.get("url", ""),
                            src.get("type", "redirect"),
                        ),
                    )

            results.append({"title": title, "anime_id": anime_id})
        conn.commit()
    return results
