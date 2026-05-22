"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface RatingItem {
  id: string;
  animeId: string;
  rating: number;
  tags: string[];
  recommend: string;
  createdAt: string;
  anime: {
    title: string;
    cover: string | null;
  };
}

export function RatingHistory() {
  const [ratings, setRatings] = useState<RatingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/ratings")
      .then((r) => r.json())
      .then((data) => setRatings(data.ratings || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-sm text-gray-400 py-4">加载中...</p>;
  }

  if (ratings.length === 0) {
    return <p className="text-sm text-gray-400 py-8 text-center">还没有评分记录</p>;
  }

  return (
    <div className="space-y-3">
      {ratings.map((r) => (
        <Link key={r.id} href={`/anime/${r.animeId}`}
          className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-all">
          <div className="w-10 h-14 bg-gray-100 rounded overflow-hidden flex-shrink-0">
            {r.anime.cover ? <img src={r.anime.cover} className="w-full h-full object-cover" alt="" /> : null}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">{r.anime.title}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-yellow-500 text-sm">{r.rating}★</span>
              {Array.isArray(r.tags) && r.tags.map((tag: string) => (
                <span key={tag} className="text-xs text-gray-400">{tag}</span>
              ))}
            </div>
          </div>
          <span className="text-xs text-gray-400">
            {r.recommend === "recommend" ? "推荐" : r.recommend === "neutral" ? "一般" : "不推荐"}
          </span>
        </Link>
      ))}
    </div>
  );
}
