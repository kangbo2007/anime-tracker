"use client";

import { useEffect, useState } from "react";
import { RankingItem } from "./RankingItem";

interface RankingData {
  id: string;
  title: string;
  titleJp: string | null;
  cover: string | null;
  score: number;
  breakdown: Record<string, number | string>;
}

export function RankingList({ type }: { type: string }) {
  const [items, setItems] = useState<RankingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/rankings?type=${type}`)
      .then((res) => res.json())
      .then((data) => {
        setItems(data.items);
        setUpdatedAt(data.updatedAt);
      })
      .finally(() => setLoading(false));
  }, [type]);

  if (loading) {
    return <p className="text-sm text-gray-400 py-8 text-center">加载中...</p>;
  }

  return (
    <div>
      <div className="text-xs text-gray-400 mb-2">
        外部数据更新：{updatedAt ? new Date(updatedAt).toLocaleString("zh-CN") : "—"}（每12小时）
        {" · "}站内数据：准实时
      </div>
      <div className="divide-y">
        {items.map((item, i) => (
          <RankingItem key={item.id} rank={i + 1} {...item} />
        ))}
      </div>
    </div>
  );
}
