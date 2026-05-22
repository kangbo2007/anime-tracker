import { db } from "@/lib/db";
import { SeasonPicker } from "@/components/calendar/SeasonPicker";
import { CalendarView } from "@/components/calendar/CalendarView";

interface Props {
  searchParams: { season?: string; year?: string };
}

export default async function HomePage({ searchParams }: Props) {
  const season = searchParams.season || "SPRING";
  const year = parseInt(searchParams.year || "2026");

  const anime = await db.anime.findMany({
    where: { season, year },
    include: { playSources: { where: { isAvailable: true } } },
    orderBy: { broadcastDay: "asc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">追番日历</h1>
      <SeasonPicker />
      <CalendarView anime={anime} />
    </div>
  );
}
