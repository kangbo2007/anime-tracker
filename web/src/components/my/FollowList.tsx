"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface FollowItem {
  id: string;
  anime: {
    id: string;
    title: string;
    titleJp: string | null;
    cover: string | null;
    currentEpisode: number;
    broadcastDay: string | null;
  };
  progress: {
    currentEpisode: number;
  } | null;
}

const DAY_LABEL: Record<string, string> = {
  MONDAY: "周一", TUESDAY: "周二", WEDNESDAY: "周三",
  THURSDAY: "周四", FRIDAY: "周五", SATURDAY: "周六", SUNDAY: "周日",
};

const TODAY = new Date().toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();

export function FollowList() {
  const [follows, setFollows] = useState<FollowItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/follow")
      .then((r) => r.json())
      .then((data) => setFollows(data.follows || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-sm text-gray-400 py-4">加载中...</p>;
  }

  if (follows.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">还没有追番，去追番日历看看吧</p>
        <Link href="/" className="text-sm text-indigo-600 mt-2 inline-block">前往追番日历</Link>
      </div>
    );
  }

  const todayFollows = follows.filter((f) => f.anime.broadcastDay === TODAY);

  return (
    <div className="space-y-6">
      {todayFollows.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-2">
            今日更新 <span className="text-sm font-normal text-indigo-600">({todayFollows.length}部)</span>
          </h3>
          <div className="space-y-2">
            {todayFollows.map((f) => (
              <Link key={f.id} href={`/anime/${f.anime.id}`}
                className="flex items-center gap-3 p-3 rounded-lg bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 transition-all">
                <div className="w-10 h-14 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                  {f.anime.cover ? <img src={f.anime.cover} className="w-full h-full object-cover" alt="" /> : null}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{f.anime.title}</p>
                  <p className="text-xs text-gray-500">
                    已看{f.progress?.currentEpisode || 0}集 / 共{f.anime.currentEpisode}集
                  </p>
                </div>
                <span className="text-xs text-indigo-600 font-medium">今天</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold mb-2">全部追番</h3>
        <div className="space-y-2">
          {follows.map((f) => (
            <Link key={f.id} href={`/anime/${f.anime.id}`}
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-all">
              <div className="w-10 h-14 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                {f.anime.cover ? <img src={f.anime.cover} className="w-full h-full object-cover" alt="" /> : null}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{f.anime.title}</p>
                <p className="text-xs text-gray-500">
                  已看{f.progress?.currentEpisode || 0}集 / 共{f.anime.currentEpisode}集
                </p>
              </div>
              <span className="text-xs text-gray-400">
                {f.anime.broadcastDay ? DAY_LABEL[f.anime.broadcastDay] || "" : ""}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
