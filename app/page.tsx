"use client";

import { useEffect, useRef, useState } from "react";
import GardenCanvas, {
  computeImageBounds,
  type ImageBounds,
} from "@/components/GardenCanvas";
import Header from "@/components/Header";
import PlantLibrary from "@/components/PlantLibrary";
import { PLANTS, type PlacedPlant, type Plant } from "@/lib/plants";

export default function Home() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [placedPlants, setPlacedPlants] = useState<PlacedPlant[]>([]);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
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

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Delete" && event.key !== "Backspace") return;
      if (event.target instanceof HTMLInputElement) return;
      if (!selectedMarkerId) return;

      event.preventDefault();
      handleDeleteSelectedMarker();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedMarkerId]);

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
    setSelectedMarkerId(null);
  }

  function handlePlantSelect(plant: Plant) {
    if (!imageUrl) return;
    setSelectedPlant(plant);
  }

  function handleUpdatePlacedPlant(
    plantId: string,
    xPercent: number,
    yPercent: number,
  ) {
    setPlacedPlants((current) =>
      current.map((plant) =>
        plant.id === plantId ? { ...plant, x: xPercent, y: yPercent } : plant,
      ),
    );
  }

  function handleSelectMarker(plantId: string) {
    setSelectedMarkerId(plantId);
  }

  function handleDeleteSelectedMarker() {
    if (!selectedMarkerId) return;

    setPlacedPlants((current) =>
      current.filter((plant) => plant.id !== selectedMarkerId),
    );
    setSelectedMarkerId(null);
  }

  function handlePhotoClick(event: React.MouseEvent<HTMLDivElement>) {
    if (selectedPlant && imageBounds) {
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
      return;
    }

    setSelectedMarkerId(null);
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
          selectedMarkerId={selectedMarkerId}
          placedPlants={placedPlants}
          imageBounds={imageBounds}
          fileInputRef={fileInputRef}
          photoAreaRef={photoAreaRef}
          imageRef={imageRef}
          onFileChange={handleFileChange}
          onOpenFilePicker={openFilePicker}
          onUpdateImageBounds={updateImageBounds}
          onPhotoClick={handlePhotoClick}
          onUpdatePlacedPlant={handleUpdatePlacedPlant}
          onSelectMarker={handleSelectMarker}
          onDeleteSelectedMarker={handleDeleteSelectedMarker}
        />
      </div>
    </div>
  );
}
