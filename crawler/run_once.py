"""GitHub Actions 单次运行入口：同步新番数据 + 抓取排名"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from src.main import sync_anime_from_yucwiki, crawl_rankings

if __name__ == "__main__":
    print("=== Syncing anime from yuc.wiki ===")
    sync_anime_from_yucwiki()
    print()
    print("=== Crawling rankings ===")
    crawl_rankings()
    print()
    print("Done.")
