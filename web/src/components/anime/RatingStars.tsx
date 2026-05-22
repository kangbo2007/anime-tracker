"use client";

import { useState } from "react";

interface RatingStarsProps {
  value: number;
  onChange: (value: number) => void;
}

export function RatingStars({ value, onChange }: RatingStarsProps) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex gap-0.5" onMouseLeave={() => setHover(0)}>
      {[0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map((star) => {
        const isHalf = star % 1 !== 0;
        const filled = (hover || value) >= star;
        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            className={`text-xl ${isHalf ? "w-3 overflow-hidden" : ""} ${
              filled ? "text-yellow-400" : "text-gray-300"
            } hover:scale-110 transition-transform`}
            title={`${star} 星`}
          >
            {isHalf ? "★" : "★"}
          </button>
        );
      })}
      <span className="ml-2 text-sm text-gray-500">
        {hover || value || "未评分"}
      </span>
    </div>
  );
}
