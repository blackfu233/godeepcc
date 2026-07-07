import azureDragon from "../assets/generated/azure-dragon.png";
import goldenPearl from "../assets/generated/golden-pearl.png";
import jelly from "../assets/generated/jelly.png";
import pufferBomb from "../assets/generated/puffer-bomb.png";
import redFish from "../assets/generated/red-fish.png";
import shark from "../assets/generated/shark.png";
import smallSchool from "../assets/generated/small-school.png";
import thunderJelly from "../assets/generated/thunder-jelly.png";
import turtle from "../assets/generated/turtle.png";
import twinFish from "../assets/generated/twin-fish.png";
import vermilion from "../assets/generated/vermilion.png";
import whiteTiger from "../assets/generated/white-tiger.png";
import xuanwu from "../assets/generated/xuanwu.png";

interface FishArtProps {
  speciesId: string;
}

const fishArtBySpecies: Record<string, string> = {
  "small-school": smallSchool,
  jelly,
  turtle,
  "red-fish": redFish,
  "red-fish-2x": redFish,
  shark,
  "shark-3x": shark,
  xuanwu,
  "xuanwu-40x": xuanwu,
  "white-tiger": whiteTiger,
  "white-tiger-30x": whiteTiger,
  "vermilion-15x": vermilion,
  vermilion,
  "azure-dragon": azureDragon,
  "azure-dragon-80x": azureDragon,
  "azure-dragon-100x": azureDragon,
  "twin-fish": twinFish,
  "golden-pearl": goldenPearl,
  "puffer-bomb": pufferBomb,
  "thunder-jelly": thunderJelly,
};

export function FishArt({ speciesId }: FishArtProps) {
  const src = fishArtBySpecies[speciesId] ?? redFish;
  const isHigh =
    speciesId.startsWith("xuanwu") ||
    speciesId.startsWith("white-tiger") ||
    speciesId.startsWith("vermilion") ||
    speciesId.startsWith("azure-dragon");
  const tierClass = speciesId.includes("twin") || speciesId.includes("pearl") || speciesId.includes("puffer") || speciesId.includes("thunder")
    ? "tool-art"
    : isHigh
      ? "high-art"
      : "low-art";

  return (
    <img
      className={`fish-art generated-fish-art ${tierClass} species-${speciesId}`}
      src={src}
      alt=""
      aria-hidden="true"
      draggable={false}
    />
  );
}
