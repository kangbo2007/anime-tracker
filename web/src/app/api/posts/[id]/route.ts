import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { content } = await req.json();
  if (!content || content.length > 5000) {
    return NextResponse.json({ error: "Invalid content" }, { status: 400 });
  }

  const post = await db.forumPost.findUnique({ where: { id: params.id } });
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const reply = await db.forumReply.create({
    data: {
      postId: params.id,
      userId: session.user.id,
      content,
    },
    include: {
      user: { select: { id: true, name: true, image: true } },
    },
  });

  return NextResponse.json(reply);
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const post = await db.forumPost.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { id: true, name: true, image: true } },
      replies: {
        include: {
          user: { select: { id: true, name: true, image: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  return NextResponse.json(post);
}
