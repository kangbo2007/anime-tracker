"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ProgressMarker({ animeId, userId, totalEpisodes }: {
  animeId: string;
  userId?: string;
  totalEpisodes: number;
}) {
  const [episode, setEpisode] = useState(0);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (!userId) return null;

  const handleMark = async () => {
    if (episode < 1 || episode > totalEpisodes) return;
    setLoading(true);
    await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ animeId, episode, isAuto: false }),
    });
    setLoading(false);
    router.refresh();
  };

  return (
    <div className="flex items-center gap-2">
      <select
        value={episode}
        onChange={(e) => setEpisode(parseInt(e.target.value))}
        className="px-2 py-1.5 text-sm border rounded-md"
      >
        <option value={0}>标记进度</option>
        {Array.from({ length: totalEpisodes }, (_, i) => i + 1).map((n) => (
          <option key={n} value={n}>第{n}集</option>
        ))}
      </select>
      <button
        onClick={handleMark}
        disabled={loading || episode === 0}
        className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50"
      >
        {loading ? "..." : "标记"}
      </button>
    </div>
  );
}
