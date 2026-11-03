import { Suspense } from "react";
import PasswordResetPage from "@/components/PasswordResetPage";

async function PasswordResetRoute({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : "";

  return <PasswordResetPage key={token} token={token} />;
}

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
          <p className="text-sm text-zinc-400" role="status">
            Loading password reset...
          </p>
        </main>
      }
    >
      <PasswordResetRoute searchParams={searchParams} />
    </Suspense>
  );
}
