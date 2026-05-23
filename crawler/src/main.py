"""爬虫服务入口：APScheduler 定时任务"""
import sys
import os
import datetime

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from apscheduler.schedulers.blocking import BlockingScheduler
from src.crawlers.bangumi import crawl_all as bangumi_crawl
from src.crawlers.yucwiki import crawl_all as yucwiki_crawl
from src.db import upsert_anime_ranking, batch_upsert_animes, fetch_animes

scheduler = BlockingScheduler()


def sync_anime_from_yucwiki():
    """从长门有c同步新番信息和播放源"""
    print(f"[{datetime.datetime.now()}] Syncing anime from yuc.wiki...")
    try:
        results = yucwiki_crawl()
        batch_results = batch_upsert_animes(results)
        for r in batch_results:
            print(f"  Synced: {r['title']} -> {r['anime_id']}")
        print(f"[{datetime.datetime.now()}] Yuc.wiki sync done. {len(batch_results)} anime synced.")
    except Exception as e:
        print(f"Yuc.wiki sync error: {e}")


def crawl_rankings():
    """抓取各平台排名数据"""
    print(f"[{datetime.datetime.now()}] Starting ranking crawl...")

    anime_list = fetch_animes()

    if not anime_list:
        print("No anime in database, skipping ranking crawl.")
        return

    for anime in anime_list:
        try:
            raw_data = {"bangumi": {}, "bilibili": {}, "douban": {}, "douyin": {}}

            try:
                bangumi_results = bangumi_crawl([{"bangumi_id": 0, "title": anime["title"]}])
                if bangumi_results:
                    raw_data["bangumi"] = bangumi_results[0]
            except Exception as e:
                print(f"  Bangumi error for {anime['title']}: {e}")

            upsert_anime_ranking(anime["id"], raw_data)
        except Exception as e:
            print(f"Error crawling {anime['title']}: {e}")

    print(f"[{datetime.datetime.now()}] Ranking crawl done. {len(anime_list)} anime processed.")


@scheduler.scheduled_job("interval", hours=12, id="sync_yucwiki")
def job_sync_yucwiki():
    sync_anime_from_yucwiki()


@scheduler.scheduled_job("interval", hours=6, id="crawl_rankings")
def job_crawl_rankings():
    crawl_rankings()


if __name__ == "__main__":
    print("Starting Anime Tracker Crawler Service...")
    print("Jobs: yucwiki sync (12h), ranking crawl (6h)")

    sync_anime_from_yucwiki()
    crawl_rankings()

    try:
        scheduler.start()
    except (KeyboardInterrupt, SystemExit):
        print("Crawler service stopped.")
