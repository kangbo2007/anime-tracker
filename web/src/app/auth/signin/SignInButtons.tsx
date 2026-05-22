"use client";

import { signIn } from "next-auth/react";

export function SignInButtons() {
  return (
    <div className="space-y-3">
      <button
        onClick={() => signIn("github", { callbackUrl: "/" })}
        className="w-full px-4 py-2.5 text-sm bg-gray-900 text-white rounded-md hover:bg-gray-800"
      >
        使用 GitHub 登录
      </button>
      <button
        onClick={() => signIn("google", { callbackUrl: "/" })}
        className="w-full px-4 py-2.5 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
      >
        使用 Google 登录
      </button>
    </div>
  );
}
