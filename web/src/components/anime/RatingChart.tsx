interface StarBar {
  star: number;
  count: number;
}

export function RatingChart({ distribution, totalCount, recommendRate }: {
  distribution: StarBar[];
  totalCount: number;
  recommendRate: number;
}) {
  const maxCount = Math.max(...distribution.map((d) => d.count), 1);

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <h3 className="text-lg font-semibold">社区评分分布</h3>
      <div className="mb-2">
        <span className="text-2xl font-bold text-indigo-600">{recommendRate}%</span>
        <span className="text-sm text-gray-500 ml-1">的用户推荐</span>
      </div>
      <div className="space-y-1">
        {distribution.reverse().map((d) => (
          <div key={d.star} className="flex items-center gap-2 text-xs">
            <span className="w-8 text-right text-gray-500">{d.star}★</span>
            <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-400 rounded-full transition-all"
                style={{ width: totalCount > 0 ? `${(d.count / maxCount) * 100}%` : "0%" }}
              />
            </div>
            <span className="w-8 text-gray-400">{d.count}</span>
          </div>
        ))}
      </div>
      {totalCount > 0 && (
        <p className="text-xs text-gray-400">共 {totalCount} 人评分</p>
      )}
    </div>
  );
}
