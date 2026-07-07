import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const source = process.argv[2];
const outDir = process.argv[3];

if (!source || !outDir) {
  throw new Error("Usage: tsx scripts/extractFrames.ts <sheet.png> <outDir>");
}

mkdirSync(outDir, { recursive: true });
writeFileSync(
  join(outDir, "README.md"),
  [
    "# Frame Extraction",
    "",
    `Source sheet: ${source}`,
    "",
    "This project keeps extraction as a pipeline step because Node has no image library dependency installed by default.",
    "Use the bundled Python/Pillow runtime or any trusted image tool to cut the sheet according to manifest rows/cols.",
  ].join("\n"),
);

console.log("Created extraction instruction stub. Use Python/Pillow processing for pixel work.");
