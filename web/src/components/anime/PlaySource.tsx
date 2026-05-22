"use client";

interface PlaySourceItem {
  id: string;
  sourceName: string;
  url: string;
  type: string;
  episodeNum: number | null;
}

export function PlaySource({ sources, animeId }: { sources: PlaySourceItem[]; animeId: string }) {
  const trackView = (episodeNum: number | null) => {
    if (!episodeNum) return;
    fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ animeId, episode: episodeNum, isAuto: true }),
    });
  };

  if (sources.length === 0) {
    return (
      <div>
        <h2 className="text-lg font-semibold mb-2">播放源</h2>
        <p className="text-sm text-gray-400">暂无播放源</p>
      </div>
    );
  }

  const embedded = sources.filter((s) => s.type === "iframe");
  const external = sources.filter((s) => s.type === "redirect");

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">播放源</h2>

      {embedded.length > 0 && (
        <div className="mb-3">
          <p className="text-sm text-gray-500 mb-1">站内播放</p>
          <div className="space-y-1">
            {embedded.map((s) => (
              <div key={s.id} className="aspect-video bg-black rounded-lg overflow-hidden">
                <iframe
                  src={s.url}
                  className="w-full h-full"
                  allowFullScreen
                  title={`Episode ${s.episodeNum || ""}`}
                  sandbox="allow-same-origin allow-scripts"
                  onLoad={() => trackView(s.episodeNum)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {external.length > 0 && (
        <div>
          <p className="text-sm text-gray-500 mb-1">外部链接</p>
          <div className="flex gap-2">
            {external.map((s) => (
              <a
                key={s.id}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackView(s.episodeNum)}
                className="px-3 py-1.5 text-sm bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100"
              >
                前往{s.sourceName}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
