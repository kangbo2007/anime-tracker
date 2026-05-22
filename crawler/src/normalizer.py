"""将各平台原始数据归一化为统一格式"""

def normalize_score(raw: float, platform: str) -> float:
    """将各平台评分统一为10分制"""
    if platform == "bangumi":
        return raw
    if platform == "douban":
        return raw * 2
    if platform == "bilibili":
        return raw * 2
    return raw
