import Link from "next/link";
import { auth, signOut } from "@/lib/auth";

export async function Navbar() {
  const session = await auth();

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-lg text-indigo-600">
            追番
          </Link>
          <Link href="/rankings" className="text-sm text-gray-600 hover:text-gray-900">
            新番排行
          </Link>
        </div>
        <div className="flex items-center gap-4">
          {session?.user ? (
            <>
              <Link href="/my" className="text-sm text-gray-600 hover:text-gray-900">
                我的追番
              </Link>
              <span className="text-sm text-gray-400">{session.user.name}</span>
              <form
                action={async () => {
                  "use server";
                  await signOut();
                }}
              >
                <button className="text-sm text-gray-500 hover:text-gray-700">
                  退出
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/api/auth/signin"
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              登录
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
