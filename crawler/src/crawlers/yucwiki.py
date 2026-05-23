"""长门有c (yuc.wiki) 爬虫：抓取新番表信息，包括番剧名、封面、播出时间、开播日期、播放源"""
import re
import httpx
from bs4 import BeautifulSoup

USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
BASE_URL = "https://yuc.wiki"

WEEKDAY_MAP: dict[str, str] = {
    "周一": "MONDAY",
    "周二": "TUESDAY",
    "周三": "WEDNESDAY",
    "周四": "THURSDAY",
    "周五": "FRIDAY",
    "周六": "SATURDAY",
    "周日": "SUNDAY",
}

SEASON_MONTHS: dict[int, str] = {
    1: "WINTER", 2: "WINTER", 3: "WINTER",
    4: "SPRING", 5: "SPRING", 6: "SPRING",
    7: "SUMMER", 8: "SUMMER", 9: "SUMMER",
    10: "FALL", 11: "FALL", 12: "FALL",
}

SEASON_PATTERN = re.compile(r"/(\d{4})(\d{2})/")
FLOAT_RE = re.compile(r"float\s*:\s*left")


def _parse_season(path: str) -> tuple[str, int]:
    m = SEASON_PATTERN.search(path)
    if not m:
        return ("SPRING", 2026)
    year = int(m.group(1))
    month = int(m.group(2))
    season = SEASON_MONTHS.get(month, "SPRING")
    return season, year


def _clean_title(td) -> str:
    """Extract title from <td> with possible <br> tags, joining lines."""
    parts = []
    for child in td.children:
        if isinstance(child, str):
            text = child.strip()
            if text:
                parts.append(text)
        elif child.name == "br":
            continue
        else:
            text = child.get_text(strip=True)
            if text:
                parts.append(text)
    return "".join(parts)


def fetch_season(path: str = "/202604/") -> list[dict]:
    """抓取指定季节页面的新番数据"""
    url = f"{BASE_URL}{path}"
    resp = httpx.get(url, headers={"User-Agent": USER_AGENT}, timeout=30)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "html.parser")

    season, year = _parse_season(path)
    results: list[dict] = []

    for td in soup.find_all("td", class_="date2"):
        day_text = td.get_text(strip=True)
        day_name = day_text.split()[0] if day_text else ""
        if day_name not in WEEKDAY_MAP:
            continue
        current_day = WEEKDAY_MAP[day_name]

        header_table = td.find_parent("table")
        if not header_table:
            continue
        header_div = header_table.find_parent("div")
        if not header_div:
            continue
        entries_div = header_div.find_next_sibling("div")
        if not entries_div:
            continue

        for anime_div in entries_div.find_all("div", style=FLOAT_RE):
            data = _parse_anime_entry(anime_div, current_day, season, year)
            if data:
                results.append(data)

    return results


def _parse_anime_entry(div, broadcast_day: str, season: str, year: int) -> dict | None:
    div_date = div.find("div", class_="div_date")
    if not div_date:
        return None

    time_p = div_date.find("p", class_="imgtext4")
    date_p = div_date.find("p", class_="imgep2")
    img = div_date.find("img")

    broadcast_time = time_p.get_text(strip=True).rstrip("~") if time_p else ""
    start_date = date_p.get_text(strip=True).rstrip("~") if date_p else ""
    cover = img.get("data-src", "") if img else ""

    table = div.find("table")
    if not table:
        return None

    title_td = table.find("td", class_=re.compile(r"date_title_"))
    if not title_td:
        return None

    title = _clean_title(title_td)

    play_sources: list[dict] = []
    for tr in table.find_all("tr", class_="tr_area"):
        for a in tr.find_all("a", href=True):
            href = a["href"]
            area_p = a.find("p", class_="area")
            region = area_p.get_text(strip=True) if area_p else ""
            source_name = _map_source_name(region, href)
            play_sources.append({
                "source_name": source_name,
                "url": href,
                "type": "redirect",
            })

    return {
        "title": title,
        "cover": cover,
        "broadcast_day": broadcast_day,
        "broadcast_time": broadcast_time,
        "start_date": start_date,
        "season": season,
        "year": year,
        "play_sources": play_sources,
    }


def _map_source_name(region: str, url: str) -> str:
    if region == "环大陆":
        return "Crunchyroll" if "crunchyroll.com" in url else "海外"
    if region == "港台":
        return "巴哈姆特" if "gamer.com.tw" in url else "港台"
    if region in ("大陆", "china"):
        return "B站" if "bilibili" in url else "大陆"
    return region or "其他"


def crawl_all(path: str = "/202604/") -> list[dict]:
    """爬虫入口：返回结构化新番数据"""
    return fetch_season(path)
