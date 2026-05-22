"""抖音爬虫：抓取番剧话题播放量"""
import httpx
import re

USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"


def get_topic_data(keyword: str) -> dict:
    """通过抖音话题搜索获取播放量与视频数"""
    resp = httpx.get(
        "https://www.douyin.com/search/" + keyword,
        params={"type": "general"},
        headers={"User-Agent": USER_AGENT},
        timeout=30,
    )
    resp.raise_for_status()
    text = resp.text

    view_count = 0
    video_count = 0

    match = re.search(r'"play_count":(\d+)', text)
    if match:
        view_count = int(match.group(1))
    match = re.search(r'"aweme_count":(\d+)', text)
    if match:
        video_count = int(match.group(1))

    return {
        "topic_views": view_count,
        "recent_video_count": video_count,
    }
