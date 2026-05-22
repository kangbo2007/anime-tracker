"use client";

import { useRouter, useSearchParams } from "next/navigation";

const SEASONS = [
  { label: "2026冬", season: "WINTER", year: 2026 },
  { label: "2026春", season: "SPRING", year: 2026 },
  { label: "2026夏", season: "SUMMER", year: 2026 },
  { label: "2026秋", season: "FALL", year: 2026 },
  { label: "2027冬", season: "WINTER", year: 2027 },
];

export function SeasonPicker() {
  const router = useRouter();
  const params = useSearchParams();
  const currentSeason = params.get("season") || "SPRING";
  const currentYear = params.get("year") || "2026";

  return (
    <div className="flex gap-2 mb-4">
      {SEASONS.map((s) => (
        <button
          key={`${s.year}-${s.season}`}
          onClick={() => router.push(`/?season=${s.season}&year=${s.year}`)}
          className={`px-3 py-1 text-sm rounded-full border ${
            s.season === currentSeason && s.year === parseInt(currentYear)
              ? "bg-indigo-600 text-white border-indigo-600"
              : "bg-white text-gray-600 border-gray-300 hover:border-indigo-400"
          }`}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
