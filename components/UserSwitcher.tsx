"use client";

import { useCRM, TEAM } from "@/context/CRMContent";

/** Temporary "who am I" picker so roles can be tested before real login exists. */
export default function UserSwitcher() {
  const { currentUser, setCurrentUser } = useCRM();

  return (
    <select
      value={currentUser.name}
      title="Viewing as"
      aria-label="Viewing as"
      onChange={(e) => {
        const user = TEAM.find((t: { name: string }) => t.name === e.target.value);
        if (user) setCurrentUser(user);
      }}
      className="bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-2 text-slate-200 text-sm outline-none"
    >
      {TEAM.map((t: { name: string; role: string }) => (
        <option key={t.name} value={t.name}>
          {t.name} · {t.role}
        </option>
      ))}
    </select>
  );
}
