"use client";

import { useState } from "react";
import { WeekGrid } from "./WeekGrid";
import { GridView } from "./GridView";

interface Anime {
  id: string;
  title: string;
  titleJp: string | null;
  cover: string | null;
  broadcastDay: string | null;
  broadcastTime: string | null;
  currentEpisode: number;
  isMovie: boolean;
  playSources: { isAvailable: boolean }[];
}

export function CalendarView({ anime }: { anime: Anime[] }) {
  const [viewMode, setViewMode] = useState<"week" | "grid">("week");
  const [tab, setTab] = useState<"tv" | "movie">("tv");

  const filteredAnime = anime.filter((a) =>
    tab === "movie" ? a.isMovie : !a.isMovie
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setTab("tv")}
            className={`px-4 py-1.5 text-sm rounded-md ${
              tab === "tv" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600"
            }`}
          >
            TV新番
          </button>
          <button
            onClick={() => setTab("movie")}
            className={`px-4 py-1.5 text-sm rounded-md ${
              tab === "movie" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600"
            }`}
          >
            动画电影
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("week")}
            className={`px-3 py-1.5 text-sm rounded-md ${
              viewMode === "week" ? "bg-gray-200 text-gray-800" : "text-gray-500"
            }`}
          >
            周历
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`px-3 py-1.5 text-sm rounded-md ${
              viewMode === "grid" ? "bg-gray-200 text-gray-800" : "text-gray-500"
            }`}
          >
            网格
          </button>
        </div>
      </div>

      {tab === "tv" && viewMode === "week" && <WeekGrid anime={filteredAnime} />}
      {(tab === "movie" || viewMode === "grid") && <GridView anime={filteredAnime} />}
    </div>
  );
}
