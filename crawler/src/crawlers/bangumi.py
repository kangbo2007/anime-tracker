"""Bangumi 爬虫：抓取番剧评分、讨论数、角色列表"""
import httpx
import time

BANGUMI_BASE = "https://api.bgm.tv"
USER_AGENT = "AnimeTracker/0.1 (com.example.animetracker)"


def search_anime(keyword: str) -> list[dict]:
    """搜索番剧"""
    resp = httpx.get(
        f"{BANGUMI_BASE}/search/subject/{keyword}",
        params={"type": 2, "responseGroup": "medium"},
        headers={"User-Agent": USER_AGENT},
        timeout=30,
    )
    resp.raise_for_status()
    data = resp.json()
    results = []
    if "list" in data:
        for item in data["list"]:
            results.append({
                "bangumi_id": item["id"],
                "title": item.get("name", ""),
                "title_jp": item.get("name_cn", ""),
                "score": item.get("rating", {}).get("score", 0),
                "rank": item.get("rating", {}).get("rank", 0),
                "summary": item.get("summary", ""),
            })
    return results


def get_anime_detail(bangumi_id: int) -> dict:
    """获取番剧详细信息"""
    resp = httpx.get(
        f"{BANGUMI_BASE}/subject/{bangumi_id}",
        params={"responseGroup": "large"},
        headers={"User-Agent": USER_AGENT},
        timeout=30,
    )
    resp.raise_for_status()
    data = resp.json()
    return {
        "bangumi_id": data["id"],
        "score": data.get("rating", {}).get("score", 0) or 0,
        "score_count": data.get("rating", {}).get("total", 0) or 0,
        "watching_count": data.get("collection", {}).get("doing", 0) or 0,
        "discussion_count": data.get("topic_count", 0) or 0,
        "comment_count": data.get("comment_count", 0) or 0,
    }


def get_characters(bangumi_id: int) -> list[dict]:
    """获取番剧角色列表"""
    resp = httpx.get(
        f"{BANGUMI_BASE}/subject/{bangumi_id}/persons",
        params={"type": 2},
        headers={"User-Agent": USER_AGENT},
        timeout=30,
    )
    resp.raise_for_status()
    data = resp.json()
    characters = []
    for item in data.get("crt", []):
        characters.append({
            "name": item.get("name", ""),
            "name_jp": item.get("name_jp", ""),
            "cv": item.get("actors", [{}])[0].get("name", "") if item.get("actors") else "",
            "avatar": item.get("images", {}).get("grid", ""),
        })
    return characters


def crawl_all(anime_list: list[dict]) -> list[dict]:
    """批量爬取番剧数据"""
    results = []
    for anime in anime_list:
        try:
            detail = get_anime_detail(anime["bangumi_id"])
            detail["episodes"] = anime.get("episodes", 0)
            results.append(detail)
            time.sleep(1)
        except Exception as e:
            print(f"Bangumi crawl error for {anime.get('title', 'unknown')}: {e}")
    return results
