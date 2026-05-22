"""豆瓣爬虫：抓取番剧评分、评论数、在看人数"""
import httpx
from bs4 import BeautifulSoup
import re

DOUBAN_SEARCH_API = "https://www.douban.com/search"
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"


def search_anime(keyword: str) -> list[dict]:
    """搜索豆瓣番剧条目"""
    resp = httpx.get(
        DOUBAN_SEARCH_API,
        params={"cat": "1002", "q": keyword},
        headers={"User-Agent": USER_AGENT},
        timeout=30,
    )
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "html.parser")
    results = []
    for item in soup.select(".result"):
        title_el = item.select_one(".title a")
        rating_el = item.select_one(".rating_nums")
        if title_el:
            href = title_el.get("href", "")
            douban_id = re.search(r"subject/(\d+)", href)
            results.append({
                "title": title_el.text.strip(),
                "douban_id": douban_id.group(1) if douban_id else "",
                "rating": float(rating_el.text) if rating_el else 0,
            })
    return results


def get_anime_detail(douban_id: str) -> dict:
    """获取豆瓣番剧详细评分和讨论数据"""
    resp = httpx.get(
        f"https://api.douban.com/v2/movie/{douban_id}",
        headers={"User-Agent": USER_AGENT},
        timeout=30,
    )
    resp.raise_for_status()
    data = resp.json()
    rating = data.get("rating", {})
    return {
        "score": rating.get("average", 0) or 0,
        "score_count": rating.get("numRaters", 0) or 0,
        "wish_count": data.get("wish_count", 0) or 0,
        "comments_count": data.get("comments_count", 0) or 0,
        "reviews_count": data.get("reviews_count", 0) or 0,
    }
