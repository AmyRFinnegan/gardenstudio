import { useEffect, useRef, useState, type RefObject } from "react";
import { MARKER_COLORS, type PlacedPlant, type Plant } from "@/lib/plants";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export type ImageBounds = {
  left: number;
  top: number;
  width: number;
  height: number;
};

type GardenCanvasProps = {
  imageUrl: string | null;
  selectedPlant: Plant | null;
  selectedMarkerId: string | null;
  placedPlants: PlacedPlant[];
  imageBounds: ImageBounds | null;
  fileInputRef: RefObject<HTMLInputElement | null>;
  photoAreaRef: RefObject<HTMLDivElement | null>;
  imageRef: RefObject<HTMLImageElement | null>;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenFilePicker: () => void;
  onUpdateImageBounds: () => void;
  onPhotoClick: (event: React.MouseEvent<HTMLDivElement>) => void;
  onUpdatePlacedPlant: (plantId: string, xPercent: number, yPercent: number) => void;
  onSelectMarker: (plantId: string) => void;
  onDeleteSelectedMarker: () => void;
};

export function computeImageBounds(
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

export default function GardenCanvas({
  imageUrl,
  selectedPlant,
  selectedMarkerId,
  placedPlants,
  imageBounds,
  fileInputRef,
  photoAreaRef,
  imageRef,
  onFileChange,
  onOpenFilePicker,
  onUpdateImageBounds,
  onPhotoClick,
  onUpdatePlacedPlant,
  onSelectMarker,
  onDeleteSelectedMarker,
}: GardenCanvasProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const suppressPhotoClickRef = useRef(false);
  const didDragRef = useRef(false);
  const onUpdatePlacedPlantRef = useRef(onUpdatePlacedPlant);
  const [draggingPlantId, setDraggingPlantId] = useState<string | null>(null);

  onUpdatePlacedPlantRef.current = onUpdatePlacedPlant;

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

      onUpdatePlacedPlantRef.current(draggingPlantId, xPercent, yPercent);
      didDragRef.current = true;
      suppressPhotoClickRef.current = true;
    }

    function handlePointerUp(event: PointerEvent) {
      if (!overlayRef.current || !draggingPlantId) return;

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

      onUpdatePlacedPlantRef.current(draggingPlantId, xPercent, yPercent);
      suppressPhotoClickRef.current = true;
      setDraggingPlantId(null);
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [draggingPlantId]);

  function handleMarkerPointerDown(
    event: React.PointerEvent<HTMLDivElement>,
    plantId: string,
  ) {
    event.stopPropagation();
    event.preventDefault();
    didDragRef.current = false;
    suppressPhotoClickRef.current = false;
    setDraggingPlantId(plantId);
  }

  function handleMarkerClick(
    event: React.MouseEvent<HTMLDivElement>,
    plantId: string,
  ) {
    event.stopPropagation();
    if (didDragRef.current) {
      didDragRef.current = false;
      return;
    }
    onSelectMarker(plantId);
  }

  function handlePhotoClick(event: React.MouseEvent<HTMLDivElement>) {
    if (suppressPhotoClickRef.current) {
      suppressPhotoClickRef.current = false;
      return;
    }
    onPhotoClick(event);
  }

  return (
    <main className="flex min-h-0 flex-1 flex-col p-8">
      <div className="mb-3 flex min-h-[1.25rem] items-center gap-3">
        {selectedPlant && (
          <p className="text-sm text-[#1e4620]">
            Click on the photo to place {selectedPlant.commonName}.
          </p>
        )}
        {selectedMarkerId && (
          <button
            type="button"
            onClick={onDeleteSelectedMarker}
            className="rounded-md border border-stone-300 bg-white px-3 py-1 text-xs font-medium text-stone-700 shadow-sm transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-[#4a7c59] focus:ring-offset-2"
          >
            Delete
          </button>
        )}
      </div>

      <div
        ref={photoAreaRef}
        className="relative flex min-h-0 flex-1 select-none flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-stone-300 bg-[#f5f0e6]/50 p-12 shadow-inner"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={onFileChange}
          className="hidden"
        />

        {imageUrl ? (
          <>
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Uploaded garden photo"
              draggable={false}
              onLoad={onUpdateImageBounds}
              className="absolute inset-0 h-full w-full object-contain p-4"
            />

            {imageBounds && (
              <div
                ref={overlayRef}
                className="absolute z-10"
                style={{
                  left: imageBounds.left,
                  top: imageBounds.top,
                  width: imageBounds.width,
                  height: imageBounds.height,
                  cursor: draggingPlantId
                    ? "grabbing"
                    : selectedPlant
                      ? "crosshair"
                      : "default",
                }}
                onClick={handlePhotoClick}
              >
                {placedPlants.map((plant) => {
                  const isSelected = selectedMarkerId === plant.id;

                  return (
                    <div
                      key={plant.id}
                      className={`absolute flex touch-none select-none flex-col items-center rounded-lg p-1 ${
                        draggingPlantId === plant.id
                          ? "cursor-grabbing"
                          : "cursor-grab"
                      } ${
                        isSelected
                          ? "ring-2 ring-[#1e4620] ring-offset-2"
                          : ""
                      }`}
                      style={{
                        left: `${plant.x}%`,
                        top: `${plant.y}%`,
                        transform: "translate(-50%, -50%)",
                      }}
                      onPointerDown={(event) =>
                        handleMarkerPointerDown(event, plant.id)
                      }
                      onClick={(event) => handleMarkerClick(event, plant.id)}
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
                  );
                })}
              </div>
            )}

            <button
              type="button"
              onClick={onOpenFilePicker}
              className="absolute right-3 top-3 z-20 rounded-md border border-stone-300 bg-white/90 px-3 py-1.5 text-xs font-medium text-stone-700 shadow-sm transition-colors hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#4a7c59] focus:ring-offset-2"
            >
              Change Photo
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={onOpenFilePicker}
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
  );
}
