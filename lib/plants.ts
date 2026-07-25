export type Plant = {
  id: string;
  commonName: string;
  matureWidthFt: number;
  color: string;
};

export type PlacedPlant = {
  id: string;
  commonName: string;
  color: string;
  x: number;
  y: number;
};

export const PLANTS: Plant[] = [
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

export const MARKER_COLORS: Record<string, string> = {
  "blue-green": "#4a7c59",
  purple: "#7c3aed",
  "purple-blue": "#5b6abf",
};
