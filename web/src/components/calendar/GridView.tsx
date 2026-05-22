"use client";

import { AnimeCard } from "./AnimeCard";

interface Anime {
  id: string;
  title: string;
  titleJp: string | null;
  cover: string | null;
  broadcastTime: string | null;
  currentEpisode: number;
  playSources: { isAvailable: boolean }[];
}

export function GridView({ anime }: { anime: Anime[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
      {anime.map((a) => (
        <AnimeCard
          key={a.id}
          id={a.id}
          title={a.title}
          titleJp={a.titleJp}
          cover={a.cover}
          broadcastTime={a.broadcastTime}
          currentEpisode={a.currentEpisode}
          score={null}
          hasSource={a.playSources.length > 0}
        />
      ))}
    </div>
  );
}
