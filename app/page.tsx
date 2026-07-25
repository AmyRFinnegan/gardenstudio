"use client";

import { useEffect, useRef, useState } from "react";

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

type ImageBounds = {
  left: number;
  top: number;
  width: number;
  height: number;
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

function computeImageBounds(
  container: HTMLElement,
  img: HTMLImageElement,
): ImageBounds | null {
  const naturalWidth = img.naturalWidth;
  const naturalHeight = img.naturalHeight;
  if (!naturalWidth || !naturalHeight) return null;

  const containerRect = container.getBoundingClientRect();
  const imgRect = img.getBoundingClientRect();
  const style = window.getComputedStyle(img);

  const paddingLeft = parseFloat(style.paddingLeft);
  const paddingRight = parseFloat(style.paddingRight);
  const paddingTop = parseFloat(style.paddingTop);
  const paddingBottom = parseFloat(style.paddingBottom);

  const contentWidth = imgRect.width - paddingLeft - paddingRight;
  const contentHeight = imgRect.height - paddingTop - paddingBottom;

  const scale = Math.min(
    contentWidth / naturalWidth,
    contentHeight / naturalHeight,
  );
  const displayWidth = naturalWidth * scale;
  const displayHeight = naturalHeight * scale;

  const offsetX = paddingLeft + (contentWidth - displayWidth) / 2;
  const offsetY = paddingTop + (contentHeight - displayHeight) / 2;

  return {
    left: imgRect.left - containerRect.left + offsetX,
    top: imgRect.top - containerRect.top + offsetY,
    width: displayWidth,
    height: displayHeight,
  };
}

export default function Home() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [placedPlants, setPlacedPlants] = useState<PlacedPlant[]>([]);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [imageBounds, setImageBounds] = useState<ImageBounds | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoAreaRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const filteredPlants = PLANTS.filter((plant) =>
    plant.commonName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  function updateImageBounds() {
    if (!photoAreaRef.current || !imageRef.current) return;
    const bounds = computeImageBounds(photoAreaRef.current, imageRef.current);
    setImageBounds(bounds);
  }

  useEffect(() => {
    if (!imageUrl) {
      setImageBounds(null);
      return;
    }

    updateImageBounds();

    const observer = new ResizeObserver(updateImageBounds);
    if (photoAreaRef.current) {
      observer.observe(photoAreaRef.current);
    }

    window.addEventListener("resize", updateImageBounds);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateImageBounds);
    };
  }, [imageUrl]);

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
    setSelectedPlant(null);
  }

  function handlePlantSelect(plant: Plant) {
    if (!imageUrl) return;
    setSelectedPlant(plant);
  }

  function handlePhotoClick(event: React.MouseEvent<HTMLDivElement>) {
    if (!selectedPlant || !imageBounds) return;

    const overlayRect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - overlayRect.left;
    const clickY = event.clientY - overlayRect.top;

    const xPercent = (clickX / overlayRect.width) * 100;
    const yPercent = (clickY / overlayRect.height) * 100;

    setPlacedPlants((current) => [
      ...current,
      {
        id: `${selectedPlant.id}-${Date.now()}`,
        commonName: selectedPlant.commonName,
        color: selectedPlant.color,
        x: xPercent,
        y: yPercent,
      },
    ]);
    setSelectedPlant(null);
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
                filteredPlants.map((plant) => {
                  const isSelected = selectedPlant?.id === plant.id;

                  return (
                    <li key={plant.id}>
                      <button
                        type="button"
                        disabled={!imageUrl}
                        onClick={() => handlePlantSelect(plant)}
                        className={`w-full rounded-md border px-4 py-3 text-left shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#4a7c59] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 enabled:hover:border-[#4a7c59] enabled:hover:bg-[#faf7f0] ${
                          isSelected
                            ? "border-[#4a7c59] bg-[#faf7f0] ring-2 ring-[#4a7c59]/30"
                            : "border-stone-300 bg-white"
                        }`}
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
                  );
                })
              )}
            </ul>
          </div>
        </aside>

        <main className="flex min-h-0 flex-1 flex-col p-8">
          {selectedPlant && (
            <p className="mb-3 text-sm text-[#1e4620]">
              Click on the photo to place {selectedPlant.commonName}.
            </p>
          )}

          <div
            ref={photoAreaRef}
            className="relative flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-stone-300 bg-[#f5f0e6]/50 p-12 shadow-inner"
          >
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
                  ref={imageRef}
                  src={imageUrl}
                  alt="Uploaded garden photo"
                  onLoad={updateImageBounds}
                  className="absolute inset-0 h-full w-full object-contain p-4"
                />

                {imageBounds && (
                  <div
                    className="absolute z-10"
                    style={{
                      left: imageBounds.left,
                      top: imageBounds.top,
                      width: imageBounds.width,
                      height: imageBounds.height,
                      cursor: selectedPlant ? "crosshair" : "default",
                    }}
                    onClick={handlePhotoClick}
                  >
                    {placedPlants.map((plant) => (
                      <div
                        key={plant.id}
                        className="pointer-events-none absolute flex flex-col items-center"
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
                  </div>
                )}

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
