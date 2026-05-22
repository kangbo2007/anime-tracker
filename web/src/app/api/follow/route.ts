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
