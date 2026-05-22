"""B站爬虫：抓取番剧播放量、追番人数、社区UGC讨论数据"""
import httpx

USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
BILIBILI_BANGUMI_API = "https://api.bilibili.com/pgc/view/web/season"


def get_bangumi_info(media_id: int) -> dict:
    """通过 media_id 获取B站番剧播放量与追番数据"""
    resp = httpx.get(
        BILIBILI_BANGUMI_API,
        params={"season_id": media_id},
        headers={"User-Agent": USER_AGENT, "Referer": "https://www.bilibili.com"},
        timeout=30,
    )
    resp.raise_for_status()
    data = resp.json()
    result = data.get("result", {})
    stat = result.get("stat", {})
    return {
        "views": stat.get("views", 0),
        "follows": stat.get("followers", 0),
        "danmakus": stat.get("danmakus", 0),
        "score": result.get("rating", {}).get("score", 0) or 0,
        "score_count": result.get("rating", {}).get("count", 0) or 0,
    }


def search_ugc_play_count(keyword: str) -> dict:
    """搜索番剧关键词的UGC稿件统计"""
    resp = httpx.get(
        "https://api.bilibili.com/x/web-interface/search/type",
        params={
            "search_type": "video",
            "keyword": keyword,
            "duration": 4,
            "order": "pubdate",
        },
        headers={"User-Agent": USER_AGENT, "Referer": "https://www.bilibili.com"},
        timeout=30,
    )
    resp.raise_for_status()
    data = resp.json()
    result = data.get("data", {})

    total_views = 0
    total_likes = 0
    total_coins = 0
    total_favorites = 0
    total_shares = 0
    total_comments = 0
    total_danmakus = 0
    count = 0

    for item in result.get("result", []):
        total_views += item.get("play", 0)
        total_likes += item.get("like", 0)
        total_coins += item.get("coin", 0)
        total_favorites += item.get("favorites", 0)
        total_shares += item.get("share", 0)
        total_comments += item.get("review", 0)
        total_danmakus += item.get("danmaku", 0)
        count += 1

    return {
        "video_count": count,
        "total_views": total_views,
        "total_likes": total_likes,
        "total_coins": total_coins,
        "total_favorites": total_favorites,
        "total_shares": total_shares,
        "total_comments": total_comments,
        "total_danmakus": total_danmakus,
    }


def search_character_ugc(character_name: str) -> dict:
    """搜索角色应援稿件数据"""
    return search_ugc_play_count(character_name)
