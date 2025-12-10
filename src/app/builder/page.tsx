"use client";

import dynamic from "next/dynamic";

const GrapesEditor = dynamic(
  () => import("@/components/builder/GrapesEditor"),
  { 
    ssr: false,
    loading: () => <div className="flex h-full items-center justify-center">Loading Editor...</div>
  }
);

export default function BuilderPage() {
  return (
    <div className="h-screen w-full overflow-hidden" suppressHydrationWarning>
      <GrapesEditor />
    </div>
  );
}
