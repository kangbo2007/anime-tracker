import { db } from "./db";

interface RankingItem {
  id: string;
  title: string;
  titleJp: string | null;
  cover: string | null;
  score: number;
  breakdown: Record<string, number | string>;
}

function normalizeComponent(value: number, scale: number): number {
  if (value <= 0) return 0;
  return Math.min(value / scale, 100);
}

function parseRaw(rawData: string | null): Record<string, unknown> {
  if (!rawData) return {};
  return JSON.parse(rawData) as Record<string, unknown>;
}

function get(raw: Record<string, unknown>, path: string[]): number {
  let v: unknown = raw;
  for (const key of path) {
    if (v == null || typeof v !== "object") return 0;
    v = (v as Record<string, unknown>)[key];
  }
  return typeof v === "number" ? v : 0;
}

export async function calculateHeatRanking(): Promise<RankingItem[]> {
  const animeList = await db.anime.findMany({
    include: { rankings: { orderBy: { calculatedAt: "desc" }, take: 1 } },
  });

  const results = animeList.map((anime) => {
    const raw = parseRaw(anime.rankings[0]?.rawData);

    const bV = get(raw, ["bilibili", "total_views"]);
    const bilibiliHeat = bV ? normalizeComponent(
      bV * 0.3 +
        get(raw, ["bilibili", "total_likes"]) * 0.15 +
        get(raw, ["bilibili", "total_coins"]) * 0.15 +
        get(raw, ["bilibili", "total_favorites"]) * 0.15 +
        get(raw, ["bilibili", "total_comments"]) * 0.1 +
        get(raw, ["bilibili", "total_danmakus"]) * 0.1 +
        get(raw, ["bilibili", "total_shares"]) * 0.05,
      1000000
    ) : 0;

    const douyinHeat = get(raw, ["douyin", "topic_views"])
      ? normalizeComponent(get(raw, ["douyin", "topic_views"]), 10000000)
      : 0;

    const bangumiHeat = get(raw, ["bangumi", "discussion_count"])
      ? normalizeComponent(get(raw, ["bangumi", "discussion_count"]) + get(raw, ["bangumi", "comment_count"]), 1000)
      : 0;

    const doubanHeat = get(raw, ["douban", "comments_count"])
      ? normalizeComponent(get(raw, ["douban", "comments_count"]) + get(raw, ["douban", "reviews_count"]), 1000)
      : 0;

    const score = bilibiliHeat * 0.40 + douyinHeat * 0.22 + bangumiHeat * 0.20 + doubanHeat * 0.18;

    return {
      id: anime.id,
      title: anime.title,
      titleJp: anime.titleJp,
      cover: anime.cover,
      score: Math.round(score * 100),
      breakdown: { bilibili: bilibiliHeat, douyin: douyinHeat, bangumi: bangumiHeat, douban: doubanHeat },
    };
  });

  return results.sort((a, b) => b.score - a.score);
}

export async function calculateScoreRanking(): Promise<RankingItem[]> {
  const animeList = await db.anime.findMany({
    include: {
      rankings: { orderBy: { calculatedAt: "desc" }, take: 1 },
      userRatings: { select: { rating: true } },
    },
  });

  const results = animeList.map((anime) => {
    const raw = parseRaw(anime.rankings[0]?.rawData);

    const bangumiScore = get(raw, ["bangumi", "score"]);
    const bangumiCount = get(raw, ["bangumi", "score_count"]);
    const doubanScore = get(raw, ["douban", "score"]) * 2;
    const doubanCount = get(raw, ["douban", "score_count"]);
    const bilibiliScore = get(raw, ["bilibili", "score"]) * 2;

    const siteRatings = anime.userRatings;
    const siteScore =
      siteRatings.length > 0
        ? (siteRatings.reduce((s, r) => s + r.rating, 0) / siteRatings.length) * 2
        : 0;

    const totalCount = bangumiCount + doubanCount;
    let score: number;
    if (bangumiCount < 50 && totalCount > 0) {
      const bangumiWeight = 0.55 * (bangumiCount / totalCount);
      const doubanWeight = 0.20 + (0.55 - bangumiWeight);
      score = bangumiScore * bangumiWeight + doubanScore * doubanWeight + bilibiliScore * 0.10 + siteScore * 0.15;
    } else {
      score = bangumiScore * 0.55 + doubanScore * 0.20 + bilibiliScore * 0.10 + siteScore * 0.15;
    }

    return {
      id: anime.id,
      title: anime.title,
      titleJp: anime.titleJp,
      cover: anime.cover,
      score: Math.round(score * 10) / 10,
      breakdown: { bangumi: bangumiScore, douban: doubanScore, bilibili: bilibiliScore, site: siteScore },
    };
  });

  return results.sort((a, b) => b.score - a.score);
}

export async function calculateViewRanking(): Promise<RankingItem[]> {
  const animeList = await db.anime.findMany({
    include: {
      rankings: { orderBy: { calculatedAt: "desc" }, take: 1 },
      watchProgress: { select: { currentEpisode: true } },
      userFollows: { select: { id: true } },
    },
  });

  const results = animeList.map((anime) => {
    const raw = parseRaw(anime.rankings[0]?.rawData);

    const siteViews = anime.watchProgress.reduce((s, p) => s + p.currentEpisode, 0);
    const siteFollows = anime.userFollows.length;
    const bilibiliViews = get(raw, ["bilibili", "views"]);
    const bangumiWatching = get(raw, ["bangumi", "watching_count"]);
    const doubanWishing = get(raw, ["douban", "wish_count"]);

    const hasCopyright = bilibiliViews > 0;
    let siteWeight = 0.40, biliWeight = 0.30, banguWeight = 0.18, doubanWeight = 0.12;
    if (!hasCopyright) {
      siteWeight = 0.55; biliWeight = 0; banguWeight = 0.28; doubanWeight = 0.17;
    }

    const score =
      normalizeComponent(siteViews + siteFollows * 10, 5000) * siteWeight +
      normalizeComponent(bilibiliViews, 10000000) * biliWeight +
      normalizeComponent(bangumiWatching, 5000) * banguWeight +
      normalizeComponent(doubanWishing, 5000) * doubanWeight;

    return {
      id: anime.id, title: anime.title, titleJp: anime.titleJp, cover: anime.cover,
      score: Math.round(score * 100),
      breakdown: { site: siteViews, bilibili: bilibiliViews, bangumi: bangumiWatching, douban: doubanWishing },
    };
  });

  return results.sort((a, b) => b.score - a.score);
}

export async function calculateRetentionRanking(): Promise<RankingItem[]> {
  const animeList = await db.anime.findMany({
    include: {
      watchProgress: { select: { currentEpisode: true } },
    },
  });

  const results = animeList.map((anime) => {
    const total = anime.watchProgress.length;
    if (total < 50) {
      return { id: anime.id, title: anime.title, titleJp: anime.titleJp, cover: anime.cover, score: 0, breakdown: { total: 0, sawLatest: 0, rate: 0 } };
    }

    const sawLatest = anime.watchProgress.filter((p) => p.currentEpisode >= anime.currentEpisode).length;
    const retentionRate = (sawLatest / total) * 100;

    return {
      id: anime.id, title: anime.title, titleJp: anime.titleJp, cover: anime.cover,
      score: Math.round(retentionRate * 10) / 10,
      breakdown: { total, sawLatest, rate: Math.round(retentionRate) },
    };
  });

  return results.filter((r) => r.score > 0).sort((a, b) => b.score - a.score);
}

export async function calculateCharacterRanking(): Promise<RankingItem[]> {
  const characters = await db.character.findMany({
    include: { anime: { select: { id: true, title: true, cover: true } } },
    orderBy: { characterScore: "desc" },
    take: 50,
  });

  return characters.map((ch) => ({
    id: ch.anime.id,
    title: `${ch.name} (${ch.anime.title})`,
    titleJp: ch.nameJp,
    cover: ch.avatar || ch.anime.cover,
    score: ch.characterScore || 0,
    breakdown: { character: ch.name },
  }));
}
