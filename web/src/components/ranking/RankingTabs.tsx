"use client";

import { useState } from "react";
import { RankingList } from "./RankingList";

const TABS = [
  { key: "heat", label: "热度榜" },
  { key: "score", label: "评分榜" },
  { key: "view", label: "播放量榜" },
  { key: "retention", label: "追更率榜" },
  { key: "character", label: "角色人气榜" },
];

export function RankingTabs() {
  const [active, setActive] = useState("heat");

  return (
    <div>
      <div className="flex gap-2 mb-4 border-b">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className={`px-4 py-2 text-sm border-b-2 -mb-px transition-colors ${
              active === tab.key
                ? "border-indigo-600 text-indigo-600 font-medium"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <RankingList type={active} />
    </div>
  );
}
