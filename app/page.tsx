"use client";

import { useRef, useState } from "react";

export default function Home() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }

    setImageUrl(URL.createObjectURL(file));
  }

  return (
    <div className="flex h-full min-h-screen flex-col bg-[#faf7f0] font-sans text-stone-800">
      <header className="shrink-0 bg-[#1e4620] px-6 py-4 shadow-sm">
        <h1 className="text-xl font-semibold tracking-tight text-[#f5f0e6]">
          Garden Studio
        </h1>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="flex w-80 shrink-0 flex-col border-r border-stone-300 bg-[#f5f0e6]">
          <div className="border-b border-stone-300 px-5 py-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[#1e4620]">
              Plant Library
            </h2>
          </div>

          <div className="flex flex-1 flex-col gap-4 p-5">
            <input
              type="search"
              placeholder="Search plants..."
              className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 placeholder:text-stone-400 focus:border-[#4a7c59] focus:outline-none focus:ring-2 focus:ring-[#4a7c59]/30"
            />

            <ul className="flex flex-1 flex-col">
              <li className="rounded-md border border-dashed border-stone-300 bg-white/60 px-4 py-8 text-center text-sm text-stone-500">
                No plants yet.
              </li>
            </ul>
          </div>
        </aside>

        <main className="flex min-h-0 flex-1 flex-col p-8">
          <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center rounded-lg border-2 border-stone-300 bg-[#f5f0e6]/50 p-12 shadow-inner">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {imageUrl ? (
              <>
                <img
                  src={imageUrl}
                  alt="Uploaded garden photo"
                  className="absolute inset-0 h-full w-full object-contain p-4"
                />
                <button
                  type="button"
                  onClick={openFilePicker}
                  className="absolute right-3 top-3 z-10 rounded-md border border-stone-300 bg-white/90 px-3 py-1.5 text-xs font-medium text-stone-700 shadow-sm transition-colors hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#4a7c59] focus:ring-offset-2"
                >
                  Change Photo
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={openFilePicker}
                  className="rounded-lg bg-[#2d5a3d] px-6 py-3 text-sm font-medium text-[#f5f0e6] shadow-sm transition-colors hover:bg-[#1e4620] focus:outline-none focus:ring-2 focus:ring-[#4a7c59] focus:ring-offset-2 focus:ring-offset-[#faf7f0]"
                >
                  Upload Garden Photo
                </button>
                <p className="mt-4 text-sm text-stone-600">
                  Upload a photo of your garden to begin designing.
                </p>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
