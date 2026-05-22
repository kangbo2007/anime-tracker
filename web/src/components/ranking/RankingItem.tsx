import Link from "next/link";

interface RankingItemProps {
  rank: number;
  id: string;
  title: string;
  titleJp: string | null;
  cover: string | null;
  score: number;
  breakdown: Record<string, number>;
}

export function RankingItem({ rank, id, title, titleJp, cover, score, breakdown }: RankingItemProps) {
  return (
    <Link href={`/anime/${id}`} className="block">
      <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all">
        <span className={`w-8 text-center font-bold text-lg ${
          rank <= 3 ? "text-indigo-600" : "text-gray-400"
        }`}>
          {rank}
        </span>
        <div className="w-10 h-14 bg-gray-100 rounded overflow-hidden flex-shrink-0">
          {cover ? (
            <img src={cover} alt={title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">?</div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{title}</p>
          <p className="text-xs text-gray-400 truncate">{titleJp || ""}</p>
        </div>
        <div className="text-right">
          <span className="text-lg font-bold text-gray-900">{typeof score === "number" && score % 1 !== 0 ? score.toFixed(1) : score}</span>
          <div className="flex gap-1 text-xs text-gray-400">
            {Object.entries(breakdown).map(([key, val]) => (
              <span key={key} title={key}>
                {key}: {typeof val === "number" && val % 1 !== 0 ? val.toFixed(1) : val}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
