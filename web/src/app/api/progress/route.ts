import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { animeId, episode, isAuto } = await req.json();

  if (!animeId || typeof episode !== "number") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const result = await db.userWatchProgress.upsert({
    where: { userId_animeId: { userId: session.user.id, animeId } },
    update: {
      currentEpisode: episode,
      isAuto: isAuto ?? false,
      status: "watching",
    },
    create: {
      userId: session.user.id,
      animeId,
      currentEpisode: episode,
      isAuto: isAuto ?? false,
      status: "watching",
    },
  });

  return NextResponse.json(result);
}
