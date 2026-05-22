interface Character {
  id: string;
  name: string;
  nameJp: string | null;
  cv: string | null;
  avatar: string | null;
}

interface AnimeInfoProps {
  title: string;
  titleJp: string | null;
  cover: string | null;
  synopsis: string | null;
  studio: string | null;
  director: string | null;
  episodeCount: number | null;
  currentEpisode: number;
  broadcastDay: string | null;
  broadcastTime: string | null;
  characters: Character[];
  avgRating: number;
  ratingCount: number;
  recommendRate: number;
}

export function AnimeInfo(props: AnimeInfoProps) {
  const dayLabel: Record<string, string> = {
    MONDAY: "周一", TUESDAY: "周二", WEDNESDAY: "周三",
    THURSDAY: "周四", FRIDAY: "周五", SATURDAY: "周六", SUNDAY: "周日",
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-6">
        <div className="w-48 h-64 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
          {props.cover ? (
            <img src={props.cover} alt={props.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">暂无封面</div>
          )}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{props.title}</h1>
          {props.titleJp && <p className="text-gray-500 mt-1">{props.titleJp}</p>}
          <div className="flex items-center gap-4 mt-3">
            <span className="text-lg font-bold text-yellow-600">{props.avgRating.toFixed(1)}</span>
            <span className="text-sm text-gray-500">{props.ratingCount} 人评分</span>
            <span className="text-sm text-indigo-600">{props.recommendRate}% 推荐</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-sm text-gray-600">
            {props.broadcastDay && (
              <span className="px-2 py-0.5 bg-gray-100 rounded">
                {dayLabel[props.broadcastDay] || props.broadcastDay} {props.broadcastTime || ""}
              </span>
            )}
            <span className="px-2 py-0.5 bg-gray-100 rounded">
              更新至第{props.currentEpisode}集
              {props.episodeCount ? ` / 共${props.episodeCount}集` : ""}
            </span>
          </div>
          <div className="mt-3 text-sm text-gray-600 space-y-1">
            {props.studio && <p>制作公司：{props.studio}</p>}
            {props.director && <p>监督：{props.director}</p>}
          </div>
        </div>
      </div>

      {props.synopsis && (
        <div>
          <h2 className="text-lg font-semibold mb-2">简介</h2>
          <p className="text-sm text-gray-700 leading-relaxed">{props.synopsis}</p>
        </div>
      )}

      {props.characters.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-2">角色</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {props.characters.map((ch) => (
              <div key={ch.id} className="flex-shrink-0 w-24 text-center">
                <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full overflow-hidden">
                  {ch.avatar ? (
                    <img src={ch.avatar} alt={ch.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">?</div>
                  )}
                </div>
                <p className="text-xs font-medium mt-1 truncate">{ch.name}</p>
                <p className="text-xs text-gray-400 truncate">{ch.cv || ""}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
