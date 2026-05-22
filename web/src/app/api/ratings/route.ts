import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { animeId, rating, tags, recommend } = await req.json();

  if (!animeId || typeof rating !== "number" || rating < 0.5 || rating > 5) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const result = await db.userRating.upsert({
    where: { animeId_userId: { animeId, userId: session.user.id } },
    update: { rating, tags: tags || [], recommend },
    create: { animeId, userId: session.user.id, rating, tags: tags || [], recommend },
  });

  return NextResponse.json(result);
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ratings: [] });
  }

  const ratings = await db.userRating.findMany({
    where: { userId: session.user.id },
    include: {
      anime: { select: { title: true, cover: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ ratings });
}
