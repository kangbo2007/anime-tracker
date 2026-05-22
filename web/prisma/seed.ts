import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const spring2026 = [
    {
      title: "鬼灭之刃 无限城篇",
      titleJp: "鬼滅の刃 無限城編",
      season: "SPRING",
      year: 2026,
      broadcastDay: "SATURDAY",
      broadcastTime: "23:00",
      episodeCount: 13,
      currentEpisode: 1,
      studio: "ufotable",
      isMovie: false,
      synopsis: "灶门炭治郎与鬼杀队众柱一同突入鬼舞辻无惨的据点\"无限城\"，与上弦之鬼展开最终决战。",
    },
    {
      title: "葬送的芙莉莲 第二季",
      titleJp: "葬送のフリーレン 第2期",
      season: "SPRING",
      year: 2026,
      broadcastDay: "FRIDAY",
      broadcastTime: "23:00",
      episodeCount: 24,
      currentEpisode: 1,
      studio: "MADHOUSE",
      isMovie: false,
      synopsis: "芙莉莲一行人继续踏上前往魔王城的旅途，新的同伴和更深刻的羁绊在此展开。",
    },
    {
      title: "某科学的超电磁炮 第四季",
      titleJp: "とある科学の超電磁砲T 第4期",
      season: "SPRING",
      year: 2026,
      broadcastDay: "THURSDAY",
      broadcastTime: "24:30",
      episodeCount: 24,
      currentEpisode: 1,
      studio: "J.C.STAFF",
      isMovie: false,
      synopsis: "御坂美琴和朋友们在学园都市中面对新的威胁，展开新一轮的冒险与战斗。",
    },
  ];

  for (const anime of spring2026) {
    const created = await db.anime.create({
      data: anime,
    });
    console.log(`Created anime: ${created.title} (${created.id})`);
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
