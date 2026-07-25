"use client";

import { useRef, useState } from "react";

type Plant = {
  id: string;
  commonName: string;
  matureWidthFt: number;
  color: string;
};

type PlacedPlant = {
  id: string;
  commonName: string;
  color: string;
  x: number;
  y: number;
};

const PLANTS: Plant[] = [
  {
    id: "blue-angel-hosta",
    commonName: "Blue Angel Hosta",
    matureWidthFt: 5,
    color: "blue-green",
  },
  {
    id: "plum-pudding-heuchera",
    commonName: "Plum Pudding Heuchera",
    matureWidthFt: 1.5,
    color: "purple",
  },
  {
    id: "purple-dome-aster",
    commonName: "Purple Dome Aster",
    matureWidthFt: 2.5,
    color: "purple-blue",
  },
];

const MARKER_COLORS: Record<string, string> = {
  "blue-green": "#4a7c59",
  purple: "#7c3aed",
  "purple-blue": "#5b6abf",
};

let placedPlantCounter = 0;

export default function Home() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [placedPlants, setPlacedPlants] = useState<PlacedPlant[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredPlants = PLANTS.filter((plant) =>
    plant.commonName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

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
    setPlacedPlants([]);
  }

  function handlePlantClick(plant: Plant) {
    if (!imageUrl) return;

    placedPlantCounter += 1;
    const offset = (placedPlantCounter - 1) * 4;

    setPlacedPlants((current) => [
      ...current,
      {
        id: `${plant.id}-${Date.now()}`,
        commonName: plant.commonName,
        color: plant.color,
        x: 50 + (offset % 3) * 2 - 2,
        y: 50 + Math.floor(offset / 3) * 2 - 2,
      },
    ]);
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

          <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-5">
            <input
              type="search"
              placeholder="Search plants..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 placeholder:text-stone-400 focus:border-[#4a7c59] focus:outline-none focus:ring-2 focus:ring-[#4a7c59]/30"
            />

            {!imageUrl && (
              <p className="text-xs text-stone-500">
                Upload a photo to place plants on your garden.
              </p>
            )}

            <ul className="flex flex-col gap-3">
              {filteredPlants.length === 0 ? (
                <li className="rounded-md border border-dashed border-stone-300 bg-white/60 px-4 py-8 text-center text-sm text-stone-500">
                  No plants match your search.
                </li>
              ) : (
                filteredPlants.map((plant) => (
                  <li key={plant.id}>
                    <button
                      type="button"
                      disabled={!imageUrl}
                      onClick={() => handlePlantClick(plant)}
                      className="w-full rounded-md border border-stone-300 bg-white px-4 py-3 text-left shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#4a7c59] focus:ring-offset-2 enabled:hover:border-[#4a7c59] enabled:hover:bg-[#faf7f0] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className="mt-0.5 h-4 w-4 shrink-0 rounded-full border border-stone-300"
                          style={{
                            backgroundColor:
                              MARKER_COLORS[plant.color] ?? "#4a7c59",
                          }}
                        />
                        <div>
                          <p className="text-sm font-medium text-stone-800">
                            {plant.commonName}
                          </p>
                          <p className="mt-1 text-xs text-stone-500">
                            Mature width: {plant.matureWidthFt} ft ·{" "}
                            {plant.color}
                          </p>
                        </div>
                      </div>
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        </aside>

        <main className="flex min-h-0 flex-1 flex-col p-8">
          <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-stone-300 bg-[#f5f0e6]/50 p-12 shadow-inner">
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

                {placedPlants.map((plant) => (
                  <div
                    key={plant.id}
                    className="pointer-events-none absolute z-10 flex flex-col items-center"
                    style={{
                      left: `${plant.x}%`,
                      top: `${plant.y}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    <div
                      className="h-12 w-12 rounded-full border-2 border-white shadow-md"
                      style={{
                        backgroundColor:
                          MARKER_COLORS[plant.color] ?? "#4a7c59",
                      }}
                    />
                    <span className="mt-1 max-w-28 rounded bg-white/90 px-1.5 py-0.5 text-center text-[10px] font-medium leading-tight text-stone-800 shadow-sm">
                      {plant.commonName}
                    </span>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={openFilePicker}
                  className="absolute right-3 top-3 z-20 rounded-md border border-stone-300 bg-white/90 px-3 py-1.5 text-xs font-medium text-stone-700 shadow-sm transition-colors hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#4a7c59] focus:ring-offset-2"
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
