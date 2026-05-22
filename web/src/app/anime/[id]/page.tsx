import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { AnimeInfo } from "@/components/anime/AnimeInfo";
import { PlaySource } from "@/components/anime/PlaySource";
import { RatingPanel } from "@/components/anime/RatingPanel";
import { RatingChart } from "@/components/anime/RatingChart";
import { FollowButton } from "@/components/anime/FollowButton";
import { ProgressMarker } from "@/components/anime/ProgressMarker";
import { auth } from "@/lib/auth";
import Link from "next/link";

interface Props {
  params: { id: string };
}

export default async function AnimeDetailPage({ params }: Props) {
  const session = await auth();
  const anime = await db.anime.findUnique({
    where: { id: params.id },
    include: {
      characters: true,
      playSources: { where: { isAvailable: true } },
      userRatings: { select: { rating: true, recommend: true } },
    },
  });

  if (!anime) notFound();

  const ratingCount = anime.userRatings.length;
  const avgRating =
    ratingCount > 0
      ? anime.userRatings.reduce((sum, r) => sum + r.rating, 0) / ratingCount
      : 0;
  const recommendCount = anime.userRatings.filter((r) => r.recommend === "recommend").length;
  const recommendRate = ratingCount > 0 ? Math.round((recommendCount / ratingCount) * 100) : 0;

  const starDistribution = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map((star) => ({
    star,
    count: anime.userRatings.filter((r) => Math.abs(r.rating - star) < 0.25).length,
  }));

  return (
    <div className="space-y-8">
      <AnimeInfo {...anime} avgRating={avgRating} ratingCount={ratingCount} recommendRate={recommendRate} />

      <PlaySource sources={anime.playSources} animeId={anime.id} />

      <div className="flex items-center gap-3 mt-4">
        <FollowButton animeId={anime.id} userId={session?.user?.id} />
        <ProgressMarker
          animeId={anime.id}
          userId={session?.user?.id}
          totalEpisodes={anime.episodeCount || anime.currentEpisode}
        />
      </div>

      <RatingPanel animeId={anime.id} userId={session?.user?.id} />

      <RatingChart distribution={starDistribution} totalCount={ratingCount} recommendRate={recommendRate} />

      <div className="border-t pt-4">
        <Link
          href={`/forum/${anime.id}`}
          className="inline-block px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700"
        >
          进入百家小坛
        </Link>
      </div>
    </div>
  );
}
