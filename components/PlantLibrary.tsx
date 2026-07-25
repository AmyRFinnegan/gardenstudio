import { MARKER_COLORS, type Plant } from "@/lib/plants";

type PlantLibraryProps = {
  imageUrl: string | null;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  plants: Plant[];
  selectedPlant: Plant | null;
  onPlantSelect: (plant: Plant) => void;
};

export default function PlantLibrary({
  imageUrl,
  searchQuery,
  onSearchQueryChange,
  plants,
  selectedPlant,
  onPlantSelect,
}: PlantLibraryProps) {
  return (
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
          onChange={(event) => onSearchQueryChange(event.target.value)}
          className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 placeholder:text-stone-400 focus:border-[#4a7c59] focus:outline-none focus:ring-2 focus:ring-[#4a7c59]/30"
        />

        {!imageUrl && (
          <p className="text-xs text-stone-500">
            Upload a photo to place plants on your garden.
          </p>
        )}

        <ul className="flex flex-col gap-3">
          {plants.length === 0 ? (
            <li className="rounded-md border border-dashed border-stone-300 bg-white/60 px-4 py-8 text-center text-sm text-stone-500">
              No plants match your search.
            </li>
          ) : (
            plants.map((plant) => {
              const isSelected = selectedPlant?.id === plant.id;

              return (
                <li key={plant.id}>
                  <button
                    type="button"
                    disabled={!imageUrl}
                    onClick={() => onPlantSelect(plant)}
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
                          Mature width: {plant.matureWidthFt} ft · {plant.color}
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
  );
}
