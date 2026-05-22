import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const season = searchParams.get("season");
  const year = searchParams.get("year");
  const isMovie = searchParams.get("isMovie");

  const where: Record<string, unknown> = {};
  if (season) where.season = season;
  if (year) where.year = parseInt(year);
  if (isMovie !== null) where.isMovie = isMovie === "true";

  const anime = await db.anime.findMany({
    where,
    include: {
      playSources: { where: { isAvailable: true } },
    },
    orderBy: { broadcastDay: "asc" },
  });

  return NextResponse.json(anime);
}
