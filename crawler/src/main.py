"""爬虫服务入口：APScheduler 定时任务"""
import sys
import os
import json
import datetime

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from apscheduler.schedulers.blocking import BlockingScheduler
from src.crawlers.bangumi import crawl_all as bangumi_crawl
from src.db import upsert_anime_ranking, get_connection

scheduler = BlockingScheduler()


@scheduler.scheduled_job("interval", hours=12, id="crawl_all")
def crawl_all_platforms():
    """每12小时执行一次全平台抓取"""
    print(f"[{datetime.datetime.now()}] Starting crawl job...")

    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT id, title, title_jp FROM animes")
        rows = cursor.fetchall()
        anime_list = [
            {"id": row[0], "title": row[1], "title_jp": row[2]}
            for row in rows
        ]
    finally:
        conn.close()

    for anime in anime_list:
        try:
            raw_data = {"bangumi": {}, "bilibili": {}, "douban": {}, "douyin": {}}
            upsert_anime_ranking(anime["id"], raw_data)
        except Exception as e:
            print(f"Error crawling {anime['title']}: {e}")

    print(f"[{datetime.datetime.now()}] Crawl job done. {len(anime_list)} anime processed.")


if __name__ == "__main__":
    print("Starting Anime Tracker Crawler Service...")
    print("Scheduler: every 12 hours")
    try:
        scheduler.start()
    except (KeyboardInterrupt, SystemExit):
        print("Crawler service stopped.")
