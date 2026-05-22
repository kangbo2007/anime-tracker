"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function FollowButton({ animeId, userId }: { animeId: string; userId?: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (!userId) return null;

  const handleToggle = async () => {
    setLoading(true);
    await fetch("/api/follow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ animeId }),
    });
    setLoading(false);
    router.refresh();
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className="px-4 py-2 text-sm bg-pink-500 text-white rounded-md hover:bg-pink-600 disabled:opacity-50"
    >
      {loading ? "..." : "追番"}
    </button>
  );
}
