import { mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";

interface BuildSpriteSheetOptions {
  framesDir: string;
  outDir: string;
  name: string;
  columns: number;
  fps: number;
  loop: boolean;
}

function parseArgs(): BuildSpriteSheetOptions {
  const args = new Map<string, string>();
  for (let index = 2; index < process.argv.length; index += 2) {
    args.set(process.argv[index], process.argv[index + 1]);
  }
  return {
    framesDir: args.get("--frames") ?? "",
    outDir: args.get("--out") ?? "",
    name: args.get("--name") ?? "sprite",
    columns: Number(args.get("--cols") ?? 4),
    fps: Number(args.get("--fps") ?? 12),
    loop: args.get("--loop") === "true",
  };
}

const options = parseArgs();
if (!options.framesDir || !options.outDir) {
  throw new Error("Usage: tsx scripts/buildSpriteSheet.ts --frames <framesDir> --out <outDir> --name <assetName> --cols 4 --fps 12");
}

const frames = readdirSync(options.framesDir)
  .filter((file) => file.toLowerCase().endsWith(".png"))
  .sort();

mkdirSync(options.outDir, { recursive: true });
writeFileSync(
  join(options.outDir, "manifest.json"),
  JSON.stringify(
    {
      name: options.name,
      type: "png_sequence_pending_sheet_build",
      frames: frames.map((file) => join("frames", basename(file)).replace(/\\/g, "/")),
      frameCount: frames.length,
      columns: options.columns,
      rows: Math.ceil(frames.length / options.columns),
      fps: options.fps,
      loop: options.loop,
      note: "Use ImageMagick/Pillow or the project processing step to pack these frames into sheet.png.",
    },
    null,
    2,
  ),
);

console.log(`Prepared sprite-sheet manifest for ${frames.length} frames.`);
