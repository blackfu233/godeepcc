import type { MusicLayer } from "./audioTypes";

export const MUSIC_LAYER_DEPTHS: Array<{ layer: MusicLayer; from: number; label: string }> = [
  { layer: 1, from: 0, label: "Layer I" },
  { layer: 2, from: 2500, label: "Layer II" },
  { layer: 3, from: 5000, label: "Layer III" },
  { layer: 4, from: 7500, label: "Layer IV" },
];
