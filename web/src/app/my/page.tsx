import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { FollowList } from "@/components/my/FollowList";
import { RatingHistory } from "@/components/my/RatingHistory";

export default async function MyPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/api/auth/signin");
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">我的追番</h1>

      <section>
        <h2 className="text-lg font-semibold mb-4">追番列表</h2>
        <FollowList />
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">我的评分</h2>
        <RatingHistory />
      </section>
    </div>
  );
}
