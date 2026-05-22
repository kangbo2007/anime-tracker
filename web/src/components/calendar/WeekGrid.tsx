import { AnimeCard } from "./AnimeCard";

const DAY_LABELS: Record<string, string> = {
  MONDAY: "周一", TUESDAY: "周二", WEDNESDAY: "周三",
  THURSDAY: "周四", FRIDAY: "周五", SATURDAY: "周六", SUNDAY: "周日",
};

interface Anime {
  id: string;
  title: string;
  titleJp: string | null;
  cover: string | null;
  broadcastDay: string | null;
  broadcastTime: string | null;
  currentEpisode: number;
  playSources: { isAvailable: boolean }[];
}

export function WeekGrid({ anime }: { anime: Anime[] }) {
  const byDay: Record<string, Anime[]> = {};
  for (const day of Object.keys(DAY_LABELS)) {
    byDay[day] = anime.filter((a) => a.broadcastDay === day);
  }

  return (
    <div className="grid grid-cols-7 gap-3">
      {Object.entries(DAY_LABELS).map(([day, label]) => (
        <div key={day} className="space-y-2">
          <div className="text-sm font-medium text-gray-500 text-center py-1 border-b">
            {label}
          </div>
          {byDay[day].length === 0 && (
            <p className="text-xs text-gray-300 text-center py-4">暂无</p>
          )}
          {byDay[day].map((a) => (
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
      ))}
    </div>
  );
}
