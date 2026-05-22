import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { PostList } from "@/components/forum/PostList";
import { PostDetail } from "@/components/forum/PostDetail";
import Link from "next/link";

interface Props {
  params: { animeId: string };
  searchParams: { post?: string };
}

export default async function ForumPage({ params, searchParams }: Props) {
  const anime = await db.anime.findUnique({
    where: { id: params.animeId },
    select: { id: true, title: true },
  });

  if (!anime) notFound();

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/anime/${anime.id}`} className="text-sm text-gray-500 hover:text-indigo-600">
          ← 返回新番影院
        </Link>
        <h1 className="text-xl font-bold">{anime.title} — 百家小坛</h1>
      </div>

      {searchParams.post ? (
        <PostDetail postId={searchParams.post} animeId={anime.id} />
      ) : (
        <PostList animeId={anime.id} />
      )}
    </div>
  );
}
