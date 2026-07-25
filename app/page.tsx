"use client";

import { useEffect, useRef, useState } from "react";
import GardenCanvas, {
  computeImageBounds,
  type ImageBounds,
} from "@/components/GardenCanvas";
import Header from "@/components/Header";
import PlantLibrary from "@/components/PlantLibrary";
import { PLANTS, type PlacedPlant, type Plant } from "@/lib/plants";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export default function Home() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [placedPlants, setPlacedPlants] = useState<PlacedPlant[]>([]);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [draggingPlantId, setDraggingPlantId] = useState<string | null>(null);
  const [imageBounds, setImageBounds] = useState<ImageBounds | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoAreaRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const suppressPhotoClickRef = useRef(false);

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

  useEffect(() => {
    if (!draggingPlantId) return;

    function handlePointerMove(event: PointerEvent) {
      if (!overlayRef.current) return;

      const rect = overlayRef.current.getBoundingClientRect();
      const xPercent = clamp(
        ((event.clientX - rect.left) / rect.width) * 100,
        0,
        100,
      );
      const yPercent = clamp(
        ((event.clientY - rect.top) / rect.height) * 100,
        0,
        100,
      );

      setPlacedPlants((current) =>
        current.map((plant) =>
          plant.id === draggingPlantId
            ? { ...plant, x: xPercent, y: yPercent }
            : plant,
        ),
      );
      suppressPhotoClickRef.current = true;
    }

    function handlePointerUp() {
      setDraggingPlantId(null);
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [draggingPlantId]);

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
    setDraggingPlantId(null);
  }

  function handlePlantSelect(plant: Plant) {
    if (!imageUrl) return;
    setSelectedPlant(plant);
  }

  function handleMarkerPointerDown(
    event: React.PointerEvent<HTMLDivElement>,
    plantId: string,
  ) {
    event.stopPropagation();
    suppressPhotoClickRef.current = false;
    setDraggingPlantId(plantId);
  }

  function handlePhotoClick(event: React.MouseEvent<HTMLDivElement>) {
    if (!selectedPlant || !imageBounds) return;

    if (suppressPhotoClickRef.current) {
      suppressPhotoClickRef.current = false;
      return;
    }

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
      <Header />

      <div className="flex min-h-0 flex-1">
        <PlantLibrary
          imageUrl={imageUrl}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          plants={filteredPlants}
          selectedPlant={selectedPlant}
          onPlantSelect={handlePlantSelect}
        />

        <GardenCanvas
          imageUrl={imageUrl}
          selectedPlant={selectedPlant}
          placedPlants={placedPlants}
          draggingPlantId={draggingPlantId}
          imageBounds={imageBounds}
          fileInputRef={fileInputRef}
          photoAreaRef={photoAreaRef}
          imageRef={imageRef}
          overlayRef={overlayRef}
          onFileChange={handleFileChange}
          onOpenFilePicker={openFilePicker}
          onUpdateImageBounds={updateImageBounds}
          onPhotoClick={handlePhotoClick}
          onMarkerPointerDown={handleMarkerPointerDown}
        />
      </div>
    </div>
  );
}
