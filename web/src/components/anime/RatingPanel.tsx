"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RatingStars } from "./RatingStars";

const TAGS = ["神作", "佳作", "还行", "劣作", "治愈", "致郁", "热血", "搞笑", "感动", "悬疑", "日常"];

interface RatingPanelProps {
  animeId: string;
  userId?: string;
}

export function RatingPanel({ animeId, userId }: RatingPanelProps) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  if (!userId) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg text-center">
        <p className="text-sm text-gray-500">请登录后评分</p>
      </div>
    );
  }

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const getRecommend = (star: number) => {
    if (star >= 4) return "recommend";
    if (star >= 3) return "neutral";
    if (star > 0) return "not_recommend";
    return "";
  };

  const handleSubmit = async () => {
    if (rating === 0) return;
    setLoading(true);
    await fetch("/api/ratings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        animeId,
        rating,
        tags: selectedTags,
        recommend: getRecommend(rating),
      }),
    });
    setLoading(false);
    router.refresh();
  };

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <h3 className="text-lg font-semibold">我的评分</h3>
      <RatingStars value={rating} onChange={setRating} />
      <div>
        <p className="text-sm text-gray-500 mb-1">标签（可选）</p>
        <div className="flex flex-wrap gap-1.5">
          {TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`px-2 py-0.5 text-xs rounded-full border ${
                selectedTags.includes(tag)
                  ? "bg-indigo-100 text-indigo-700 border-indigo-300"
                  : "bg-white text-gray-500 border-gray-200 hover:border-indigo-300"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
      {rating > 0 && (
        <p className="text-xs text-gray-400">
          推荐：{getRecommend(rating) === "recommend" ? "推荐" : getRecommend(rating) === "neutral" ? "一般" : "不推荐"}
          （根据星级自动判定）
        </p>
      )}
      <button
        onClick={handleSubmit}
        disabled={loading || rating === 0}
        className="px-4 py-1.5 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "提交中..." : "提交评分"}
      </button>
    </div>
  );
}
