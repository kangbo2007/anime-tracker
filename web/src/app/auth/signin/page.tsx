import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SignInButtons } from "./SignInButtons";

export default async function SignInPage() {
  const session = await auth();
  if (session?.user) redirect("/");

  return (
    <div className="max-w-sm mx-auto mt-16">
      <h1 className="text-2xl font-bold text-center mb-6">登录追番</h1>
      <SignInButtons />
    </div>
  );
}
