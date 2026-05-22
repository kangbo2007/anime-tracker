import os
import sqlite3
import json
from dotenv import load_dotenv

load_dotenv()

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "..", "web", "prisma", "dev.db")


def get_connection():
    return sqlite3.connect(DB_PATH)


def upsert_anime_ranking(anime_id: str, raw_data: dict) -> None:
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO anime_rankings (id, anime_id, raw_data) VALUES (?, ?, ?)",
            (f"ar_{anime_id}_{__import__('time').time()}", anime_id, json.dumps(raw_data, ensure_ascii=False)),
        )
        conn.commit()
    finally:
        conn.close()
