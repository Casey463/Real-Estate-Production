"use client";

import dynamic from "next/dynamic";

const Map = dynamic(() => import("../map-components/map"), { ssr: false });
export default function Middleware() {
  return (
    <main className="flex items-center  p-4 md:p-8 h-screen">
      <div className="w-full h-full">
        <div className="h-9/10 w-full border rounded-lg overflow-hidden">
          <Map />
        </div>
      </div>
    </main>
  );
}
