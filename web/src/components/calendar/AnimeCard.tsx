import Link from "next/link";

interface AnimeCardProps {
  id: string;
  title: string;
  titleJp: string | null;
  cover: string | null;
  broadcastTime: string | null;
  currentEpisode: number;
  score: number | null;
  hasSource: boolean;
}

export function AnimeCard({ id, title, titleJp, cover, broadcastTime, currentEpisode, score, hasSource }: AnimeCardProps) {
  return (
    <Link href={`/anime/${id}`} className="block">
      <div className="group rounded-lg border border-gray-200 bg-white p-3 hover:border-indigo-300 hover:shadow-sm transition-all">
        <div className="flex gap-3">
          <div className="w-16 h-20 bg-gray-100 rounded flex-shrink-0 overflow-hidden">
            {cover ? (
              <img src={cover} alt={title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">暂无封面</div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 truncate">{title}</h3>
            <p className="text-xs text-gray-400 truncate">{titleJp || ""}</p>
            <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
              {broadcastTime && <span>{broadcastTime}</span>}
              <span>更新至{currentEpisode}集</span>
            </div>
            <div className="mt-1 flex items-center gap-2">
              {score != null && (
                <span className="text-xs font-medium text-yellow-600">{score.toFixed(1)}</span>
              )}
              <span className={`text-xs px-1 rounded ${hasSource ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                {hasSource ? "有片源" : "外部链接"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
