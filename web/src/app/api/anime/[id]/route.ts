import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const anime = await db.anime.findUnique({
    where: { id: params.id },
    include: {
      characters: true,
      playSources: { where: { isAvailable: true } },
      userRatings: {
        select: { rating: true, recommend: true, tags: true },
      },
    },
  });

  if (!anime) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const ratingCount = anime.userRatings.length;
  const avgRating =
    ratingCount > 0
      ? anime.userRatings.reduce((sum, r) => sum + r.rating, 0) / ratingCount
      : 0;
  const recommendCount = anime.userRatings.filter(
    (r) => r.recommend === "recommend"
  ).length;
  const recommendRate = ratingCount > 0 ? recommendCount / ratingCount : 0;

  return NextResponse.json({
    ...anime,
    avgRating: Math.round(avgRating * 10) / 10,
    ratingCount,
    recommendRate: Math.round(recommendRate * 100),
    starDistribution: [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map((star) => ({
      star,
      count: anime.userRatings.filter((r) => Math.abs(r.rating - star) < 0.25).length,
    })),
  });
}
