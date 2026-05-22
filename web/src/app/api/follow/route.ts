import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { animeId } = await req.json();
  if (!animeId) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const existing = await db.userFollow.findUnique({
    where: { userId_animeId: { userId: session.user.id, animeId } },
  });

  if (existing) {
    await db.userFollow.delete({ where: { id: existing.id } });
    return NextResponse.json({ followed: false });
  }

  await db.userFollow.create({
    data: { userId: session.user.id, animeId },
  });

  return NextResponse.json({ followed: true });
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ follows: [] });
  }

  const follows = await db.userFollow.findMany({
    where: { userId: session.user.id },
    include: {
      anime: {
        select: {
          id: true,
          title: true,
          titleJp: true,
          cover: true,
          currentEpisode: true,
          broadcastDay: true,
        },
      },
    },
  });

  const withProgress = await Promise.all(
    follows.map(async (f) => {
      const progress = await db.userWatchProgress.findUnique({
        where: { userId_animeId: { userId: session.user.id, animeId: f.animeId } },
        select: { currentEpisode: true },
      });
      return { ...f, progress };
    })
  );

  const dayOrder = ["MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY","SUNDAY"];
  withProgress.sort((a, b) => {
    return dayOrder.indexOf(a.anime.broadcastDay || "SUNDAY") - dayOrder.indexOf(b.anime.broadcastDay || "SUNDAY");
  });

  return NextResponse.json({ follows: withProgress });
}
