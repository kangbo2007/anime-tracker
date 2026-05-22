import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { autoTag } from "@/lib/auto-tag";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { animeId, title, content } = await req.json();

  if (!animeId || !title || !content) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  if (title.length > 100 || content.length > 10000) {
    return NextResponse.json({ error: "Content too long" }, { status: 400 });
  }

  const tags = autoTag(title + " " + content);

  const post = await db.forumPost.create({
    data: {
      animeId,
      userId: session.user.id,
      title,
      content,
      autoTags: JSON.stringify(tags),
    },
  });

  return NextResponse.json(post);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const animeId = searchParams.get("animeId");
  const sort = searchParams.get("sort") || "latest";
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = 20;

  if (!animeId) {
    return NextResponse.json({ error: "animeId required" }, { status: 400 });
  }

  const orderBy =
    sort === "hot"
      ? { replies: { _count: "desc" as const } }
      : { createdAt: "desc" as const };

  const posts = await db.forumPost.findMany({
    where: { animeId },
    include: {
      user: { select: { id: true, name: true, image: true } },
      _count: { select: { replies: true } },
    },
    orderBy,
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  const total = await db.forumPost.count({ where: { animeId } });

  return NextResponse.json({ posts, total, page, pageSize });
}
