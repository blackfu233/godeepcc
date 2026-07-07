import { existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";

const ROOT = process.cwd();
const IMAGE_DIRS = ["src/assets", "assets"];
const LARGE_IMAGE_BYTES = 1024 * 1024;

const largeImages: Array<{ path: string; bytes: number }> = [];

function walk(dir: string) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) walk(full);
    else if ([".png", ".jpg", ".jpeg", ".webp", ".gif"].includes(extname(entry).toLowerCase()) && stat.size >= LARGE_IMAGE_BYTES) {
      largeImages.push({ path: relative(ROOT, full).replaceAll("\\", "/"), bytes: stat.size });
    }
  }
}

for (const dir of IMAGE_DIRS) {
  const full = join(ROOT, dir);
  if (existsSync(full)) walk(full);
}

if (!existsSync(join(ROOT, "reports"))) mkdirSync(join(ROOT, "reports"));

console.log("Large images that should have mobile derivatives:");
for (const file of largeImages.sort((a, b) => b.bytes - a.bytes)) {
  console.log(`${(file.bytes / 1024 / 1024).toFixed(2)} MB\t${file.path}`);
}

console.log("\nThis project intentionally avoids adding an image optimizer dependency in this pass. Route mobile backgrounds were generated with local Windows imaging APIs; install sharp/imagemagick later for automated WebP conversion.");
